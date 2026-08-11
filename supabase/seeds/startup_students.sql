-- Sprint 2 / Task 002-C-1: 창업반 초기 학생 20명 등록
--
-- 재실행 안전성:
--   - student_number가 이미 존재하면 해당 행은 변경하지 않고 건너뛴다.
--   - access_code는 기존 애플리케이션과 동일한 4-byte random / 8자리 hex 형식이다.
--   - 생성한 access_code가 이미 존재하면 새 코드를 생성한다.
--
-- 이 seed는 susi_class2_students에 startup 학생만 추가한다.
-- 기존 학생, applications, checklist 데이터는 수정하지 않는다.

begin;

do $$
declare
  startup_student record;
  generated_access_code text;
  inserted_count integer := 0;
  skipped_count integer := 0;
begin
  for startup_student in
    select *
    from (values
      ('3201', '김민혁'),
      ('3202', '김보하'),
      ('3203', '김예준'),
      ('3204', '김지유'),
      ('3205', '김하경'),
      ('3206', '김한별'),
      ('3207', '남경원'),
      ('3208', '남수현'),
      ('3209', '박세영'),
      ('3210', '성유영'),
      ('3211', '송승훈'),
      ('3212', '양서호'),
      ('3213', '이헌열'),
      ('3214', '임지은'),
      ('3215', '임혁'),
      ('3216', '장서아'),
      ('3217', '전익선'),
      ('3218', '최유미'),
      ('3219', '최한진'),
      ('3220', '황예연')
    ) as students(student_number, student_name)
  loop
    if exists (
      select 1
      from public.susi_class2_students
      where student_number = startup_student.student_number
    ) then
      skipped_count := skipped_count + 1;
      continue;
    end if;

    loop
      generated_access_code := encode(gen_random_bytes(4), 'hex');
      exit when not exists (
        select 1
        from public.susi_class2_students
        where access_code = generated_access_code
      );
    end loop;

    insert into public.susi_class2_students (
      name,
      student_number,
      access_code,
      class_code
    ) values (
      startup_student.student_name,
      startup_student.student_number,
      generated_access_code,
      'startup'
    )
    on conflict (student_number) do nothing;

    if found then
      inserted_count := inserted_count + 1;
    else
      skipped_count := skipped_count + 1;
    end if;
  end loop;

  raise notice 'startup 학생 seed 완료: 신규 %명, 기존 %명 건너뜀',
    inserted_count,
    skipped_count;
end
$$;

commit;

-- 적용 결과 확인: 대상 명단 20행과 class_code를 확인한다.
select student_number,
       name as student_name,
       class_code
from public.susi_class2_students
where class_code = 'startup'
order by student_number;
