-- Sprint 2 / Task 002-C: 학급별 담임 인증 정보
-- 비밀번호 평문은 저장하지 않으며 service role을 사용하는 서버에서만 접근한다.

create table if not exists public.susi_class2_teacher_class_credentials (
  class_code text primary key,
  password_hash text not null,
  password_salt text not null,
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'susi_class2_teacher_class_credentials_class_code_check'
      and conrelid = 'public.susi_class2_teacher_class_credentials'::regclass
  ) then
    alter table public.susi_class2_teacher_class_credentials
      add constraint susi_class2_teacher_class_credentials_class_code_check
      check (class_code in ('distribution', 'startup', 'health'));
  end if;
end
$$;

alter table public.susi_class2_teacher_class_credentials enable row level security;

-- 기존 유통반 교사 비밀번호가 있으면 해시와 salt를 그대로 이전한다.
-- 기존 테이블과 자격 증명은 삭제하거나 수정하지 않는다.
insert into public.susi_class2_teacher_class_credentials (
  class_code,
  password_hash,
  password_salt,
  updated_at
)
select
  'distribution',
  password_hash,
  password_salt,
  updated_at
from public.susi_class2_teacher_credentials
where id = 1
on conflict (class_code) do nothing;
