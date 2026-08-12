# Database Schema

> **CONFIRMED 범위:** 로컬 `supabase/schema.sql`과 `supabase/migrations/*.sql` 기준. 실제 운영 DB는 조회하지 않았다.

> **Task 003-B0:** `schema.sql` 본문은 3개 학급 기준이나 `0010_add_finance_class.sql`이 finance 제약, import batch 테이블과 finance 전용 application 컬럼을 추가한다. 상태는 **LOCAL MIGRATION ONLY**, 원격 적용은 UNKNOWN이다.

## 핵심 테이블

### `susi_class2_students`

- PK: `id uuid`
- `access_code text not null unique`
- `class_code text not null`, 현재 허용값은 `distribution`, `startup`, `health`
- 이름, 학생번호, 생성시각을 보유

### `susi_class2_applications`

- PK: `id uuid`
- FK: `student_id` → students.id, 학생 삭제 시 cascade
- 학생별 표시 순서 `seq`; `(student_id, seq)` unique
- 대학, 학과, 전형, 일정, 성적, 서류, 비고 등의 지원정보

### `susi_class2_checklist_items`

- PK: `id uuid`
- FK: `student_id` → students.id, cascade
- nullable FK: `application_id` → applications.id, cascade
- 라벨, 제출 여부, 비고, 정렬순서

### 교사 자격 증명

- `susi_class2_teacher_credentials`: 기존 단일 자격 증명 보존용
- `susi_class2_teacher_class_credentials`: `class_code` PK, 비밀번호 hash/salt, 최초 변경 상태, session version 등 학급별 인증 정보

## 관계와 링크

`/apply/[code]`의 code는 students.access_code를 조회한다. 조회된 students.id(UUID)가 applications.student_id와 checklist.student_id의 부모 키다. checklist.application_id는 특정 지원 대학과 체크리스트 항목을 선택적으로 연결한다.

## 학년도

`academic_year` 컬럼은 로컬 schema와 타입에서 확인되지 않았다. 학년도 분리는 PLANNED이며 설계가 필요하다.

## v2 Finance 확장

- `susi_class2_import_batches` 이력 테이블
- applications의 finance 전용 전형·합격선·점수·비고·source/import batch 필드
- finance 교사 자격 증명 초기 행
- 기존 학생/access_code/application/checklist를 직접 이전하거나 변경하는 SQL은 `0010`에 없음

## Migration 목록

- `0002_checklist_application_id.sql`
- `0003_application_note.sql`
- `0004_teacher_first_password_change.sql`
- `0005_student_class_code.sql`
- `0006_teacher_class_credentials.sql`
- `0007_reset_class_teacher_credentials.sql`
- `0008_reset_distribution_teacher_credential.sql`
- `0009_fix_distribution_teacher_credential_hash.sql`
- `0010_add_finance_class.sql`

어떤 migration이 운영 DB에 적용됐는지는 UNKNOWN이다.
