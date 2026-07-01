import { cn } from "@/lib/utils";
import { Card } from "./Card";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  tone?: "brand" | "success" | "info" | "neutral";
  detail?: string;
  progress?: number;
  className?: string;
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  brand: "bg-brand-tint text-brand-dark ring-brand/10",
  success: "bg-success-light text-success ring-success/10",
  info: "bg-info-light text-info ring-info/10",
  neutral: "bg-surface-muted text-ink-soft ring-ink-faint/10",
};

export function StatCard({
  label,
  value,
  unit,
  icon,
  tone = "brand",
  detail,
  progress,
  className,
}: StatCardProps) {
  const Icon = icon;
  const clampedProgress =
    progress === undefined ? null : Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <Card
      className={cn(
        "group relative flex min-h-32 flex-col justify-between gap-5 overflow-hidden",
        "hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_30px_rgba(88,64,38,0.08)]",
        className,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand/70 via-gold/50 to-transparent opacity-70" />
      <div className="flex items-start justify-between gap-3">
        {Icon && (
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full ring-1",
              TONES[tone],
            )}
            aria-hidden
          >
            <Icon className="size-6" strokeWidth={1.9} />
          </span>
        )}
        <span className="mt-1 h-1.5 w-10 rounded-full bg-brand/10 transition-colors group-hover:bg-brand/25" />
      </div>
      <div className="min-w-0 space-y-1.5">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          {label}
        </div>
        <div className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {value}
          {unit && (
            <span className="ml-1 text-base font-semibold text-ink-faint">
              {unit}
            </span>
          )}
        </div>
        {detail && (
          <p className="text-xs font-semibold text-ink-soft">{detail}</p>
        )}
        {clampedProgress !== null && (
          <div className="pt-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand to-gold"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
