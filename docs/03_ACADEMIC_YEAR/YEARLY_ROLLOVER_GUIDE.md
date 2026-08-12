# Yearly Rollover Guide — 설계 초안

**Status: PLANNING**

## 목표

매년 새 프로그램을 만드는 대신 같은 애플리케이션에서 `academic_year = 2026`, `2027`, `2028`처럼 학년도 단위 운영과 전환이 가능한 구조로 발전시킨다.

## CONFIRMED 현재 상태

- `academic_year` 필드는 로컬 schema와 TypeScript 타입에서 확인되지 않았다.
- 2026은 앱 제목, export 제목/파일명, footer 등에 하드코딩되어 있다.
- applications와 checklist는 학생 UUID를 통해 연결되지만 별도 학년도 컬럼은 없다.
- v2 class_code 코드는 네 학급으로 확장됐고 migration 0010이 제약 확장을 정의한다. 단, 운영 적용은 UNKNOWN이다.

## UNKNOWN — 설계 전 확인 필요

- 운영 DB의 실제 schema/migration 적용 상태
- 학생을 연도별 새 행으로 만들지, 지속 식별자를 둘지
- 지원대학·체크리스트 이력을 어느 수준에서 연도별 분리할지
- 다음 학년도 학급 구성과 졸업생 조회 요구
- 전년도 링크와 access_code 유지 또는 종료 요구

## PLANNED 설계 단계

1. 모든 2026 하드코딩 위치와 사용자 영향 조사
2. 학년도 엔터티/컬럼 및 unique/FK 범위 설계
3. 전년도 read-only 보존과 신규 학년도 생성 흐름 설계
4. 관리자 학년도 전환 및 기본 학년도 정책 설계
5. 백업·롤백·링크 호환성 검증

UI 구현 단계에서는 DB migration 없이 `CURRENT_ACADEMIC_YEAR = 2026` 같은 단일 config로 제목·footer·export 표시를 모으는 방안을 우선한다. 실제 데이터 분리를 위한 academic_year migration은 별도 승인 Task다.

Task 003-A에서는 코드와 DB를 변경하지 않았다.
