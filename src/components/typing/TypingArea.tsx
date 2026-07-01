"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useDevice } from "@/lib/device/DeviceProvider";
import {
  useTypingEngine,
  type TypingResult,
} from "@/lib/typing/useTypingEngine";
import { useStuckTimer } from "@/lib/typing/useStuckTimer";
import { OnScreenKeyboard } from "@/components/keyboard/OnScreenKeyboard";
import { StuckKeyHint } from "@/components/keyboard/StuckKeyHint";
import { Prompt } from "./Prompt";
import { ResultsSummary } from "./ResultsSummary";
import type { Lesson } from "@/lib/data/types";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

interface TypingAreaProps {
  lesson?: Lesson;
  target: string;
  timeLimitSeconds?: number;
  nextHref?: string;
  /**
   * Called when the learner taps "Try again". Lesson screens pass a regenerate
   * function here so each attempt gets a fresh random prompt. When omitted the
   * same prompt is reset in place.
   */
  onRetry?: () => void;
}

/**
 * Wrapper that remounts the run whenever the prompt changes, so all run state
 * (engine + result + focus) resets cleanly without effect-driven setState.
 */
export function TypingArea(props: TypingAreaProps) {
  return <TypingRun key={props.target} {...props} />;
}

function TypingRun({
  lesson,
  target,
  timeLimitSeconds,
  nextHref,
  onRetry,
}: TypingAreaProps) {
  const { info } = useDevice();
  const { recordLessonResult } = useUserProgress();
  const [result, setResult] = useState<TypingResult | null>(null);
  const [focused, setFocused] = useState(false);
  const surfaceRef = useRef<HTMLDivElement>(null);

  const handleComplete = useCallback(
    (r: TypingResult) => {
      setResult(r);
      if (lesson) recordLessonResult(lesson, r);
    },
    [lesson, recordLessonResult],
  );

  const engine = useTypingEngine(target, {
    timeLimitSeconds,
    onComplete: handleComplete,
  });

  const isComplete = engine.status === "complete";
  const promptSize = info.keyboardSize === "compact" ? "compact" : "large";

  // Fade in the correct key after 4s stuck on the same character.
  const reveal = useStuckTimer(engine.currentIndex, !isComplete);

  // Autofocus the typing surface for physical-keyboard devices.
  useEffect(() => {
    if (!info.showsOnScreenKeyboard) {
      surfaceRef.current?.focus();
    }
  }, [info.showsOnScreenKeyboard]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return; // ignore shortcuts (incl. paste)
    if (e.key === "Backspace") {
      e.preventDefault();
      engine.backspace();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      engine.pressChar("\n");
      return;
    }
    if (e.key.length === 1) {
      e.preventDefault();
      engine.pressChar(e.key);
    }
  };

  const prevent = (e: React.SyntheticEvent) => e.preventDefault();

  const handleRetry = () => {
    if (onRetry) {
      onRetry(); // parent regenerates the prompt -> remounts this run
      return;
    }
    engine.reset();
    setResult(null);
    if (!info.showsOnScreenKeyboard) surfaceRef.current?.focus();
  };

  return (
    <div className="space-y-5">
      <ProgressBar value={engine.progress} label="Lesson progress" />

      <Card className="min-h-44 border-brand/10 bg-cream">
        {isComplete && result ? (
          <ResultsSummary result={result} onRetry={handleRetry} nextHref={nextHref} />
        ) : (
          <div
            ref={surfaceRef}
            tabIndex={0}
            role="textbox"
            aria-label="Typing area"
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onClick={() => surfaceRef.current?.focus()}
            onPaste={prevent}
            onCopy={prevent}
            onCut={prevent}
            onContextMenu={prevent}
            className="relative cursor-text rounded-xl bg-white/60 p-2 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:p-3"
          >
            <Prompt
              target={target}
              charStates={engine.charStates}
              size={promptSize}
            />

            {/* Click-to-focus overlay for physical-keyboard devices. */}
            {!info.showsOnScreenKeyboard && !focused && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/85 text-center text-sm font-semibold text-ink-soft backdrop-blur-sm">
                Click here, then start typing
              </div>
            )}
          </div>
        )}
      </Card>

      {!isComplete &&
        (info.showsOnScreenKeyboard ? (
          <div className="space-y-2">
            <OnScreenKeyboard
              expectedChar={engine.expectedChar}
              onKey={engine.pressChar}
              onBackspace={engine.backspace}
              size={info.keyboardSize === "compact" ? "compact" : "large"}
              blank
              reveal={reveal}
              disabled={isComplete}
            />
            <p className="text-center text-xs text-ink-faint">Type the sentence.</p>
          </div>
        ) : (
          <StuckKeyHint expectedChar={engine.expectedChar} reveal={reveal} />
        ))}
    </div>
  );
}
