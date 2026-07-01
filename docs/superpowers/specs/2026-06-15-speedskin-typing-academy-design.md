# SpeedSkin Typing Academy — Design Spec

Date: 2026-06-15
Status: Approved (STEP 1)

## Summary

A modern, school-friendly Next.js app that teaches touch typing. STEP 1 delivers the
polished, navigable MVP shell: five pages, a reusable live typing engine, device-aware
on-screen keyboards, and a Supabase-ready (but mock-backed) data layer. No auth, no live
database in this step.

## Tech & scaffolding

- Next.js (App Router) + TypeScript + Tailwind CSS v4, npm, ESLint.
- `src/` layout, import alias `@/*` → `src/*`.
- Fonts via `next/font`: Nunito (display/headings) + Inter (body).
- Theme tokens as CSS variables in `globals.css`, surfaced to Tailwind via `@theme`.
  SpeedSkin orange accent (`#F97316`), soft neutral surfaces, rounded-2xl cards, large
  tap targets (≥44px).

## Routes

| Route             | Purpose                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `/`               | Landing / student dashboard: greeting, continue-lesson, stats, links |
| `/settings`       | Device settings: Chromebook / iPad / iPhone picker                   |
| `/lesson`         | Lesson list (levels 1–8+) with progress                              |
| `/lesson/[id]`    | Live typing lesson                                                   |
| `/achievements`   | Badge grid (earned + locked)                                         |
| `/teacher`        | Teacher dashboard: class roster + progress                          |

## Component structure

```
src/components/
  ui/        Button, Card, StatCard, ProgressBar, Badge, SegmentedControl, PageHeader
  layout/    AppShell (sidebar on desktop/Chromebook, bottom tab bar on phone/tablet), NavLinks
  typing/    TypingArea, Prompt (per-char styling), StatsBar, ResultsSummary
  keyboard/  OnScreenKeyboard (QWERTY, next-key highlight, finger color-coding), FingerGuide
```

## Device behavior (`src/lib/device/`)

- `DeviceProvider` (client) in root layout + `useDevice()` hook.
- Selection persisted to `localStorage` key `speedskin:device`; default `chromebook`.
- Chromebook → physical keyboard; lesson shows a non-interactive `FingerGuide`.
  iPad → larger interactive `OnScreenKeyboard`. iPhone → compact on-screen keyboard.
- The lesson page reads `useDevice()` to decide which keyboard UI renders.

## Typing engine (`src/lib/typing/`)

- Pure helpers: WPM (net), accuracy %, mistake count, elapsed time, per-character state
  (`correct | incorrect | current | pending`). Pure functions are unit-testable.
- `useTypingEngine(targetText, options)` hook orchestrates state. Generic over the prompt
  text so it can later power Python code lessons (STEP 2) — no English-only assumptions.
- On completion → `ResultsSummary` (WPM, accuracy, time, mistakes, next-lesson CTA).
- STEP 1 ships a working basic engine; STEP 2 layers levels, blank-keyboard fade-in hints,
  random prompt generation, and Python mode on top of this same engine.

## Supabase-ready data layer

- Mock data in `src/lib/mock/` (lessons, achievements, students, currentUser) shaped to
  match future DB tables.
- Thin repository layer `src/lib/data/*` (`getLessons()`, `getStudents()`, …) so swapping
  mock → Supabase later is localized.
- `src/lib/supabase/client.ts` stub (env-based init, commented) + `types.ts` placeholder.
  No auth, no live calls in STEP 1.

## Responsive strategy

Mobile-first. Bottom tab bar (phone/tablet) ↔ left sidebar (Chromebook/desktop). Verified
at iPhone (~390px), iPad (~820px), Chromebook (~1280px).

## Scope guardrails (YAGNI for STEP 1)

No auth, no real DB, no audio, no settings beyond device, no multi-class management. Just
five polished, navigable pages with a working typing engine and device-aware keyboards.
