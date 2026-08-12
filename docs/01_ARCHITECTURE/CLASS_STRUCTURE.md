# Class Structure

## CONFIRMED — v2 현재 구현

| class_code | 표시명 |
| --- | --- |
| `distribution` | 유통반 |
| `startup` | 창업반 |
| `health` | 보건반 |
| `finance` | 금융과 |

`CLASS_CODES`와 TypeScript `ClassCode`는 네 학급을 포함한다. migration `0010_add_finance_class.sql`은 학생/교사 class_code 제약을 확장하고 finance 교사 자격 증명을 추가한다. 기본 학급은 `distribution`이다.

Landing과 공통 UI의 표시명은 `finance`를 포함해 금융반·창업반·유통반·보건반으로 통일한다. 기존 데이터/문서 호환용 `CLASS_NAME_BY_CODE.finance = 금융과`와 DB class_code는 변경하지 않는다.

## 운영 적용 상태

| class_code | 표시명 | 상태 |
| --- | --- | --- |
| `finance` | 금융과 | LOCAL MIGRATION ONLY / 원격 적용 UNKNOWN |

finance 코드 통합은 완료됐지만 운영 DB 적용과 finance 데이터는 Task 003-B0에서 확인하지 못했다.

## PM Common-feature Policy

네 class_code는 데이터·권한 경계로 유지하지만 UI 기능 차이를 만드는 기준으로 사용하지 않는다. StudentDetail, ApplicationTable, ChecklistPanel, ParentConfirmation, ExportActions와 LinkManagement를 네 학급이 공유하며 현재 인증된 class_code로만 query/action을 실행한다. UI 권장 표시명은 `finance`도 `금융반`이다. DB class_code는 변경하지 않는다.
