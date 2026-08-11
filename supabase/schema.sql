-- 수시 지원서류 취합 프로그램 스키마
-- 기존 Supabase 프로젝트(카페 앱과 동일 프로젝트)에 새 테이블만 추가한다.
-- 이 테이블들은 Supabase Auth 세션과 무관하게 서버(service role key)에서만 접근한다.
-- RLS는 켜두고 정책은 만들지 않아 anon/authenticated 키로는 절대 접근할 수 없게 막는다.

create extension if not exists "pgcrypto";

create table if not exists public.susi_class2_students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  student_number text unique,
  access_code text not null unique,
  class_code text not null check (class_code in ('distribution', 'startup', 'health')),
  created_at timestamptz not null default now()
);

create table if not exists public.susi_class2_applications (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.susi_class2_students(id) on delete cascade,
  seq int not null,
  region text not null default '',
  university_name text not null default '',
  department text not null default '',
  admission_type text not null default '',
  admission_name text not null default '',
  admission_method text not null default '',
  csat_min_grade text not null default '',
  recruit_count text not null default '',
  prev_recruit_count text not null default '',
  required_documents text not null default '',
  apply_start_date date,
  document_submit_date date,
  stage1_announce_date date,
  interview_date date,
  final_announce_date date,
  my_grade text not null default '',
  prev_avg_grade text not null default '',
  note text not null default '',
  updated_at timestamptz not null default now(),
  unique (student_id, seq)
);

create table if not exists public.susi_class2_checklist_items (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.susi_class2_students(id) on delete cascade,
  application_id uuid references public.susi_class2_applications(id) on delete cascade,
  label text not null,
  is_submitted boolean not null default false,
  note text not null default '',
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists susi_class2_applications_student_id_idx on public.susi_class2_applications(student_id);
create index if not exists susi_class2_checklist_items_student_id_idx on public.susi_class2_checklist_items(student_id);
create index if not exists susi_class2_checklist_items_application_id_idx on public.susi_class2_checklist_items(application_id);
create index if not exists susi_class2_students_class_code_idx on public.susi_class2_students(class_code);

alter table public.susi_class2_students enable row level security;
alter table public.susi_class2_applications enable row level security;
alter table public.susi_class2_checklist_items enable row level security;

-- 새 학급 18명 자동 등록. 이 파일을 다시 실행해도 중복 등록되지 않는다.
insert into public.susi_class2_students (name, student_number, access_code, class_code)
values
  ('강백진', '01', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('김보우', '02', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('김영준', '03', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('김회령', '04', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('남청윤', '05', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('박신재', '06', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('신비', '07', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('신예린', '08', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('우승비', '09', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('유은성', '10', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('이남우', '11', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('이승연', '12', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('이태율', '13', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('장효은', '14', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('정효리', '15', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('채윤혁', '16', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('최희경', '17', encode(gen_random_bytes(4), 'hex'), 'distribution'),
  ('한윤서', '18', encode(gen_random_bytes(4), 'hex'), 'distribution')
on conflict (student_number) do update set name = excluded.name;

-- 각 학생에게 기본 지원 대학 입력란 6개를 만든다.
insert into public.susi_class2_applications (student_id, seq)
select student.id, seq
from public.susi_class2_students student
cross join generate_series(1, 6) as seq
on conflict (student_id, seq) do nothing;

-- 의도적으로 정책을 만들지 않는다.
-- anon/authenticated 키로는 select/insert/update/delete가 전부 거부되고
-- service role key를 쓰는 서버 코드(Server Action/Route Handler)에서만 접근 가능하다.

-- 유통반 담임교사 전용 로그인 정보. 기존 금융과 인증 데이터와 분리한다.
create table if not exists public.susi_class2_teacher_credentials (
  id smallint primary key default 1 check (id = 1),
  password_hash text not null,
  password_salt text not null,
  must_change_password boolean not null default true,
  password_changed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.susi_class2_teacher_credentials enable row level security;
-- 정책을 만들지 않아 service role을 사용하는 서버 코드에서만 접근한다.

-- 학급별 담임 인증 정보. 기존 공용 자격 증명은 데이터 보호를 위해 유지한다.
create table if not exists public.susi_class2_teacher_class_credentials (
  class_code text primary key,
  password_hash text not null,
  password_salt text not null,
  must_change_password boolean not null default true,
  password_updated_at timestamptz,
  session_version integer not null default 1 check (session_version > 0),
  reset_marker text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint susi_class2_teacher_class_credentials_class_code_check
    check (class_code in ('distribution', 'startup', 'health'))
);

alter table public.susi_class2_teacher_class_credentials enable row level security;

insert into public.susi_class2_teacher_class_credentials (
  class_code,
  password_hash,
  password_salt,
  updated_at
)
select 'distribution', password_hash, password_salt, updated_at
from public.susi_class2_teacher_credentials
where id = 1
on conflict (class_code) do nothing;
