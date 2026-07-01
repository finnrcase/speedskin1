"use client";

import { cn } from "@/lib/utils";
import {
  FINGER_LABEL,
  FINGER_TINT,
  findKeyForChar,
} from "@/lib/typing/keyboard-layout";

interface StuckKeyHintProps {
  /** Character the learner should type next. */
  expectedChar: string | null;
  /** Reveal the hint (driven by the 4-second stuck timer). */
  reveal: boolean;
}

function describeChar(char: string | null): string {
  if (char === null) return "";
  if (char === " ") return "space";
  return char;
}

/**
 * Chromebook hint. No keyboard is shown by default (the physical SpeedSkin cover
 * handles that). If the learner gets stuck for 4 seconds, the single correct key
 * fades in — never a full keyboard.
 */
export function StuckKeyHint({ expectedChar, reveal }: StuckKeyHintProps) {
  const match = expectedChar ? findKeyForChar(expectedChar) : null;
  const fingerName = match ? FINGER_LABEL[match.finger] : null;
  const tint = match ? FINGER_TINT[match.finger] : "bg-surface-muted text-ink-soft";

  return (
    <div className="mx-auto flex min-h-20 w-full max-w-md items-center justify-center rounded-card border border-line bg-surface p-4 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
      {reveal && expectedChar !== null ? (
        <div className="flex animate-fade-in items-center gap-4">
          <span
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-card text-2xl font-bold",
              tint,
            )}
            aria-hidden
          >
            {expectedChar === " " ? "␣" : describeChar(expectedChar)}
          </span>
          <p className="text-left text-sm text-ink-soft">
            Press{" "}
            <span className="font-bold text-ink">
              “{describeChar(expectedChar)}”
            </span>
            {fingerName && (
              <>
                {" "}
                with your{" "}
                <span className="font-bold text-ink">{fingerName}</span>
              </>
            )}
            .
          </p>
        </div>
      ) : (
        <p className="text-sm font-medium text-ink-faint">
          Use your SpeedSkin keyboard cover — a hint appears if you get stuck.
        </p>
      )}
    </div>
  );
}
