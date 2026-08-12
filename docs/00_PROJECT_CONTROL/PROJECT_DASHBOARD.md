# Project Dashboard

## Project

영동미래고 수시자료 취합 시스템

## Current Phase

Document Output and Print Layout Complete / PM Review Pending

## Current Task

Task 003-C6 — Document Output and Print Layout

## Status

READY FOR PM REVIEW

## C6 Implemented

- 기존 학생별 Excel route와 print route의 PDF/Print intent 유지
- 문서 제목·학교명·학생·학번·학급·지원대학/checklist 수 공통 header
- Print 지원대학 표에 공통 합격컷·추가 비고와 기존 핵심 필드 출력
- A4 landscape 10mm margin, table header 반복과 행 분할 방지
- Checklist는 새 페이지에서 시작하고 항목별 page break 방지
- 인쇄 시 Sticky/웹 Action 제거
- Excel 지원대학 sheet 23개 공통 열과 한글 안전 파일명
- 기존 금융 전용 `jungboh/susi`의 학부모 확인서 원본을 확인해 네 학급 공통 기능으로 구현
- 확정 확인 문구·관계·학부모 성명·서명 영역과 A4 Portrait 배치 보존

## Status Policy Pending

작성 완료/진행 중/미작성은 현재 DB에 명시 상태와 확정 계산 규칙이 없어 구현하지 않았다. Dashboard의 입력 참여율은 작성 완료율이 아니다.

## PM Decision — Four-class Common Features

v2에서는 finance 전용 UI 기능을 두지 않는다. 출력·PDF·Excel·학부모 확인서·Sticky Table·링크 관리 등을 금융/창업/유통/보건 네 학급에 공통 제공하되, 서버 데이터 접근은 현재 인증된 class_code로 격리한다.

## Confirmed

- CURRENT 개발 기준: `jungboh/susi-distribution-v2`, local/origin `main` 0 ahead / 0 behind
- v2는 이전 통합본 import 후 finance 및 Excel/PDF 기능을 추가한 기능 통합본
- 코드 기준 finance, startup, distribution, health 4개 학급
- `/apply/[code]` → access_code → student UUID → applications/checklist 구조 유지
- v2·이전 통합·금융 전용 Netlify URL 모두 2026-08-12 공개 HTTP 200 응답

## Unverified External Items

- v2 Netlify site ID, 연결 Git 저장소, production branch와 build command
- 운영 Supabase migration 적용 상태와 finance 운영 데이터
- 기존 배포 학생 URL의 실제 도메인 분포

## Known Gaps

- 학부모 확인서 전용 출력 구현 완료; 실제 운영 인쇄 QA 필요
- 지원표 왼쪽 4열 sticky 없음(상단 header만 sticky)
- academic_year 구조 없음, 2026 하드코딩 존재
- v2 로컬 schema.sql과 기존 docs 일부가 migration 0010 이전 3개 학급 기준이어서 이번 문서에서 상태를 구분함

## Critical Rules

1. 기존 학생 URL/access_code/UUID 관계 변경 금지
2. 이전 통합 사이트와 금융 전용 사이트 삭제·redirect 금지
3. 운영 DB는 별도 승인 및 dry-run/검토 후 변경
4. Commit/Push/Deploy는 PM 승인 후 수행

## Implementation Plan

003-C1 Design Foundation → C2 Landing/Login → C3 App Shell/Dashboard → C4 Student Management → C5 Common Student Detail → C6 Common Document Output → C7 Common Link Management → C8 Responsive/Regression QA

## Next Task

Task 003-C7A — QR Removal + Student URL Policy Simplification
# Task 003-C7 구현 현황 — 2026-08-12

Status: **READY FOR PM REVIEW**

- 네 학급 공통 링크 관리 화면, 이름·학번 검색, 모바일 카드 구현
- 기존 access_code와 `/apply/[code]`를 변경하지 않고 문서로 확인된 v2 배포 origin으로 개별 링크 복사
- Clipboard 실패 시 전체 URL 수동 복사 fallback 제공
- QR UI·생성·저장·인쇄·dependency는 PM 정책 변경으로 제거
- 인증 학급 전용 전체 링크 Excel과 A4 Portrait 학생·학부모 접속 안내문 구현
- 복사·Excel·안내문은 단일 `buildStudentUrl()`과 기존 v2 배포 origin을 사용하고 임의 요청 Host를 신뢰하지 않음
- C6 학부모 확인서는 보호 파일·`mode=parent`·A4 Portrait·확정 문구·서명 영역을 그대로 유지하고 C7 안내문과 분리
- DB/Migration/운영 데이터/환경/Netlify 변경 없음
- 원격 브라우저 QA는 미실행 상태이며 PM 검토 후 별도 진행 필요
