---
name: pre-deploy-check
description: Run this project's pre-deploy/pre-commit verification sequence (remote/branch sanity check, typecheck, lint, build, diff whitespace check, untracked-file review) for susi-distribution before committing, pushing, or deploying.
---

# Pre-deploy check

Verification sequence for `susi-distribution` before a commit, push, or deploy, per `docs/02_OPERATIONS/GITHUB_WORKFLOW.md` and `docs/02_OPERATIONS/LOCAL_SETUP.md`.

## Steps

1. **Repo sanity check** — confirm you're on the right remote/branch before touching anything:
   ```bash
   git remote -v
   git branch --show-current
   git status --short
   git fetch --prune
   ```
   - Remote must be `jungboh/susi-distribution` — never confuse it with the separate `jungboh/susi` (finance) repo.
   - Base branch is `main`.
   - Investigate any unexpected changes before proceeding; don't delete or revert blindly.

2. **Verification commands** — all four must pass:
   ```bash
   npm run typecheck
   npm run lint
   npm run build
   git diff --check
   ```
   There is no test script in this repo — these four checks are the full verification bar.

3. **Untracked/staged review** — before committing:
   - Run `git status --short` and review every file about to be added.
   - Confirm nothing among the changes contains: `.env.local` or other real env values, `SUPABASE_SERVICE_ROLE_KEY`, real student `access_code` values, student names/personal data, or generated export files (xlsx/print output).
   - If `docs/` was touched, make sure the relevant Project Control / architecture / operations / release doc was updated alongside the code change, not left stale.

4. **Commit scope** — keep commits small and scoped to one approved task; do not bundle unrelated changes.

5. **Before push** — re-run step 1 (remote/branch/diff) since state may have changed, confirm the push target is intentional, and never force-push. Any push affecting production needs separate approval and a deploy plan (see `docs/02_OPERATIONS/NETLIFY_DEPLOY.md`).

## Hard stops

Do not proceed past a failing typecheck/lint/build/diff-check by skipping it. Do not commit or push if step 3's secret/PII scan finds anything questionable — stop and ask instead of guessing whether it's safe.
