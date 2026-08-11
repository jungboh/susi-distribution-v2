# Netlify Deploy

## 통합 프로젝트

- GitHub: `jungboh/susi-distribution`
- Production: `susi-distribution.netlify.app`
- Branch: `main`

## 금융과 전용 프로젝트

- GitHub: `jungboh/susi`
- Production: `susi2026.netlify.app`

## 혼동 방지 규칙

배포 전에 저장소, branch, Netlify site 이름/URL, 환경변수 대상 Supabase를 네 방향으로 대조한다. 통합 변경을 금융과 사이트에 배포하거나 금융과 환경변수를 통합 사이트에 복사하지 않는다.

배포 전 typecheck, lint, build, diff 확인과 DB 호환성을 검증한다. 배포 후에는 승인된 테스트 데이터로 주요 라우트와 기존 학생 링크를 smoke test한다. Task 003-A에서는 Netlify 설정을 조회하거나 배포하지 않았으므로 실제 연결·환경변수 상태는 UNKNOWN이다.
