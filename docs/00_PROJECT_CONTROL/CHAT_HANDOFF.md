# Chat / Codex Handoff

새 ChatGPT 대화나 새로운 Codex 세션에서는 이전 채팅 내용을 추측하지 말고 아래 문서를 먼저 읽는다.

## Project

영동미래고 수시자료 취합 시스템

## Repository

`jungboh/susi-distribution`

## Production

`susi-distribution.netlify.app`

## Separate Finance System

- Repository: `jungboh/susi`
- Production: `susi2026.netlify.app`
- **IMPORTANT:** 기존 금융과 시스템은 계속 독립 운영하며 수정하지 않는다.

## Current Working Directory

`C:\Users\IIBI\Desktop\susi-integrated-work\susi-distribution`

## Current Classes

`distribution`, `startup`, `health`

## Planned Class

`finance` → 금융반. 아직 구현되지 않았다.

## Critical Rule

기존 학생/학부모 링크를 절대 변경하지 않는다.

## Link Protection

`/apply/[code]`, access_code, student UUID, access_code와 UUID의 관계, 기존 QR과 배포 URL을 보호한다. 실제 값과 개인정보는 문서에 기록하지 않는다.

## Current Phase

Project Documentation / Integration Preparation

## Last Completed Task

Task 003-A-DOC — DONE

## Next Planned Work

아직 PM 승인 전이다. 다음 작업을 자동으로 시작하지 않는다.

## How to Resume

다음 파일을 Source of Truth로 순서대로 읽는다.

1. `docs/00_PROJECT_CONTROL/PROJECT_OVERVIEW.md`
2. `docs/00_PROJECT_CONTROL/PROJECT_DASHBOARD.md`
3. `docs/00_PROJECT_CONTROL/CURRENT_TASK.md`
4. `docs/00_PROJECT_CONTROL/CHAT_HANDOFF.md`
5. 필요한 Architecture/Operations 문서

그 후 PM이 승인한 Task만 시작한다. 문서에 없는 운영 상태는 추정하지 않는다.

## Task Delivery Standard

앞으로 Codex Task는 반드시 다음을 포함한다.

1. Task 목적
2. 작업 대상 저장소
3. 사전 검증
4. 허용 범위
5. 구현 내용
6. 데이터 보호 규칙
7. 검증 명령
8. 절대 금지
9. 중단 조건
10. 완료 기준
11. 완료 보고 형식
12. 문서 업데이트
13. 다음 Task 자동 시작 금지
