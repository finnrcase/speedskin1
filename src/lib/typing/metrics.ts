/*
  Pure typing-metric helpers. No React, no DOM — easy to unit test and reuse for
  any prompt content (English text now, Python code in STEP 2).
*/

/** Standard WPM uses a 5-character "word". */
const CHARS_PER_WORD = 5;

/**
 * Net words-per-minute from the number of correctly typed characters and the
 * elapsed time. Returns 0 until at least a little time has passed to avoid the
 * value spiking to infinity on the first keystroke.
 */
export function computeWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs < 500 || correctChars <= 0) return 0;
  const minutes = elapsedMs / 1000 / 60;
  return Math.round(correctChars / CHARS_PER_WORD / minutes);
}

/**
 * Accuracy as a percentage of total keystrokes that were correct.
 * `correctChars` is the number advanced; `mistakes` is wrong keypresses.
 */
export function computeAccuracy(correctChars: number, mistakes: number): number {
  const total = correctChars + mistakes;
  if (total === 0) return 100;
  return Math.round((correctChars / total) * 100);
}

export type CharState = "correct" | "current" | "incorrect" | "pending";

/**
 * Per-character display state. In the blocking input model every character
 * before the cursor is correct (you can only advance by pressing the right key);
 * the current character flashes `incorrect` when the last keypress was wrong.
 */
export function buildCharStates(
  length: number,
  currentIndex: number,
  errorAtCurrent: boolean,
): CharState[] {
  const states: CharState[] = new Array(length);
  for (let i = 0; i < length; i += 1) {
    if (i < currentIndex) states[i] = "correct";
    else if (i === currentIndex)
      states[i] = errorAtCurrent ? "incorrect" : "current";
    else states[i] = "pending";
  }
  return states;
}
