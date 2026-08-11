-- 유통반·창업반·보건반 공용 구조를 위한 학생 학급 코드
-- 기존 id, access_code, applications, checklist 데이터는 변경하지 않는다.
-- 재실행 시 NULL인 class_code만 distribution으로 채우며 기존 학급 코드는 보존한다.

do $$
declare
  before_student_count bigint;
  after_student_count bigint;
  before_identity_checksum text;
  after_identity_checksum text;
begin
  select
    count(*),
    coalesce(
      md5(string_agg(id::text || ':' || access_code, ',' order by id)),
      md5('')
    )
  into before_student_count, before_identity_checksum
  from public.susi_class2_students;

  alter table public.susi_class2_students
    add column if not exists class_code text;

  update public.susi_class2_students
  set class_code = 'distribution'
  where class_code is null;

  if exists (
    select 1
    from public.susi_class2_students
    where class_code not in ('distribution', 'startup', 'health')
  ) then
    raise exception '허용되지 않은 class_code가 있어 migration을 중단합니다.';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'susi_class2_students_class_code_check'
      and conrelid = 'public.susi_class2_students'::regclass
  ) then
    alter table public.susi_class2_students
      add constraint susi_class2_students_class_code_check
      check (class_code in ('distribution', 'startup', 'health'));
  end if;

  alter table public.susi_class2_students
    alter column class_code set not null;

  select
    count(*),
    coalesce(
      md5(string_agg(id::text || ':' || access_code, ',' order by id)),
      md5('')
    )
  into after_student_count, after_identity_checksum
  from public.susi_class2_students;

  if before_student_count <> after_student_count then
    raise exception '학생 수가 변경되어 migration을 중단합니다. before=%, after=%',
      before_student_count, after_student_count;
  end if;

  if before_identity_checksum <> after_identity_checksum then
    raise exception '학생 id 또는 access_code가 변경되어 migration을 중단합니다.';
  end if;

  raise notice 'class_code migration 완료: 학생 %명, id/code checksum %',
    after_student_count, after_identity_checksum;
end $$;

create index if not exists susi_class2_students_class_code_idx
  on public.susi_class2_students(class_code);

-- 적용 후 검증용 조회
select class_code, count(*) as student_count
from public.susi_class2_students
group by class_code
order by class_code;
