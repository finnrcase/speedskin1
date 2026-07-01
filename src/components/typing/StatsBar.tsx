import { cn } from "@/lib/utils";
import { formatDuration } from "@/lib/utils";

interface StatsBarProps {
  wpm: number;
  accuracy: number;
  mistakes: number;
  elapsedMs: number;
  remainingSeconds: number | null;
  className?: string;
}

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "brand" | "danger";
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={cn(
          "text-2xl font-bold tracking-tight tabular-nums sm:text-3xl",
          tone === "brand" && "text-brand",
          tone === "danger" && "text-danger",
          tone === "neutral" && "text-ink",
        )}
      >
        {value}
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </span>
    </div>
  );
}

export function StatsBar({
  wpm,
  accuracy,
  mistakes,
  elapsedMs,
  remainingSeconds,
  className,
}: StatsBarProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-4 gap-2 rounded-card border border-line bg-surface/90 px-3 py-4 shadow-[0_6px_18px_rgba(88,64,38,0.06)]",
        className,
      )}
    >
      <Stat label="WPM" value={String(wpm)} tone="brand" />
      <Stat label="Accuracy" value={`${accuracy}%`} />
      <Stat
        label="Mistakes"
        value={String(mistakes)}
        tone={mistakes > 0 ? "danger" : "neutral"}
      />
      {remainingSeconds === null ? (
        <Stat label="Time" value={formatDuration(elapsedMs / 1000)} />
      ) : (
        <Stat label="Time left" value={formatDuration(remainingSeconds)} />
      )}
    </div>
  );
}
