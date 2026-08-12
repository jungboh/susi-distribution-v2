## TASK

`EXAMPLE-001 — 파이프라인 계약 검증 예시`

## STATUS

`READY FOR CODEX`

## CONTEXT

- 현재 진행 단계: 예시
- 관련 기능 또는 모듈: 자동화 계약
- 이전 확정 사항: 없음
- 작업이 필요한 이유: 로컬 dry-run 검증

## ACCEPTANCE CRITERIA

- [ ] 작업지 계약 검증기가 성공한다.

## FILES TO INSPECT

- `automation/pipeline/`

## FILES TO TOUCH

- 없음

## IN SCOPE

- 작업지 형식 검증

## OUT OF SCOPE

- 코드 변경, Commit, Push, Deploy, 원격 DB

## VALIDATION

- `node automation/pipeline/validate-task.mjs automation/pipeline/examples/task.example.md`

## STOP CONDITIONS

- 저장소 또는 작업지 형식이 예상과 다름

## NOTES FOR CODEX

- 이 파일은 형식 검증 예시이며 실제 기능 Task가 아니다.
