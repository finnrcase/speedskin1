import { describe, expect, it } from "vitest";
import { normalizeLocalProgress } from "./local-progress";

const completedLesson = {
  lessonId: "l1-home-row-letters",
  status: "completed",
  bestWpm: 24,
  bestAccuracy: 96,
  stars: 3,
  track: "basics",
  completedSessions: 2,
  minutesPracticed: 7,
};

describe("local progress compatibility", () => {
  it("keeps pre-Academy progress when academyAttempts is missing", () => {
    const normalized = normalizeLocalProgress({
      lessonProgress: { [completedLesson.lessonId]: completedLesson },
      shortcutLessonProgress: {},
      shortcutSkillProgress: [],
    });

    expect(normalized.lessonProgress[completedLesson.lessonId]).toMatchObject(
      completedLesson,
    );
    expect(normalized.academyAttempts).toEqual([]);
  });

  it("migrates older array-shaped progress collections", () => {
    const normalized = normalizeLocalProgress({
      lessonProgress: [completedLesson],
      shortcutLessonProgress: [
        {
          lessonId: "shortcut-l1-copy",
          status: "completed",
          bestAccuracy: 90,
          averageReactionMs: 1200,
          completedSessions: 1,
        },
      ],
    });

    expect(normalized.lessonProgress[completedLesson.lessonId]?.status).toBe(
      "completed",
    );
    expect(
      normalized.shortcutLessonProgress["shortcut-l1-copy"]?.status,
    ).toBe("completed");
  });

  it("drops only invalid records and safely fills partial attempt fields", () => {
    const normalized = normalizeLocalProgress({
      lessonProgress: {
        valid: completedLesson,
        removed: { ...completedLesson, lessonId: "removed-lesson" },
      },
      shortcutSkillProgress: [null, { shortcutId: "not-real" }],
      academyAttempts: [
        null,
        { id: "removed", lessonId: "removed-lesson" },
        { id: "partial", lessonId: "l1-home-row-letters", xpEarned: 12 },
      ],
    });

    expect(Object.keys(normalized.lessonProgress)).toEqual([
      "l1-home-row-letters",
    ]);
    expect(normalized.academyAttempts).toHaveLength(1);
    expect(normalized.academyAttempts[0]).toMatchObject({
      id: "partial",
      academy: "keyboard",
      xpEarned: 12,
      quizAnswers: [],
      typingResult: { wpm: 0, accuracy: 0 },
    });
  });

  it("returns a safe empty state for malformed roots and fields", () => {
    expect(normalizeLocalProgress(null)).toEqual({
      lessonProgress: {},
      shortcutLessonProgress: {},
      shortcutSkillProgress: [],
      academyAttempts: [],
    });
    expect(normalizeLocalProgress({ academyAttempts: {} }).academyAttempts).toEqual(
      [],
    );
  });
});
