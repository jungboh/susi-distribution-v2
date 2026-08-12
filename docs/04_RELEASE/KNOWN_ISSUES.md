# Known Issues

## Task 003-B0 Confirmed Gaps

- 학부모 확인서는 금융 전용 원본 기준으로 구현했으나 실제 4개 학급 데이터와 A4 Portrait 인쇄 QA가 필요함
- 지원대학 표는 상단 header만 sticky이며 요구된 왼쪽 4개 열 sticky는 확인되지 않음
- 2026 하드코딩이 있고 academic_year/school_year 구조가 없음
- v2 `schema.sql`은 3개 학급 기준이고 finance는 migration 0010으로만 확장됨

## Unverified External Items

- v2 Netlify 연결 저장소, site ID, production branch/build 설정
- 운영 Supabase의 migration 0010 적용과 finance 데이터 상태
- 기존 학생 URL이 사용하는 실제 도메인 분포

No confirmed issues were added during Task 003-A-DOC.

## 관찰 사항(확정 이슈 아님)

- `npm ci` 감사 결과 중간 2개, 높음 6개 취약점이 보고되었다. 영향 분석과 dependency 변경은 별도 승인 Task가 필요하다.
- 운영 Supabase, Netlify 및 실제 사용자 흐름은 Task 003-A에서 조회하거나 smoke test하지 않았다.
