-- 지원대학별 지원 수준을 독립적으로 저장한다.
-- 기존 순번과 선발유형(selection_type)은 변경하지 않는다.
alter table public.susi_class2_applications
  add column if not exists application_level text not null default '';

alter table public.susi_class2_applications
  drop constraint if exists susi_class2_applications_application_level_check;

alter table public.susi_class2_applications
  add constraint susi_class2_applications_application_level_check
  check (application_level in ('', '하향', '적정', '상향', '우주상향'));
