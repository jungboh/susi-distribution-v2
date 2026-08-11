# QA Checklist

## Git

- [ ] remote가 `jungboh/susi-distribution`인가
- [ ] 예상 branch인가
- [ ] 시작 전 working tree 상태를 확인했는가
- [ ] 예상 변경만 남았는가
- [ ] `git diff --check`가 통과하는가

## Student

- [ ] 기존 `/apply/[code]` 링크가 유지되는가
- [ ] access_code와 학생 UUID 연결이 유지되는가
- [ ] 학생 페이지 조회와 저장이 정상인가
- [ ] applications가 올바른 학생에 연결되는가
- [ ] checklist와 application 연결이 정상인가

## Teacher

- [ ] 학급 선택 및 로그인/최초 등록 흐름이 정상인가
- [ ] 다른 학급 세션으로 접근할 수 없는가
- [ ] 학생 목록 검색·통계가 정상인가
- [ ] 학생 상세, export, print 권한이 정상인가

## Build

- [ ] 의존성을 lockfile 기준으로 설치했는가
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `git diff --check`

## Deployment

- [ ] 올바른 Netlify site와 GitHub branch인가
- [ ] 올바른 Supabase project인가
- [ ] Production 환경변수 이름과 노출 범위를 확인했는가
- [ ] DB migration/백업/롤백 승인이 있는가
- [ ] Production smoke test와 기존 링크 회귀 검증을 완료했는가
