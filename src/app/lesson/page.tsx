"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Code2, Command, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { LessonCard } from "@/components/lessons/LessonCard";
import { LearningJourney } from "@/components/lessons/LearningJourney";
import { buttonClasses } from "@/components/ui/Button";
import {
  getLegacyTypingLessons,
  getLessonsByTrack,
} from "@/lib/data";
import type { Lesson } from "@/lib/data/types";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

function LessonGrid({
  lessons,
  getLessonProgress,
}: {
  lessons: Lesson[];
  getLessonProgress: ReturnType<typeof useUserProgress>["getLessonProgress"];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson) => (
        <LessonCard
          key={lesson.id}
          lesson={lesson}
          progress={getLessonProgress(lesson.id)}
        />
      ))}
    </div>
  );
}

function CourseCard({
  title,
  copy,
  href,
  Icon,
}: {
  title: string;
  copy: string;
  href: string;
  Icon: LucideIcon;
}) {
  return (
    <Card className="flex h-full flex-col gap-4 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_14px_34px_rgba(88,64,38,0.10)]">
      <span
        className="flex size-12 items-center justify-center rounded-full bg-brand-tint text-brand-dark"
        aria-hidden
      >
        <Icon className="size-6" strokeWidth={1.8} />
      </span>
      <div className="flex-1">
        <h2 className="text-xl font-bold tracking-tight text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{copy}</p>
      </div>
      <Link href={href} className={buttonClasses("secondary", "sm", "w-full")}>
        Open path
        <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
      </Link>
    </Card>
  );
}

export default function LessonListPage() {
  const basics = getLegacyTypingLessons();
  const python = getLessonsByTrack("python");
  const { user, getLessonProgress } = useUserProgress();
  const completionPct = (user.lessonsCompleted / user.totalLessons) * 100;
  const journeyItems = basics.slice(0, 8).map((lesson) => ({
    lesson,
    progress: getLessonProgress(lesson.id),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Learn"
        title="Lessons"
        subtitle="Choose typing or coding."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <CourseCard
          title="Learn to Type"
          copy="Practice letters, words, and sentences."
          href="#typing-basics"
          Icon={BookOpen}
        />
        <CourseCard
          title="Learn to Code"
          copy="Type simple Python patterns."
          href="#python-typing"
          Icon={Code2}
        />
        <CourseCard
          title="Keyboard Shortcuts"
          copy="Practice real shortcut keys."
          href="/shortcuts"
          Icon={Command}
        />
      </section>

      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-ink">
            Your progress
          </span>
          <span className="text-sm font-semibold text-ink-soft">
            {user.lessonsCompleted} / {user.totalLessons} done
          </span>
        </div>
        <ProgressBar value={completionPct} tone="success" label="Lessons completed" />
      </Card>

      <LearningJourney
        items={journeyItems}
        title="Typing Basics journey"
        subtitle="One level at a time."
      />

      <section id="typing-basics" className="space-y-4 scroll-mt-8">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-dark" aria-hidden>
            <BookOpen className="size-5" strokeWidth={1.8} />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Typing Basics
          </h2>
        </div>
        <LessonGrid lessons={basics} getLessonProgress={getLessonProgress} />
      </section>

      <section id="python-typing" className="space-y-4 scroll-mt-8">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-dark" aria-hidden>
            <Code2 className="size-5" strokeWidth={1.8} />
          </span>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Python Typing
          </h2>
        </div>
        <LessonGrid lessons={python} getLessonProgress={getLessonProgress} />
      </section>
    </div>
  );
}
