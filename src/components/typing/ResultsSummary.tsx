import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { formatDuration } from "@/lib/utils";
import type { TypingResult } from "@/lib/typing/useTypingEngine";

interface ResultsSummaryProps {
  result: TypingResult;
  onRetry: () => void;
  nextHref?: string;
}

function starCount(accuracy: number): number {
  if (accuracy >= 95) return 3;
  if (accuracy >= 85) return 2;
  return 1;
}

export function ResultsSummary({ result, onRetry, nextHref }: ResultsSummaryProps) {
  const stars = starCount(result.accuracy);

  return (
    <div className="warm-panel -m-2 space-y-6 rounded-card border border-brand/15 p-5 text-center sm:m-0">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Lesson complete
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-ink">
          Strong finish
        </h2>
        <div className="mt-3 flex justify-center">
          <Stars count={stars} className="[&_svg]:size-5" />
        </div>
      </div>

      <div className="mx-auto grid max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
        <Result label="WPM" value={String(result.wpm)} />
        <Result label="Accuracy" value={`${result.accuracy}%`} />
        <Result label="Mistakes" value={String(result.mistakes)} />
        <Result label="Time" value={formatDuration(result.elapsedMs / 1000)} />
      </div>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="outline" size="lg" onClick={onRetry}>
          <RotateCcw className="size-4" strokeWidth={1.8} aria-hidden />
          Try again
        </Button>
        {nextHref && (
          <Link href={nextHref} className={buttonClasses("primary", "lg")}>
            Next lesson
            <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-white/85 px-3 py-4 shadow-[0_1px_2px_rgba(88,64,38,0.05)]">
      <div className="text-2xl font-bold tracking-tight text-ink tabular-nums">
        {value}
      </div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </div>
    </div>
  );
}
