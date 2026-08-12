# CURRENT TASK

- **Task:** PIPELINE-001 — 반자동 개발 파이프라인 기반 구축
- **Status:** READY FOR PM REVIEW
- **Base checkpoint:** `4e54d9e` (`Task 003-C8B`, C1~C8B-2)
- **Flow:** GPT(PM) 작업지 → GitHub Issue → Codex 로컬 구현 → Draft PR → CI·Netlify Preview → PM 검토 → 사용자 Merge
- **Default:** `DryRun`; 브랜치·코드·Commit·Push·PR을 변경하지 않고 계약과 저장소 상태만 검증
- **Execute:** Codex는 `workspace-write`에서 구현하고 구조화 결과를 남기며 typecheck·lint·build·whitespace 검사를 재실행
- **Publish gate:** `PublishDraftPr`과 사용자 확인이 있을 때만 명시적 Stage·Commit·Push·Draft PR 수행
- **Merge:** 자동화하지 않음; PM `APPROVED` 이후 사용자만 수행
- **Deploy / Remote DB:** 자동 실행하지 않음
- **Next feature:** C8C는 PIPELINE-001 dry-run 검증 이후 별도 Task로 착수
- **Validation:** task/result contract PASS, workflow YAML PASS, typecheck PASS, lint PASS, build PASS, `git diff --check` PASS
- **Environment gate:** 현재 Linux 검증환경에는 PowerShell·Codex CLI·GitHub CLI가 없어 실제 Windows Issue dry-run은 미실행
