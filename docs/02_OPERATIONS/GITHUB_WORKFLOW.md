# GitHub Workflow

## CURRENT Baseline

- Repository: `https://github.com/jungboh/susi-distribution-v2.git`
- Local: `C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2`
- Branch: `main`

## 작업 전 읽기 검증

```powershell
git remote -v
git branch --show-current
git status --short
git fetch --prune
git rev-list --left-right --count HEAD...origin/main
```

이전 `susi-distribution`과 금융 전용 `susi`를 CURRENT로 혼동하지 않는다. 기존 변경을 reset, checkout, stash하지 않는다.

## 작업 후

`npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`, `git status --short`를 실행한다. 환경변수, service role key, 실제 access_code와 개인정보를 commit하지 않는다.

Commit/Push는 PM 승인 후 수행하며 force push, remote 변경, 무단 branch 변경을 금지한다.
