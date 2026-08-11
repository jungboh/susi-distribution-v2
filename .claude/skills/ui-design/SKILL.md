---
name: ui-design
description: Apply susi-distribution's existing Tailwind visual language (colors, spacing, borders, typography, component shapes) when building or editing any teacher or student screen, so new UI matches the current app instead of introducing a new style.
---

# UI design conventions for susi-distribution

This app has one consistent visual language across teacher and student screens (see `src/components/class-selector.tsx`, `checklist-panel.tsx`, `teacher-header.tsx`, `application-table.tsx`). Match it rather than inventing new colors, radii, or spacing. Plain Tailwind utility classes only — no CSS-in-JS, no new design tokens, no component library.

## Color

- **Brand blue** is the only accent color: `bg-brand` / `text-brand` (`#2563eb`) with `hover:bg-brand-dark` (`#1d4ed8`) on interactive elements. Defined in `tailwind.config.ts` — reuse `brand`/`brand-dark`, don't hardcode new hex values or add new brand colors.
- **Neutrals are all `slate`**: `slate-800` for headings/primary text, `slate-600`/`slate-700` for body text, `slate-500` for secondary text, `slate-400` for placeholders/hints/disabled labels, `slate-300`/`slate-200`/`slate-100` for borders (darker border = more prominent element), `slate-50` for subtle recessed backgrounds. Page background is `#f4f6fb` (set globally in `globals.css`), cards are `bg-white`.
- **Semantic red** (`text-red-500`) is reserved for error/destructive states only (validation errors, delete affordances on hover). There is no separate success/warning color in use — don't introduce green/amber without a reason tied to existing patterns.

## Shape and elevation

- Cards/sections: `rounded-xl` or `rounded-2xl` + `border border-slate-200` + `bg-white`, optionally `shadow-sm` (modals use `shadow-xl`).
- Inputs/buttons/small chips: `rounded-lg`.
- Nested/grouped items inside a card: `rounded-lg border border-slate-100 bg-slate-50/40` (one shade recessed from the parent card).
- Empty states: `rounded-lg border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400`.

## Typography scale

- Page/dialog titles: `text-lg font-bold text-slate-800`.
- Section headings: `text-sm font-semibold text-slate-800`.
- Body/labels: `text-sm`; secondary metadata and table-dense UI: `text-xs`; the smallest counters/badges go down to `text-[11px]`.
- Font weight signals hierarchy: `font-bold` for titles, `font-semibold` for headings and primary buttons, `font-medium` for labels, regular weight for body copy.

## Interactive elements

- Primary button: `rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60` (sizing shrinks to `px-3 py-1.5 text-xs` in dense toolbars).
- Secondary/cancel button: `rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 disabled:opacity-60`.
- Text inputs/selects: `rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand` (no ring/shadow on focus — border color change only). Disabled state: `disabled:bg-slate-50`.
- Checkboxes: plain `<input type="checkbox">` with `accent-brand`, not a custom-styled control.
- Always pair a pending/loading state on submit buttons (`disabled` + label swap, e.g. `"확인" → "처리 중..."`) — every existing form does this via `useActionState`/`useTransition`, not a spinner overlay.
- Destructive actions (delete) are a bare `×` or icon-less text button in `text-slate-300 hover:text-red-500`, always behind a `confirm()` or explicit confirmation, never a bare click-to-delete.

## Layout patterns

- Modals: fixed full-screen overlay `fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4`, click-outside-to-close on the overlay only (not the panel), panel capped at `max-w-sm` with `p-6`.
- Class/card grids: `grid gap-4 sm:grid-cols-3` (matches the fixed 3-class model — don't hardcode a 3-column grid for lists that can grow).
- Horizontal scroll for per-university groups (`flex gap-3 overflow-x-auto`) rather than wrapping or paginating — this is intentional for the checklist board.
- Errors render inline near the control that caused them (`role="alert"`, `text-xs text-red-500`), not as toasts or global banners.

## Print/export screens

`/teacher/students/[id]/print` and the print CSS block in `globals.css` are a separate rendering mode (A4, `.no-print`, `.print-page`, `break-inside: avoid` on `.application-section`). If a screen needs a printable variant, follow that existing print stylesheet pattern rather than building new print CSS from scratch — see `globals.css` and `student-print-document.tsx`.

## What not to do

- Don't add a UI/component library (no shadcn, MUI, etc.) — this app is hand-rolled Tailwind only.
- Don't introduce new border radii, spacing units, or a second accent color for "just this one screen."
- Don't add animation/transition beyond the existing `transition` on hover color changes.
