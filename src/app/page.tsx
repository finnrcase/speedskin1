"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ClipboardCheck,
  Clock3,
  Flame,
  Gauge,
  GraduationCap,
  Keyboard,
  Laptop,
  ListChecks,
  Map,
  Medal,
  Rocket,
  Sparkles,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { LessonCard } from "@/components/lessons/LessonCard";
import { LearningJourney } from "@/components/lessons/LearningJourney";
import { HomeworkSummaryCard } from "@/components/classroom/HomeworkSummaryCard";
import { AchievementMark } from "@/components/ui/AchievementMark";
import {
  getAchievements,
  getLessonById,
  getLessons,
} from "@/lib/data";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

const FEATURES = [
  { label: "Any device", Icon: Laptop },
  { label: "Teacher dashboard", Icon: GraduationCap },
  { label: "Class codes", Icon: ClipboardCheck },
  { label: "Progress tracking", Icon: TrendingUp },
];

function displayKey(key: string): string {
  if (key === " ") return "Space";
  if (key === ";") return "Semicolon";
  return key.toUpperCase();
}

function ProgressRing({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className="grid size-24 place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(249,115,22,0.16)]"
      style={{
        background: `conic-gradient(#f97316 ${clamped * 3.6}deg, #ffedd5 0deg)`,
      }}
      aria-label={`${label}: ${clamped}%`}
    >
      <div className="grid size-16 place-items-center rounded-full bg-white text-center shadow-[0_8px_18px_rgba(88,64,38,0.08)]">
        <span className="text-xl font-bold tracking-tight text-ink">
          {clamped}%
        </span>
      </div>
    </div>
  );
}

function MotivationPanel({
  title,
  copy,
  Icon,
  children,
}: {
  title: string;
  copy: string;
  Icon: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <Card className="group min-h-40 overflow-hidden bg-white/92 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_14px_34px_rgba(88,64,38,0.10)]">
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-tint text-brand-dark ring-1 ring-brand/10 transition-colors group-hover:bg-brand group-hover:text-white">
          <Icon className="size-6" strokeWidth={1.9} aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-bold tracking-tight text-ink">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-ink-soft">{copy}</p>
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export default function DashboardPage() {
  const { user, getLessonProgress } = useUserProgress();
  const currentLesson = getLessonById(user.currentLessonId);
  const lessons = getLessons();
  const earnedAchievements = getAchievements().filter((a) => a.earned);
  const completionPct = (user.lessonsCompleted / user.totalLessons) * 100;
  const journeyItems = lessons.slice(0, 8).map((lesson) => ({
    lesson,
    progress: getLessonProgress(lesson.id),
  }));
  const upNext = lessons
    .filter((l) => {
      const p = getLessonProgress(l.id);
      return p?.status === "current" || p?.status === "available";
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="hero-panel keyboard-pattern rounded-card border border-brand/20 p-6 shadow-[0_18px_50px_rgba(88,64,38,0.11)] sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.35fr_0.9fr] lg:items-center">
          <div className="max-w-3xl space-y-5">
            <p className="inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand shadow-[0_1px_2px_rgba(88,64,38,0.04)]">
              Welcome back, {user.name}
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Ready to level up your typing?
            </h1>
            <p className="max-w-2xl text-base leading-7 text-ink-soft">
              Start today&apos;s mission, build your next typing skill, and keep
              your streak alive with focused practice.
            </p>
            <div className="flex flex-wrap gap-2">
              {FEATURES.map(({ label, Icon }) => (
                <Badge key={label} tone="brand" icon={Icon}>
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-card border border-white/75 bg-white/85 p-5 shadow-[0_14px_34px_rgba(88,64,38,0.10)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    Today&apos;s goal
                  </p>
                  <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
                    Finish {currentLesson?.title ?? "one lesson"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">
                    Aim for 95% accuracy and a clean finish.
                  </p>
                </div>
                <ProgressRing value={completionPct} label="Course progress" />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-button bg-brand-tint px-3 py-2 text-sm font-semibold text-brand-dark">
                <span>Level {user.level}</span>
                <span>{user.lessonsCompleted}/{user.totalLessons} lessons</span>
              </div>
            </div>

            <div className="rounded-card border border-white/70 bg-white/80 p-4 shadow-[0_12px_28px_rgba(88,64,38,0.08)] backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-brand text-white">
                  <Map className="size-5" strokeWidth={1.9} aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                    Learning path
                  </p>
                  <p className="font-bold text-ink">Practice, improve, unlock</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-ink-soft">
                {["Warm up", "Type clean", "Level up"].map((step, index) => (
                  <div key={step} className="rounded-button bg-brand-tint px-2 py-3">
                    <span className="mx-auto mb-1 flex size-6 items-center justify-center rounded-full bg-white text-brand-dark">
                      {index + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <MotivationPanel
          title="Today's Mission"
          copy="Start today's mission and finish one focused challenge."
          Icon={Rocket}
        >
          {currentLesson && (
            <Link
              href={`/lesson/${currentLesson.id}`}
              className={buttonClasses("primary", "sm", "w-full")}
            >
              Start today&apos;s mission
              <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
            </Link>
          )}
        </MotivationPanel>

        <MotivationPanel
          title="Next Skill"
          copy={currentLesson?.focus ?? "Build your next typing skill."}
          Icon={BookOpenCheck}
        >
          <Badge tone="brand" icon={Sparkles}>
            Build your next typing skill
          </Badge>
        </MotivationPanel>

        <MotivationPanel
          title="Keys to Practice"
          copy="Practice these keys until they feel automatic."
          Icon={Keyboard}
        >
          <div className="flex flex-wrap gap-2">
            {user.weakKeys.map((key) => (
              <span
                key={key}
                className="rounded-button border border-line bg-cream px-2.5 py-1.5 text-xs font-bold text-ink-soft"
              >
                {displayKey(key)}
              </span>
            ))}
          </div>
        </MotivationPanel>
      </section>

      <LearningJourney items={journeyItems} />

      <Card className="warm-panel flex flex-col gap-5 border-brand/15 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className="flex size-14 items-center justify-center rounded-full border border-white/80 bg-white text-base font-bold text-brand-dark shadow-[0_8px_20px_rgba(88,64,38,0.08)]"
            aria-hidden
          >
            {user.avatar}
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Weekly streak
            </p>
            <h2 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Keep your streak alive
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
              You&apos;re {Math.max(0, 7 - user.streakDays)} practice days from
              a seven-day streak milestone.
            </p>
          </div>
        </div>
        <div className="w-full rounded-card border border-white/70 bg-white/80 p-4 sm:w-72">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-soft">
              Weekly streak
            </span>
            <span className="text-2xl font-bold text-brand-dark">
              {user.streakDays}/7
            </span>
          </div>
          <ProgressBar
            value={(user.streakDays / 7) * 100}
            tone="brand"
            label="Weekly streak"
            className="mt-3"
          />
        </div>
      </Card>

      <section>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Day streak"
            value={user.streakDays}
            icon={Flame}
            tone="brand"
            detail="Keep your streak alive"
            progress={(user.streakDays / 7) * 100}
          />
          <StatCard
            label="Avg speed"
            value={user.averageWpm}
            unit="wpm"
            icon={Gauge}
            tone="info"
            detail="+3 WPM this week"
            progress={(user.averageWpm / 40) * 100}
          />
          <StatCard
            label="Accuracy"
            value={`${user.averageAccuracy}%`}
            icon={Target}
            tone="success"
            detail="Best: 98%"
            progress={user.averageAccuracy}
          />
          <StatCard
            label="Practice time"
            value={user.minutesPracticed}
            icon={Clock3}
            tone="neutral"
            detail="Goal: 100 min"
            progress={(user.minutesPracticed / 100) * 100}
          />
        </div>
      </section>

      {currentLesson && (
        <Card className="overflow-hidden border-brand/15 bg-cream sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-3">
            <Badge tone="brand" icon={Sparkles}>Next challenge</Badge>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-ink">
                {currentLesson.title}
              </h2>
              <p className="max-w-md text-sm leading-6 text-ink-soft">
                {currentLesson.focus}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="neutral" icon={ListChecks}>
                Level {currentLesson.level}
              </Badge>
              <Badge tone="neutral" icon={Medal}>
                Ready for Python typing?
              </Badge>
            </div>
          </div>
          <Link
            href={`/lesson/${currentLesson.id}`}
            className={buttonClasses(
              "primary",
              "lg",
              "mt-5 w-full sm:mt-0 sm:w-auto",
            )}
          >
            Start lesson
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
          </Link>
        </Card>
      )}

      <HomeworkSummaryCard />

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              Current term
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-ink">
              Course progress
            </h2>
          </div>
          <span className="text-sm font-semibold text-ink-soft">
            {user.lessonsCompleted} / {user.totalLessons} lessons
          </span>
        </div>
        <ProgressBar value={completionPct} tone="success" label="Course progress" />
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-ink">Up next</h2>
          <Link href="/lesson" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
            See all lessons
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upNext.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              progress={getLessonProgress(lesson.id)}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Recent milestones
          </h2>
          <Link href="/achievements" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
            View all
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {earnedAchievements.map((a) => (
            <Card
              key={a.id}
              className="flex w-40 shrink-0 flex-col items-start gap-3"
            >
              <AchievementMark icon={a.icon} className="size-10" />
              <span className="text-sm font-semibold text-ink">{a.title}</span>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
