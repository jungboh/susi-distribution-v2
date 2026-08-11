# Local Setup

## 현재 확인된 위치

- Desktop: `C:\Users\IIBI\Desktop`
- Work Root: `C:\Users\IIBI\Desktop\susi-integrated-work`
- PROJECT_ROOT: `C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution`

## 사전 준비

1. Git과 Node.js/npm을 설치한다.
2. `node -v`, `npm -v`로 버전을 확인한다. Windows PowerShell 정책이 `npm.ps1`을 막으면 `npm.cmd`를 사용한다.
3. 실제 Desktop 경로는 `[Environment]::GetFolderPath("Desktop")`으로 확인한다.

## Clone과 설치

```powershell
$Desktop = [Environment]::GetFolderPath("Desktop")
$WorkRoot = Join-Path $Desktop "susi-integrated-work"
New-Item -ItemType Directory -Path $WorkRoot
Set-Location $WorkRoot
git clone https://github.com/jungboh/susi-distribution.git
Set-Location .\susi-distribution
git remote -v
git branch --show-current
git status --short
npm ci
```

기존 clone이 있으면 삭제하거나 덮어쓰지 말고 먼저 상태를 확인한다.

## 환경변수

`.env.local.example`의 변수 이름을 기준으로 별도 `.env.local`을 구성한다: `SUPABASE_URL` 또는 선택 fallback `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TEACHER_AUTH_SECRET`. 실제 값은 문서, 로그, Git에 기록하지 않는다. 금융과 전용 프로젝트의 값을 복사하지 않는다.

## 검증

```powershell
npm run typecheck
npm run lint
npm run build
git diff --check
git status --short
```

Task 003-A 검증 환경은 Node `v24.19.0`, npm `11.17.0`이며 lockfile 설치와 세 스크립트가 통과했다. 이는 package의 공식 engines 요구사항을 뜻하지 않는다.
