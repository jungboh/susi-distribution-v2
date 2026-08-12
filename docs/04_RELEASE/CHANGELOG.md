# Changelog

## Task 003-C6 — 2026-08-12

- 기존 학생별 Excel·PDF intent·Print intent route 유지
- 출력 문서 title/school/class/student/객관적 count header 통일
- Print 지원대학 표에 공통 합격컷 및 추가 비고 포함
- A4 landscape 10mm margin과 다중 페이지 header/행 break 정책 적용
- Checklist 새 페이지 및 항목 break 방지
- 인쇄 시 C5 Sticky 스타일과 웹 Action 제거
- Excel 지원대학 sheet를 네 학급 공통 23열로 통일
- 기존 금융 전용 `jungboh/susi` 원본 학부모 확인서 양식 확인
- 확정 확인 문구·관계·학부모 성명·서명 영역을 보존한 네 학급 공통 문서 구현
- `?mode=parent`에서 세션·학생 소속 재검증을 재사용하고 A4 Portrait 적용
- QR·학생 URL을 포함하지 않으며 C7 접속 안내문과 분리
- DB/migration/auth/student link/dependency 변경 없음
- commit/push/deploy 없음

## Task 003-C5 — 2026-08-12

- 기존 학생 상세 route를 TeacherAppShell 공통 화면으로 개편
- 학생 기본정보와 실제 지원대학/checklist 요약 구현
- URL class/session/student class 서버 일치 검증 강화
- 기존 Application CRUD·자동 저장·Checklist 로직 재사용
- Application Table sticky header 구현
- desktop 순번·지역·지원대학·모집단위 sticky, mobile 순번 sticky 구현
- 금융 추가 열을 네 학급 공통 열로 노출
- Excel/PDF/Print 공통 Export 진입 영역 정리
- DB/migration/auth/student link/dependency 변경 없음
- commit/push/deploy 없음

## Task 003-C4 — 2026-08-12

- TeacherAppShell 내부 공통 Student Management 구현
- desktop DataTable과 mobile compact student card 구현
- 이름·학번 검색, 검색 초기화, 전체/검색 결과 수 구현
- 기존 학생 추가 Action의 pending/error 접근성 UI 개선
- 기존 학생 삭제 Action의 확인·pending·실패 안내 개선
- 기존 학생 상세 route와 개인 링크 복사 유지
- class-filtered server query 및 상태 정책 PENDING 유지
- DB/migration/auth/student link/dependency 변경 없음
- commit/push/deploy 없음

## Task 003-C3 — 2026-08-12

- 네 학급 공통 Teacher App Shell, Sidebar, Header 구현
- desktop 고정 Sidebar와 tablet/mobile drawer 구현
- 실제 학급 데이터 기반 Dashboard metric과 입력 참여율 구현
- 작성 완료/진행 중/미작성 임의 정책 미구현
- 기존 학생 관리 기능을 `view=students`로 연결
- 기존 학급 잠금 Action과 SiteFooter 재사용
- DB/migration/auth/student link/dependency 변경 없음
- commit/push/deploy 없음

## Task 003-C2 — 2026-08-12

- `/` 네 학급 공통 Landing 및 class card 구현
- 선택 학급 담임 로그인/최초 비밀번호 등록 panel 구현
- 기존 인증 Server Action과 검증된 class session 재사용
- 잘못되거나 누락된 class query는 Landing으로 복귀
- 인증·DB·학생 링크·dependency 변경 없음
- typecheck, lint, production build 통과
- commit/push/deploy 없음

## Task 003-C1 — 2026-08-12

- CSS variable/Tailwind semantic design token 구현
- Typography, Button, Card, StatusBadge foundation 구현
- PageContainer, PageHeader, PageSection, EmptyState 구현
- DataTable visual foundation 구현(Sticky Columns 제외)
- 교사/학생 공통 Deep Navy Footer 적용
- 새 dependency, DB/migration/auth/link 변경 없음
- commit/push/deploy 없음

## Task 003-B — 2026-08-12

- PM 확정 목업 기준 route/component/feature inventory와 UI mapping 작성
- finance 전용 기능 분류를 폐지하고 네 학급 COMMON 기능 정책 확정
- 학부모 확인서, sticky columns, 링크·안내문과 상태 UX 설계; 당시 QR 초안은 후속 C7A 정책으로 폐기
- UI design system 및 학생 링크 배포·보호 문서 생성
- Task 003-C1~C8 구현 phase 정의
- 기능·CSS·DB·migration 변경 없음, commit/push/deploy 없음

## Task 003-B0 — 2026-08-12

- v2 local/GitHub baseline과 origin/main 동기화 확인
- v2가 finance 및 금융용 Excel/PDF 기능을 추가한 기능 통합본임을 확인
- 세 Netlify URL 공개 응답 및 v2 외부 연결 메타데이터 미확인 상태 기록
- 4개 학급, 링크, 인증, Supabase local migration, 학년도/기능 gap 감사
- Source of Truth를 v2 CURRENT 기준으로 갱신
- 기능·DB·학생 데이터 변경 없음, commit/push/deploy 없음

## Task 003-A-DOC — 2026-08-11

- 실제 Desktop, 작업 폴더 및 PROJECT_ROOT 확인
- 통합 Git 저장소, branch와 기존 working tree 상태 확인
- 기존 문서의 유효한 내용을 보존하며 공식 명칭과 인수인계 기준 보완
- 애플리케이션 기능 변경 없음
- DB/Supabase/migration 변경 없음
- commit, push, deploy 없음

## Task 003-A — 2026-08-11

- 새 컴퓨터의 Desktop에 독립 작업환경 구성
- `jungboh/susi-distribution` clone 및 개발환경 검증
- 프로젝트 문서 체계 Bootstrap
- Project Control, Architecture, Operations, Academic Year, Release 문서 생성
- 기능 변경 없음
- 애플리케이션 코드 변경 없음
- DB/Supabase 변경 없음
- commit, push, deploy 없음
## Task 003-C7 — 2026-08-12

- Teacher Navigation과 공통 링크 관리 화면 추가
- 학번/이름 서버 검색, desktop table/mobile card, access_code 존재 기반 상태 구현
- 실제 `/apply/[access_code]` 개별 링크 복사 및 Clipboard 수동 fallback 구현
- QR 초안 구현은 후속 Task 003-C7A PM 정책 변경으로 전부 제거
- Teacher session/class 재검증 학급 링크 Excel 및 A4 학생·학부모 접속 안내문 구현
- localhost 배포 artifact 방지, private no-store Excel 응답, raw 오류 비노출 적용
- C6 학부모 확인서 protected files와 parent print CSS 무변경; 안내문과 분리 유지
- DB/Migration/Supabase/Netlify/environment/운영 데이터 변경 없음
- Commit/Push/Deploy 없음; 원격 브라우저 QA 대기

## Task 003-C7A — 2026-08-12

- PM 정책 변경에 따라 C7 QR 버튼·Dialog·생성·PNG 저장·인쇄·안내문 QR·상태·CSS·type을 제거
- `qrcode@1.5.4`와 package-lock 신규 의존성 항목 제거
- 복사·Excel·안내문 URL을 공통 `buildStudentUrl()`로 통일
- 기존 배포 문서가 확정한 `https://susi-distribution-v2.netlify.app`을 단일 origin으로 사용하고 요청 Host 신뢰 제거
- access_code encode는 공통 helper에서 정확히 한 번 적용
- QR 완료 항목과 QR 스캔 Release QA는 “정책 변경으로 제거” 처리
- C6 학부모 확인서 보호 파일·문구·route·A4 CSS 무변경
- DB/Migration/Supabase/Netlify/environment/운영 데이터 변경 없음
