import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  tone?: "brand" | "success";
  label?: string;
}

export function ProgressBar({
  value,
  className,
  tone = "brand",
  label,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn(
        "h-3 w-full overflow-hidden rounded-full border border-white/70 bg-surface-muted shadow-inner",
        className,
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          tone === "brand"
            ? "bg-gradient-to-r from-brand to-gold"
            : "bg-gradient-to-r from-success to-brand",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
