# SpeedSkin Design System

The north star for the product overhaul. Three words describe every screen:
**calm, premium, playful (never childish).** Think Linear/Stripe/Notion polish
with Brilliant/Khan clarity and Duolingo-style motivation (progression, not the
visual style). One cohesive system — if two screens solve the same problem two
ways, standardize on what's here.

## Foundations (tokens — `src/app/globals.css @theme`)

**Color — restrained, mostly neutral, one accent.**

| Token | Value | Use |
| --- | --- | --- |
| `brand` | `#f97316` | The single accent. Primary actions, active state, focus. Use sparingly. |
| `brand-dark` | `#ea580c` | Hover/pressed accent. |
| `brand-tint` / `brand-wash` | `#fff7ed` / `#ffedd5` | Soft accent fills behind icons/badges. |
| `ink` / `ink-soft` / `ink-faint` | `#18181b` / `#52525b` / `#71717a` | Text hierarchy. All ≥ 4.5:1 on white. |
| `canvas` / `surface` / `surface-muted` | `#faf8f4` / `#fff` / `#f5f4f1` | App background / cards / inset areas. |
| `line` | `#e9e5dd` | Hairline borders (1px). |
| `success` / `danger` / `info` | green / red / slate | Status only — never decorative. |

Rules: avoid rainbow UIs, avoid heavy gradients, avoid flashy effects. Accent is
a seasoning. The ambient background is intentionally quiet (a soft warm glow +
whisper of neutral texture) — keep it that way.

**Typography.** Inter, tight tracking on headings (`tracking-tight`). Scale:
page title `text-3xl/4xl font-bold`; section `text-xl font-bold`; card title
`text-lg font-bold`; body `text-sm/base text-ink-soft`; meta/labels `text-xs
uppercase tracking-wide text-ink-faint`. Mono only for the typing prompt.

**Spacing & radius.** Section rhythm `space-y-8`; card padding `p-5 sm:p-6`;
control height 44px (`h-11`). Radius: cards `rounded-card` (0.75rem), controls
`rounded-button` (0.625rem), pills/avatars `rounded-full`. Keep corners
consistent — no mixing 0.5/1.25rem ad hoc.

**Elevation.** Flat by default with a 1px `line` border. Resting cards: none or
`shadow-sm`. Hover/active surfaces: soft brown-tinted shadow
`0 12px 30px rgba(88,64,38,0.08)`. No hard/dark drop shadows.

## Motion (additive utilities in globals.css)

Tasteful and intentional only. `.animate-rise-in` for section/page entrance,
`.animate-fade-in` for hints, `.interactive` for hover-lift + press-settle on
clickable cards/buttons, `.focus-ring` for a consistent accessible focus halo.
All motion is disabled under `prefers-reduced-motion`.

## Components (standards)

- **Button** — primary (accent), secondary (tint), outline, ghost; sizes sm/md/lg
  at 40/44/56px; leading lucide icon `size-4`; press microinteraction.
- **Card** — `Card` primitive owns radius/border/shadow; pass a `bg-*` to tint
  (it yields the default surface so the tint wins).
- **Badge / Pill** — status + meta, lucide icon optional, never decorative color.
- **Input / Form** — `h-11`, `rounded-button`, 1px line, accent focus ring,
  visible label, helper/error text in `danger`.
- **Icons** — lucide only, `strokeWidth={1.8}`, sized 16/20/24. No emoji anywhere
  (navigation, achievements, buttons, avatars).
- **Progress** — bar for completion, ring for a single headline goal.

## Accessibility

≥4.5:1 text contrast; visible `focus-visible` rings on every interactive
element; ≥44px touch targets; keyboard-operable flows; `prefers-reduced-motion`
respected. (Known tradeoff: white-on-accent buttons sit ~2.5:1 — acceptable only
at large/bold sizes; revisit if strict AA is required.)

## Platform information architecture

SpeedSkin is a **digital-skills platform**, not a typing site. Courses are
first-class and the model must absorb future paths (Computer Skills, Internet
Safety, AI Literacy, Productivity) without restructuring:

- **Course** = a learning path (Typing, Coding, Keyboard Shortcuts, …) with an
  icon, summary, level/track progression, and its own player.
- Navigation: Home · Courses · Achievements · Teacher (role) · Settings ·
  Profile. A `/courses` hub presents every path with progress and a clear
  "continue / start" — students always know where they are and what's next.

## Overhaul sequence (this is pass 1 of N)

1. **Design language (this pass)** — calm/premium tokens + ambient background +
   motion/focus/a11y standards + this spec.
2. **Courses hub + navigation IA** — multi-course home, role-aware nav, profile.
3. **Lesson player** — one-task focus, keyboard viz, hint system, completion +
   transitions, applied across Typing/Coding/Shortcuts.
4. **Teacher analytics** — data cards, charts, scannable tables, reports.
5. **Consistency audit** — empty/loading/error states, forms, settings, auth.
