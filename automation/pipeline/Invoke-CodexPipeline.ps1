[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [Parameter(ParameterSetName = "Issue", Mandatory = $true)]
    [ValidateRange(1, [int]::MaxValue)]
    [int]$IssueNumber,

    [Parameter(ParameterSetName = "File", Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$TaskFile,

    [ValidateSet("DryRun", "Execute")]
    [string]$Mode = "DryRun",

    [switch]$PublishDraftPr,

    [string]$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")),

    [string]$BaseBranch = "main"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Assert-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name"
    }
}

function Invoke-Native([string]$Command, [string[]]$Arguments) {
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed ($LASTEXITCODE): $Command $($Arguments -join ' ')"
    }
}

function Get-NativeText([string]$Command, [string[]]$Arguments) {
    $output = & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Command failed ($LASTEXITCODE): $Command $($Arguments -join ' ')"
    }
    return ($output -join "`n").Trim()
}

function Convert-ToSlug([string]$Value) {
    $slug = ($Value.ToLowerInvariant() -replace "[^a-z0-9가-힣]+", "-").Trim("-")
    if (-not $slug) { return "task" }
    return $slug.Substring(0, [Math]::Min(48, $slug.Length))
}

Assert-Command "git"
Assert-Command "node"

$resolvedRoot = (Resolve-Path $ProjectRoot).Path
Push-Location $resolvedRoot
try {
    $gitRoot = Get-NativeText "git" @("rev-parse", "--show-toplevel")
    if ((Resolve-Path $gitRoot).Path -ne $resolvedRoot) {
        throw "ProjectRoot and Git root differ: $resolvedRoot / $gitRoot"
    }

    $remote = Get-NativeText "git" @("remote", "get-url", "origin")
    if ($remote -notmatch "(^|[:/])jungboh/susi-distribution-v2(\.git)?$") {
        throw "Unexpected origin remote: $remote"
    }

    $status = Get-NativeText "git" @("status", "--porcelain")
    if ($status) { throw "Working tree must be clean before the pipeline starts.`n$status" }

    Invoke-Native "git" @("fetch", "origin", "--prune")
    $branch = Get-NativeText "git" @("branch", "--show-current")
    if ($branch -ne $BaseBranch) { throw "Start from $BaseBranch; current branch is $branch" }
    $distance = Get-NativeText "git" @("rev-list", "--left-right", "--count", "HEAD...origin/$BaseBranch")
    if ($distance -notmatch "^0\s+0$") { throw "Local and origin/$BaseBranch differ: $distance" }

    $runId = Get-Date -Format "yyyyMMdd-HHmmss"
    $runDirectory = Join-Path $resolvedRoot ".pipeline\runs\$runId"
    New-Item -ItemType Directory -Path $runDirectory -Force | Out-Null
    $taskPath = Join-Path $runDirectory "task.md"

    if ($PSCmdlet.ParameterSetName -eq "Issue") {
        Assert-Command "gh"
        $issueJson = Get-NativeText "gh" @("issue", "view", $IssueNumber, "--json", "body,labels")
        $issue = $issueJson | ConvertFrom-Json
        if ($issue.labels.name -notcontains "codex:ready") {
            throw "Issue #$IssueNumber must have the codex:ready label."
        }
        Set-Content -LiteralPath $taskPath -Value $issue.body -Encoding utf8NoBOM
    } else {
        $sourceTask = (Resolve-Path $TaskFile).Path
        Copy-Item -LiteralPath $sourceTask -Destination $taskPath
    }

    $metadataJson = Get-NativeText "node" @("automation/pipeline/validate-task.mjs", $taskPath)
    $metadata = $metadataJson | ConvertFrom-Json
    Write-Host "Task contract valid: $($metadata.task)"

    if ($Mode -eq "DryRun") {
        Write-Host "DRY RUN complete. No branch, code, commit, push, PR, deploy, or DB change was made."
        Write-Host "Captured task: $taskPath"
        return
    }

    Assert-Command "codex"
    $sourceId = if ($PSCmdlet.ParameterSetName -eq "Issue") { "issue-$IssueNumber" } else { "file" }
    $slug = Convert-ToSlug $metadata.task
    $workBranch = "codex/$sourceId-$slug"
    Invoke-Native "git" @("switch", "-c", $workBranch)

    $resultPath = Join-Path $runDirectory "result.json"
    $promptPath = Join-Path $runDirectory "prompt.md"
    $guardrails = @"
You are implementing the attached approved task in the current repository.
Obey CLAUDE.md and the task's scope and stop conditions.
Do not commit, push, create a PR, deploy, or access a remote database.
Do not expose secrets or student personal data.
Run the repository validation commands before reporting completion.
If any stop condition is met, return BLOCKED without expanding scope.

APPROVED TASK:
"@
    Set-Content -LiteralPath $promptPath -Value ($guardrails + "`n" + (Get-Content $taskPath -Raw)) -Encoding utf8NoBOM

    Get-Content $promptPath -Raw | & codex exec --ephemeral --sandbox workspace-write --output-schema automation/pipeline/result.schema.json --output-last-message $resultPath -
    if ($LASTEXITCODE -ne 0) { throw "codex exec failed with exit code $LASTEXITCODE" }

    Invoke-Native "node" @("automation/pipeline/validate-result.mjs", $resultPath)
    $result = Get-Content $resultPath -Raw | ConvertFrom-Json
    if ($result.status -eq "BLOCKED") { throw "Codex reported BLOCKED. See $resultPath" }

    Invoke-Native "npm" @("run", "typecheck")
    Invoke-Native "npm" @("run", "lint")
    Invoke-Native "npm" @("run", "build")
    Invoke-Native "git" @("diff", "--check")

    if (-not $PublishDraftPr) {
        Write-Host "Implementation validated locally. PublishDraftPr was not supplied; no commit, push, or PR was created."
        Write-Host "Result: $resultPath"
        return
    }

    if ($PSCmdlet.ParameterSetName -ne "Issue") {
        throw "PublishDraftPr requires -IssueNumber so the PR can link to an approved Issue."
    }
    Assert-Command "gh"
    Invoke-Native "git" @("fetch", "origin", "--prune")
    $publishDistance = Get-NativeText "git" @("rev-list", "--left-right", "--count", "HEAD...origin/$BaseBranch")
    if ($publishDistance -notmatch "^0\s+0$") {
        throw "origin/$BaseBranch changed during execution: $publishDistance"
    }
    if (-not $PSCmdlet.ShouldProcess("origin/$workBranch", "Commit, push, and create a draft PR")) { return }

    $changed = @(
        (Get-NativeText "git" @("diff", "--name-only")) -split "`n"
        (Get-NativeText "git" @("ls-files", "--others", "--exclude-standard")) -split "`n"
    ) | Where-Object { $_ } | Sort-Object -Unique
    if (-not $changed) { throw "No implementation changes to publish." }

    $forbidden = $changed | Where-Object {
        $_ -match "(^|/)(\.env($|\.)|node_modules/|\.next/|tsconfig\.tsbuildinfo$|auth\.json$)"
    }
    if ($forbidden) { throw "Forbidden files detected:`n$($forbidden -join "`n")" }

    Invoke-Native "git" (@("add", "--") + $changed)
    Invoke-Native "git" @("diff", "--cached", "--check")
    $sensitiveDiff = Get-NativeText "git" @("diff", "--cached", "-U0")
    if ($sensitiveDiff -match '(?im)^\+.*(SUPABASE_SERVICE_ROLE_KEY|TEACHER_AUTH_SECRET|OPENAI_API_KEY|CODEX_API_KEY)\s*[:=]\s*[^<{$\s]') {
        throw "Possible secret value detected in staged diff."
    }
    Invoke-Native "git" @("commit", "-m", "feat: $($metadata.task)")
    Invoke-Native "git" @("push", "-u", "origin", $workBranch)

    $prBody = Join-Path $runDirectory "pr-body.md"
    Set-Content -LiteralPath $prBody -Encoding utf8NoBOM -Value @"
## Task

Closes #$IssueNumber

## Codex result

$($result.summary)

## Review gate

- Draft PR only
- CI and Netlify Deploy Preview must pass
- PM must return APPROVED
- Final merge remains a user action
"@
    Invoke-Native "gh" @("pr", "create", "--draft", "--base", $BaseBranch, "--head", $workBranch, "--title", $metadata.task, "--body-file", $prBody)
} finally {
    Pop-Location
}
