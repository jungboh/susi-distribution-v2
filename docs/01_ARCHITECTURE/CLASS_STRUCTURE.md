# Class Structure

## CONFIRMED — 현재 구현

| class_code | 표시명 |
| --- | --- |
| `distribution` | 유통반 |
| `startup` | 창업반 |
| `health` | 보건반 |

`CLASS_CODES`, TypeScript `ClassCode`, 표시명 매핑, 로컬 DB 제약조건과 학급별 교사 자격 증명이 위 세 값을 기준으로 한다. 기본 학급은 `distribution`이다.

## PLANNED

| class_code | 표시명 | 상태 |
| --- | --- | --- |
| `finance` | 금융반 | 미구현 |

finance 추가는 코드, DB 제약조건, 인증 자격 증명, 데이터 안전 복제와 기존 금융 시스템 보호를 함께 설계해야 하는 별도 Task다. Task 003-A에서는 구현하지 않았다.
