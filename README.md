# SpeedSkin

SpeedSkin is a digital skills learning app for students. It combines typing lessons, beginner coding practice, keyboard shortcut training, classroom homework, teacher progress dashboards, and admin visibility in one polished Next.js product.

The app supports three roles:

- Student: practice lessons, join a class, complete homework, and track progress.
- Teacher: create classes, generate join codes, assign homework, and review student progress.
- Admin: view high-level workspace totals and product data.

When Supabase is not configured, SpeedSkin runs in local demo mode so the full product flow can still be explored without real accounts.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth and Postgres RLS
- Vitest
- ESLint

## Setup

Install dependencies:

```bash
npm install
```

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in Supabase values if you want real authentication and persistent cloud data. Leave them blank to use local demo mode.

## Environment Variables

SpeedSkin reads these public client variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Supabase publishable keys are also supported:

```bash
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not commit `.env`, `.env.local`, OAuth client secrets, Supabase service-role keys, or any other private API keys. Google OAuth secrets are configured in the Supabase dashboard, not in this repository.

## Supabase Setup

1. Create a Supabase project.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to `.env.local`.
3. Run `supabase/migrations/001_auth_classroom_progress.sql` in the Supabase SQL editor or with the Supabase CLI.
4. Confirm these tables exist:
   - `profiles`
   - `classrooms`
   - `class_memberships`
   - `assignments`
   - `lesson_progress`
   - `progress_logs`
   - `shortcut_skill_progress`
   - `shortcut_lesson_progress`
   - `shortcut_attempts`
5. Confirm Row Level Security is enabled.

The migration includes profile roles, class joining, lesson progress, shortcut mastery tracking, assignment data, and RLS policies for students, teachers, admins, and unauthenticated users.

## Google OAuth

Google sign-in is managed through Supabase Auth.

1. In Supabase, go to **Authentication > Providers > Google**.
2. Enable Google and add the Google OAuth Client ID and Client Secret.
3. In Google Cloud Console, add your app origins and redirect URLs.
4. In Supabase Auth URL settings, add:

```text
http://localhost:3000/auth/callback
https://your-production-domain.com/auth/callback
```

First-time Google users are sent to role onboarding. Returning users are routed to the dashboard for their saved role.

## Run Locally

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port 3000 is busy:

```bash
npm run dev -- --port 3001
```

## Test

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm run test
```

Run the production build:

```bash
npm run build
```

Serve the production build locally:

```bash
npm run start
```

## Main Routes

- `/` - student learning dashboard
- `/courses` - typing, coding, and keyboard shortcuts course cards
- `/lesson/[id]` - typing/coding lesson flow
- `/shortcuts` - keyboard shortcut levels
- `/shortcuts/[id]` - real shortcut combo trainer
- `/homework` - class code entry and homework
- `/achievements` - student awards
- `/teacher` - classroom dashboard and homework assignment flow
- `/admin` - admin workspace summary
- `/settings` - device selection
- `/auth/callback` - Supabase OAuth callback
- `/onboarding` - first-login role selection

## Deployment

Vercel is the deployment target; Supabase is the backend
(project `speedskin`, ref `xuuxwqrwvmaccxmjwwjk`).

### 1. Environment variables

Set these in **both** `.env.local` (dev) and **Vercel → Project → Settings →
Environment Variables** (Production + Preview). Both are public client keys.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xuuxwqrwvmaccxmjwwjk.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon`/publishable key |

After changing env vars in Vercel, **redeploy** (env changes don't apply to
existing builds).

### 2. Database

The schema lives in `supabase/migrations/001…004`. Apply it with the Supabase
CLI (`supabase db push`) or by pasting each file into the SQL editor in order.

### 3. Google OAuth setup

Two different callback URLs are involved — don't mix them up:

**Google Cloud Console** (console.cloud.google.com):
1. APIs & Services → OAuth consent screen → External → fill app name + support
   email; add scopes `email`, `profile`, `openid`; publish.
2. Credentials → Create credentials → OAuth client ID → **Web application**.
3. **Authorized JavaScript origins**: `https://<your-domain>` and
   `http://localhost:3000`.
4. **Authorized redirect URI** (this is Supabase's callback, not the app's):
   `https://xuuxwqrwvmaccxmjwwjk.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**.

**Supabase dashboard**:
1. Authentication → Providers → **Google** → enable, paste Client ID + Secret.
2. Authentication → URL Configuration:
   - **Site URL**: `https://<your-domain>`
   - **Redirect URLs** (allow list, this is the *app's* callback):
     `https://<your-domain>/auth/callback` and
     `http://localhost:3000/auth/callback`

### 4. Vercel

Default Next.js settings (`npm install` / `npm run build`). Add the env vars
from step 1, then deploy. Confirm the deployed landing page shows the login
screen (not "Supabase is not configured") — that confirms env vars are live.

### 5. Pre-launch checklist (before real users)

- **Remove the seed/demo accounts and data** (see `docs/DEMO.md`):
  ```sql
  delete from auth.users where email like '%@speedskin.dev';
  -- cascades to profiles, memberships, assignments, and progress
  ```
- **Re-enable email confirmation**: Supabase → Authentication → Providers →
  Email → turn on **Confirm email** (it may be off for demoing signups).
- Rotate keys if `docs/DEMO.md` was shared.
- Re-run `get_advisors` (security + performance) after any schema change.

### Verify before sharing

```bash
npm run lint && npm run test && npm run build
```

Then click through the student, teacher, and admin flows on the deployed URL
with real accounts (browser-only — email/password + Google can't be exercised
from CI).

## Repository Hygiene

The repository intentionally excludes:

- `node_modules`
- `.next`
- `.env` and `.env.local`
- build output
- coverage output
- local logs and caches
- screenshots and local QA artifacts

Only `.env.example` should be committed as an environment template.
