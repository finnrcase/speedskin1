import { describe, expect, it } from "vitest";
import type { CurriculumLesson, LessonAttempt } from "@/lib/data/types";
import { ACADEMY_IDS } from "./academies";
import { CURRICULUM_LEVELS, GRADE_BANDS, TYPING_LEVELS } from "./levels";
import { CURRICULUM_LESSONS } from "./lessons";
import {
  evaluateLessonMastery,
  getAcademyMasteryProgress,
  isTypingSkillMastered,
} from "./mastery";
import {
  ACADEMY_CURRICULUM_PLANS,
  PLANNED_CORE_LESSON_TOTAL,
} from "./plans";
import { getCurriculumCoverage } from "./report";
import { validateAcademyPlans, validateCurriculum } from "./validate";

function cloneLessons(): CurriculumLesson[] {
  return structuredClone(CURRICULUM_LESSONS) as CurriculumLesson[];
}

function attempt(
  lesson: CurriculumLesson,
  accuracy: number,
  quizPercentage: number,
  id = "attempt-1",
): LessonAttempt {
  return {
    id,
    lessonId: lesson.id,
    academy: lesson.academy,
    startedAt: "2026-09-26T10:00:00.000Z",
    completedAt: "2026-09-26T10:05:00.000Z",
    thinkResponse: "A useful original response.",
    quizAnswers: [],
    quizScore: {
      correctAnswers: quizPercentage >= 67 ? 2 : 1,
      totalQuestions: 3,
      percentage: quizPercentage,
    },
    typingResult: {
      wpm: 1,
      accuracy,
      mistakes: 0,
      elapsedMs: 1000,
      correctChars: 20,
      totalChars: 20,
    },
    xpEarned: 40,
  };
}

describe("curriculum production system", () => {
  it("defines ordered, unique curriculum, typing, and grade-band systems", () => {
    expect(CURRICULUM_LEVELS).toHaveLength(5);
    expect(TYPING_LEVELS).toHaveLength(8);
    expect(GRADE_BANDS.map((band) => band.id)).toEqual(["3-5", "6-8", "9-12", "any"]);
    expect(CURRICULUM_LEVELS.map((level) => level.level)).toEqual([1, 2, 3, 4, 5]);
    expect(TYPING_LEVELS.map((level) => level.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(TYPING_LEVELS.map((level) => level.id)).size).toBe(8);
    expect(TYPING_LEVELS[0].wpmRole.toLowerCase()).toContain("not gate");
  });

  it("defines one valid plan for every Academy and exactly 135 core slots", () => {
    const result = validateAcademyPlans();
    expect(result.errors).toEqual([]);
    expect(ACADEMY_CURRICULUM_PLANS.map((plan) => plan.academyId)).toEqual(ACADEMY_IDS);
    expect(PLANNED_CORE_LESSON_TOTAL).toBe(135);
    expect(ACADEMY_CURRICULUM_PLANS.map((plan) => plan.suggestedCoreLessonCount)).toEqual([
      30, 15, 15, 15, 15, 15, 15, 15,
    ]);
  });

  it("keeps unit IDs and roadmap positions unique and ordered", () => {
    const units = ACADEMY_CURRICULUM_PLANS.flatMap((plan) => plan.units);
    expect(new Set(units.map((unit) => unit.id)).size).toBe(units.length);
    for (const plan of ACADEMY_CURRICULUM_PLANS) {
      const slots = plan.units.flatMap((unit) => unit.topicSequence);
      expect(slots).toHaveLength(plan.suggestedCoreLessonCount);
      expect(new Set(slots).size).toBe(slots.length);
      expect(slots.every((slot) => slot.trim().length > 0)).toBe(true);
    }
  });

  it("validates every current seed lesson", () => {
    const result = validateCurriculum(CURRICULUM_LESSONS);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it("reports duplicate IDs and Academy sequence positions with useful paths", () => {
    const lessons = cloneLessons();
    lessons[1].id = lessons[0].id;
    lessons[1].sequence = lessons[0].sequence;
    const result = validateCurriculum(lessons);
    expect(result.errors.map((item) => item.code)).toEqual(
      expect.arrayContaining(["duplicate-lesson-id", "duplicate-sequence"]),
    );
    expect(result.errors.every((item) => item.path.length > 0)).toBe(true);
  });

  it("detects invalid metadata and incomplete or malformed quiz banks", () => {
    const lessons = cloneLessons();
    lessons[0].gradeBand = "unknown" as CurriculumLesson["gradeBand"];
    lessons[0].quizBank = lessons[0].quizBank.slice(0, 4);
    lessons[1].quizBank[0].correctChoiceId = "missing";
    const codes = validateCurriculum(lessons).errors.map((item) => item.code);
    expect(codes).toEqual(
      expect.arrayContaining([
        "invalid-grade-band",
        "incomplete-quiz-bank",
        "invalid-correct-choice",
      ]),
    );
  });

  it("distinguishes completion from mastery without using WPM", () => {
    const lesson = CURRICULUM_LESSONS[0];
    const incomplete = evaluateLessonMastery(lesson, []);
    const completedOnly = evaluateLessonMastery(lesson, [attempt(lesson, 89, 100)]);
    const masteredAtOneWpm = evaluateLessonMastery(lesson, [attempt(lesson, 90, 67)]);
    expect(incomplete).toMatchObject({ complete: false, mastered: false });
    expect(completedOnly).toMatchObject({ complete: true, mastered: false });
    expect(masteredAtOneWpm).toMatchObject({ complete: true, mastered: true });
  });

  it("requires typing evidence across distinct lessons for skill mastery", () => {
    const [first, second] = CURRICULUM_LESSONS.filter(
      (lesson) => lesson.typingLevel === "beginner",
    );
    const firstAttempt = attempt(first, 95, 0, "attempt-first");
    const secondAttempt = attempt(second, 95, 0, "attempt-second");
    expect(
      isTypingSkillMastered({
        typingLevel: "beginner",
        lessons: CURRICULUM_LESSONS,
        attempts: [firstAttempt],
      }),
    ).toBe(false);
    expect(
      isTypingSkillMastered({
        typingLevel: "beginner",
        lessons: CURRICULUM_LESSONS,
        attempts: [firstAttempt, secondAttempt],
      }),
    ).toBe(true);
  });

  it("calculates Academy completion and mastery separately", () => {
    const keyboard = CURRICULUM_LESSONS.filter((lesson) => lesson.academy === "keyboard");
    const attempts = [
      attempt(keyboard[0], 90, 67, "one"),
      attempt(keyboard[1], 50, 100, "two"),
    ];
    expect(
      getAcademyMasteryProgress("keyboard", CURRICULUM_LESSONS, attempts),
    ).toMatchObject({ completed: 2, mastered: 1, total: 3 });
  });

  it("reports missing Academy content without treating planned slots as lessons", () => {
    const coverage = getCurriculumCoverage();
    expect(coverage.find((item) => item.academyId === "keyboard")).toMatchObject({
      authoredCoreLessons: 3,
      plannedCoreLessons: 30,
    });
    expect(coverage.find((item) => item.academyId === "language")?.flags).toContain(
      "No lessons authored",
    );
  });
});
