-- Reset only the distribution-class teacher credential to first-time setup.
-- The plaintext initial password is intentionally not stored in this migration.

update public.susi_class2_teacher_class_credentials
set password_hash = 'ff8f719171e8868e5ccf40c0ed5804b6bfdfc08fa86652f3796f81660ffb46fba8855604b529959b006b1e75403bca9c0c5be486e9324ee112f92613c499b126',
    password_salt = 'e8fe11ff209385651afc0863b8ac8988',
    must_change_password = true,
    password_updated_at = null,
    session_version = session_version + 1,
    reset_marker = 'distribution-teacher-reset-v2',
    updated_at = now()
where class_code = 'distribution'
  and reset_marker is distinct from 'distribution-teacher-reset-v2';

select class_code,
       must_change_password,
       session_version,
       password_updated_at
from public.susi_class2_teacher_class_credentials
where class_code = 'distribution';
