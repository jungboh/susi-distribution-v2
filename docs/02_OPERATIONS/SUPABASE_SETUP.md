# Supabase Setup and Safety

> Task 003-A에서는 Supabase Cloud에 로그인·link·변경하지 않았다. 아래는 향후 작업을 위한 안전 원칙이다.

## 절차 원칙

1. Supabase CLI 로그인 주체를 확인한다.
2. Dashboard와 별도 승인 자료로 정확한 project-ref 및 프로젝트명을 확인한다.
3. 통합 프로젝트와 금융과 전용 프로젝트가 아닌지 교차 확인한다.
4. 승인 후에만 `supabase link --project-ref <confirmed-ref>`를 수행한다.
5. 로컬/원격 migration 목록을 읽고 차이를 검토한다.
6. 지원되는 경우 dry-run 또는 SQL 검토 결과를 먼저 남긴다.
7. 백업, 영향 범위, 롤백 절차 승인 후 `db push`를 수행한다.

## 주의사항

- `migration repair`는 이력 불일치를 숨길 수 있으므로 운영 DB와 migration 이력을 확인하고 명시적으로 승인된 경우에만 사용한다.
- `db reset`, INSERT/UPDATE/DELETE, RLS/Storage 변경은 별도 작업과 승인 없이 수행하지 않는다.
- service role key는 서버 전용이며 화면, 문서, 로그, Git에 노출하지 않는다.
- 학생 id/access_code 보존 검증과 백업 없이 관련 migration을 적용하지 않는다.
- 실제 연결 project-ref, 적용 migration 및 운영 상태는 현재 UNKNOWN이다.
