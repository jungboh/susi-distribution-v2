# Student Link Distribution

## 확정 정책

- 학생 route와 access_code는 기존 `/apply/[code]`를 그대로 사용한다.
- 신규 배포 링크 origin은 저장소 `CLAUDE.md`와 `NETLIFY_DEPLOY.md`가 현재 v2 배포로 명시한 `https://susi-distribution-v2.netlify.app`이다.
- 복사, Excel 표시 URL/hyperlink target, 안내문 텍스트 URL은 모두 `buildStudentUrl(accessCode)`를 사용한다.
- helper가 access_code에 `encodeURIComponent`를 정확히 한 번 적용한다.
- 요청 Host, `x-forwarded-host`, localhost, loopback, `.local`은 운영 링크의 기준으로 사용하지 않는다.
- 신규 환경변수나 Netlify 설정은 추가하지 않는다.

## 제공 기능

- 인증 학급 학생 링크 목록과 이름·학번 검색
- 개별 전체 URL Clipboard 복사와 readonly 수동 fallback
- 인증 학급 전용 링크 Excel
- 학생별 또는 학급 일괄 학생·학부모 접속 안내문
- A4 Portrait, 학생별 페이지 분리, 텍스트 URL 줄바꿈

## Excel·Print 회귀 보호

- `/teacher/links/export/xlsx`를 유지하며 인증 학급 전체 학생만 서버 조회한다.
- Excel 열은 순번·학급·학번·이름·학생 접속 URL·상태를 유지한다.
- URL cell의 표시 문자열과 hyperlink target은 동일한 공통 helper 결과다.
- `/teacher/links/guide`와 브라우저 Print action을 유지한다.
- 안내문에는 실제 학생정보, 접속 절차, 줄바꿈 가능한 텍스트 URL을 배치한다.
- `@page` A4 Portrait, 학생별 `break-after`, 마지막 학생의 break 해제를 유지한다.
- QR 제거를 이유로 Excel route, 안내문 route, Print CSS를 삭제하거나 비활성화하지 않는다.
- C6의 학생별 Excel·PDF·Print와 학부모 확인서 A4 Print는 별도 보호 대상이다.

QR 관련 UI·생성·저장·인쇄·안내문 요소·dependency·QA는 Task 003-C7A PM 정책 변경으로 제거했다.

## 보안

- Teacher session과 요청 class_code 일치 후 서버에서 해당 학급만 조회한다.
- 개별 안내문은 조회 학생의 class_code도 재검증한다.
- 학생 UUID, access_code 단독 값, 실제 학생 목록은 Excel·문서·로그에 별도 노출하지 않는다.
- Excel은 `private, no-store`이며 URL 표시값과 hyperlink target이 같다.
- 학부모 확인서는 C6 서명 문서이고 C7A 접속 안내문과 별도 route·CSS로 유지한다.

## Release QA

- 네 학급 인증과 다른 학급 직접 접근 차단
- 개별 링크 복사와 Clipboard 실패 fallback
- Excel 표시 URL과 hyperlink target
- 안내문 텍스트 URL과 A4 페이지 분리
- 1440/1280/1024/768/390 반응형 및 keyboard 접근

QR 스캔 QA는 정책 변경으로 제거했다. 실행하지 않은 브라우저·운영 검증은 PASS로 기록하지 않는다.
