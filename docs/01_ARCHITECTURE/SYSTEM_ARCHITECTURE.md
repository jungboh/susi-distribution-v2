# System Architecture

## 확인 범위

이 문서는 Task 003-A 시점의 저장소 코드와 로컬 SQL만 기준으로 한다. 운영 Supabase와 Netlify 설정은 조회하지 않았다.

## 애플리케이션

- Next.js 15 App Router와 React 19, TypeScript를 사용한다.
- Tailwind CSS 3으로 UI를 구성한다.
- `src/app`이 라우트와 Server Actions를, `src/components`가 화면 구성요소를 담당한다.
- `src/lib/data.ts`, `teacher-auth.ts`, `supabase-admin.ts` 등 데이터·인증 모듈은 `server-only`다.
- 브라우저 상호작용이 필요한 구성요소와 Server Actions가 분리되어 있다.

## 데이터 접근

서버 전용 Supabase service-role 클라이언트가 `susi_class2_*` 테이블을 조회·변경한다. 로컬 schema는 RLS를 활성화하며 공개 정책을 정의하지 않는다. 실제 운영 RLS 상태는 UNKNOWN이다.

## 학생 흐름

`/apply/[code]` → access_code로 학생 조회 → 학생 UUID로 applications/checklist 조회 → 학생 workspace 렌더링 → Server Actions에서 소유 관계를 재검증하고 저장.

## 교사 흐름

`/teacher` → 학급 선택 → 학급 자격 증명 확인 → HMAC 서명 HttpOnly 쿠키 발급 → DB의 session_version과 재검증 → 해당 학급 학생 목록/상세/내보내기 접근.

별도 middleware 파일은 없다. 페이지와 Server Action에서 서버 세션을 확인한다.

## 배포

CURRENT 개발 기준은 `jungboh/susi-distribution-v2`의 `main`이다. v2 Netlify 후보 `susi-distribution-v2.netlify.app`은 공개 응답하지만 연결 저장소/branch/build 설정은 UNKNOWN이다. 이전 `susi-distribution.netlify.app`과 금융 전용 `susi2026.netlify.app`은 링크 호환성을 위해 ACTIVE_COMPATIBILITY로 보존한다.
