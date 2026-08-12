# UI Design System

## Reference

PM 확정 목업의 랜딩, 담임 로그인, teacher app shell/dashboard, 학생 관리, 학생 상세, 링크 관리 화면을 기준으로 한다. 학교명 앞 로고는 사용하지 않는다.

## Visual Direction

대학입시 업무 시스템에 맞는 White 기반 Blue/Gray UI, Deep Navy 강조, cool gray border, rounded card, 절제된 shadow, 조밀하고 명확한 table을 사용한다.

## Proposed Tokens

기존 Tailwind `brand #2563eb`, `brand.dark #1d4ed8`를 보존하면서 다음 semantic token으로 확장한다.

**C1 implementation:** `src/app/globals.css`의 HSL CSS variables와 `tailwind.config.ts`의 `navy/page/surface/subtle/foreground/muted/line/success/warning/danger` semantic utilities로 구현했다.

| Token | 후보 HEX | 용도 |
| --- | --- | --- |
| `navy-950` | `#082B59` | sidebar/footer/강한 CTA |
| `navy-900` | `#0B3568` | primary dark |
| `blue-700` | `#1D4ED8` | hover/active |
| `blue-600` | `#2563EB` | 기존 brand |
| `blue-50` | `#EFF6FF` | selected/soft status |
| `slate-900` | `#0F172A` | 제목 |
| `slate-600` | `#475569` | 본문 보조 |
| `slate-200` | `#E2E8F0` | border |
| `slate-50` | `#F8FAFC` | table header/background |
| `white` | `#FFFFFF` | surface |
| `green-600` | `#16A34A` | 완료 |
| `amber-600` | `#D97706` | 진행/주의 |
| `red-600` | `#DC2626` | 위험/오류 |

본문과 버튼은 WCAG 대비를 확인하며 밝은 blue 위 흰 글자, 연한 상태 배경 위 진한 상태 글자를 사용한다.

## Typography

- Page title: 28–32px, 700, navy/slate
- Section title: 20–24px, 700
- Card metric: 28–36px, 700
- Body: 14–16px, 400–500
- Table: 12–14px, header 600
- Caption: 11–12px, slate-500

## Components

| Component | 상태 | 설계 |
| --- | --- | --- |
| `AppShell` | NEW | sidebar/header/main/footer grid |
| `TeacherSidebar` | NEW | 240px desktop, drawer mobile |
| `TeacherHeader` | REFACTOR | 학급명, 학년도, 사용자/lock |
| `AppFooter` | REFACTOR | dark navy, copyright + privacy/guide |
| `PageHeader` | NEW | breadcrumb/title/actions |
| `ClassCard` | NEW from ClassSelector | 네 학급 동일 구조와 접근성 label |
| `LoginCard` | NEW from ClassSelector | password와 first-time flow |
| `MetricCard` | NEW | icon, label, value, optional trend |
| `StatusBadge` | NEW | 완료/진행/미작성 semantic 색상 |
| `DataTable` | NEW abstraction | sticky/hover/empty/loading |
| `EmptyState` | NEW | 검색 없음·학생 없음 |
| `StudentDetailTabs` | NEW | 지원대학/체크리스트/제출서류/기록/출력 |
| `LinkTable` | NEW | 기존 URL, 복사, Excel, 안내문 actions |
| `PrintActionGroup` | REFACTOR | Excel/PDF/print/학부모 확인서 공통 |

### C1 Actual Files

- `src/components/ui/button.tsx`: primary/secondary/ghost/danger, sm/md/lg/icon, loading/disabled
- `src/components/ui/card.tsx`: Card/Header/Title/Description/Content
- `src/components/ui/status-badge.tsx`: 표현 전용 success/warning/neutral/danger
- `src/components/ui/typography.tsx`: PageTitle/SectionTitle/BodyText/Caption
- `src/components/ui/page-layout.tsx`: PageContainer/PageHeader/PageSection
- `src/components/ui/empty-state.tsx`: title/description/action
- `src/components/ui/data-table.tsx`: visual shell/table primitive
- `src/components/layout/site-footer.tsx`: 공통 Deep Navy Footer
- `src/lib/ui.ts`: dependency 없는 className 결합 helper

## Button

- Primary: navy background, white text
- Secondary: white, slate border, navy text
- Ghost: transparent, slate/navy hover surface
- Danger: red text/border; destructive confirmation 필수
- focus-visible ring을 항상 제공하고 icon-only에는 aria-label과 tooltip을 둔다.

## Card

12–16px radius, 1px slate-200 border, white surface, `0 4px 16px rgba(15,23,42,.06)` 이하 shadow. 정보 밀도가 높은 table container는 shadow보다 border를 우선한다.

## Table

Slate-50 header, 44–48px row, subtle hover, semantic status badge, keyboard focus, horizontal scroll. 상단 header와 왼쪽 순번·지역·지원대학·모집단위를 네 학급 공통 sticky로 적용한다.

## Footer

Dark Navy. `© 2026 jungboh All rights reserved.`와 `개인정보처리방침 | 이용안내`. Landing, login, teacher app과 학생 page 스타일을 통일하고 print/PDF에서는 숨긴다. 링크 목적지와 문안은 PM 확인이 필요하다.

C1에서는 존재하지 않는 route나 `href="#"`를 만들지 않고 정책 문구를 비활성 presentation text로 제공한다.

## Data Table Foundation Status

C1은 header/body typography, border, row hover/focus, overflow shell와 sticky surface token만 제공한다. 순번·지역·지원대학·모집단위의 누적 left와 실제 sticky column 적용은 C5 범위다.

## Responsive

- `>=1024px`: sidebar 상시, dashboard 4 metrics, table desktop density
- tablet: sidebar compact/drawer, cards 2열
- mobile: sidebar drawer, cards 1열, table horizontal scroll
- 학생 `/apply/[code]`: mobile-first와 자동저장 UX를 유지
- sticky 열은 viewport와 zoom에서 content를 가리지 않는지 C8에서 검증

## Screen Baseline

- Landing: 학교명, 2026 제목, 네 class card(금융반·창업반·유통반·보건반)
- Teacher Shell: desktop Deep Navy 고정 Sidebar, tablet/mobile drawer, White sticky Header, 공통 SiteFooter
- Dashboard: 1/2/4열 metric card와 CSS progress bar. 입력 참여율을 작성 완료율로 표현하지 않는다.
- Student Management: `md` 이상 C1 DataTable, 작은 화면 compact card. 검색·초기화와 파괴적 삭제 Action을 시각적으로 분리한다.
- Student Detail: 공통 TeacherAppShell, 학생 summary, Export, Application, Checklist 순서. Application Table은 header 고정, `md` 이상 순번·지역·지원대학·모집단위 고정, 작은 화면 순번만 고정하고 내부 가로 스크롤한다.
- Document Output: A4 landscape, 10mm margin, 흑백 border 기반 표, 반복 header, 행 단위 break 방지, Checklist 새 페이지. 화면 Sticky와 웹 Action은 print에서 제거한다.
- Parent Confirmation: 검증된 금융 전용 원본의 A4 Portrait 구성과 확정 문구·서명 영역을 재사용한다. 네 학급 실제 데이터만 치환하고 QR/학생 URL은 넣지 않으며 C7 접속 안내문과 분리한다.
- Login: 선택 학급을 유지한 담임 password card와 최초 등록
- Teacher shell: sidebar, 학년도 selector(표시는 가능하나 DB 전환은 FUTURE), header/footer
- Dashboard: metrics, 진행률, 최근 학생, 공지 후보
- 학생 관리: 검색, 상태 tabs, student table, 추가
- 학생 상세: tabs와 공통 output
- 링크 관리: individual/bulk/guide
# C7 링크 관리 UI 적용

- desktop은 학번·이름·링크 상태·관리 action의 업무용 table, mobile은 학생별 card를 사용한다.
- access_code 원문과 전체 URL은 기본 목록에 표시하지 않는다. 전체 URL은 명시적 복사 fallback, Excel, 안내문에서만 제공한다.
- QR 관련 UI는 C7A PM 정책 변경으로 제거했다.
- 접속 안내문은 `c7-link-guide.css`의 전용 named page와 A4 Portrait를 사용한다. C6 parent confirmation CSS와 결합하지 않는다.
