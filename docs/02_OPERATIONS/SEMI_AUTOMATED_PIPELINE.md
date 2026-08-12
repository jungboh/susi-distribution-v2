# Semi-Automated Development Pipeline

## Status

- Foundation: `Task PIPELINE-001`
- Default behavior: `DryRun`
- Repository: `jungboh/susi-distribution-v2`
- Base branch: `main`
- Final merge: user-only approval

## Flow

1. GPT(PM)가 `.github/ISSUE_TEMPLATE/codex-task.md` 형식으로 작업지를 작성한다.
2. 사용자가 내용을 확인한 뒤 GitHub Issue를 생성하고 `codex:ready` 상태로 둔다.
3. 로컬 PowerShell에서 파이프라인을 먼저 `DryRun`으로 실행한다.
4. 계약 검증이 통과하면 `Execute`로 Codex 구현과 로컬 검증을 수행한다.
5. 사용자가 게시 단계를 승인할 때만 Commit·Push·Draft PR을 생성한다.
6. GitHub CI와 Netlify Deploy Preview를 확인한다.
7. GPT(PM)가 `APPROVED`, `CHANGES REQUESTED`, `BLOCKED` 중 하나로 판정한다.
8. `APPROVED` 이후에도 최종 Merge는 사용자가 직접 수행한다.

## One-time requirements

- PowerShell 7
- Node.js 22
- Git
- GitHub CLI 로그인: `gh auth status`
- Codex CLI 로그인: `codex login`
- 실제 프로젝트 경로:
  `C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2`

실제 인증값은 저장소, Issue, 로그 또는 결과 JSON에 기록하지 않는다. 자동화 인증정보는 저장소에서 실행되는 신뢰되지 않은 코드와 분리한다.

## Dry run

```powershell
pwsh ./automation/pipeline/Invoke-CodexPipeline.ps1 `
  -IssueNumber 12 `
  -Mode DryRun `
  -ProjectRoot "C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2"
```

Dry run은 프로젝트 루트, 원격 저장소, 깨끗한 `main`, `origin/main` 일치, Issue 작업지 제목·순서를 검사한다. `.pipeline/runs/`에 입력 사본만 남기며 브랜치·코드·GitHub 상태를 변경하지 않는다.

GitHub Issue를 만들기 전 로컬 계약만 확인할 때는 `-TaskFile automation/pipeline/examples/task.example.md`를 사용할 수 있다. 실제 Issue 실행은 `codex:ready` 라벨이 있어야 한다.

## Local implementation

```powershell
pwsh ./automation/pipeline/Invoke-CodexPipeline.ps1 `
  -IssueNumber 12 `
  -Mode Execute `
  -ProjectRoot "C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2"
```

Codex는 `workspace-write` sandbox에서 실행되고 구조화 결과를 `.pipeline/runs/<timestamp>/result.json`에 기록한다. 스크립트는 typecheck, lint, build, whitespace 검사를 다시 실행한다. 이 단계는 Commit·Push·PR을 만들지 않는다.

## Publish a draft PR

```powershell
pwsh ./automation/pipeline/Invoke-CodexPipeline.ps1 `
  -IssueNumber 12 `
  -Mode Execute `
  -PublishDraftPr `
  -ProjectRoot "C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2"
```

`PublishDraftPr`은 고위험 승인 단계다. 변경 파일을 명시적으로 Stage하고 Commit·Push 후 Draft PR만 만든다. Merge, Deploy, 원격 DB 또는 다음 Task는 실행하지 않는다.
이 명령은 `DryRun`이 통과한 뒤 깨끗한 `main`에서 실행한다. 게시하지 않는 `Execute`를 먼저 실행해 로컬 변경이 남아 있다면 자동 게시를 다시 실행하지 말고 해당 결과를 수동 검토한다.

## Stop conditions

- 작업 경로 또는 origin이 지정 저장소와 다름
- 시작 브랜치가 `main`이 아님
- 작업트리가 깨끗하지 않음
- 로컬과 `origin/main`이 일치하지 않음
- Issue 형식 또는 `READY FOR CODEX` 상태가 유효하지 않음
- Codex가 `BLOCKED`를 반환함
- typecheck, lint, build, whitespace 검사 중 하나라도 실패함
- 민감정보·환경변수·빌드 산출물 후보가 변경에 포함됨
- Commit·Push·Draft PR 게시를 사용자가 승인하지 않음

## Generated files

`.pipeline/runs/`는 로컬 실행 기록이며 Git에 포함하지 않는다. 각 실행에는 작업지, Codex prompt, 구조화 결과가 저장될 수 있으므로 개인정보나 실제 access code가 들어간 Issue를 만들지 않는다.

## PM review result

- `APPROVED`: 범위·검증·Preview가 모두 승인되어 사용자 Merge 가능
- `CHANGES REQUESTED`: 같은 Issue/PR에서 수정 후 재검증 필요
- `BLOCKED`: 권한, 환경, 요구사항 또는 안전 조건 해결 전 진행 금지
