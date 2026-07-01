"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Command, ShieldCheck, Target } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { ShortcutLessonCard } from "@/components/shortcuts/ShortcutLessonCard";
import {
  getShortcutLessons,
} from "@/lib/data";
import { shortcutLabel } from "@/lib/shortcuts/catalog";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export default function ShortcutsPage() {
  const { user, getShortcutLessonProgress } = useUserProgress();
  const lessons = getShortcutLessons();
  const completionPct = (user.shortcutLessonsCompleted / lessons.length) * 100;
  const current =
    lessons.find((lesson) => getShortcutLessonProgress(lesson.id)?.status === "current") ??
    lessons.find((lesson) => getShortcutLessonProgress(lesson.id)?.status === "available");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Keyboard shortcuts"
        title="Keyboard superpowers"
        subtitle="Practice real commands with randomized missions, just like typing lessons."
        actions={
          current && (
            <Link
              href={`/shortcuts/${current.id}`}
              className="inline-flex items-center gap-2 rounded-button bg-brand px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(249,115,22,0.20)] transition-transform hover:-translate-y-0.5"
            >
              Continue
              <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
            </Link>
          )
        }
      />

      <Card className="warm-panel space-y-3 border-brand/15">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Badge tone="brand" icon={Command}>
              Shortcut path
            </Badge>
            <h2 className="mt-2 text-lg font-bold tracking-tight text-ink">
              Learn commands after you learn keys
            </h2>
          </div>
          <span className="text-sm font-semibold text-ink-soft">
            {user.shortcutLessonsCompleted} / {lessons.length} levels done
          </span>
        </div>
        <ProgressBar value={completionPct} tone="success" label="Shortcut path progress" />
      </Card>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Mastery"
          value={`${user.shortcutMasteryPct}%`}
          icon={ShieldCheck}
          tone="success"
          detail="Comfortable or mastered"
          progress={user.shortcutMasteryPct}
        />
        <StatCard
          label="Reaction"
          value={(user.shortcutAverageReactionMs / 1000).toFixed(1)}
          unit="s"
          icon={Clock3}
          tone="info"
          detail="Average shortcut response"
        />
        <StatCard
          label="Lessons"
          value={user.shortcutLessonsCompleted}
          icon={Target}
          tone="brand"
          detail={`${lessons.length} levels available`}
          progress={completionPct}
        />
        <Card className="bg-white/82 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Focus
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {user.weakShortcuts.map((shortcutId) => (
              <span
                key={shortcutId}
                className="rounded-button border border-line bg-cream px-2 py-1 text-xs font-semibold text-ink-soft"
              >
                {shortcutLabel(shortcutId)}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-dark"
            aria-hidden
          >
            <Command className="size-5" strokeWidth={1.8} />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Shortcut levels
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <ShortcutLessonCard
              key={lesson.id}
              lesson={lesson}
              progress={getShortcutLessonProgress(lesson.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
