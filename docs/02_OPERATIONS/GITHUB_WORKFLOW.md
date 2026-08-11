# GitHub Workflow

## 작업 전

```powershell
git remote -v
git branch --show-current
git status --short
git fetch --prune
```

- remote가 `jungboh/susi-distribution`인지 확인한다.
- 기본 작업 브랜치가 `main`인지 확인하고, 실제 변경은 승인된 작업 브랜치 정책을 따른다.
- 예상하지 못한 변경은 삭제하거나 되돌리기 전에 원인을 확인한다.

## Commit 정책

- 한 Task의 승인 범위만 작고 명확한 commit으로 만든다.
- typecheck, lint, build, `git diff --check` 결과를 확인한다.
- 환경변수, service role key, access_code, 학생 이름·개인정보, export 파일을 commit하지 않는다.
- Project Control 문서와 변경 관련 architecture/operations/release 문서를 함께 갱신한다.

## Push 정책

- push 전 remote, branch, diff, commit 범위를 재검증한다.
- 운영에 영향을 주는 push는 승인과 배포 계획을 확인한다.
- force push는 금지한다.
- `jungboh/susi`와 통합 저장소를 혼동하지 않는다.
