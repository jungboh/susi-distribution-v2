# Routes and Authentication

## 학생 라우트

- `/apply/[code]`: code로 학생을 조회한다. 없으면 404, 있으면 학생 UUID에 연결된 applications와 checklist를 표시한다.
- 학생 페이지는 교사 세션과 독립적으로 기존 access_code로 접근한다.
- 실제 access_code 값은 문서화하지 않는다.
- 링크 복사 UI는 `${window.location.origin}/apply/${code}`를 사용하므로 접속 중인 site origin이 새 복사 링크의 base domain이다.

## 교사 라우트

- `/`: 금융반·창업반·유통반·보건반 공통 Landing
- `/teacher?class={class_code}`: 선택 학급 최초 비밀번호 등록/로그인; 인증 완료 시 해당 학급 Dashboard
- `/teacher?class={class_code}&view=students`: C4 전까지 유지하는 기존 학생 관리 화면
- `/teacher/login`, `/teacher/change-password`: `/teacher`로 redirect하는 기존 호환 route
- `/teacher/students/[id]`: 학생 상세; 학생 학급과 세션 학급이 같아야 한다.
- `/teacher/students/[id]/print`: 출력 화면
- `/teacher/students/[id]/export/xlsx`: Excel 응답 라우트

## 교사 인증

- 자격 증명은 `susi_class2_teacher_class_credentials`에서 학급별로 조회한다.
- 비밀번호는 scrypt hash와 salt로 확인한다.
- 쿠키 `susi_class2_teacher_class_session`은 HMAC 서명된 payload에 classCode, sessionVersion, 만료시각을 담는다.
- 쿠키는 HttpOnly, SameSite=Lax, production에서 Secure, 최대 12시간이다.
- 요청마다 DB의 must_change_password와 session_version을 비교해 세션을 검증한다.
- HMAC에는 32자 이상 `TEACHER_AUTH_SECRET`이 필요하다.

## Middleware와 권한 확인

middleware 파일은 현재 없다. 페이지와 Server Actions가 `requireTeacherClassSession` 또는 `readVerifiedTeacherClassSession`으로 교사 권한 및 학급 일치를 검증한다. 학생 저장 액션은 access_code와 리소스 소유 관계를 확인한다.

운영 쿠키와 자격 증명 상태는 Task 003-A에서 조회하지 않아 UNKNOWN이다.

v2 코드의 학급 인증은 finance를 포함한 네 class_code를 같은 HMAC cookie/session_version 구조로 처리한다. finance credential의 운영 DB 존재 여부는 UNKNOWN이다.

Task 003-C2는 인증 로직을 변경하지 않고 기존 mode 조회·로그인·최초 등록 Server Action을 새 공통 panel에서 호출한다. class query 누락/오류는 `/`로 돌려보내며, 인증 세션의 classCode가 선택 class_code와 일치해야 기존 학생 목록을 조회한다.
# C7 링크 배포 route

| Route | 용도 | 보호 |
|---|---|---|
| `/teacher?class={class_code}&view=links` | 인증 학급 링크 목록·검색 | verified Teacher session과 class 일치 |
| `/teacher/links/export/xlsx?class={class_code}` | 학급 전체 링크 Excel | route에서 session/class 재검증, 서버 학급 query, private no-store |
| `/teacher/links/guide?class={class_code}[&student={uuid}]` | 일괄/개별 접속 안내문 | session/class 재검증, 개별 학생도 student.class_code 일치 |

학생 목적지는 기존 `/apply/[access_code]`다. access_code/UUID 연결은 변경하지 않으며 UUID는 학생 접속 URL·Excel에 포함하지 않는다. 복사·Excel·안내문은 저장소 배포 문서에 명시된 `https://susi-distribution-v2.netlify.app`을 단일 origin으로 사용한다. 요청 Host나 forwarded Host는 URL 생성에 사용하지 않으며 access_code는 공통 helper에서 정확히 한 번 encode한다.
