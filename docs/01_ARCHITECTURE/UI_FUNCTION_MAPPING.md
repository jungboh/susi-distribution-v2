# UI Function Mapping

## Scope and PM Decision

Task 003-B의 확정 목업과 v2 코드를 기준으로 한 설계 문서다. Task 003-C2에서 Landing과 Teacher Login 영역을 구현했으며 DB는 변경하지 않았다.

> v2에서는 금융반 특화 기능을 두지 않는다. 금융반에서 사용하던 출력·PDF·Excel·학부모 확인서·Sticky Table 등 유용한 기능을 금융/창업/유통/보건 4개 학급에 공통 제공한다. 기능은 공통화하되 담임 데이터 접근은 현재 인증된 학급으로 격리한다.

허용 분류는 `KEEP`, `MOVE`, `REDESIGN`, `COMMON`, `NEW`, `REMOVE_CANDIDATE`, `FUTURE`다.

## Route Inventory

| Route | 사용자 | 현재 목적·주요 구성요소 | 새 목업 위치 | 변경 방식 |
| --- | --- | --- | --- | --- |
| `/` | 교사 | 네 학급 선택 | Landing | REDESIGN — C2 구현 |
| `/apply/[code]` | 학생 | access_code 조회, `StudentApplicationWorkspace`, 자동 저장 | 학생 모바일 입력 화면 | KEEP + REDESIGN |
| `/teacher` | 교사 | 선택 학급 로그인/최초 등록 또는 인증 학급 학생 목록 | Login/App Shell/Dashboard/학생 관리 | REDESIGN + 분리 — Login C2 구현 |
| `/teacher/login` | 교사 | `/teacher`로 이동 | 담임 로그인 | REMOVE_CANDIDATE 또는 실제 route로 재사용 |
| `/teacher/change-password` | 교사 | `/teacher`로 이동 | 최초 비밀번호 설정/설정 | REMOVE_CANDIDATE 또는 실제 route로 재사용 |
| `/teacher/students/[id]` | 교사 | 학생 상세, application/checklist, export, finance import | 공통 Student Detail tabs | REDESIGN + COMMON |
| `/teacher/students/[id]/print` | 교사 | A4 출력/PDF 저장 | 공통 출력 | KEEP + REDESIGN |
| `/teacher/students/[id]/export/xlsx` | 교사 | 학생 Excel 응답 | 공통 출력/다운로드 | KEEP + COMMON |

신규 Dashboard·학생 관리·링크 관리·출력센터는 기존 기능을 우선 재배치하며 route 결정은 구현 Task에서 확정한다.

## Component Inventory

| Component | Current Purpose | New Role | Decision | Notes |
| --- | --- | --- | --- | --- |
| `ClassSelector` | 학급 선택·인증·최초 비밀번호 | `ClassCard` + `LoginCard` | REFACTOR | 네 학급 공통, 표시명은 UI에서 금융반 |
| `TeacherHeader` | 제목·뒤로가기·학급 잠금 | App Shell header | REFACTOR | Sidebar와 중복 navigation 정리 |
| `AppFooter` | 교사 footer | Dark Navy 공통 footer | REPLACE_VISUAL_ONLY | privacy/guide 링크 정책 필요 |
| `StudentFooter` | 학생 footer | 동일 브랜드 footer | REPLACE_VISUAL_ONLY | 학생 모바일 유지, print 숨김 |
| `AddStudentForm` | 현재 학급 학생 추가 | 학생 관리 toolbar/modal | MOVE + REFACTOR | 인증 학급 고정 |
| `CopyLinkButton` | 현재 origin 링크 복사 | Link Management 및 상세 quick action | MOVE + KEEP | 재발급 기능 아님 |
| `DeleteStudentButton` | 학생 삭제 | 학생 관리 overflow action | MOVE | 위험 action 확인 강화 |
| `ApplicationTable` | 지원대학 CRUD·자동저장 | 공통 Student Detail | REDESIGN + COMMON — C5 구현 | sticky header/4열, finance UI 분기 제거 |
| `ChecklistPanel` | application별 checklist | 공통 checklist tab | KEEP + REDESIGN | 네 학급 공통 |
| `StudentApplicationWorkspace` | 학생 application/checklist | 학생 모바일 shell | REFACTOR | 기존 링크·자동저장 유지 |
| `StudentExportActions` | Excel/PDF/print | 공통 Export Actions | MOVE + COMMON — C5 배치 구현 | 문서/학부모 확인서는 C6 |
| `StudentPrintDocument` | A4 학생 출력 | 공통 student document | REDESIGN + COMMON — C6 구현 | 네 학급 공통 추가 열, A4 landscape |
| `PrintPageActions` | print/PDF 실행 | `PrintActionGroup` | REUSE | 공통 출력 |
| `AdmissionExcelImport` | finance 입결 Excel import | 공통 import capability | REFACTOR + COMMON | 학급별 format adapter 필요 |
| `InterestPdfImport` | finance 관심대학 PDF import | 공통 import capability | REFACTOR + COMMON | 학급별 format adapter 필요 |

## Feature Mapping

| 기존/목표 기능 | 현재 Route/Component | 새 화면 | 분류 | 유지 조건 |
| --- | --- | --- | --- | --- |
| 학급 선택·인증 | `/teacher`, `ClassSelector` | Landing + Login | KEEP + REDESIGN + COMMON | class session 유지 |
| 학생 목록·검색 | `/teacher?class=...&view=students` | 학생 관리 | MOVE + REDESIGN + COMMON — C4 구현 | 인증 class_code 서버 필터 |
| 학생 추가·삭제 | `/teacher?class=...&view=students` | 학생 관리 | MOVE + COMMON — C4 구현 | 기존 Action과 권한 검증 재사용 |
| 지원대학 CRUD/자동저장 | application table/actions | Student Detail | KEEP + REDESIGN + COMMON | access_code·소유권 검증 유지 |
| checklist | `ChecklistPanel` | Student Detail checklist | KEEP + REDESIGN + COMMON | student/application 관계 유지 |
| 링크 복사 | 목록·상세 `CopyLinkButton` | 링크 관리 | MOVE + COMMON | 기존 access_code 사용 |
| Excel export | export route | 출력/다운로드 | KEEP + COMMON | finance 조건 제거 설계 |
| PDF/print | print route/actions | 출력/다운로드 | KEEP + COMMON | 웹 footer 출력 제외 |
| 학부모 확인서 | 금융 전용 원본 확인 | Student Detail 출력 | NEW + COMMON — C6 구현 | `mode=parent`, 실제 학급명·학생 데이터 |
| sticky header | `ApplicationTable` | Student Detail | KEEP + COMMON | 모든 학급 동일 |
| sticky left columns | 없음 | Student Detail | NEW + COMMON | 순번~모집단위 고정 |
| Excel/PDF import | finance 고정 actions | Student Detail/Import | REDESIGN + COMMON | 공통 엔진 + 학급별 포맷 |
| Dashboard metrics | class-filtered student stats | Dashboard | NEW + COMMON — C3 구현 | 실제 입력/체크리스트 지표만 사용 |
| 상태 필터 | 없음 | 학생 관리 | NEW + COMMON | PM 상태 정의 필요 |
| 전체 링크 Excel·안내문 | 없음 | 링크 관리 | NEW + COMMON | v2 배포 origin 단일 기준 |
| 공지사항·설정 | 없음 | Sidebar | FUTURE | 데이터/권한 요구 별도 |
| 중복 login/change-password redirect | redirect-only routes | Login/Settings | REMOVE_CANDIDATE | 삭제 전 링크/회귀 조사 |

## Existing Finance-only Branches → COMMON Redesign

| 위치 | 현재 제한 | 공통화 설계 | 변경 종류 |
| --- | --- | --- | --- |
| `application-table.tsx` | finance만 합격컷/비고 필드 표시 | 공통 schema/column config 또는 모든 학급 동일 열 | 코드 변경; DB 컬럼은 이미 nullable/default 구조 |
| `student-print-document.tsx` | finance만 추가 열 출력 | 공통 출력 템플릿에서 동일 필드 지원 | 코드 변경 |
| `student-export-excel.ts` | finance만 추가 Excel 열 | 공통 workbook column set | 코드 변경 |
| student detail page | finance만 import UI 노출 | 공통 ImportPanel | 코드 변경 |
| `excel-import-actions.ts` | finance session·student query 고정 | 인증 session.classCode를 사용 | 코드 변경, 데이터 격리 필수 |
| `import-actions.ts` | finance session·student query 고정 | 인증 session.classCode를 사용 | 코드 변경, 포맷 adapter 필요 |

finance migration이 만든 지원정보 컬럼을 네 학급에서 공통 의미로 사용하려면 용어·보존 정책 확인이 필요하지만 새 컬럼 추가는 현재 설계상 필수로 보이지 않는다. 학부모 확인서와 안내문은 코드/UI 기능이며 URL을 DB에 보존하지 않으므로 DB 변경 없이 제공한다. 작성 상태를 영속 상태로 만들면 별도 DB migration이 필요하다.

## Common Student Detail

모든 학급이 동일한 학생 기본정보와 `지원대학 / 체크리스트 / 제출서류 / 기록 / 출력` 구조를 사용한다. 출력은 Excel, PDF, 인쇄, 학부모 확인서를 공통 제공한다. classCode/className은 props 또는 서버 데이터이며 학급별 page 복제는 금지한다.

## Parent Confirmation — NEW / COMMON

- 접근: Teacher → 인증 학급 → 학생 상세 → 출력 → 학부모 확인서
- 제목: `2026학년도 [학급명] 수시 지원 현황`
- 내용: 학번, 이름, 현재 실제 지원행(최대 표시량은 구현 전 정책 확인), 대학·모집학부·전형정보, 확인 문구, 날짜, 학부모 성명/서명, 영동미래고등학교
- A4 portrait, 웹 footer 미출력
- 학급명은 student.class_code의 표시명에서 가져오고 finance 조건문을 두지 않는다.

## Sticky Table — NEW / COMMON

| 열 | 제안 폭 | 누적 left |
| --- | ---: | ---: |
| 순번 | 56px | 0px |
| 지역 | 88px | 56px |
| 지원대학 | 180px | 144px |
| 모집단위 | 200px | 324px |

- header `position: sticky; top: 0; z-index: 30`
- 고정 body 열 `z-index: 10`, 고정 header 교차부 `z-index: 40`
- 불투명 white/slate 배경과 마지막 고정 열 오른쪽 border/shadow
- 네 학급 동일 동작; classCode 분기 금지
- mobile은 horizontal scroll을 유지하되 화면 폭이 매우 작으면 순번+지원대학만 고정하는 축소안은 구현 QA에서 접근성 검증 후 결정

## Link Management — NEW / COMMON

링크 관리는 개별 링크 / 일괄 Excel / 안내문을 제공한다. 개별 표는 학번·이름·access_code 존재 기반 상태와 관리 action을 표시한다.

- 링크 복사, 전체 링크 Excel, 전체 링크 복사
- 학생별 안내문 및 일괄 출력
- 링크 재생성 UI는 만들지 않는다.
- **DOMAIN POLICY REQUIRED:** v2/이전 도메인 중 신규 출력 기준을 PM이 확정해야 한다.

## Dashboard and Status

현재 가능한 값은 전체 학생 수, 지원대학이 1개 이상인 학생 수, 학생별 지원대학 수, checklist 완료/전체 수다. 명시적 완료 상태와 학생 단위 최근 수정 집계는 없다.

- 미작성 후보: filledCount 0
- 진행 중 후보: filledCount > 0
- 완료: 별도 완료 버튼/상태 또는 명확한 계산 규칙 필요
- **PM DECISION REQUIRED:** 완료 기준과 상태 변경 주체
- **NEW DATA REQUIREMENT:** 완료 상태 영속화, 학생 단위 최근 수정일, 공지사항

## Implementation Phases

1. **003-C1 Design Foundation:** token, typography, button, card, footer, status badge
2. **003-C2 Landing + Teacher Login:** 네 class card, login, first-time setup
3. **003-C3 Teacher App Shell + Dashboard:** sidebar, header, metric cards, navigation — 구현 완료
4. **003-C4 Student Management:** server search, desktop table, mobile cards, add/delete — 구현 완료; status tabs는 정책 확정 전 미구현
5. **003-C5 Student Detail:** common application/checklist, sticky header/columns, common export entry — 구현 완료
6. **003-C6 Common Document Output:** 학생별 PDF/Excel/print와 금융 원본 기반 네 학급 공통 학부모 확인서 구현 완료
7. **003-C7A Link Management:** 텍스트 링크, Excel, 안내문 공통 기능; QR은 정책 변경으로 제거
8. **003-C8 Responsive + Regression QA:** desktop/tablet/mobile/print/link 회귀
# C7 mapping update — 2026-08-12

| 기능 | 분류 | 구현 |
|---|---|---|
| 네 학급 학생 링크 관리 | COMMON | `/teacher?...&view=links`, 서버 class query |
| 개별 링크 복사/fallback | MOVE + COMMON | 기존 `/apply/[code]`, v2 배포 origin |
| QR 확인·저장 | REMOVE | C7A PM 정책 변경으로 코드·dependency·QA 제거 |
| 학급 링크 Excel | NEW + COMMON | ExcelJS, 인증 학급 전용 |
| 학생·학부모 접속 안내문 | NEW + COMMON | 별도 A4 Portrait 문서 |
| 학부모 확인서 | COMMON — PROTECTED | C6 `mode=parent`; C7 안내문과 병합 금지 |
