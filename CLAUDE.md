# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

영동미래고 수시자료 취합 시스템 (SUSI Admissions Document Management System). Manages each student's college application list (수시) and required-document checklist. Teachers authenticate per class to review their class's students; each student edits their own record via a unique link.

This repo (`susi-distribution`, GitHub `jungboh/susi-distribution`, deployed at `susi-distribution.netlify.app`) is separate from a different, independently operated "금융과" (finance) system in `jungboh/susi.git` (`susi2026.netlify.app`). Do not mix code, env vars, Supabase projects, or deploys between the two — they share no data.

## Commands

```bash
npm install         # or npm ci
npm run dev          # start dev server
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run build        # next build — must pass before considering work done
```

There is no test suite/script in this repo. Verification is typecheck + lint + build (and `git diff --check` before committing).

Environment variables (copy `.env.local.example` to `.env.local`): `SUPABASE_URL` (or fallback `NEXT_PUBLIC_SUPABASE_URL`), `SUPABASE_SERVICE_ROLE_KEY`, `TEACHER_AUTH_SECRET` (32+ chars, HMAC signing for class sessions). Never commit real values.

## Architecture

**Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, `@supabase/supabase-js` against Postgres/Supabase, ExcelJS for exports, deployed on Netlify. No middleware file — auth is checked per page/Server Action.

**Data access is centralized and server-only.** All DB reads/writes go through `src/lib/data.ts`, which uses the service-role Supabase client from `src/lib/supabase-admin.ts` (itself validated by `src/lib/supabase-url.ts`, which rejects any URL with a path, query, or non-`*.supabase.co` host). These modules import `server-only` and must never be reachable from client components. RLS is enabled on the tables with no public policies — the app is the only access path.

**Tables are namespaced `susi_class2_*`** (`susi_class2_students`, `susi_class2_applications`, `susi_class2_checklist_items`, `susi_class2_teacher_credentials`, `susi_class2_teacher_class_credentials`) to stay isolated from the separate finance project's tables in the same account. Relationships: `students.access_code` (unique) is the public entry point looked up by `/apply/[code]`; the resolved `students.id` UUID is the parent key for both `applications.student_id` and `checklist_items.student_id`; `checklist_items.application_id` optionally links a checklist row to one application.

**Two parallel identity models, both enforced in `src/app/actions.ts` before every mutation:**
- **Student flow:** `/apply/[code]` resolves `access_code` → student, with no teacher session involved. Server Actions re-derive the student from the access code and verify it owns the target application/checklist row (`resolveStudentFromAccessCode`, `authorizeApplication`, `authorizeChecklistItem`) — the access code itself is never trusted as an authorization token past that lookup.
- **Teacher flow:** `/teacher` → pick a class → authenticate against `susi_class2_teacher_class_credentials` (scrypt hash+salt, `src/lib/teacher-auth.ts`) → HMAC-signed HttpOnly cookie (`susi_class2_teacher_class_session`) carrying `classCode` + `sessionVersion`. Every subsequent request re-verifies against the DB's current `session_version`/`must_change_password`, so rotating a class's credentials (or forcing first-time password setup) immediately invalidates existing sessions. `requireTeacherClassSession(expectedClassCode)` enforces that the session's class matches the resource's class — a distribution-class teacher cannot touch startup-class students.

Both flows converge on the same mutation functions in `actions.ts`, which take an `accessCode: string | null` first argument to select which authorization path to run, then call into `src/lib/data.ts`.

**Class model:** valid classes are the fixed set in `src/lib/class-codes.ts` (`distribution`/`startup`/`health`, Korean display names, `isClassCode` guard). Adding a class means extending that list plus the corresponding `teacher_class_credentials` row via migration — there's no dynamic class creation.

**Routes:** `/`, `/teacher/login`, `/teacher/change-password` all redirect to `/teacher`. `/teacher/students/[id]`, `.../print`, `.../export/xlsx` are teacher-only and check the session's class against the student's `class_code`. `/apply/[code]` is student-only and independent of teacher auth. See `docs/01_ARCHITECTURE/ROUTES_AND_AUTH.md` for the full route/auth table.

**Schema evolution** lives in `supabase/migrations/*.sql`, applied in numeric order; `supabase/seeds/startup_students.sql` is a separate, idempotent (skip-if-exists) seed run after migrations, not part of the migration chain.

## Hard constraints (from `docs/00_PROJECT_CONTROL/PROJECT_OVERVIEW.md`)

- Never change existing `/apply/[code]` behavior, a student's `access_code`, a student's UUID, or the access_code↔UUID linkage — these are already printed on distributed QR codes.
- Do not change the production database without separate approval and prior verification.
- Never write secrets, real access codes, or student personal data into docs or Git.
- Keep this repo's code/env vars/Supabase/deploy fully separate from the finance repo's.

## Project docs

`docs/00_PROJECT_CONTROL/` (current task, dashboard, overview), `docs/01_ARCHITECTURE/` (system, routes/auth, DB schema, class structure), `docs/02_OPERATIONS/` (GitHub workflow, local setup, Supabase setup, Netlify deploy), `docs/03_ACADEMIC_YEAR/` (yearly rollover — multi-year support is still PLANNED, not implemented), `docs/04_RELEASE/` (changelog, known issues, QA checklist). These use a CONFIRMED/PLANNED/UNKNOWN/BLOCKED/DEPRECATED status convention — check a claim's status tag before relying on it.
