# CURRENT TASK

- **Task:** Task 003-C8C — Consultation Field Autosave Engine, plus a post-C8C 스타일링 패스(목업 시각 언어 적용, 별도 Task 번호 없음)
- **Status:** IMPLEMENTED LOCALLY, NOT PUSHED — 브랜치 `codex/issue-2-task-003-c8c-teacher-consultation-autosave`, `origin/main` 대비 2 ahead / 0 behind (`8f6c715`, `b4de609`), upstream 트래킹 없음
- **Base checkpoint:** `4e54d9e` (`Task 003-C8B`, C1~C8B-2)
- **Validation (로컬):** typecheck/lint/build, `git diff --check` 통과 (커밋 메시지 근거, PM 페르소나 'j' 리뷰 GO)
- **Blocking:** Commit·Push·PR·Merge·Deploy 전 사용자 게시 승인 필요 (아직 승인 없음)
- **Next feature:** Task 003-C8D — Student 읽기 전용 상담 화면 (PLANNED, 미착수)

## PIPELINE-001 — 반자동 개발 파이프라인 기반 구축 (완료, 기반 인프라)

- **Status:** READY FOR PM REVIEW로 도입된 이후 실제로 사용 중 (schema 호환성 후속 수정 PIPELINE-001B `09f5e49`/`ad07dab` 포함)
- **Flow:** GPT(PM) 작업지 → GitHub Issue → Codex 로컬 구현 → Draft PR → CI·Netlify Preview → PM 검토 → 사용자 Merge
- **Default:** `DryRun`; 브랜치·코드·Commit·Push·PR을 변경하지 않고 계약과 저장소 상태만 검증
- **Execute:** Codex는 `workspace-write`에서 구현하고 구조화 결과를 남기며 typecheck·lint·build·whitespace 검사를 재실행
- **Publish gate:** `PublishDraftPr`과 사용자 확인이 있을 때만 명시적 Stage·Commit·Push·Draft PR 수행
- **Merge:** 자동화하지 않음; PM `APPROVED` 이후 사용자만 수행
- **Deploy / Remote DB:** 자동 실행하지 않음
- **Environment gate:** 현재 Linux 검증환경에는 PowerShell·Codex CLI·GitHub CLI가 없어 실제 Windows Issue dry-run은 미실행 (문서화 시점 기준, 이후 실사용 여부는 이 문서 갱신 시점에 재확인하지 않음)
