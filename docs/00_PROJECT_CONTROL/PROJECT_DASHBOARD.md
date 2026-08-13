# Project Dashboard

## Project

영동미래고 수시자료 취합 시스템

## Current Phase

Task 003-C8C Consultation Autosave + Post-C8C Mockup Styling Pass Complete Locally / Not Pushed

## Current Task

Task 003-C8C — Consultation Field Autosave Engine, plus an untracked-by-task-number styling pass applying mockup visual language to landing/sidebar/dashboard/links

## Status

IMPLEMENTED LOCALLY, NOT PUSHED — branch `codex/issue-2-task-003-c8c-teacher-consultation-autosave`, 2 commits ahead of `origin/main` (`8f6c715`, `b4de609`), no upstream tracking branch set as of 2026-08-13

## C8C Implemented — 2026-08-13 문서 갱신 (commit `8f6c715`)

- 37개 상담 필드 중 신규 22개(Teacher 편집)를 위한 field-key 단위 자동저장 엔진 구현: in-flight guard + 최신값 coalescing으로 동일 필드 중복 저장이 순서를 벗어나 완료되는 것을 방지
- blur 시 flush, application 전환 시 flush(에러 상태 필드가 남아있으면 `confirm()` 경고), `beforeunload` 저장 중 경고 추가
- `consultation-panel.tsx`에 application state를 끌어올려 신규 37필드 editor와 기존 application table이 서로의 미저장 편집을 덮어쓰지 않도록 동기화; `application-table.tsx`는 자체 resync effect 동안 필드별 dirty state를 추적
- 신규 파일: `src/components/consultation/consultation-editor.tsx`, `consultation-panel.tsx`, `index.ts`
- 기존 15개 필드 저장 계약과 신규 22개 Teacher-only allowlist에 회귀 없음 (typecheck/lint/build, `git diff --check` 통과 확인)
- PM 페르소나 'j' 리뷰: GO

## Post-C8C 스타일링 패스 — 2026-08-13 문서 갱신 (commit `b4de609`, Task 번호 미부여)

- 기존 `tailwind.config.ts`/`globals.css` 토큰만 사용해 목업 시각 언어를 기존 화면에 적용 (신규 색상/radius/business logic 없음)
- Landing class card: navy 배경 + 중앙 아이콘 + "로그인" 버튼 형태로 변경, 유통반 아이콘을 cart 아이콘으로 교체
- Teacher sidebar: nav 항목에 아이콘 추가, 비활성(준비 중) 항목 상태는 유지
- Teacher dashboard: metric card에 아이콘 배지 추가, 라벨/값/계산 로직은 변경 없음 — 완료/진행중/미작성 분류, donut chart, 최근 활동 목록은 이번 범위 아님
- 링크 관리: 개별 링크 / 일괄 링크 관리 / 안내문 출력 tab 레이아웃으로 재구성, 기존 excel-export/guide-print action은 위치만 이동, QR은 정책상 계속 미구현
- PM 페르소나 'j' 리뷰: GO — QR/공지사항 데이터/상태분류/최근활동/기록탭 콘텐츠가 목업에서 유입되지 않았고 C8C 자동저장 엔진을 건드리지 않았음을 확인

## C6 Implemented

- 기존 학생별 Excel route와 print route의 PDF/Print intent 유지
- 문서 제목·학교명·학생·학번·학급·지원대학/checklist 수 공통 header
- Print 지원대학 표에 공통 합격컷·추가 비고와 기존 핵심 필드 출력
- A4 landscape 10mm margin, table header 반복과 행 분할 방지
- Checklist는 새 페이지에서 시작하고 항목별 page break 방지
- 인쇄 시 Sticky/웹 Action 제거
- Excel 지원대학 sheet 23개 공통 열과 한글 안전 파일명
- 기존 금융 전용 `jungboh/susi`의 학부모 확인서 원본을 확인해 네 학급 공통 기능으로 구현
- 확정 확인 문구·관계·학부모 성명·서명 영역과 A4 Portrait 배치 보존

## Status Policy Pending

작성 완료/진행 중/미작성은 현재 DB에 명시 상태와 확정 계산 규칙이 없어 구현하지 않았다. Dashboard의 입력 참여율은 작성 완료율이 아니다.

## PM Decision — Four-class Common Features

v2에서는 finance 전용 UI 기능을 두지 않는다. 출력·PDF·Excel·학부모 확인서·Sticky Table·링크 관리 등을 금융/창업/유통/보건 네 학급에 공통 제공하되, 서버 데이터 접근은 현재 인증된 class_code로 격리한다.

## Confirmed

- CURRENT 개발 기준: `jungboh/susi-distribution-v2`, 작업 브랜치 `codex/issue-2-task-003-c8c-teacher-consultation-autosave`, `origin/main` 대비 2 ahead / 0 behind, **push 안 됨** (2026-08-13 기준)
- v2는 이전 통합본 import 후 finance 및 Excel/PDF 기능을 추가한 기능 통합본
- 코드 기준 finance, startup, distribution, health 4개 학급
- `/apply/[code]` → access_code → student UUID → applications/checklist 구조 유지
- v2·이전 통합·금융 전용 Netlify URL 모두 2026-08-12 공개 HTTP 200 응답
- migration `0011_add_application_consultation_fields.sql`이 로컬 저장소에 존재 (Task 003-C8B에서 추가, `4e54d9e`). 운영 적용 여부는 여전히 UNKNOWN

## Unverified External Items

- v2 Netlify site ID, 연결 Git 저장소, production branch와 build command
- 운영 Supabase migration 적용 상태와 finance 운영 데이터
- 기존 배포 학생 URL의 실제 도메인 분포

## Known Gaps

- 학부모 확인서 전용 출력 구현 완료; 실제 운영 인쇄 QA 필요
- 지원표 왼쪽 4열 sticky 없음(상단 header만 sticky)
- academic_year 구조 없음, 2026 하드코딩 존재
- v2 로컬 schema.sql과 기존 docs 일부가 migration 0010 이전 3개 학급 기준이어서 이번 문서에서 상태를 구분함
- Task 003-C8D(Student 읽기 전용 상담 화면), C8E(Excel/PDF/Print 37필드 확장), C8F(반응형/권한/QA)는 코드·commit 근거 없음 — 미착수로 간주
- 2026-08-13 이전 이 문서는 Task 003-C7A 시점에서 갱신이 멈춰 있었고, 실제로는 이미 C8B/PIPELINE-001/PIPELINE-001B/C8C/스타일링 패스까지 로컬에 진행돼 있었음 (git 로그 기준 확인 후 이번에 동기화)

## Critical Rules

1. 기존 학생 URL/access_code/UUID 관계 변경 금지
2. 이전 통합 사이트와 금융 전용 사이트 삭제·redirect 금지
3. 운영 DB는 별도 승인 및 dry-run/검토 후 변경
4. Commit/Push/Deploy는 PM 승인 후 수행

## Implementation Plan

003-C1 Design Foundation → C2 Landing/Login → C3 App Shell/Dashboard → C4 Student Management → C5 Common Student Detail → C6 Common Document Output → C7 Common Link Management → C7A QR Removal → C8B Consultation Field Foundation (C8B-1 mapping doc + C8B-2 shared UI) → C8C Teacher Consultation Autosave → C8D Student Read-only Consultation View (PLANNED) → C8E Excel/PDF/Print 37-field Extension (PLANNED) → C8F Responsive/Regression QA (PLANNED)

## Next Task

Task 003-C8D — Student 기존 편집 15개 보존 + 신규 22개 읽기 전용 상담 화면 (`docs/01_ARCHITECTURE/TASK_003_C8B_1_CONSULTATION_37_FIELD_UI_MAPPING.md` §12 후속 작업 기준). 착수 여부는 코드·commit 근거 없음 — PLANNED.

로컬 미push 커밋(`8f6c715`, `b4de609`)의 PM 검토·게시 승인이 먼저 필요하다.
# Task 003-C7 구현 현황 — 2026-08-12

Status: **READY FOR PM REVIEW**

- 네 학급 공통 링크 관리 화면, 이름·학번 검색, 모바일 카드 구현
- 기존 access_code와 `/apply/[code]`를 변경하지 않고 문서로 확인된 v2 배포 origin으로 개별 링크 복사
- Clipboard 실패 시 전체 URL 수동 복사 fallback 제공
- QR UI·생성·저장·인쇄·dependency는 PM 정책 변경으로 제거
- 인증 학급 전용 전체 링크 Excel과 A4 Portrait 학생·학부모 접속 안내문 구현
- 복사·Excel·안내문은 단일 `buildStudentUrl()`과 기존 v2 배포 origin을 사용하고 임의 요청 Host를 신뢰하지 않음
- C6 학부모 확인서는 보호 파일·`mode=parent`·A4 Portrait·확정 문구·서명 영역을 그대로 유지하고 C7 안내문과 분리
- DB/Migration/운영 데이터/환경/Netlify 변경 없음
- 원격 브라우저 QA는 미실행 상태이며 PM 검토 후 별도 진행 필요
