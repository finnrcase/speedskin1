# SpeedSkin — Demo Access

The app runs on a live Supabase backend (project **`speedskin`**,
ref `xuuxwqrwvmaccxmjwwjk`). These accounts are **real, pre-seeded Supabase
users** with real data and RLS enforced — not a local demo bypass.

## Environment variables

Local dev uses `.env.local` (already set). For the Vercel deployment, set:

```
NEXT_PUBLIC_SUPABASE_URL=https://xuuxwqrwvmaccxmjwwjk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from Supabase → Project Settings → API>
```

## Login credentials (password for all: `SpeedSkin123!`)

| Role | Email | What you'll see |
| --- | --- | --- |
| **Teacher** | `teacher@speedskin.dev` | Class 6B dashboard: join code `SPEED-6021`, 6 students with WPM/accuracy/mastery, 4 assignments, roster + summaries |
| **Student** | `student@speedskin.dev` | Jordan's home + courses with saved progress, and homework for Class 6B |

Other seeded students (same password): `ava@`, `noah@`, `maya@`, `liam@`,
`eli@speedskin.dev`.

These accounts are email-pre-confirmed, so they log in immediately.

## To let NEW people sign up during a demo
Either (a) Supabase → Authentication → Providers → Email → turn **off**
"Confirm email", or (b) configure **Google** (Authentication → Providers →
Google) with a Google Cloud OAuth client and add
`https://<your-domain>/auth/callback` + `http://localhost:3000/auth/callback`
to the redirect allowlist.

## Before a public launch
- Remove these seed/demo accounts and data.
- Turn email confirmation back on (or keep Google OAuth).
- Rotate keys if this doc was shared widely.
