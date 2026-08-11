# 영동미래고 수시자료 취합 시스템

SUSI Admissions Document Management System

## 상태 범례

- **CONFIRMED**: 코드, 로컬 SQL 또는 실제 환경에서 확인
- **PLANNED**: 앞으로 구현 예정
- **UNKNOWN**: 아직 확인하지 못함
- **BLOCKED**: 문제로 확인 또는 진행 불가
- **DEPRECATED**: 더 이상 사용하지 않음

## Purpose

영동미래고 학생별 수시 지원 대학과 제출서류 체크리스트를 관리하고, 교사가 학급별 자료를 취합하며, 학생이 고유 링크로 자료를 작성하는 시스템이다.

## Current Production

- **CONFIRMED GitHub:** `https://github.com/jungboh/susi-distribution.git`
- **CONFIRMED Netlify:** `https://susi-distribution.netlify.app`

## Separate Finance Production

- **CONFIRMED GitHub:** `https://github.com/jungboh/susi.git`
- **CONFIRMED Netlify:** `https://susi2026.netlify.app`
- 기존 금융과 시스템은 폐기·이전 대상이 아니며 독립적으로 계속 운영한다.

## Current Classes

- **CONFIRMED:** `distribution` 유통반
- **CONFIRMED:** `startup` 창업반
- **CONFIRMED:** `health` 보건반

## Planned Expansion

- **PLANNED:** `finance` 금융반 추가. 아직 구현되지 않았다.

## Main Features

- 학생별 수시 지원 대학 관리
- 학생별 제출서류 체크리스트 및 비고 관리
- 교사용 학급 선택, 학생 목록과 상세 관리
- 학생 고유 링크를 통한 자료 작성
- 교사용 Excel 내보내기와 인쇄 화면

## Technology

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, Supabase JavaScript client, PostgreSQL/Supabase, ExcelJS, Netlify를 사용한다.

## 주요 화면과 흐름

- 학생: `/apply/[code]`에서 `access_code`로 학생을 조회하고 해당 학생 UUID에 연결된 지원 대학과 체크리스트를 표시·저장한다.
- 교사: `/teacher`에서 학급을 선택하고 학급별 비밀번호로 인증한 뒤 학생 목록과 `/teacher/students/[id]` 상세를 관리한다.
- `/`와 `/teacher/login`, `/teacher/change-password`는 현재 `/teacher`로 이동한다.

## Critical Data Protection Rules

- 기존 `/apply/[code]`, 학생 `access_code`, 학생 UUID, UUID와 `access_code`의 연결 관계, 기존 QR과 배포 URL을 변경하지 않는다.
- 운영 DB 변경은 별도 승인과 사전 검증 없이는 수행하지 않는다.
- 비밀값, 실제 access_code, 학생 개인정보를 문서나 Git에 기록하지 않는다.
- 통합 저장소와 금융과 전용 저장소의 코드, 환경변수, Supabase 및 배포를 혼동하지 않는다.

## Long-term Goal

2026년에 한정된 일회성 프로그램이 아니라 학년도별 데이터를 안전하게 구분하고 2027, 2028년 이후에도 반복 사용할 수 있는 시스템으로 확장한다. 구체적인 데이터·링크 정책은 아직 PLANNED 상태다.
