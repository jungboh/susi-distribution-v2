# 수시지원서류 관리

유통반·창업반·보건반 학생의 수시 지원 대학과 제출서류를 학급별 담임 인증으로 관리하는 웹 애플리케이션입니다. GitHub 저장소는 `susi-distribution`이며 기존 금융과 저장소 및 `susi_*` 테이블과 분리해 운영합니다.

## 데이터 분리 원칙

이 애플리케이션은 다음 `susi_class2_*` 테이블만 사용합니다.

- `susi_class2_students`
- `susi_class2_applications`
- `susi_class2_checklist_items`
- `susi_class2_teacher_credentials` (기존 공용 자격 증명 보존용)
- `susi_class2_teacher_class_credentials` (학급별 담임 인증)

RLS를 활성화하고 공개 정책을 만들지 않습니다. 데이터와 자격 증명은 서버의 service role 클라이언트에서만 접근합니다.

## Supabase SQL 적용 순서

기존 운영 DB에는 다음 migration을 번호순으로 적용합니다.

1. `supabase/migrations/0002_checklist_application_id.sql`
2. `supabase/migrations/0003_application_note.sql`
3. `supabase/migrations/0004_teacher_first_password_change.sql`
4. `supabase/migrations/0005_student_class_code.sql`
5. `supabase/migrations/0006_teacher_class_credentials.sql`
6. `supabase/migrations/0007_reset_class_teacher_credentials.sql`

`0006`은 학급별 자격 증명 테이블을 만들고 기존 유통반 비밀번호 해시가 있으면 그대로 이전합니다. `0007`은 세 학급을 최초 비밀번호 등록 상태로 초기화하고 세션 버전을 올려 기존 학급 쿠키를 무효화합니다. 초기 비밀번호 평문은 migration이나 애플리케이션 코드에 포함하지 않습니다. 기존 자격 증명, 학생 ID, access code, applications, checklist는 변경하지 않습니다.

창업반 초기 명단은 migration 적용 후 `supabase/seeds/startup_students.sql`을 별도로 실행합니다. Seed는 학생 번호가 이미 있으면 건너뛰며 기존 행을 갱신하지 않습니다.

## 환경변수

`.env.local.example`을 `.env.local`로 복사해 설정합니다. 실제 비밀값은 Git에 커밋하지 않습니다.

| 변수 | 설명 |
| --- | --- |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` 형식의 기본 URL |
| `NEXT_PUBLIC_SUPABASE_URL` | `SUPABASE_URL`이 없을 때만 사용하는 선택 변수 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 service role key |
| `TEACHER_AUTH_SECRET` | 학급 세션 HMAC 서명용 32자 이상 비밀값 |

초기 비밀번호는 별도 환경변수가 필요하지 않습니다. `0007` migration에 salt가 적용된 scrypt 해시만 저장되며, 화면이나 서버 로그에는 초기 비밀번호 값을 출력하지 않습니다. 최초 등록 후에는 학급별 새 비밀번호 해시와 새 세션 버전이 저장됩니다.

## 실행 및 배포

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```

Netlify에서 GitHub 저장소 `susi-distribution`을 연결하고 build command를 `npm run build`로 설정합니다. 위 환경변수를 Production 및 Functions 런타임에 등록한 다음 새 Production deploy를 실행합니다.

- `/`와 `/teacher/login`은 `/teacher` 학급 선택 화면으로 이동합니다.
- 학급 카드에서 해당 학급 비밀번호를 인증하면 그 학급 목록만 열립니다.
- `학급 선택 · 잠금`은 학급 세션을 삭제합니다.
- 담임용 학생 상세에서는 최신 지원대학·체크리스트를 Excel로 저장하거나 A4 출력 페이지에서 인쇄·PDF 저장할 수 있습니다.
- 학생 개인 링크 `/apply/[code]`는 교사 인증과 관계없이 기존 access code로 작동합니다.

Supabase URL에는 `/rest/v1`, `/auth/v1`, `/functions/v1` 경로나 따옴표를 포함하지 마세요.
