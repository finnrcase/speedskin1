import { describe, expect, it } from "vitest";
import { getLegacyTypingLessons, getLessons } from "./index";
import { getCurriculumLessonById } from "@/lib/curriculum";

describe("legacy lesson compatibility", () => {
  it("contains retained IDs exactly once in the merged catalog", () => {
    const ids = getLessons().map((lesson) => lesson.id);
    for (const id of [
      "l1-home-row-letters",
      "l2-home-row-words",
      "l3-top-bottom-rows",
    ]) {
      expect(ids.filter((candidate) => candidate === id)).toHaveLength(1);
    }
  });

  it("keeps non-Keyboard Academy content out of the classic Typing course", () => {
    const typingLessons = getLegacyTypingLessons();
    expect(typingLessons).toHaveLength(8);
    expect(
      typingLessons.every((lesson) => {
        const curriculumLesson = getCurriculumLessonById(lesson.id);
        return !curriculumLesson || curriculumLesson.academy === "keyboard";
      }),
    ).toBe(true);
  });
});

