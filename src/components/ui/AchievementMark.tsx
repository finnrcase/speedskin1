import {
  BadgeCheck,
  BookOpenCheck,
  Code2,
  Flame,
  Gauge,
  ListChecks,
  Lock,
  Medal,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  "first-lesson": BookOpenCheck,
  "five-lessons": ListChecks,
  "ten-lessons": Medal,
  "accuracy-90": Target,
  "accuracy-95": BadgeCheck,
  "wpm-20": Gauge,
  "wpm-30": Trophy,
  "streak-7": Flame,
  "python-beginner": Code2,
};

interface AchievementMarkProps {
  icon: string;
  earned?: boolean;
  status?: "earned" | "next" | "locked";
  className?: string;
}

export function AchievementMark({
  icon,
  earned = true,
  status,
  className,
}: AchievementMarkProps) {
  const state = status ?? (earned ? "earned" : "locked");
  const Icon = state === "locked" ? Lock : ACHIEVEMENT_ICONS[icon] ?? Trophy;

  return (
    <span
      className={cn(
        "relative flex size-12 items-center justify-center border shadow-[0_1px_2px_rgba(88,64,38,0.06)]",
        state === "earned" &&
          "rounded-[1.25rem] border-brand/20 bg-gradient-to-br from-brand-tint to-gold-tint text-brand-dark ring-4 ring-brand/5",
        state === "next" &&
          "rounded-[1.25rem] border-brand/35 bg-brand text-white shadow-[0_12px_26px_rgba(249,115,22,0.18)] ring-4 ring-brand/10",
        state === "locked" &&
          "rounded-full border-line bg-surface-muted text-ink-faint",
        className,
      )}
      aria-hidden
    >
      <Icon className="size-5" strokeWidth={1.8} />
    </span>
  );
}
