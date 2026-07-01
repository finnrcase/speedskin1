import type {
  ShortcutAttempt,
  ShortcutId,
  ShortcutMasteryState,
  ShortcutSkillProgress,
} from "@/lib/data/types";
import { SHORTCUTS } from "./catalog";

export function masteryStateFor({
  correctAttempts,
  incorrectAttempts,
  averageReactionMs,
}: {
  correctAttempts: number;
  incorrectAttempts: number;
  averageReactionMs: number | null;
}): ShortcutMasteryState {
  const attempts = correctAttempts + incorrectAttempts;
  const accuracy = attempts === 0 ? 0 : correctAttempts / attempts;
  const reaction = averageReactionMs ?? Number.POSITIVE_INFINITY;

  if (correctAttempts >= 8 && accuracy >= 0.9 && reaction <= 1300) {
    return "Mastered";
  }
  if (correctAttempts >= 5 && accuracy >= 0.8 && reaction <= 1800) {
    return "Comfortable";
  }
  if (correctAttempts >= 3 && accuracy >= 0.65) {
    return "Practicing";
  }
  return "Learning";
}

export function emptyShortcutProgress(
  shortcutId: ShortcutId,
): ShortcutSkillProgress {
  return {
    shortcutId,
    correctAttempts: 0,
    incorrectAttempts: 0,
    averageReactionMs: null,
    masteryState: "Learning",
  };
}

export function defaultShortcutSkillProgress(): ShortcutSkillProgress[] {
  return Object.keys(SHORTCUTS).map((id) =>
    emptyShortcutProgress(id as ShortcutId),
  );
}

export function updateShortcutSkillProgress(
  progress: ShortcutSkillProgress,
  attempt: ShortcutAttempt,
): ShortcutSkillProgress {
  const previousAttempts =
    progress.correctAttempts + progress.incorrectAttempts;
  const previousAverage = progress.averageReactionMs ?? attempt.reactionMs;
  const nextCorrect = progress.correctAttempts + (attempt.correct ? 1 : 0);
  const nextIncorrect = progress.incorrectAttempts + (attempt.correct ? 0 : 1);
  const nextAverage = Math.round(
    (previousAverage * previousAttempts + attempt.reactionMs) /
      (previousAttempts + 1),
  );

  return {
    shortcutId: progress.shortcutId,
    correctAttempts: nextCorrect,
    incorrectAttempts: nextIncorrect,
    averageReactionMs: nextAverage,
    masteryState: masteryStateFor({
      correctAttempts: nextCorrect,
      incorrectAttempts: nextIncorrect,
      averageReactionMs: nextAverage,
    }),
  };
}

export function shortcutAccuracy(progress: ShortcutSkillProgress): number {
  const attempts = progress.correctAttempts + progress.incorrectAttempts;
  if (attempts === 0) return 0;
  return Math.round((progress.correctAttempts / attempts) * 100);
}

export function shortcutMasteryPercentage(
  progress: ShortcutSkillProgress[],
): number {
  if (progress.length === 0) return 0;
  const ready = progress.filter(
    (p) => p.masteryState === "Comfortable" || p.masteryState === "Mastered",
  ).length;
  return Math.round((ready / progress.length) * 100);
}
