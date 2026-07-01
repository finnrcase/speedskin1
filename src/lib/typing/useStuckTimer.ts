"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the learner has been stuck on the same position for longer
 * than `delayMs` — used to fade in the correct key as a hint.
 *
 * `positionKey` is the current character index. When it changes (the learner
 * pressed the correct key) the timer restarts and the hint hides again. Pressing
 * wrong keys does not change the index, so the timer keeps running — matching
 * "stuck on the same character for more than 4 seconds".
 *
 * setState only happens inside the timeout callback (not the effect body), and
 * the revealed value is keyed to a position so the result is derived purely
 * during render, avoiding cascading renders.
 */
export function useStuckTimer(
  positionKey: number,
  enabled: boolean,
  delayMs = 4000,
): boolean {
  const [revealedPosition, setRevealedPosition] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setTimeout(
      () => setRevealedPosition(positionKey),
      delayMs,
    );
    return () => window.clearTimeout(id);
  }, [positionKey, enabled, delayMs]);

  return enabled && revealedPosition === positionKey;
}
