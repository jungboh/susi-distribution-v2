-- 제출서류 체크리스트를 학교(지원 대학)별로 관리하기 위한 마이그레이션
-- 이미 supabase/schema.sql을 실행한 적이 있다면 이 파일만 추가로 실행하면 된다.

alter table public.susi_class2_checklist_items
  add column if not exists application_id uuid references public.susi_class2_applications(id) on delete cascade;

create index if not exists susi_class2_checklist_items_application_id_idx
  on public.susi_class2_checklist_items(application_id);
