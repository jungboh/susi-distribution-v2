-- v2 통합: 금융과를 4번째 학급(finance)으로 추가한다.
-- 기존 세 학급(distribution/startup/health)의 행과 susi_* (금융과 구 시스템) 테이블은
-- 이 migration에서 전혀 건드리지 않는다. 오직 컬럼/테이블 추가와 제약 확장만 수행한다.

-- 1. class_code 허용값에 'finance' 추가 (기존 값 제거 없이 확장만)
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'susi_class2_students_class_code_check'
      and conrelid = 'public.susi_class2_students'::regclass
  ) then
    alter table public.susi_class2_students
      drop constraint susi_class2_students_class_code_check;
  end if;

  alter table public.susi_class2_students
    add constraint susi_class2_students_class_code_check
    check (class_code in ('distribution', 'startup', 'health', 'finance'));
end
$$;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'susi_class2_teacher_class_credentials_class_code_check'
      and conrelid = 'public.susi_class2_teacher_class_credentials'::regclass
  ) then
    alter table public.susi_class2_teacher_class_credentials
      drop constraint susi_class2_teacher_class_credentials_class_code_check;
  end if;

  alter table public.susi_class2_teacher_class_credentials
    add constraint susi_class2_teacher_class_credentials_class_code_check
    check (class_code in ('distribution', 'startup', 'health', 'finance'));
end
$$;

-- 2. 금융과 대량 입력(엑셀/PDF) 이력 테이블 (susi.git의 susi_import_batches 구조 참고)
create table if not exists public.susi_class2_import_batches (
  id uuid primary key default gen_random_uuid(),
  original_file_name text not null,
  created_at timestamptz not null default now(),
  total_rows int not null default 0,
  inserted_rows int not null default 0,
  updated_rows int not null default 0,
  skipped_rows int not null default 0,
  failed_rows int not null default 0
);

alter table public.susi_class2_import_batches enable row level security;
-- 정책을 만들지 않아 service role을 쓰는 서버 코드에서만 접근한다.

-- 3. 금융과 전용 지원정보 필드 추가 (다른 세 학급은 사용하지 않는 nullable/기본값 컬럼)
alter table public.susi_class2_applications
  add column if not exists major_series text not null default '',
  add column if not exists stage1_elements text not null default '',
  add column if not exists season text not null default '',
  add column if not exists selection_type text not null default '',
  add column if not exists first_pass_cut text not null default '',
  add column if not exists cut_70 text not null default '',
  add column if not exists additional_pass_cut text not null default '',
  add column if not exists my_score text not null default '',
  add column if not exists remarks text not null default '',
  add column if not exists data_source text not null default 'manual',
  add column if not exists import_batch_id uuid references public.susi_class2_import_batches(id) on delete set null;

create index if not exists susi_class2_applications_import_batch_id_idx
  on public.susi_class2_applications(import_batch_id);

-- 4. 금융과 담임 계정 생성 (must_change_password=true, 최초 로그인 시 새 비밀번호 등록)
-- 초기 비밀번호 평문은 이 파일에 없다. scrypt 해시/salt만 저장하며,
-- 실제 초기 비밀번호는 담임에게 별도 채널로 전달한다.
insert into public.susi_class2_teacher_class_credentials (
  class_code,
  password_hash,
  password_salt,
  must_change_password,
  password_updated_at,
  session_version,
  updated_at
)
values (
  'finance',
  '90161e37b7d7ffede44b4c0d0560457fa77f94d19c02c9aaccd0c4b1e3448a81dd24ac64e172e97d65032e00494fde4aee5b1a07f0a9cd139529f2b92d0a44c9',
  '27833cad3b8d436c4425420ba9d59baa',
  true,
  null,
  1,
  now()
)
on conflict (class_code) do nothing;
