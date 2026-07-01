"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildCharStates,
  computeAccuracy,
  computeWpm,
  type CharState,
} from "./metrics";

export type EngineStatus = "idle" | "running" | "complete";

export interface TypingEngineOptions {
  /** Optional time budget (seconds). When it elapses the run completes. */
  timeLimitSeconds?: number;
  /** Called once when the prompt is finished or the timer runs out. */
  onComplete?: (result: TypingResult) => void;
}

export interface TypingResult {
  wpm: number;
  accuracy: number;
  mistakes: number;
  elapsedMs: number;
  correctChars: number;
  totalChars: number;
}

export interface TypingEngine {
  target: string;
  status: EngineStatus;
  currentIndex: number;
  charStates: CharState[];
  expectedChar: string | null;
  errorAtCurrent: boolean;
  mistakes: number;
  correctChars: number;
  elapsedMs: number;
  /** Seconds remaining for timed runs, else null. */
  remainingSeconds: number | null;
  wpm: number;
  accuracy: number;
  progress: number;
  /** Feed a single typed character (physical or on-screen keyboard). */
  pressChar: (char: string) => void;
  /** Step back one correct character so a learner can review. */
  backspace: () => void;
  reset: () => void;
}

/**
 * Drives a single typing run over `target`. Content-agnostic so the same engine
 * powers letter drills, sentences, and (STEP 2) Python code lessons.
 *
 * Input model is "blocking": the cursor only advances when the correct key is
 * pressed; a wrong key is recorded as a mistake and flashes the current
 * character. This makes "stuck on the same character" (STEP 2 hint fade-in)
 * well defined.
 *
 * The hook assumes one run per mount — callers reset by remounting with a
 * `key={target}` rather than mutating `target` in place.
 */
export function useTypingEngine(
  target: string,
  options: TypingEngineOptions = {},
): TypingEngine {
  const { timeLimitSeconds, onComplete } = options;

  const [status, setStatus] = useState<EngineStatus>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [errorAtCurrent, setErrorAtCurrent] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);

  // Refs mirror state so the interval/timeout callbacks read fresh values
  // without needing to re-subscribe on every keystroke.
  const startedAtRef = useRef<number | null>(null);
  const currentIndexRef = useRef(0);
  const mistakesRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const finish = useCallback(
    (correctChars: number, finalMistakes: number, end: number) => {
      const start = startedAtRef.current ?? end;
      setStatus("complete");
      setEndedAt(end);
      setNow(end);
      onCompleteRef.current?.({
        wpm: computeWpm(correctChars, Math.max(1, end - start)),
        accuracy: computeAccuracy(correctChars, finalMistakes),
        mistakes: finalMistakes,
        elapsedMs: Math.max(0, end - start),
        correctChars,
        totalChars: target.length,
      });
    },
    [target.length],
  );

  const pressChar = useCallback(
    (char: string) => {
      if (status === "complete") return;
      if (char.length !== 1) return; // ignore control keys

      const ts = Date.now();
      if (status === "idle") {
        setStatus("running");
        setStartedAt(ts);
        setNow(ts);
        startedAtRef.current = ts;
      }

      if (char === target[currentIndexRef.current]) {
        const nextIndex = currentIndexRef.current + 1;
        currentIndexRef.current = nextIndex;
        setCurrentIndex(nextIndex);
        setErrorAtCurrent(false);
        if (nextIndex >= target.length) {
          finish(nextIndex, mistakesRef.current, ts);
        }
      } else {
        mistakesRef.current += 1;
        setMistakes(mistakesRef.current);
        setErrorAtCurrent(true);
      }
    },
    [status, target, finish],
  );

  const backspace = useCallback(() => {
    if (status !== "running") return;
    const nextIndex = Math.max(0, currentIndexRef.current - 1);
    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    setErrorAtCurrent(false);
  }, [status]);

  const reset = useCallback(() => {
    currentIndexRef.current = 0;
    mistakesRef.current = 0;
    startedAtRef.current = null;
    setStatus("idle");
    setCurrentIndex(0);
    setMistakes(0);
    setErrorAtCurrent(false);
    setStartedAt(null);
    setEndedAt(null);
    setNow(0);
  }, []);

  // Tick for live WPM/time and detect the time limit. setState happens inside
  // the interval callback (not the effect body), so it does not cascade.
  useEffect(() => {
    if (status !== "running") return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (timeLimitSeconds && startedAtRef.current !== null) {
        const limit = startedAtRef.current + timeLimitSeconds * 1000;
        if (t >= limit) {
          finish(currentIndexRef.current, mistakesRef.current, limit);
        }
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [status, timeLimitSeconds, finish]);

  const elapsedMs =
    startedAt === null ? 0 : Math.max(0, (endedAt ?? now) - startedAt);
  const correctChars = currentIndex;
  const wpm = computeWpm(correctChars, elapsedMs);
  const accuracy = computeAccuracy(correctChars, mistakes);
  const charStates = useMemo(
    () => buildCharStates(target.length, currentIndex, errorAtCurrent),
    [target.length, currentIndex, errorAtCurrent],
  );
  const remainingSeconds = timeLimitSeconds
    ? Math.max(0, Math.ceil(timeLimitSeconds - elapsedMs / 1000))
    : null;
  const progress = target.length === 0 ? 0 : (currentIndex / target.length) * 100;

  return {
    target,
    status,
    currentIndex,
    charStates,
    expectedChar: target[currentIndex] ?? null,
    errorAtCurrent,
    mistakes,
    correctChars,
    elapsedMs,
    remainingSeconds,
    wpm,
    accuracy,
    progress,
    pressChar,
    backspace,
    reset,
  };
}
