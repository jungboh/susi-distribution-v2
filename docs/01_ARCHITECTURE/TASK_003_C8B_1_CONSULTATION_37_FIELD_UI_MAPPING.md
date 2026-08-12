# Task 003-C8B-1 — 상담 화면 37개 필드 대응표 및 역할별 UI 설계

## 1. 목적과 기준

이 문서는 상담 화면의 37개 업무 필드와 역할별 UI를 확정하는 후속 구현 기준이다. 실제 UI, Action, DB, Excel, PDF, Print는 이 Task에서 변경하지 않는다.

- 기존 업무 필드 15개: PM 확정 목록
- 신규 교사 관리 필드 22개: Migration `0011`, `Application`, Teacher-only allowlist와 일치
- 권한: 기존 15개는 현재 정책 유지. 신규 22개는 Teacher 조회·편집, Student 조회만 허용
- 조회: Teacher와 Student 모두 `listApplications().select("*")`
- 저장: 기존 15개는 공통 allowlist, 신규 22개는 Teacher-only allowlist
- 제외: `campus`, `region`, `prev_recruit_count`, 기존 date 일정 5개, 시스템·연결 필드

## 2. 검증 요약

| 검증 | 결과 | 근거 |
|---|---:|---|
| 기존 필드 | 15 | PM 확정, `src/lib/types.ts`, 기존 UI/Action |
| 신규 필드 | 22 | `0011_add_application_consultation_fields.sql` |
| 합계 | 37 | 중복 없음 |
| 신규 Migration·타입·allowlist 일치 | PASS | `0011`, `Application`, `TEACHER_ONLY_APPLICATION_FIELD_NAMES` |
| 신규/기존 allowlist 중복 | 0 | `src/app/actions.ts` |

`campus`는 생성하거나 `region`으로 대응하지 않는다. `recruitment_count`라는 별도 컬럼은 사용하지 않고 실제 `recruit_count`를 화면에서 “모집인원”으로 표시한다.

## 3. 기존 15개 검증표

| DB/TS 필드 | 현재 UI | 현재 저장 | Excel | Print | 확정 비고 |
|---|---|---|---|---|---|
| `university_name` | 지원대학 | Teacher·Student 공통 | 개별 열 | 개별 열 | 공통 기본정보 |
| `department` | 모집단위(학부,학과) | 공통 | 개별 열 | 개별 열 | 공통 기본정보 |
| `admission_type` | 전형유형 select | 공통 | 개별 열 | 전형명과 결합 | 공통 기본정보 |
| `admission_name` | 전형명 | 공통 | 개별 열 | 전형유형과 결합 | 공통 기본정보 |
| `admission_method` | 전형방법 | 공통 | 개별 열 | 개별 열 | 1차 상담 |
| `csat_min_grade` | 수능 최저등급 | 공통 | 개별 열 | 개별 열 | 1차 상담 |
| `recruit_count` | 모집인원 | 공통 | 개별 열 | 전년모집과 결합 | 공통 기본정보 |
| `required_documents` | 제출서류 | 공통 | 개별 열 | 개별 열 | 2차 상담 |
| `my_grade` | 나의 내신 | 공통 | 개별 열 | 전년평균과 결합 | 1차 상담 |
| `prev_avg_grade` | 전년평균 | 공통 | 개별 열 | 나의 내신과 결합 | 레거시 참고 입결 |
| `first_pass_cut` | 전년합격컷 | 공통 | 개별 열 | 합격컷 묶음 | 레거시 참고 입결 |
| `cut_70` | 70%컷 | 공통 | 개별 열 | 합격컷 묶음 | 레거시 참고 입결 |
| `additional_pass_cut` | 최종컷 | 공통 | 개별 열 | 합격컷 묶음 | 추가합격자의 성적 컷 |
| `note` | 비고 | 공통 | 개별 열 | 개별 열 | 공통 메모 |
| `remarks` | 추가 비고 | 공통 | 개별 열 | 개별 열 | 공통 메모 |

근거: `src/components/application-table.tsx`, `src/app/actions.ts`, `src/lib/student-export-excel.ts`, `src/components/student-print-document.tsx`.

## 4. 최종 37개 대응표

표시 순서는 공통 기본정보 → 1차 상담 → 2차 상담 → 공통 메모다. `T 편집`은 Teacher 편집, `S 편집`은 Student 편집이다. 조회는 37개 모두 Teacher·Student 허용이다.

| 번호 | 단계 | 섹션 | 화면 라벨 | DB·TS 필드 | 타입 | 구분 | T 편집 | S 편집 | 입력/표시 | 빈 값 | 저장 정책 | 원문 | 현재 위치 | 후속 |
|---:|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 공통 | 기본정보 | 지원대학 | `university_name` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8B-2/C8C/C8D |
| 2 | 공통 | 기본정보 | 모집단위(학부·학과) | `department` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8B-2/C8C/C8D |
| 3 | 공통 | 기본정보 | 전형유형 | `admission_type` | string | 기존 | 허용 | 허용 | select | 미선택 | 기존 | 예 | UI·Excel·Print | C8B-2/C8C/C8D |
| 4 | 공통 | 기본정보 | 전형명 | `admission_name` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8B-2/C8C/C8D |
| 5 | 공통 | 기본정보 | 모집인원 | `recruit_count` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8B-2/C8C/C8D |
| 6 | 공통 | 기본정보 | 설립 구분 | `establishment_type` | string\|null | 신규 | 허용 | 금지 | Teacher select/text, Student text | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 7 | 1차 | 전형조건 | 전형방법 | `admission_method` | string | 기존 | 허용 | 허용 | textarea | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 8 | 1차 | 전형조건 | 수능 최저등급 | `csat_min_grade` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 9 | 1차 | 성적 | 나의 내신 | `my_grade` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 10 | 1차 | 레거시 입결 | 전년평균 | `prev_avg_grade` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 11 | 1차 | 레거시 입결 | 전년합격컷 | `first_pass_cut` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 12 | 1차 | 레거시 입결 | 70%컷 | `cut_70` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 13 | 1차 | 레거시 입결 | 추가합격 성적 컷 | `additional_pass_cut` | string | 기존 | 허용 | 허용 | text | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 14 | 1차 | 2023 입결 | 2023 50% 컷 | `result_2023_cut_50` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 15 | 1차 | 2023 입결 | 2023 70% 컷 | `result_2023_cut_70` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 16 | 1차 | 2023 입결 | 2023 경쟁률 | `result_2023_competition_rate` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 17 | 1차 | 2023 입결 | 2023 추가합격 인원 | `result_2023_additional_admits` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 18 | 1차 | 2024 입결 | 2024 50% 컷 | `result_2024_cut_50` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 19 | 1차 | 2024 입결 | 2024 70% 컷 | `result_2024_cut_70` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 20 | 1차 | 2024 입결 | 2024 경쟁률 | `result_2024_competition_rate` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 21 | 1차 | 2024 입결 | 2024 추가합격 인원 | `result_2024_additional_admits` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 22 | 1차 | 2025 입결 | 2025 50% 컷 | `result_2025_cut_50` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 23 | 1차 | 2025 입결 | 2025 70% 컷 | `result_2025_cut_70` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 24 | 1차 | 2025 입결 | 2025 경쟁률 | `result_2025_competition_rate` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 25 | 1차 | 2025 입결 | 2025 추가합격 인원 | `result_2025_additional_admits` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 26 | 1차 | 2026 입결 | 2026 50% 컷 | `result_2026_cut_50` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 27 | 1차 | 2026 입결 | 2026 70% 컷 | `result_2026_cut_70` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 28 | 1차 | 2026 입결 | 2026 경쟁률 | `result_2026_competition_rate` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 29 | 1차 | 2026 입결 | 2026 추가합격 인원 | `result_2026_additional_admits` | string\|null | 신규 | 허용 | 금지 | text/read-only | - | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 30 | 2차 | 제출 | 제출서류 | `required_documents` | string | 기존 | 허용 | 허용 | textarea | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D/C8E |
| 31 | 2차 | 일정 | 원서접수 기간 | `apply_period_text` | string\|null | 신규 | 허용 | 금지 | textarea/read-only | 아직 입력되지 않음 | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 32 | 2차 | 일정 | 서류제출 기간 | `document_submit_period_text` | string\|null | 신규 | 허용 | 금지 | textarea/read-only | 아직 입력되지 않음 | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 33 | 2차 | 일정 | 1단계 발표 | `stage1_announce_text` | string\|null | 신규 | 허용 | 금지 | textarea/read-only | 아직 입력되지 않음 | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 34 | 2차 | 일정 | 면접 일정 | `interview_schedule_text` | string\|null | 신규 | 허용 | 금지 | textarea/read-only | 아직 입력되지 않음 | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 35 | 2차 | 일정 | 최종 발표 | `final_announce_text` | string\|null | 신규 | 허용 | 금지 | textarea/read-only | 아직 입력되지 않음 | 신규 NULL | 예 | 조회만 | C8C/C8D/C8E |
| 36 | 공통 | 메모 | 비고 | `note` | string | 기존 | 허용 | 허용 | textarea | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |
| 37 | 공통 | 메모 | 추가 비고 | `remarks` | string | 기존 | 허용 | 허용 | textarea | 미입력 | 기존 | 예 | UI·Excel·Print | C8C/C8D |

## 5. 단계별 정보 구조

상담 상세은 기존 학생 상세의 탭 패턴과 일관되게 `상담 개요 / 1차 상담 / 2차 상담` 단계형 탭을 권장한다. 긴 단일 폼보다 현재 업무 위치가 명확하며, 모바일에서도 한 단계만 표시할 수 있다.

```text
[학생명 · 학번 · 학급 고정 헤더]
[상담 개요] [1차 상담] [2차 상담]

상담 개요
 ├─ 지원대학·학과·전형 기본정보
 └─ 공통 메모

1차 상담
 ├─ 전형방법·수능 최저·나의 내신
 ├─ 레거시 참고 입결(연도 미지정)
 └─ 2023~2026 연도별 비교

2차 상담
 ├─ 제출서류
 └─ 원서접수·서류·발표·면접 일정 원문
```

레거시 입결과 연도별 입결은 시각적으로 분리한다. `additional_pass_cut`은 성적 컷, `result_*_additional_admits`는 인원임을 라벨과 도움말로 명시한다. 기존 date 필드는 이 화면의 37개에서 제외되지만 기존 UI와 출력에서 유지하며 원문 일정과 동기화하지 않는다.

## 6. Teacher UI 설계

- 학생 식별 헤더를 sticky로 유지해 다른 학생 오편집을 방지한다.
- 공통 기본정보는 2~3열 form grid, 1차 입결은 연도 행×지표 열 비교표로 배치한다.
- 신규 22개 input만 Teacher 편집 가능하며 기존 15개는 현재 편집 동작을 유지한다.
- 연도별 값은 `text` input으로 받고 숫자 키보드나 숫자 변환을 강제하지 않는다.
- 일정 원문은 자동 높이 textarea로 제공하고 줄바꿈·공백·기호를 보존한다.
- 필드 단위 자동 저장 상태: `변경됨 → 저장 중 → 저장 완료`, 실패 시 해당 필드 가까이에 `저장 실패·다시 시도`를 표시한다.
- 빈 입력 저장 시 신규 필드는 NULL이 된다는 사실을 placeholder가 아닌 짧은 도움말로 안내한다.
- 오래된 응답이 최신 입력을 덮지 않도록 후속 C8C에서 필드별 request sequence 또는 AbortController를 적용한다.

## 7. Student UI 설계

- 신규 22개는 input/textarea/disabled control이 아닌 semantic text, definition list, table/card로 표시한다.
- 기존 15개는 현재 Student 편집 기능을 유지한다.
- Teacher 저장 버튼·연필 icon·편집 affordance는 신규 22개 영역에 표시하지 않는다.
- 입결은 “교사 입력 정보” 읽기 전용 배지를 사용하고, null은 `-`로 표시한다.
- 일정 null은 `아직 입력되지 않음`으로 표시해 실제 원문 `-`, `없음`, `미공개`와 구분한다.
- 서버의 Student Teacher-only write 차단을 계속 최종 권한 경계로 사용한다.

## 8. 반응형 설계

| 폭 | 구조 |
|---|---|
| 1024px 이상 | 단계 탭, 기본정보 3열, 4개 연도×4개 지표 비교표 |
| 768px | 기본정보 2열, 입결 표 가로 스크롤 + 첫 연도 열 sticky |
| 390px | 단계 탭 가로 스크롤, 연도별 카드 accordion, 일정 한 열 |
| 360px | 390px 구조 유지, action 44px 이상, 긴 문자열 `overflow-wrap:anywhere` |

모바일 권장안은 **연도별 카드 accordion**이다. 4×4 표를 축소하면 라벨과 값이 혼동되므로 최신 2026년을 먼저 펼치고 2025→2023 순으로 둔다. 값이 없는 연도도 `0`으로 표현하지 않고 네 지표 각각 `-`로 표시한다.

## 9. 빈 값과 원문 정책

| 저장/실제 값 | Teacher 편집 | Student 표시 |
|---|---|---|
| `null` | 빈 control | 입결 `-`, 일정 `아직 입력되지 않음` |
| `""`·공백만(신규) | 저장 시 NULL | 해당 없음 |
| `"0"` | `0` | `0` |
| `"3.4:1"` | 그대로 | 그대로 |
| `"미공개"`, `"없음"`, `"-"` | 그대로 | 그대로 |
| 일정 원문·내부 줄바꿈 | 그대로 | `white-space: pre-wrap` |

경쟁률·등급·인원은 숫자로 변환하지 않는다. 신규 필드는 비어 있는지 판정할 때만 trim하며 원문 자체를 trim 결과로 교체하지 않는다. 기존 15개의 저장 정책은 변경하지 않는다.

## 10. Excel·PDF·Print 후속 연결

| 대상 | 현재 | C8E 설계 기준 |
|---|---|---|
| 기존 15개 | Excel 개별 열, Print 일부 결합 | 기존 매핑 보존, 상담 섹션 추가 여부 검토 |
| 설립 구분 | 미연결 | 기본정보 열/셀 추가 |
| 연도별 입결 16개 | 미연결 | 연도×지표 matrix, 문자열 서식 |
| 일정 원문 5개 | 미연결 | 원문 일정 섹션, 줄바꿈 보존 |
| 기존 date 5개 | 기존 출력 유지 | 원문 필드로 대체·자동 동기화 금지 |
| 레거시 입결 4개 | 기존 출력 유지 | 연도별 입결과 별도 “참고 입결” 표시 |

Excel은 37개 열을 무조건 한 worksheet에 나열하기 전에 기본정보/입결/일정 sheet 분리 가능성을 검토한다. PDF·Print는 A4 가독성을 위해 1차와 2차 섹션의 페이지 분리를 우선한다. C8E 전에는 기존 출력 코드를 변경하지 않는다.

## 11. 보안·회귀 보호

- Teacher session → application owner 학생 → class_code 일치 검증을 유지한다.
- Student는 access_code로 재조회한 학생 UUID와 application owner가 같아야 한다.
- `id`, `student_id`, `seq`, `updated_at`, class/access/auth 필드는 37개에서 제외한다.
- 신규 22개 Student 편집 UI를 제공하지 않으며 서버 Teacher-only allowlist를 유지한다.
- `/apply/[code]`, access_code, UUID 연결, 네 학급 격리, RLS를 변경하지 않는다.
- 기존 공통 27개 allowlist, 기존 CRUD, 자동 저장, Excel/PDF/Print를 설계 단계에서 변경하지 않는다.

## 12. 미확정 사항과 후속 Task

미확정 사항:

- 설립 구분을 자유 text로 둘지 승인된 option 목록을 제공할지(C8C에서 PM 확인)
- 상담 상태·상담일·상담자 같은 별도 데이터 모델은 현재 37개에 없으며 별도 Task 필요
- 기존 Student 편집 15개를 상담 읽기 화면과 같은 위치에서 유지할지 기존 application table로 연결할지
- Excel worksheet 분리와 Print 페이지 배치

후속 작업:

1. **003-C8B-2:** 단계 탭, read-only value, 연도별 비교, 일정 표시의 공통 UI 기반
2. **003-C8C:** Teacher 37개 필드 입력 및 필드별 자동 저장 UX
3. **003-C8D:** Student 기존 편집 보존 + 신규 22개 읽기 전용 상담 화면
4. **003-C8E:** Excel·PDF·Print 37개 필드 확장
5. **003-C8F:** 360/390/768/1024+, 권한 부정, 링크, 네 학급 E2E QA

## 13. 근거 파일

- `supabase/schema.sql`
- `supabase/migrations/0010_add_finance_class.sql`
- `supabase/migrations/0011_add_application_consultation_fields.sql`
- `src/lib/types.ts`
- `src/app/actions.ts`
- `src/lib/data.ts`
- `src/components/application-table.tsx`
- `src/lib/student-export-excel.ts`
- `src/components/student-print-document.tsx`
- `src/app/apply/[code]/page.tsx`
