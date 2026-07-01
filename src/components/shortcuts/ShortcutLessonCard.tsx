import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  Command,
  Crown,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import { SHORTCUTS } from "@/lib/shortcuts/catalog";
import type {
  ShortcutLesson,
  ShortcutProgress,
} from "@/lib/data/types";

interface ShortcutLessonCardProps {
  lesson: ShortcutLesson;
  progress?: ShortcutProgress;
}

function statusBadge(status: ShortcutProgress["status"] | undefined) {
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

export function ShortcutLessonCard({
  lesson,
  progress,
}: ShortcutLessonCardProps) {
  const locked = progress?.status === "locked";
  const progressValue =
    progress?.status === "completed"
      ? 100
      : progress?.status === "current"
        ? 62
        : progress?.status === "available"
          ? 28
          : 0;

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
          lesson.isBoss
            ? "bg-gradient-to-r from-info via-brand to-gold"
            : "bg-gradient-to-r from-brand via-gold to-brand-light",
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-gradient-to-br from-brand-tint to-gold-tint text-sm font-bold text-brand-dark shadow-[0_1px_2px_rgba(88,64,38,0.06)]">
          {lesson.isBoss ? (
            <Crown className="size-5" strokeWidth={1.8} aria-hidden />
          ) : (
            lesson.level
          )}
        </span>
        {statusBadge(progress?.status)}
      </div>

      <div className="flex-1">
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Badge tone={lesson.isBoss ? "info" : "brand"} icon={Command}>
            {lesson.isBoss ? "Boss mix" : "Shortcut level"}
          </Badge>
          <Badge tone="neutral" icon={Clock3}>
            {lesson.estimatedMinutes} min
          </Badge>
        </div>
        <h3 className="text-lg font-bold tracking-tight text-ink">
          {lesson.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-soft">{lesson.focus}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {lesson.shortcutIds.slice(-4).map((shortcutId) => (
            <span
              key={shortcutId}
              className="rounded-button border border-line bg-cream px-2.5 py-1 text-xs font-semibold text-ink-soft"
            >
              {SHORTCUTS[shortcutId].label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-line pt-3">
        <ProgressBar
          value={progressValue}
          tone={progress?.status === "completed" ? "success" : "brand"}
          label={`${lesson.title} progress`}
        />
        <div className="flex items-center justify-between text-sm text-ink-faint">
          <span>{lesson.sessionLength} prompts</span>
          {progress?.averageReactionMs ? (
            <span className="font-semibold text-ink-soft">
              {(progress.averageReactionMs / 1000).toFixed(1)}s avg
            </span>
          ) : (
            <span>Build speed</span>
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
      href={`/shortcuts/${lesson.id}`}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      {inner}
    </Link>
  );
}
