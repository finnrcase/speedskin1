import { describe, expect, it } from "vitest";
import {
  emptyShortcutProgress,
  masteryStateFor,
  updateShortcutSkillProgress,
} from "./mastery";
import type { ShortcutAttempt } from "@/lib/data/types";

function attempt(correct: boolean, reactionMs = 1000): ShortcutAttempt {
  return {
    shortcutId: "copy",
    correct,
    reactionMs,
    expectedCombo: "Ctrl+C",
    actualCombo: correct ? "Ctrl+C" : "C",
    createdAt: "2026-06-30T00:00:00.000Z",
  };
}

describe("masteryStateFor", () => {
  it("moves through mastery states as accuracy and speed improve", () => {
    expect(
      masteryStateFor({
        correctAttempts: 1,
        incorrectAttempts: 1,
        averageReactionMs: 2200,
      }),
    ).toBe("Learning");
    expect(
      masteryStateFor({
        correctAttempts: 3,
        incorrectAttempts: 1,
        averageReactionMs: 1900,
      }),
    ).toBe("Practicing");
    expect(
      masteryStateFor({
        correctAttempts: 5,
        incorrectAttempts: 1,
        averageReactionMs: 1500,
      }),
    ).toBe("Comfortable");
    expect(
      masteryStateFor({
        correctAttempts: 9,
        incorrectAttempts: 0,
        averageReactionMs: 1100,
      }),
    ).toBe("Mastered");
  });
});

describe("updateShortcutSkillProgress", () => {
  it("records correct and incorrect attempts with an average reaction time", () => {
    const start = emptyShortcutProgress("copy");
    const afterMiss = updateShortcutSkillProgress(start, attempt(false, 1800));
    const afterCorrect = updateShortcutSkillProgress(afterMiss, attempt(true, 1000));

    expect(afterCorrect.correctAttempts).toBe(1);
    expect(afterCorrect.incorrectAttempts).toBe(1);
    expect(afterCorrect.averageReactionMs).toBe(1400);
  });
});
