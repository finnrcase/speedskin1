import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type BadgeTone = "brand" | "success" | "info" | "neutral" | "danger";

const TONES: Record<BadgeTone, string> = {
  brand: "border-brand/25 bg-brand-tint text-brand-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
  success: "border-success/15 bg-success-light text-success",
  info: "border-line bg-info-light text-info",
  neutral: "border-line bg-cream text-ink-soft",
  danger: "border-danger/15 bg-danger-light text-danger",
};

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: LucideIcon;
  className?: string;
}

export function Badge({
  children,
  tone = "neutral",
  icon: Icon,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
        TONES[tone],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" strokeWidth={1.8} aria-hidden />}
      {children}
    </span>
  );
}
