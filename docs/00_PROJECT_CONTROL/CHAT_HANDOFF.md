# Chat / Codex Handoff

새 대화 시작 시 다음과 같이 요청한다.

> CHAT_HANDOFF.md와 PROJECT_DASHBOARD.md를 읽고 이어서 진행해줘

## Project

영동미래고 수시자료 취합 시스템

## CURRENT

- PROJECT_ROOT: `C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2`
- GitHub: `jungboh/susi-distribution-v2`
- Netlify candidate: `susi-distribution-v2.netlify.app`
- Git: 작업 브랜치 `codex/issue-2-task-003-c8c-teacher-consultation-autosave`, `origin/main` 대비 2 ahead / 0 behind, push 안 됨 (2026-08-13 기준, Task 003-B0 문서화 시점의 `main` 0/0 상태에서 이후 갱신)

## ACTIVE_COMPATIBILITY

- 이전 통합: `jungboh/susi-distribution`, `susi-distribution.netlify.app`
- 기존 금융 전용: `jungboh/susi`, `susi2026.netlify.app`
- 기존 학생 URL 보호를 위해 상태 확인 전 삭제·redirect·archive하지 않는다.

## External Status

- 세 Netlify URL은 2026-08-12 HTTP 200 응답 확인
- v2 Netlify의 연결 Git/site ID/branch/build 설정: **UNKNOWN — Dashboard 확인 필요**
- Supabase `0010` 운영 적용 및 finance 데이터: **UNKNOWN**

## Classes and Features

- 4개 학급 코드: finance(표시명 금융과), startup, distribution, health — CONFIRMED
- finance 조건부 필드, Excel/PDF import, Excel export, 인쇄/PDF 저장 — 현재 코드에서 CONFIRMED
- 학부모 확인서 전용 출력 — IMPLEMENTED FROM VERIFIED FINANCE SOURCE
- sticky header — CONFIRMED; 왼쪽 순번·지역·지원대학·모집단위 sticky — MISSING

## Critical Link Rule

`/apply/[code]`, access_code, student UUID, 기존 URL과 applications/checklist를 절대 변경하지 않는다. C7A의 신규 텍스트 링크는 기존 문서가 확인한 v2 Netlify origin을 단일 기준으로 사용한다.

## PM Decision — Mandatory

v2에서는 금융반 특화 기능을 두지 않는다. 금융반에서 사용하던 출력·PDF·Excel·학부모 확인서·Sticky Table 등 유용한 기능을 금융/창업/유통/보건 4개 학급에 공통 제공한다.

기능은 공통화하되 담임 데이터 접근은 현재 인증된 학급으로 격리한다. 학급 전용 기능 분류는 사용하지 않고 `KEEP/MOVE/REDESIGN/COMMON/NEW/REMOVE_CANDIDATE/FUTURE`만 사용한다.

## UI Baseline

Blue/Gray, Deep Navy, White, rounded card, 얇은 border, 절제된 shadow, 명확한 table, desktop 중심 responsive. Landing에는 영동미래고등학교와 2026학년도 수시자료 취합 시스템, 금융반·창업반·유통반·보건반을 표시하며 학교명 앞 로고는 사용하지 않는다. Footer 목표는 `© 2026 jungboh All rights reserved.`와 `개인정보처리방침 | 이용안내`다.

## Last Completed Task

Task 003-C8C — Consultation Field Autosave Engine (`8f6c715`), 이어서 post-C8C 스타일링 패스(`b4de609`, Task 번호 미부여). 둘 다 로컬 구현 완료, **push 안 됨**, 사용자 게시 승인 대기.

## C6 Implementation

학생별 Excel과 `/teacher/students/[id]/print?auto=1&intent=pdf|print` 구조를 유지했다. 일반 출력은 A4 landscape 10mm이며 Excel은 네 학급 공통 23열이다. 학부모 확인서는 기존 금융 전용 `jungboh/susi`의 `StudentPrintDocument` 원본을 확인해 `?mode=parent`로 구현했다. 원본의 2026학년도 확인 문구, 학생과의 관계, 학부모 성명·서명란, A4 Portrait 구성과 하단 영동미래고등학교 표기를 보존한다. 학생 정보·학급·지원대학·제출서류만 검증된 실제 데이터로 치환하며 QR/접속 URL은 넣지 않는다. C7 안내문과 별도 문서다.

## C8C Implementation — 2026-08-13 문서 갱신

37개 상담 필드 중 신규 22개(Teacher 편집)를 위한 field-key 단위 자동저장 엔진을 구현했다. in-flight guard와 최신값 coalescing으로 동일 필드 중복 저장이 순서를 벗어나 완료되는 것을 막고, blur flush·application 전환 flush(에러 필드 있으면 `confirm()`)·`beforeunload` 경고를 추가했다. `consultation-panel.tsx`에 application state를 끌어올려 신규 editor와 기존 application table이 서로의 미저장 편집을 덮어쓰지 않도록 동기화했다. 기존 15개 필드 저장 계약과 신규 22개 Teacher-only allowlist에는 회귀가 없다(로컬 typecheck/lint/build 통과, PM 페르소나 'j' 리뷰 GO).

## Post-C8C 스타일링 패스 — 2026-08-13 문서 갱신

기존 Tailwind 토큰만으로 목업 시각 언어를 landing class card(navy+아이콘+로그인 버튼), sidebar(nav 아이콘), dashboard(metric card 아이콘 배지), 링크 관리(개별/일괄/안내문 3-tab)에 적용했다. 목업에는 QR 코드 출력 탭·QR 열·QR 일괄 출력 버튼이 있으나, Task 003-C7A의 "QR을 절대 구현하지 않는다"는 PM 정책 결정에 따라 QR은 계속 제외한다. 완료/진행중/미작성 상태 분류, 진행률 도넛차트, 최근 작성 학생 목록, 실제 공지사항 데이터도 목업에는 있지만 판정 규칙·데이터 모델이 없어 이번 패스에서 구현하지 않았다(별도 PM 결정 필요, `PROJECT_DASHBOARD.md` Known Gaps 참고).

## Next Task

Task 003-C8D — Student 기존 편집 15개 보존 + 신규 22개 읽기 전용 상담 화면. 착수 근거 없음, PLANNED. 그 전에 로컬 미push 커밋(`8f6c715`, `b4de609`)의 PM 검토·게시 승인이 필요하다.

## Implementation Phases

C1 Design Foundation, C2 Landing/Login, C3 App Shell/Dashboard, C4 Student Management, C5 Common Student Detail, C6 Common Document Output, C7 Common Link Management, C8 Responsive/Regression QA.

## Resume Order

1. `PROJECT_OVERVIEW.md`
2. `PROJECT_DASHBOARD.md`
3. `CURRENT_TASK.md`
4. `CHAT_HANDOFF.md`
5. 관련 Architecture/Operations 문서
# Task 003-C7 handoff — 2026-08-12

Task 003-C7A는 구현 및 로컬 정적 검증 후 **READY FOR PM REVIEW**다. 교사 화면은 `/teacher?class={class_code}&view=links`, Excel은 `/teacher/links/export/xlsx`, 안내문은 `/teacher/links/guide`다. 학생 URL은 기존 `/apply/[access_code]`만 사용하며 access_code·UUID·DB를 변경하지 않았다. 복사·Excel·안내문은 기존 저장소 문서가 현재 배포로 확정한 `https://susi-distribution-v2.netlify.app`과 단일 helper를 사용한다.

QR 기능은 PM 정책 변경으로 UI·Dialog·생성·PNG·인쇄·안내문·CSS·type·dependency에서 완전히 제거했다. Excel과 안내문은 client 목록을 신뢰하지 않고 Teacher session과 요청 class를 재검증한 뒤 서버에서 그 학급만 조회한다.

**Excel·Print 필수 유지:** QR만 제거한다. 인증 학급 전체 링크 Excel route와 순번·학급·학번·이름·학생 접속 URL·상태 열, 표시 URL과 hyperlink target, 학생·학부모 접속 안내문 route, 학생정보·텍스트 URL, 학생별 A4 Portrait 페이지 분리, 브라우저 Print, 인쇄 전용 CSS, 마지막 빈 페이지 방지는 C7A 보호 범위다. QR가 있던 공간은 접속 절차와 텍스트 URL의 가독성에 사용한다. C6 Excel·PDF·Print와 학부모 확인서 A4 Print도 변경하지 않는다.

**회귀 보호:** `parent-confirmation-document.tsx`, 학생 상세의 `학부모 확인서` 버튼, `?mode=parent`, 금융 원본 확정 문구, 학생과의 관계·학부모 성명·서명란, A4 Portrait, 하단 `영동미래고등학교`, QR·학생 URL 미포함을 유지한다. C7 학생·학부모 접속 안내문은 별도 route·CSS의 별도 문서이며 두 문서를 병합하지 않는다.

실제 로그인, 네 학급 격리 공격, Clipboard, Excel 열기/하이퍼링크, A4 인쇄 미리보기, 1440/1280/1024/768/390 브라우저 QA는 아직 실행하지 않았으므로 PASS가 아니다. QR 스캔은 정책 변경으로 Release QA에서 제거했다. Commit/Push/Deploy 없이 PM 검토를 기다린다.
