# CURRENT TASK

- **Task:** 003-C7A — QR Removal + Student URL Policy Simplification
- **Status:** READY FOR PM REVIEW
- **Scope:** QR 기능 전체 제거, 텍스트 링크 중심 링크 관리·복사 fallback·학급 Excel·A4 접속 안내문 유지
- **Student URL source:** `STUDENT_LINK_ORIGIN = https://susi-distribution-v2.netlify.app`
- **Evidence:** 저장소 `CLAUDE.md`와 `docs/02_OPERATIONS/NETLIFY_DEPLOY.md`에 현재 v2 배포 URL로 명시된 기존 설정
- **Consistency:** 복사·Excel 표시/target·안내문이 모두 `buildStudentUrl(accessCode)` 사용
- **Encoding:** access_code는 helper에서 `encodeURIComponent`를 정확히 한 번 적용
- **Isolation:** Teacher session과 요청 class 일치 후 서버에서 해당 class_code만 조회
- **QR:** PM 정책 변경으로 제거. 코드, UI, 안내문, CSS, type, dependency, QA 항목 없음
- **Excel/Print 필수 유지:** 인증 학급 전체 링크 Excel의 6개 열과 hyperlink, 안내문 route, 학생정보·텍스트 URL, 학생별 A4 Portrait, 브라우저 Print, print CSS, 마지막 빈 페이지 방지를 삭제·축소하지 않는다.
- **Guide layout:** QR가 있던 공간은 접속 절차와 줄바꿈 가능한 텍스트 URL의 가독성을 높이는 데 사용한다.
- **DB / Migration / Environment / Netlify:** 변경 없음
- **Protected:** C6 학부모 확인서 파일·버튼·`mode=parent`·문구·서명·A4 CSS 무변경
- **Protected C6 outputs:** 기존 학생별 Excel·PDF·Print route와 동작을 유지한다.
- **Remote QA:** 실제 로그인, Clipboard, Excel, A4 안내문, viewport 검증은 미실행
- **Stop:** Commit/Push/Deploy 및 다음 Task 자동 착수 없이 PM 검토 대기
