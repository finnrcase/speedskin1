# SpeedSkin Academy architecture

SpeedSkin uses one curriculum engine for eight Academies. A `CurriculumLesson`
contains the Learn, Type, Think, Check, and Score content plus independent
curriculum and typing difficulty. Reviewed curriculum definitions live in
`src/lib/curriculum/lessons.ts`; student-created attempts live in Supabase.

## Compatibility decisions

- Keyboard Academy reuses `l1-home-row-letters`, `l2-home-row-words`, and
  `l3-top-bottom-rows`. Existing `lesson_progress` rows continue to count.
- The remaining classic typing drills are retained as practice while content is
  progressively reviewed into the richer model.
- Python typing remains an optional specialized practice area. It still uses the
  proven typing player and existing progress rows.
- The shortcut trainer remains intact and is linked as specialized practice;
  Chromebook lessons may link to it with `relatedPracticeHref`.
- Academy progress is derived from completed lesson IDs, so no duplicated
  progress table or destructive data migration is required.
- Non-Keyboard Academy attempts still use the existing `basics` database track
  for schema compatibility, but classic Typing course totals, unlocks, and level
  calculations explicitly exclude those lessons.

## Deterministic metrics

XP never rewards raw WPM. It is the lesson's base XP plus an accuracy bonus
(15 at 97%+, 8 at 92%+) and a knowledge bonus equal to quiz percentage divided
by ten, rounded. XP is awarded once per lesson; later practice attempts are
saved with zero XP. Total XP uses the best bounded award per lesson.

Keyboard Health is a 0–100 summary based only on data SpeedSkin currently has:

- 70% average typing accuracy
- 20% published Academy lesson completion
- 10% weak-key health, where each reported weak key reduces that component by
  20 points, up to five keys

Learners with no completed lessons receive a neutral starting value of 80
rather than a misleading low score based on missing history.

The formula intentionally omits invented consistency or timing precision. It
can be expanded when recent-attempt history is rich enough to support it.

Streaks count distinct consecutive local calendar days with a completed Academy
attempt. Repeating lessons on the same day does not increase the streak, while
meaningful practice on a later day can maintain it. Legacy progress has no
completion timestamp, so authenticated legacy users begin a new measured streak
when they finish their next Academy attempt.

## Trust boundary

The browser calculates typing metrics, quiz score, and XP because curriculum is
version-controlled rather than stored in Postgres. RLS prevents writing attempts
for another user, attempts are immutable, XP is capped at 100, and a partial
unique index permits only one positive XP award per user and lesson. This is a
proportionate integrity boundary for educational progress, not authoritative
high-stakes assessment. A learner can still alter their own first-attempt values
with a custom client; server-side curriculum scoring is intentionally deferred.

Grade band is not currently stored on user profiles. Free Play exposes an
explicit grade-band filter and Surprise Me respects it, but Academy Mode cannot
automatically personalize grade eligibility until profile/onboarding data exists.

## Adding curriculum

The curriculum production system is documented in `docs/curriculum/README.md`,
with the human authoring contract in `docs/curriculum/Finn-Build-Sheet.md` and
the 135-slot plan in `docs/curriculum/roadmap.md`. Conceptual levels, typing
levels, and grade bands are centralized in `src/lib/curriculum/levels.ts`;
Academy outcomes and units live in `src/lib/curriculum/plans.ts`.

Add a validated `CurriculumLesson` to `src/lib/curriculum/lessons.ts`. The
catalog, filters, Academy browser, Free Play, Surprise Me, lesson player,
scoring, and progress views consume the shared data automatically. New locales
can use the optional `locale` metadata; the typing engine remains text-agnostic.
`npm run curriculum:validate` is also a production-build prerequisite, while
`npm run curriculum:report` shows authored coverage and gaps.
