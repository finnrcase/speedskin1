import { describe, expect, it } from "vitest";
import {
  calculateKeyboardHealth,
  calculateStreak,
  calculateTotalXp,
  calculateXp,
  getAcademies,
  getCurriculumLessons,
  getFreePlayLessons,
  getNextLessonAfter,
  getNextAcademyLesson,
  getSurpriseLesson,
  scoreQuiz,
  selectQuizQuestions,
} from "./engine";

describe("curriculum engine", () => {
  it("defines all eight academies in one catalog", () => {
    expect(getAcademies().map((academy) => academy.id)).toEqual([
      "keyboard",
      "language",
      "chromebook",
      "digital",
      "communication",
      "people",
      "money",
      "life",
    ]);
  });

  it("filters lessons by Academy", () => {
    const lessons = getCurriculumLessons({ academy: "money" });
    expect(lessons).toHaveLength(1);
    expect(lessons[0].academy).toBe("money");
  });

  it("keeps typing and curriculum difficulty independent", () => {
    const byTyping = getCurriculumLessons({ typingLevel: "punctuation" });
    const byCurriculum = getCurriculumLessons({ curriculumLevel: "foundation" });
    expect(byTyping.some((lesson) => lesson.curriculumLevel === "developing")).toBe(true);
    expect(byCurriculum.some((lesson) => lesson.typingLevel === "beginner")).toBe(true);
  });

  it("selects the first unfinished lesson in coherent Academy order", () => {
    expect(getNextAcademyLesson(["l1-home-row-letters"])?.id).toBe(
      "l2-home-row-words",
    );
  });

  it("maps completed legacy Keyboard IDs to the next Academy lesson once", () => {
    expect(
      getNextAcademyLesson([
        "l1-home-row-letters",
        "l2-home-row-words",
        "l3-top-bottom-rows",
      ])?.id,
    ).toBe("academy-chromebook-tabs");
  });

  it("returns no Academy Mode lesson when all published lessons are complete", () => {
    const lessons = getCurriculumLessons();
    expect(
      getNextAcademyLesson(lessons.map((lesson) => lesson.id)),
    ).toBeUndefined();
  });

  it("selects three unique quiz questions from a larger bank", () => {
    const bank = getCurriculumLessons()[0].quizBank;
    const picked = selectQuizQuestions(bank, 3, () => 0.25);
    expect(picked).toHaveLength(3);
    expect(new Set(picked.map((question) => question.id)).size).toBe(3);
  });

  it("does not mutate a quiz bank and de-duplicates malformed repeated IDs", () => {
    const bank = getCurriculumLessons()[0].quizBank;
    const originalIds = bank.map((question) => question.id);
    const picked = selectQuizQuestions([bank[0], bank[0], bank[1]], 3, () => 0);
    expect(picked.map((question) => question.id)).toEqual([
      bank[1].id,
      bank[0].id,
    ]);
    expect(bank.map((question) => question.id)).toEqual(originalIds);
  });

  it("returns every available quiz question when fewer than three exist", () => {
    const bank = getCurriculumLessons()[0].quizBank.slice(0, 2);
    expect(selectQuizQuestions(bank, 3, () => 0.5)).toHaveLength(2);
  });

  it("scores quiz answers and returns percentage", () => {
    const questions = getCurriculumLessons()[0].quizBank.slice(0, 3);
    const selections = Object.fromEntries(
      questions.map((question, index) => [
        question.id,
        index === 0 ? question.correctChoiceId : "not-correct",
      ]),
    );
    expect(scoreQuiz(questions, selections).score).toEqual({
      correctAnswers: 1,
      totalQuestions: 3,
      percentage: 33,
    });
  });

  it("treats missing and malformed quiz selections as incorrect", () => {
    const questions = getCurriculumLessons()[0].quizBank.slice(0, 2);
    const result = scoreQuiz(questions, {
      [questions[0].id]: "not-a-choice",
    });
    expect(result.score).toEqual({
      correctAnswers: 0,
      totalQuestions: 2,
      percentage: 0,
    });
  });

  it("calculates deterministic XP without a WPM input", () => {
    expect(calculateXp({ baseXp: 40, typingAccuracy: 98, quizPercentage: 100 })).toBe(65);
    expect(calculateXp({ baseXp: 40, typingAccuracy: 80, quizPercentage: 50 })).toBe(45);
  });

  it("bounds XP inputs and total retry awards", () => {
    expect(calculateXp({ baseXp: -20, typingAccuracy: -5, quizPercentage: -1 })).toBe(0);
    expect(calculateXp({ baseXp: 500, typingAccuracy: 100, quizPercentage: 100 })).toBe(100);
    expect(calculateXp({ baseXp: Number.NaN, typingAccuracy: Number.NaN, quizPercentage: Number.NaN })).toBe(0);
    expect(
      calculateTotalXp([
        { lessonId: "one", xpEarned: 50 },
        { lessonId: "one", xpEarned: 80 },
        { lessonId: "two", xpEarned: 500 },
      ]),
    ).toBe(180);
  });

  it("calculates documented Keyboard Health from measured inputs", () => {
    expect(
      calculateKeyboardHealth({
        averageAccuracy: 90,
        completedLessons: 5,
        totalLessons: 10,
        weakKeyCount: 2,
      }),
    ).toBe(79);
  });

  it("uses a neutral Keyboard Health baseline when there is no history", () => {
    expect(
      calculateKeyboardHealth({
        averageAccuracy: Number.NaN,
        completedLessons: 0,
        totalLessons: 10,
        weakKeyCount: 5,
      }),
    ).toBe(80);
  });

  it("keeps Keyboard Health bounded for weak and strong learners", () => {
    const weak = calculateKeyboardHealth({
      averageAccuracy: 60,
      completedLessons: 1,
      totalLessons: 10,
      weakKeyCount: 5,
    });
    const strong = calculateKeyboardHealth({
      averageAccuracy: 98,
      completedLessons: 10,
      totalLessons: 10,
      weakKeyCount: 0,
    });
    const withWeakKeys = calculateKeyboardHealth({
      averageAccuracy: 98,
      completedLessons: 10,
      totalLessons: 10,
      weakKeyCount: 4,
    });
    expect(weak).toBe(44);
    expect(strong).toBe(99);
    expect(withWeakKeys).toBeLessThan(strong);
    expect(weak).toBeGreaterThanOrEqual(0);
    expect(strong).toBeLessThanOrEqual(100);
  });

  it("unlocks free-play lessons only when prior Academy lessons are complete", () => {
    const fresh = getFreePlayLessons({}, []);
    expect(fresh.some((lesson) => lesson.id === "l2-home-row-words")).toBe(false);
    const progressed = getFreePlayLessons({}, ["l1-home-row-letters"]);
    expect(progressed.some((lesson) => lesson.id === "l2-home-row-words")).toBe(true);
  });

  it("can represent an impossible Academy assignment filter as no matches", () => {
    expect(
      getCurriculumLessons({
        academy: "keyboard",
        typingLevel: "advanced",
        curriculumLevel: "foundation",
      }),
    ).toEqual([]);
  });

  it("chooses Surprise Me only from eligible content", () => {
    const lesson = getSurpriseLesson([], () => 0);
    expect(lesson).toBeDefined();
    expect(lesson?.sequence).toBe(1);
  });

  it("makes Surprise Me respect grade, difficulty, and recent-lesson exclusion", () => {
    const first = getSurpriseLesson(
      [],
      () => 0,
      { gradeBand: "6-8", typingLevel: "intermediate" },
    );
    const alternative = getSurpriseLesson(
      [],
      () => 0,
      { gradeBand: "6-8", typingLevel: "intermediate" },
      first?.id,
    );
    expect(first?.gradeBand).toBe("6-8");
    expect(first?.typingLevel).toBe("intermediate");
    expect(alternative?.id).not.toBe(first?.id);
  });

  it("returns no next lesson after every later lesson is complete", () => {
    const lessons = getCurriculumLessons();
    expect(
      getNextLessonAfter(lessons[0].id, lessons.map((lesson) => lesson.id)),
    ).toBeUndefined();
  });

  it("counts streaks by distinct consecutive calendar days", () => {
    const now = new Date(2026, 8, 26, 12);
    const localIso = (daysAgo: number) => {
      const date = new Date(2026, 8, 26 - daysAgo, 12);
      return date.toISOString();
    };
    expect(calculateStreak([localIso(0), localIso(0), localIso(1)], now)).toBe(2);
    expect(calculateStreak([localIso(1), localIso(2)], now)).toBe(2);
    expect(calculateStreak([localIso(0), localIso(2)], now)).toBe(1);
    expect(calculateStreak(["invalid"], now)).toBe(0);
  });

  it("preserves legacy typing lesson IDs in the Academy catalog", () => {
    const ids = getCurriculumLessons({ academy: "keyboard" }).map((lesson) => lesson.id);
    expect(ids).toContain("l1-home-row-letters");
    expect(ids).toContain("l2-home-row-words");
    expect(ids).toContain("l3-top-bottom-rows");
  });
});
