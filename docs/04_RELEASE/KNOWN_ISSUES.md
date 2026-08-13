# Known Issues

## 2026-08-13 문서 갱신 시점 Confirmed Gaps

- `codex/issue-2-task-003-c8c-teacher-consultation-autosave` 브랜치가 `origin/main` 대비 2 커밋(Task 003-C8C, post-C8C 스타일링 패스) 앞서 있고 **push 안 됨**. PM 검토·게시 승인 전까지 다른 작업자는 이 변경 사항을 볼 수 없다.
- 목업 이미지(`목업이미지.png`) 대비 코드 미구현 항목: QR 코드 출력(Task 003-C7A 정책상 영구 미구현), 작성 완료/진행중/미작성 상태 분류, 대시보드 진행률 도넛차트·최근 작성 학생 목록·실제 공지사항 데이터, 로그인 화면 "비밀번호를 잊으셨나요?" 링크(대상 기능 없어 미추가), 학생 상세 화면의 지원대학현황/체크리스트/제출서류/기록 4-tab 구조(현재는 단일 스크롤 화면), 학생 관리 표의 번호·최근 수정일 열과 페이지네이션(데이터 소스 없음)
- `.claude/skills/ui-design/SKILL.md`가 Task 003-C1 이전의 구 디자인 시스템(brand blue/slate, `class-selector.tsx`/`teacher-header.tsx` 참조)을 기술하고 있으나 두 참조 파일은 더 이상 어디에서도 import되지 않는 죽은 코드다. 실제 교사 화면은 `docs/01_ARCHITECTURE/UI_DESIGN_SYSTEM.md`의 navy/semantic token 체계(C1~C8C)를 따른다. 학생 `/apply/[code]` 화면(`checklist-panel.tsx` 등)은 구 디자인 시스템을 계속 사용 중이라 스킬 문서 자체가 틀린 것은 아니지만, 교사 화면 작업 시 참조하면 안 된다.

## Task 003-B0 Confirmed Gaps

- 학부모 확인서는 금융 전용 원본 기준으로 구현했으나 실제 4개 학급 데이터와 A4 Portrait 인쇄 QA가 필요함
- 지원대학 표는 상단 header만 sticky이며 요구된 왼쪽 4개 열 sticky는 확인되지 않음
- 2026 하드코딩이 있고 academic_year/school_year 구조가 없음
- v2 `schema.sql`은 3개 학급 기준이고 finance는 migration 0010으로만 확장됨

## Unverified External Items

- v2 Netlify 연결 저장소, site ID, production branch/build 설정
- 운영 Supabase의 migration 0010 적용과 finance 데이터 상태
- 기존 학생 URL이 사용하는 실제 도메인 분포

No confirmed issues were added during Task 003-A-DOC.

## 관찰 사항(확정 이슈 아님)

- `npm ci` 감사 결과 중간 2개, 높음 6개 취약점이 보고되었다. 영향 분석과 dependency 변경은 별도 승인 Task가 필요하다.
- 운영 Supabase, Netlify 및 실제 사용자 흐름은 Task 003-A에서 조회하거나 smoke test하지 않았다.
