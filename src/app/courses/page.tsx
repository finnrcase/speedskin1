"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  ACTIVE_COURSES,
  FUTURE_COURSES,
  type Course,
} from "@/lib/courses";
import { getLessonsByTrack, getShortcutLessons } from "@/lib/data";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

interface CourseProgress {
  completed: number;
  total: number;
  nextHref: string;
  masteryPct?: number;
}

export default function CoursesPage() {
  const { user, getLessonProgress, getShortcutLessonProgress } =
    useUserProgress();

  const progressFor = (course: Course): CourseProgress => {
    if (course.source.type === "typing") {
      const lessons = getLessonsByTrack(course.source.track);
      const completed = lessons.filter(
        (l) => getLessonProgress(l.id).status === "completed",
      ).length;
      const next = lessons.find(
        (l) => getLessonProgress(l.id).status !== "completed",
      );
      return {
        completed,
        total: lessons.length,
        nextHref: next ? `/lesson/${next.id}` : "/lesson",
      };
    }
    // shortcuts
    const lessons = getShortcutLessons();
    const completed = lessons.filter(
      (l) => getShortcutLessonProgress(l.id).status === "completed",
    ).length;
    const next = lessons.find(
      (l) => getShortcutLessonProgress(l.id).status !== "completed",
    );
    return {
      completed,
      total: lessons.length,
      nextHref: next ? `/shortcuts/${next.id}` : "/shortcuts",
      masteryPct: user.shortcutMasteryPct,
    };
  };

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Learn"
        title="Pick a path"
        subtitle="Typing, coding, and shortcuts."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIVE_COURSES.map((course) => (
          <ActiveCourseCard
            key={course.id}
            course={course}
            progress={progressFor(course)}
          />
        ))}
      </section>

      {FUTURE_COURSES.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Coming soon
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {FUTURE_COURSES.map((course) => (
              <FutureCourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CourseIcon({ Icon, muted }: { Icon: LucideIcon; muted?: boolean }) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1",
        muted
          ? "bg-surface text-ink-faint ring-line"
          : "bg-brand-tint text-brand-dark ring-brand/10",
      )}
      aria-hidden
    >
      <Icon className="size-6" strokeWidth={1.8} />
    </span>
  );
}

function ActiveCourseCard({
  course,
  progress,
}: {
  course: Course;
  progress: CourseProgress;
}) {
  const { completed, total, nextHref, masteryPct } = progress;
  const pct = total === 0 ? 0 : (completed / total) * 100;
  const done = total > 0 && completed === total;
  const cta = completed === 0 ? "Start course" : done ? "Review course" : "Continue";

  return (
    <Card className="flex h-full flex-col gap-5 hover:border-brand/25">
      <div className="flex items-start gap-3">
        <CourseIcon Icon={course.Icon} />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold tracking-tight text-ink">
            {course.title}
          </h3>
          <p className="text-sm text-ink-soft">{course.subtitle}</p>
        </div>
        {done && (
          <Badge tone="success" icon={CheckCircle2}>
            Complete
          </Badge>
        )}
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink-faint">
          <span>
            {completed}/{total} lessons
          </span>
          {masteryPct !== undefined && <span>{masteryPct}% mastery</span>}
        </div>
        <ProgressBar
          value={pct}
          tone={done ? "success" : "brand"}
          label={`${course.title} progress`}
        />
        <Link href={nextHref} className={buttonClasses("primary", "md", "w-full")}>
          {cta}
          <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
        </Link>
      </div>
    </Card>
  );
}

function FutureCourseCard({ course }: { course: Course }) {
  return (
    <Card className="flex h-full flex-col gap-3 border-dashed bg-surface-muted/60">
      <CourseIcon Icon={course.Icon} muted />
      <div className="flex-1">
        <h3 className="text-base font-bold tracking-tight text-ink">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-ink-soft">{course.subtitle}</p>
      </div>
      <span className="text-sm font-semibold text-ink-faint">Coming soon</span>
    </Card>
  );
}
