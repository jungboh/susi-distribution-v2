-- 유통반 교사용 최초 비밀번호 변경 기능
-- 기존 금융과 테이블 및 인증 정보에는 영향을 주지 않는다.
create table if not exists public.susi_class2_teacher_credentials (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null,
  password_salt text not null,
  must_change_password boolean not null default true,
  password_changed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.susi_class2_teacher_credentials enable row level security;
