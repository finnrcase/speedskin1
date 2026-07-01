import Link from "next/link";
import { Check, Lock, Play, Route } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Lesson, LessonProgress } from "@/lib/data/types";

interface JourneyItem {
  lesson: Lesson;
  progress?: LessonProgress;
}

interface LearningJourneyProps {
  items: JourneyItem[];
  title?: string;
  subtitle?: string;
}

const STATE_LABELS: Record<LessonProgress["status"], string> = {
  completed: "Completed",
  current: "Current",
  available: "Next up",
  locked: "Locked",
};

function stateIcon(status: LessonProgress["status"] | undefined) {
  if (status === "completed") return Check;
  if (status === "current") return Play;
  if (status === "locked") return Lock;
  return Route;
}

export function LearningJourney({
  items,
  title = "Your learning journey",
  subtitle = "Move through levels, unlock new skills, and keep your typing streak alive.",
}: LearningJourneyProps) {
  return (
    <section className="rounded-card border border-brand/15 bg-surface p-5 shadow-[0_12px_30px_rgba(88,64,38,0.08)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Level path
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
            {subtitle}
          </p>
        </div>
        <Badge tone="brand" icon={Route}>
          Build your next typing skill
        </Badge>
      </div>

      <div className="mt-6 overflow-x-auto pb-2">
        <div className="relative flex min-w-[720px] items-stretch gap-3">
          <div className="journey-line absolute left-10 right-10 top-9 h-2 rounded-full" />
          {items.map(({ lesson, progress }) => {
            const status = progress?.status ?? "available";
            const locked = status === "locked";
            const Icon = stateIcon(status);
            const node = (
              <div
                className={cn(
                  "relative flex w-36 flex-col items-center gap-3 rounded-card border bg-white px-3 py-4 text-center shadow-[0_4px_14px_rgba(88,64,38,0.06)] transition-all",
                  status === "completed" &&
                    "border-success/20 bg-success-light/70",
                  status === "current" &&
                    "border-brand/40 bg-brand-tint shadow-[0_12px_28px_rgba(249,115,22,0.16)] ring-2 ring-brand/10",
                  status === "available" &&
                    "border-brand/15 hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-[0_12px_28px_rgba(88,64,38,0.10)]",
                  locked && "border-line bg-surface-muted opacity-70",
                )}
              >
                <span
                  className={cn(
                    "relative z-10 flex size-12 items-center justify-center rounded-full border text-sm font-bold shadow-[0_2px_8px_rgba(88,64,38,0.08)]",
                    status === "completed" &&
                      "border-success/25 bg-success text-white",
                    status === "current" &&
                      "border-brand bg-brand text-white",
                    status === "available" &&
                      "border-brand/25 bg-white text-brand-dark",
                    locked && "border-line bg-white text-ink-faint",
                  )}
                >
                  {status === "available" ? (
                    lesson.level
                  ) : (
                    <Icon className="size-5" strokeWidth={2} aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                    Level {lesson.level}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-ink">
                    {lesson.title}
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-brand-dark">
                    {STATE_LABELS[status]}
                  </p>
                </div>
              </div>
            );

            if (locked) {
              return (
                <div key={lesson.id} aria-disabled>
                  {node}
                </div>
              );
            }

            return (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {node}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
