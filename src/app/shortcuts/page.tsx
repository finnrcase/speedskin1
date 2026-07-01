"use client";

import Link from "next/link";
import { ArrowRight, Command } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ShortcutLessonCard } from "@/components/shortcuts/ShortcutLessonCard";
import {
  getShortcutLessons,
} from "@/lib/data";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export default function ShortcutsPage() {
  const { user, getShortcutLessonProgress } = useUserProgress();
  const lessons = getShortcutLessons();
  const completionPct = (user.shortcutLessonsCompleted / lessons.length) * 100;
  const current =
    lessons.find((lesson) => getShortcutLessonProgress(lesson.id)?.status === "current") ??
    lessons.find((lesson) => getShortcutLessonProgress(lesson.id)?.status === "available");

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Learn"
        title="Keyboard Shortcuts"
        subtitle="Press the shortcut shown."
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

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              {user.shortcutLessonsCompleted} of {lessons.length} levels
            </h2>
          </div>
          <span className="text-sm font-semibold text-ink-soft">
            {user.shortcutMasteryPct}% mastery
          </span>
        </div>
        <ProgressBar value={completionPct} tone="success" label="Shortcut path progress" />
      </Card>

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
