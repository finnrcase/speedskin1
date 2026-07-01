"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClasses } from "@/components/ui/Button";
import { useDevice } from "@/lib/device/DeviceProvider";
import { cn } from "@/lib/utils";
import {
  SHORTCUT_PLATFORM_META,
  shortcutComboLabel,
  shortcutPlatformForDevice,
} from "@/lib/shortcuts/catalog";
import { createShortcutSession } from "@/lib/shortcuts/session";
import {
  defaultShortcutSkillProgress,
  shortcutAccuracy,
  shortcutMasteryPercentage,
  updateShortcutSkillProgress,
} from "@/lib/shortcuts/mastery";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";
import type {
  ShortcutAttempt,
  ShortcutDefinition,
  ShortcutId,
  ShortcutLesson,
  ShortcutSkillProgress,
  ShortcutTask,
} from "@/lib/data/types";

const MODIFIER_KEYS = new Set(["Control", "Meta", "Shift", "Alt"]);

interface ShortcutTrainerProps {
  lesson: ShortcutLesson;
  shortcuts: ShortcutDefinition[];
  initialTasks: ShortcutTask[];
  initialProgress: ShortcutSkillProgress[];
  nextHref?: string;
}

type Feedback =
  | { kind: "correct"; message: string }
  | { kind: "incorrect"; message: string }
  | null;

function progressMap(progress: ShortcutSkillProgress[]) {
  return new Map(progress.map((p) => [p.shortcutId, p]));
}

function mergeProgress(
  base: ShortcutSkillProgress[],
  stored: ShortcutSkillProgress[],
): ShortcutSkillProgress[] {
  const storedMap = progressMap(stored);
  return base.map((item) => storedMap.get(item.shortcutId) ?? item);
}

function actualComboForEvent(e: React.KeyboardEvent<HTMLElement>): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.metaKey) parts.push("Cmd");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (!MODIFIER_KEYS.has(e.key)) {
    parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
  }
  return parts.length ? parts.join("+") : e.key;
}

function averageReaction(attempts: ShortcutAttempt[]): number {
  if (attempts.length === 0) return 0;
  return Math.round(
    attempts.reduce((sum, attempt) => sum + attempt.reactionMs, 0) /
      attempts.length,
  );
}

function hintStrength(progress: ShortcutSkillProgress | undefined) {
  const correct = progress?.correctAttempts ?? 0;
  if (correct >= 6) return "subtle";
  if (correct >= 3) return "medium";
  return "strong";
}

function KeyCap({
  label,
  strength,
}: {
  label: string;
  strength: "strong" | "medium" | "subtle";
}) {
  return (
    <span
      className={cn(
        "flex h-14 min-w-16 items-center justify-center rounded-xl border px-4 text-lg font-bold shadow-[0_10px_24px_rgba(88,64,38,0.08)] transition-opacity sm:h-16 sm:min-w-20 sm:text-xl",
        strength === "strong" &&
          "border-brand bg-brand text-white ring-4 ring-brand/15",
        strength === "medium" &&
          "border-brand/30 bg-brand-tint text-brand-dark ring-2 ring-brand/10",
        strength === "subtle" &&
          "border-line bg-white/70 text-ink-soft opacity-55",
      )}
    >
      {label}
    </span>
  );
}

function ShortcutKeys({
  modifier,
  targetKey,
  strength,
}: {
  modifier: string;
  targetKey: string;
  strength: "strong" | "medium" | "subtle";
}) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label={`${modifier}+${targetKey}`}>
      <KeyCap label={modifier} strength={strength} />
      <span className="text-2xl font-bold text-ink-faint">+</span>
      <KeyCap label={targetKey} strength={strength} />
    </div>
  );
}

export function ShortcutTrainer({
  lesson,
  shortcuts,
  initialTasks,
  initialProgress,
  nextHref,
}: ShortcutTrainerProps) {
  const { device } = useDevice();
  const {
    recordShortcutAttempt,
    recordShortcutLessonResult,
    shortcutSkillProgress: accountShortcutProgress,
  } = useUserProgress();
  const platform = shortcutPlatformForDevice(device);
  const modifier = SHORTCUT_PLATFORM_META[platform].modifier;
  const surfaceRef = useRef<HTMLDivElement>(null);
  const taskStartedAtRef = useRef<number | null>(null);
  const completionRecordedRef = useRef(false);

  const allSeedProgress = useMemo(
    () =>
      mergeProgress(
        defaultShortcutSkillProgress(),
        accountShortcutProgress.length
          ? accountShortcutProgress
          : initialProgress,
      ),
    [accountShortcutProgress, initialProgress],
  );
  const [sequence, setSequence] = useState(initialTasks);
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<ShortcutAttempt[]>([]);
  const [skillProgress, setSkillProgress] = useState(allSeedProgress);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [focused, setFocused] = useState(false);

  const shortcutById = useMemo(
    () => new Map(shortcuts.map((shortcut) => [shortcut.id, shortcut])),
    [shortcuts],
  );
  const currentTask = sequence[index] ?? null;
  const currentShortcut = currentTask
    ? shortcutById.get(currentTask.shortcutId)
    : null;
  const currentSkillProgress = currentTask
    ? skillProgress.find((p) => p.shortcutId === currentTask.shortcutId)
    : undefined;
  const complete = index >= sequence.length;
  const correctAttempts = attempts.filter((a) => a.correct).length;
  const accuracy =
    attempts.length === 0
      ? 100
      : Math.round((correctAttempts / attempts.length) * 100);
  const progressValue =
    sequence.length === 0 ? 0 : Math.min(100, (index / sequence.length) * 100);
  const averageMs = averageReaction(attempts);
  const masteryPct = shortcutMasteryPercentage(skillProgress);

  useEffect(() => {
    surfaceRef.current?.focus();
  }, [sequence]);

  const restart = () => {
    setSequence(createShortcutSession(lesson));
    setIndex(0);
    setAttempts([]);
    setFeedback(null);
    completionRecordedRef.current = false;
    taskStartedAtRef.current = null;
    window.requestAnimationFrame(() => surfaceRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!currentTask || !currentShortcut || complete) return;
    if (MODIFIER_KEYS.has(e.key)) return;

    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length === 1) {
      e.preventDefault();
    }

    const normalizedKey = e.key.toLowerCase();
    const correctModifier =
      platform === "mac" ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
    const correct =
      correctModifier &&
      !e.altKey &&
      !e.shiftKey &&
      normalizedKey === currentShortcut.key;
    const startedAt = taskStartedAtRef.current ?? e.timeStamp;
    const reactionMs = Math.max(120, Math.round(e.timeStamp - startedAt));
    const expectedCombo = shortcutComboLabel(currentShortcut, platform);
    const actualCombo = actualComboForEvent(e);
    const attempt: ShortcutAttempt = {
      shortcutId: currentTask.shortcutId,
      correct,
      reactionMs,
      expectedCombo,
      actualCombo,
      createdAt: `event-${Math.round(e.timeStamp)}`,
    };

    setAttempts((items) => [...items, attempt]);
    const nextSkillProgress = skillProgress.map((item) =>
      item.shortcutId === attempt.shortcutId
        ? updateShortcutSkillProgress(item, attempt)
        : item,
    );
    const updatedSkillProgress = nextSkillProgress.find(
      (item) => item.shortcutId === attempt.shortcutId,
    );
    setSkillProgress(nextSkillProgress);
    if (updatedSkillProgress) {
      recordShortcutAttempt(lesson.id, attempt, updatedSkillProgress);
    }

    if (!correct) {
      setFeedback({
        kind: "incorrect",
        message: `${actualCombo} missed. Try ${expectedCombo}.`,
      });
      taskStartedAtRef.current = e.timeStamp;
      return;
    }

    setFeedback({
      kind: "correct",
      message: `${expectedCombo} landed.`,
    });
    setIndex((value) => value + 1);
    taskStartedAtRef.current = e.timeStamp;
  };

  useEffect(() => {
    if (!complete || sequence.length === 0) return;
    if (completionRecordedRef.current) return;
    completionRecordedRef.current = true;
    recordShortcutLessonResult(lesson, {
      accuracy,
      averageReactionMs: averageMs || null,
    });
  }, [
    accuracy,
    averageMs,
    complete,
    lesson,
    recordShortcutLessonResult,
    sequence.length,
  ]);

  const prevent = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div className="space-y-5">
      <ProgressBar value={progressValue} label="Shortcut mission progress" />

      <div className="flex items-center justify-between rounded-button border border-line bg-white px-4 py-3 text-sm font-semibold text-ink-soft">
        <span>{correctAttempts}/{sequence.length} correct</span>
        <span>{accuracy}% accuracy</span>
        <span>{masteryPct}% mastery</span>
      </div>

      <Card className="min-h-80 border-brand/10 bg-cream">
        {complete ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-ink">
                Great work
              </h2>
              <p className="text-sm text-ink-soft">
                {accuracy}% accuracy · {averageMs ? `${(averageMs / 1000).toFixed(1)}s` : "0s"}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <button
                type="button"
                onClick={restart}
                className={buttonClasses("secondary", "md")}
              >
                <RotateCcw className="size-4" strokeWidth={1.8} aria-hidden />
                New mix
              </button>
              {nextHref && (
                <Link href={nextHref} className={buttonClasses("primary", "md")}>
                  Next level
                  <ArrowRight className="size-4" strokeWidth={1.8} aria-hidden />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div
            ref={surfaceRef}
            tabIndex={0}
            role="group"
            aria-label="Keyboard shortcut practice area"
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              setFocused(true);
              taskStartedAtRef.current ??= e.timeStamp;
            }}
            onBlur={() => setFocused(false)}
            onClick={() => surfaceRef.current?.focus()}
            onPaste={prevent}
            onCopy={prevent}
            onCut={prevent}
            onContextMenu={prevent}
            className="relative rounded-xl bg-white/68 p-4 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:p-6"
          >
            {!focused && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-surface/88 text-center text-sm font-semibold text-ink-soft backdrop-blur-sm">
                Click here, then press the shortcut
              </div>
            )}

            {currentTask && currentShortcut && (
              <div className="space-y-6 text-center">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-brand">
                    {index + 1} of {sequence.length}
                  </p>
                  <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    {currentTask.prompt}
                  </h2>
                </div>

                <ShortcutKeys
                  modifier={modifier}
                  targetKey={currentShortcut.key.toUpperCase()}
                  strength={hintStrength(currentSkillProgress)}
                />

                {feedback && (
                  <div
                    className={cn(
                      "mx-auto inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
                      feedback.kind === "correct"
                        ? "bg-success-light text-success"
                        : "bg-danger-light text-danger",
                    )}
                    aria-live="polite"
                  >
                    {feedback.kind === "correct" ? (
                      <CheckCircle2
                        className="size-4"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    ) : (
                      <XCircle
                        className="size-4"
                        strokeWidth={1.8}
                        aria-hidden
                      />
                    )}
                    {feedback.message}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
            This level
          </h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {lesson.shortcutIds.map((shortcutId) => {
            const shortcut = shortcutById.get(shortcutId as ShortcutId);
            const item = skillProgress.find((p) => p.shortcutId === shortcutId);
            if (!shortcut || !item) return null;
            return (
              <div
                key={shortcutId}
                className="rounded-button border border-line bg-cream px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink">{shortcut.label}</span>
                  <span className="text-xs font-semibold text-ink-faint">
                    {item.masteryState}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-ink-faint">
                  <span>{item.correctAttempts} correct</span>
                  <span>{item.incorrectAttempts} missed</span>
                  <span>{shortcutAccuracy(item)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
