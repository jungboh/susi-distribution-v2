# Routes and Authentication

## 학생 라우트

- `/apply/[code]`: code로 학생을 조회한다. 없으면 404, 있으면 학생 UUID에 연결된 applications와 checklist를 표시한다.
- 학생 페이지는 교사 세션과 독립적으로 기존 access_code로 접근한다.
- 실제 access_code 값은 문서화하지 않는다.

## 교사 라우트

- `/`, `/teacher/login`, `/teacher/change-password`: `/teacher`로 redirect
- `/teacher`: 학급 선택, 최초 비밀번호 등록/로그인, 인증 학급의 학생 목록
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
