---
name: Codex 작업지
about: PM 승인 후 Codex 반자동 파이프라인에 전달할 작업지를 작성합니다.
title: "[Task ID] 작업명"
labels: "codex:ready"
assignees: ""
---

## TASK

`[Task ID] — [한 문장 작업명]`

## STATUS

`READY FOR CODEX`

## CONTEXT

- 현재 진행 단계:
- 관련 기능 또는 모듈:
- 이전 확정 사항:
- 작업이 필요한 이유:

## ACCEPTANCE CRITERIA

- [ ] 구현 후 객관적으로 확인할 수 있는 조건
- [ ] 권한과 데이터 격리가 유지되는 조건
- [ ] 기존 기능의 회귀가 없음을 확인하는 조건
- [ ] 필요한 테스트와 빌드가 통과하는 조건

## FILES TO INSPECT

- 작업 전에 조사할 파일 또는 디렉터리

## FILES TO TOUCH

- 변경이 허용된 파일 또는 디렉터리

## IN SCOPE

- 이번 작업에 포함되는 내용

## OUT OF SCOPE

- 이번 작업에서 수행하지 않을 내용

## VALIDATION

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

## STOP CONDITIONS

- 요구사항과 저장소 상태가 충돌함
- 허용 범위 밖 변경이 필요함
- 필수 검증이 실패함
- 민감정보, 개인정보 또는 원격 이력 충돌이 발견됨

## NOTES FOR CODEX

- 확인되지 않은 내용은 추정하지 말고 `확인 필요`로 보고한다.
- 명시적인 게시 승인 전에는 Commit, Push, Deploy, 원격 DB 작업을 수행하지 않는다.
- 기존 사용자 변경을 되돌리거나 다음 Task를 자동으로 시작하지 않는다.
