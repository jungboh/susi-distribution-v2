# Netlify Deploy and Classification

## CURRENT CANDIDATE

- URL: `https://susi-distribution-v2.netlify.app`
- 2026-08-12 공개 HTTP 200 및 `/teacher` 이동 확인
- 연결 Git/site ID/production branch/build command: **UNKNOWN — NETLIFY DASHBOARD CHECK REQUIRED**

## ACTIVE_COMPATIBILITY

- 이전 통합: `https://susi-distribution.netlify.app` — HTTP 200
- 금융 전용: `https://susi2026.netlify.app` — HTTP 200

사이트가 응답한다는 사실만으로 CURRENT/LEGACY를 확정하지 않는다. 기존 학생 링크의 실제 도메인과 Netlify 연결을 확인하기 전 삭제, redirect, domain 변경, unlink를 금지한다.

## 배포 안전 절차

PM 승인 후 Netlify Dashboard에서 site ID, Git repository, production branch, build command와 환경변수 대상 Supabase를 확인한다. typecheck/lint/build, DB 호환성과 기존 링크 회귀 검증 후에만 배포한다.
