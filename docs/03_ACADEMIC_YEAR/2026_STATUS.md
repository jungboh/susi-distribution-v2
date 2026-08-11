# 2026 Status

## CONFIRMED

- 앱 제목: `2026년 영동미래고 수시지원서류 취합`
- 현재 구현 학급: 유통반(`distribution`), 창업반(`startup`), 보건반(`health`)
- 학생별 지원 대학 6~15행 관리, 제출서류 체크리스트, 메모, 교사용 목록/상세, Excel export 및 인쇄 화면이 코드에 존재한다.
- 학생 개인 링크는 `/apply/[code]`, 교사는 학급별 인증을 사용한다.
- finance는 향후 추가 예정이며 아직 구현되지 않았다.

## 보호 요구

현재 배포된 학생/학부모 링크, access_code, 학생 UUID 및 연결 관계를 유지해야 한다. 기존 금융과 전용 시스템도 독립적으로 보호한다.

## UNKNOWN

- 운영 DB의 현재 학생 수, 실제 학급별 데이터와 migration 적용 상태
- Production 환경변수와 최근 배포 상태
- 2026 종료 시 데이터 보관·access_code 정책
- 실제 사용자 대상 end-to-end QA 결과
