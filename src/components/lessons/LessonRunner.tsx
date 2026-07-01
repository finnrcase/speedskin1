"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { TypingArea } from "@/components/typing/TypingArea";
import { generatePrompt } from "@/lib/typing/prompt-generator";
import type {
  Lesson,
  LessonCategory,
  PromptTopic,
  PromptType,
} from "@/lib/data/types";

interface LessonRunnerProps {
  category: LessonCategory;
  lesson?: Lesson;
  promptType: PromptType;
  topic?: PromptTopic;
  /** Server-generated first prompt (keeps SSR and first client render in sync). */
  initialPrompt: string;
  timeLimitSeconds?: number;
  nextHref?: string;
}

/**
 * Owns the random prompt for a lesson. The server seeds the first prompt; every
 * retry / shuffle generates a fresh one on the client. The attempt counter keys
 * the run so it remounts even when a new prompt happens to match the old text.
 */
export function LessonRunner({
  category,
  lesson,
  promptType,
  topic,
  initialPrompt,
  timeLimitSeconds,
  nextHref,
}: LessonRunnerProps) {
  const [run, setRun] = useState({ prompt: initialPrompt, attempt: 0 });

  const regenerate = () =>
    setRun((r) => ({
      prompt: generatePrompt({ category, promptType, topic }),
      attempt: r.attempt + 1,
    }));

  return (
    <div className="space-y-4">
      <TypingArea
        key={run.attempt}
        lesson={lesson}
        target={run.prompt}
        timeLimitSeconds={timeLimitSeconds}
        nextHref={nextHref}
        onRetry={regenerate}
      />
      <div className="flex justify-center">
        <button
          type="button"
          onClick={regenerate}
          className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand-tint px-4 py-2 text-sm font-semibold text-brand hover:-translate-y-0.5 hover:bg-brand-light/40 no-select"
        >
          <RotateCcw className="size-4" strokeWidth={1.8} aria-hidden />
          New prompt
        </button>
      </div>
    </div>
  );
}
