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

Vercel is the expected deployment target.

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js settings:
   - Install command: `npm install`
   - Build command: `npm run build`
   - Output directory: default
4. Add the public Supabase variables in Vercel project settings.
5. Add the deployed `/auth/callback` URL to Supabase and Google OAuth redirect allow lists.
6. Deploy.

Before sharing the app with real users, verify:

```bash
npm run lint
npm run test
npm run build
```

Then test the student, teacher, and admin flows with real Supabase accounts.

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
