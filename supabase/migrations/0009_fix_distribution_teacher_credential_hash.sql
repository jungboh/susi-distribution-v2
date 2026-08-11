-- Correct the distribution-class initial credential hash.
-- The application passes the stored hexadecimal salt as a UTF-8 string to scrypt.
-- The plaintext initial password is intentionally not stored in this migration.

update public.susi_class2_teacher_class_credentials
set password_hash = '48dd2cd53bb1a9c47b8fb12e2e239330ed97495b001dc4f66acbd2a682dc0a082963a5b65783ce9542e72be8c4f74c569f4a3a3fe9936c5be70cf50724af607b',
    password_salt = 'ec964ae463c7d666c50abd52a52ba1ed',
    must_change_password = true,
    password_updated_at = null,
    session_version = session_version + 1,
    reset_marker = 'distribution-teacher-reset-v3',
    updated_at = now()
where class_code = 'distribution'
  and reset_marker is distinct from 'distribution-teacher-reset-v3';

select class_code,
       must_change_password,
       session_version,
       password_updated_at
from public.susi_class2_teacher_class_credentials
where class_code = 'distribution';
