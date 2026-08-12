# 영동미래고 수시자료 취합 시스템

SUSI Admissions Document Management System

## Status Legend

`CONFIRMED` 코드·Git·공개 응답에서 확인 / `PLANNED` 향후 작업 / `UNKNOWN` 외부 설정 확인 필요 / `BLOCKED` 진행 불가

## Purpose

금융반, 창업반, 유통반, 보건반 학생의 수시 지원 대학과 제출서류를 하나의 시스템에서 학급별로 관리하고, 향후 여러 학년도에 반복 사용할 수 있도록 확장한다.

## Repository Classification — Task 003-B0

### CURRENT

- GitHub: `https://github.com/jungboh/susi-distribution-v2`
- PROJECT_ROOT: `C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution-v2`
- 근거: local/origin main 동기화, 4개 학급 코드, finance migration과 금융 기능 commit 확인

### ACTIVE_COMPATIBILITY

- 이전 통합 GitHub: `https://github.com/jungboh/susi-distribution`
- 이전 통합 Netlify: `https://susi-distribution.netlify.app`
- 금융 전용 GitHub: `https://github.com/jungboh/susi`
- 금융 전용 Netlify: `https://susi2026.netlify.app`
- 기존 학생 URL의 실제 도메인 분포를 확인하기 전에는 삭제·redirect·archive하지 않는다.

### UNKNOWN

- v2 Netlify `https://susi-distribution-v2.netlify.app`의 연결 Git 저장소, site ID, production branch와 build 설정
- 운영 Supabase에 `0010_add_finance_class.sql`이 적용됐는지 여부

## Current Classes

- `finance` → 코드 표시명 `금융과` — **CONFIRMED**
- `startup` → 창업반 — **CONFIRMED**
- `distribution` → 유통반 — **CONFIRMED**
- `health` → 보건반 — **CONFIRMED**

## Main Features

- `/apply/[code]` 학생 고유 링크와 지원대학/checklist 관리
- 학급별 담임 인증, 최초 비밀번호 등록, session version 검증, 학급 잠금
- 학생 목록·상세, 링크 복사, Excel 내보내기, 인쇄/PDF 저장
- 현재 finance 조건부인 추가 필드·관심대학 PDF·입결통합 Excel 기능을 네 학급 공통 capability로 재설계 예정
- 학부모 확인서 출력은 **MISSING / NEW COMMON**
- 표 상단 header sticky는 **CONFIRMED**, 요구된 왼쪽 4열 sticky는 **MISSING**

## Technology

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, Supabase/PostgreSQL, ExcelJS, `read-excel-file`, `pdfjs-dist`, Netlify.

## Critical Data Protection Rules

기존 `/apply/[code]`, access_code, student UUID, 상호 연결, QR, 배포 URL, applications와 checklist를 변경하지 않는다. v2 링크 복사는 `window.location.origin`을 사용하므로 현재 접속 도메인이 새 링크의 base domain이 된다. 기존 URL은 자동 전환하지 않는다.

## Four-class Common Feature Policy

금융반에서 검증된 Excel/PDF/출력·추가 정보·Sticky UX와 신규 학부모 확인서·링크 관리 기능을 네 학급 공통으로 제공한다. 학급별 화면을 복제하지 않고 공통 component에 classCode/className을 전달한다. UI 기능은 같지만 모든 server query/action은 인증된 class_code로 데이터를 격리한다.

## Academic Year

2026은 제목, export와 footer에 하드코딩되어 있고 `academic_year`/`school_year` DB 구조는 확인되지 않았다. 다년도 구조는 PLANNED다.
