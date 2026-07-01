"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Command,
  Gauge,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HomeworkSummaryCard } from "@/components/classroom/HomeworkSummaryCard";
import { buttonClasses } from "@/components/ui/Button";
import {
  getLessonsByTrack,
  getShortcutLessons,
} from "@/lib/data";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

interface ContinueCardProps {
  title: string;
  detail: string;
  href: string;
  Icon: LucideIcon;
}

function ContinueCard({ title, detail, href, Icon }: ContinueCardProps) {
  return (
    <Link href={href} className="block h-full">
      <Card className="flex h-full flex-col gap-5 hover:border-brand/25">
        <span
          className="flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand-dark"
          aria-hidden
        >
          <Icon className="size-6" strokeWidth={1.8} />
        </span>
        <div className="flex-1">
          <h3 className="text-xl font-bold tracking-tight text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-soft">{detail}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          Continue
          <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
        </span>
      </Card>
    </Link>
  );
}

function firstOpenLesson(
  lessons: ReturnType<typeof getLessonsByTrack>,
  getProgress: ReturnType<typeof useUserProgress>["getLessonProgress"],
) {
  return lessons.find((lesson) => getProgress(lesson.id).status !== "completed");
}

export default function DashboardPage() {
  const { user, getLessonProgress, getShortcutLessonProgress } = useUserProgress();
  const typingLessons = getLessonsByTrack("basics");
  const codingLessons = getLessonsByTrack("python");
  const shortcutLessons = getShortcutLessons();
  const nextTyping = firstOpenLesson(typingLessons, getLessonProgress);
  const nextCoding = firstOpenLesson(codingLessons, getLessonProgress);
  const nextShortcut = shortcutLessons.find(
    (lesson) => getShortcutLessonProgress(lesson.id).status !== "completed",
  );
  const lessonPct = Math.round((user.lessonsCompleted / user.totalLessons) * 100);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-brand">Welcome back.</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink">
          Keep learning, {user.name}.
        </h1>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Continue learning
          </h2>
          <Link href="/courses" className={buttonClasses("outline", "sm")}>
            Learn
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <ContinueCard
            title="Continue Typing"
            detail={nextTyping?.title ?? "Review typing lessons"}
            href={nextTyping ? `/lesson/${nextTyping.id}` : "/lesson"}
            Icon={BookOpen}
          />
          <ContinueCard
            title="Continue Coding"
            detail={nextCoding?.title ?? "Practice Python typing"}
            href={nextCoding ? `/lesson/${nextCoding.id}` : "/lesson#python-typing"}
            Icon={Code2}
          />
          <ContinueCard
            title="Continue Shortcuts"
            detail={nextShortcut?.title ?? "Review shortcut levels"}
            href={nextShortcut ? `/shortcuts/${nextShortcut.id}` : "/shortcuts"}
            Icon={Command}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Homework due
        </h2>
        <HomeworkSummaryCard />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            Progress snapshot
          </h2>
          <Link href="/achievements" className="text-sm font-semibold text-brand">
            Details
          </Link>
        </div>
        <Card className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <Gauge className="size-4 text-brand" strokeWidth={1.8} />
                Speed
              </div>
              <p className="mt-2 text-3xl font-bold text-ink">
                {user.averageWpm}
                <span className="ml-1 text-base font-semibold text-ink-faint">
                  wpm
                </span>
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <Target className="size-4 text-brand" strokeWidth={1.8} />
                Accuracy
              </div>
              <p className="mt-2 text-3xl font-bold text-ink">
                {user.averageAccuracy}%
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <Trophy className="size-4 text-brand" strokeWidth={1.8} />
                Lessons
              </div>
              <p className="mt-2 text-3xl font-bold text-ink">
                {user.lessonsCompleted}
                <span className="ml-1 text-base font-semibold text-ink-faint">
                  done
                </span>
              </p>
            </div>
          </div>
          <ProgressBar value={lessonPct} tone="success" label="Lessons complete" />
        </Card>
      </section>
    </div>
  );
}
