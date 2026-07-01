import Link from "next/link";
import {
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Code2,
  Gauge,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Stars } from "@/components/ui/Stars";
import { cn } from "@/lib/utils";
import type { Lesson, LessonProgress } from "@/lib/data/types";

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
}

function statusBadge(status: LessonProgress["status"] | undefined) {
  switch (status) {
    case "completed":
      return <Badge tone="success" icon={CheckCircle2}>Completed</Badge>;
    case "current":
      return <Badge tone="brand" icon={PlayCircle}>Continue</Badge>;
    case "locked":
      return <Badge tone="neutral" icon={Lock}>Locked</Badge>;
    default:
      return <Badge tone="info" icon={Sparkles}>New</Badge>;
  }
}

const CATEGORY_LABELS: Record<Lesson["category"], string> = {
  letters: "Letter control",
  words: "Word rhythm",
  rows: "Keyboard reach",
  capitals: "Shift control",
  punctuation: "Punctuation",
  numbers: "Number row",
  sentences: "Sentence flow",
  timed: "Timed sprint",
  code: "Code typing",
};

function targetWpm(lesson: Lesson): number {
  if (lesson.promptType === "python") return 24 + lesson.level * 2;
  return 22 + lesson.level * 2;
}

export function LessonCard({ lesson, progress }: LessonCardProps) {
  const locked = progress?.status === "locked";

  const inner = (
    <Card
      className={cn(
        "group relative flex h-full flex-col gap-4 overflow-hidden",
        locked
          ? "opacity-60"
          : "hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-[0_14px_34px_rgba(88,64,38,0.10)]",
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          progress?.status === "completed"
            ? "bg-gradient-to-r from-success to-brand"
            : "bg-gradient-to-r from-brand via-gold to-brand-light",
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-gradient-to-br from-brand-tint to-gold-tint text-sm font-bold text-brand-dark shadow-[0_1px_2px_rgba(88,64,38,0.06)]">
          {lesson.level}
        </span>
        {statusBadge(progress?.status)}
      </div>
      <div className="flex-1">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge
            tone={lesson.promptType === "python" ? "info" : "neutral"}
            icon={lesson.promptType === "python" ? Code2 : BookOpenCheck}
          >
            {lesson.track === "python" ? "Python typing" : CATEGORY_LABELS[lesson.category]}
          </Badge>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-ink">
          {lesson.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{lesson.focus}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-button border border-line bg-cream px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              <Gauge className="size-3.5" strokeWidth={1.8} aria-hidden />
              Target
            </div>
            <p className="mt-1 text-sm font-bold text-ink">
              {targetWpm(lesson)} WPM
            </p>
          </div>
          <div className="rounded-button border border-line bg-cream px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
              <Target className="size-3.5" strokeWidth={1.8} aria-hidden />
              Goal
            </div>
            <p className="mt-1 text-sm font-bold text-ink">90% accuracy</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 border-t border-line pt-3 text-sm text-ink-faint">
        {progress && progress.status !== "locked" && (
          <div className="progress-rail h-1.5 rounded-full">
            <div
              className="h-full rounded-full bg-brand"
              style={{
                width:
                  progress.status === "completed"
                    ? "100%"
                    : progress.status === "current"
                      ? "62%"
                      : "28%",
              }}
            />
          </div>
        )}
        <div className="flex items-center justify-between">
          {progress && progress.bestWpm !== null ? (
            <span className="font-semibold text-ink-soft">
              {progress.bestWpm} WPM · {progress.bestAccuracy}%
            </span>
          ) : (
            <span>{lesson.estimatedMinutes} min</span>
          )}
          {progress && progress.stars > 0 ? (
            <Stars count={progress.stars} />
          ) : (
            <span className="inline-flex items-center gap-1.5">
              {lesson.timeLimitSeconds && (
                <>
                  <Clock3 className="size-4" strokeWidth={1.8} aria-hidden />
                  Timed
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  if (locked) {
    return <div aria-disabled>{inner}</div>;
  }

  return (
    <Link
      href={`/lesson/${lesson.id}`}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      {inner}
    </Link>
  );
}
