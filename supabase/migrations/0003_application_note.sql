-- 지원 대학 표에 자유롭게 쓸 수 있는 "비고" 칸을 추가하는 마이그레이션
-- 이미 supabase/schema.sql을 실행한 적이 있다면 이 파일만 추가로 실행하면 된다.

alter table public.susi_class2_applications
  add column if not exists note text not null default '';
