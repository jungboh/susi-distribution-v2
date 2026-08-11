-- Sprint 2 / Task 002-E: 세 학급 담임 비밀번호 최초 등록 상태 초기화
-- 초기 비밀번호 평문은 포함하지 않는다. 아래 값은 학급별 random salt와 scrypt 해시다.
-- reset_marker로 동일 SQL을 다시 실행해도 등록 완료 비밀번호를 재초기화하지 않는다.

alter table public.susi_class2_teacher_class_credentials
  add column if not exists must_change_password boolean not null default true,
  add column if not exists password_updated_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists session_version integer not null default 1,
  add column if not exists reset_marker text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'susi_class2_teacher_class_credentials_session_version_check'
      and conrelid = 'public.susi_class2_teacher_class_credentials'::regclass
  ) then
    alter table public.susi_class2_teacher_class_credentials
      add constraint susi_class2_teacher_class_credentials_session_version_check
      check (session_version > 0);
  end if;
end
$$;

insert into public.susi_class2_teacher_class_credentials (
  class_code,
  password_hash,
  password_salt,
  must_change_password,
  password_updated_at,
  session_version,
  reset_marker,
  updated_at
)
values
  (
    'distribution',
    'bd0c1c7f94fb983d4795fe97cb772240f6a76e2b335507315c19f2e14b1434f55caa43f13450509ff507b5e1e4fabaafa73344e5ca4eb56b4efcbefd50102abf',
    'a353dfed85bcf6beb7028b2b8684aacb',
    true,
    null,
    1,
    'task-002-e-reset-v1',
    now()
  ),
  (
    'startup',
    '30507abaee425f489b7e0c51e4fc45722ef1b35bb789820d375d25a0aee770c4c9dd74d0b6b470d3eb34b550abde3a63bd2c9f16c57c925001382e0cf0b4a4d8',
    'f33a412bcc11793702e3d9b6c8afef46',
    true,
    null,
    1,
    'task-002-e-reset-v1',
    now()
  ),
  (
    'health',
    '92ef123ed756ab8cd186e4b74fa48b37cd4b499969cb9f85dc9283bddf0530bed2ea4b0b9d6f1927b81ac057c4e2d2f115403e63a7fe6d4c069795d2990182ce',
    '0451c0b58b9162c0e702c26d74e684bc',
    true,
    null,
    1,
    'task-002-e-reset-v1',
    now()
  )
on conflict (class_code) do update
set password_hash = excluded.password_hash,
    password_salt = excluded.password_salt,
    must_change_password = true,
    password_updated_at = null,
    session_version = public.susi_class2_teacher_class_credentials.session_version + 1,
    reset_marker = excluded.reset_marker,
    updated_at = now()
where public.susi_class2_teacher_class_credentials.reset_marker
      is distinct from excluded.reset_marker;

select class_code,
       must_change_password,
       session_version,
       password_updated_at
from public.susi_class2_teacher_class_credentials
order by class_code;
