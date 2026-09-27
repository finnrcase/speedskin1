import type { Lesson, LessonProgress } from "@/lib/data/types";
import { CURRICULUM_LESSONS } from "@/lib/curriculum/lessons";

/*
  Two learning paths:
  - "basics" (levels 1-8): the core touch-typing progression.
  - "python" (levels 1-5): typing practice for basic Python syntax.

  Each lesson carries a fixed sampleText as a readable example; the actual
  prompts are generated per attempt from `category` + `promptTopic`.
*/
const LEGACY_LESSONS: Lesson[] = [
  {
    id: "l1-home-row-letters",
    level: 1,
    order: 1,
    title: "Home Row Letters",
    focus: "Find the home row by feel: a s d f j k l ;",
    category: "letters",
    promptType: "english",
    track: "basics",
    sampleText: "asdf jkl; asdf jkl; ffjj ddkk slsl a;a; fjfj dkdk",
    estimatedMinutes: 3,
  },
  {
    id: "l2-home-row-words",
    level: 2,
    order: 2,
    title: "Home Row Words",
    focus: "Build real words using only the home row keys.",
    category: "words",
    promptType: "english",
    track: "basics",
    sampleText: "as ask sad lad fall flask glass salad all dads",
    estimatedMinutes: 4,
  },
  {
    id: "l3-top-bottom-rows",
    level: 3,
    order: 3,
    title: "Top & Bottom Rows",
    focus: "Reach up and down without looking at your hands.",
    category: "rows",
    promptType: "english",
    track: "basics",
    sampleText: "the quick red fox we type now very busy cats move",
    estimatedMinutes: 4,
  },
  {
    id: "l4-capital-letters",
    level: 4,
    order: 4,
    title: "Capital Letters",
    focus: "Use the shift key for clean capital letters.",
    category: "capitals",
    promptType: "english",
    track: "basics",
    sampleText: "The Fox And The Cat Monday In April New York City",
    estimatedMinutes: 5,
  },
  {
    id: "l5-punctuation",
    level: 5,
    order: 5,
    title: "Punctuation",
    focus: "Commas, periods, and question marks in real text.",
    category: "punctuation",
    promptType: "english",
    track: "basics",
    sampleText: "Hello, world! Yes? No. Wait... go, now; then stop!",
    estimatedMinutes: 5,
  },
  {
    id: "l6-numbers",
    level: 6,
    order: 6,
    title: "Numbers",
    focus: "Type the number row smoothly and accurately.",
    category: "numbers",
    promptType: "english",
    track: "basics",
    sampleText: "1 2 3 4 5 room 207 call 555 0142 pi is 3.14 and 42",
    estimatedMinutes: 5,
  },
  {
    id: "l7-full-sentences",
    level: 7,
    order: 7,
    title: "Full Sentences",
    focus: "Put it all together with complete sentences.",
    category: "sentences",
    promptType: "english",
    track: "basics",
    sampleText:
      "The quick brown fox jumps over the lazy dog every single morning.",
    estimatedMinutes: 6,
  },
  {
    id: "l8-timed-sprint",
    level: 8,
    order: 8,
    title: "Timed Sprint",
    focus: "Type as much as you can before the timer runs out.",
    category: "timed",
    promptType: "english",
    track: "basics",
    sampleText:
      "Practice a little every day and your speed will climb faster than you expect.",
    estimatedMinutes: 2,
    timeLimitSeconds: 60,
  },

  // ---- Python Typing path ----
  {
    id: "py-strings",
    level: 1,
    order: 9,
    title: "Python: Strings & Print",
    focus: "Type print statements and text strings.",
    category: "code",
    promptType: "python",
    track: "python",
    promptTopic: "strings",
    sampleText: 'print("Hello, world!")',
    estimatedMinutes: 5,
  },
  {
    id: "py-numbers",
    level: 2,
    order: 10,
    title: "Python: Numbers & Variables",
    focus: "Assign numbers to variables.",
    category: "code",
    promptType: "python",
    track: "python",
    promptTopic: "numbers",
    sampleText: "score = 10",
    estimatedMinutes: 5,
  },
  {
    id: "py-conditions",
    level: 3,
    order: 11,
    title: "Python: Conditions",
    focus: "Type if, elif, and else statements.",
    category: "code",
    promptType: "python",
    track: "python",
    promptTopic: "conditions",
    sampleText: "if score > 5:",
    estimatedMinutes: 6,
  },
  {
    id: "py-loops",
    level: 4,
    order: 12,
    title: "Python: Loops & Functions",
    focus: "Practice loops and function definitions.",
    category: "code",
    promptType: "python",
    track: "python",
    promptTopic: "loops",
    sampleText: "for i in range(5):",
    estimatedMinutes: 6,
  },
  {
    id: "py-multiline",
    level: 5,
    order: 13,
    title: "Python: Multi-line Snippets",
    focus: "Type short multi-line snippets with indentation.",
    category: "code",
    promptType: "python",
    track: "python",
    promptTopic: "multiline",
    sampleText: 'def greet(name):\n    print("Hi", name)',
    estimatedMinutes: 7,
  },
];

const curriculumIds = new Set(CURRICULUM_LESSONS.map((lesson) => lesson.id));

/**
 * Academy lessons replace matching legacy objects in-place, preserving IDs and
 * existing progress. Python and the remaining classic drills stay available as
 * specialized practice.
 */
export const LESSONS: Lesson[] = [
  ...CURRICULUM_LESSONS,
  ...LEGACY_LESSONS.filter((lesson) => !curriculumIds.has(lesson.id)),
];

function progress(
  lessonId: string,
  status: LessonProgress["status"],
  bestWpm: number | null = null,
  bestAccuracy: number | null = null,
  stars: LessonProgress["stars"] = 0,
): LessonProgress {
  return { lessonId, status, bestWpm, bestAccuracy, stars };
}

/** Per-lesson progress for the current student. */
export const LESSON_PROGRESS: Record<string, LessonProgress> = {
  "l1-home-row-letters": progress("l1-home-row-letters", "completed", 28, 98, 3),
  "l2-home-row-words": progress("l2-home-row-words", "completed", 31, 96, 3),
  "l3-top-bottom-rows": progress("l3-top-bottom-rows", "completed", 26, 92, 2),
  "l4-capital-letters": progress("l4-capital-letters", "current"),
  "l5-punctuation": progress("l5-punctuation", "available"),
  "l6-numbers": progress("l6-numbers", "locked"),
  "l7-full-sentences": progress("l7-full-sentences", "locked"),
  "l8-timed-sprint": progress("l8-timed-sprint", "locked"),
  "py-strings": progress("py-strings", "available"),
  "py-numbers": progress("py-numbers", "locked"),
  "py-conditions": progress("py-conditions", "locked"),
  "py-loops": progress("py-loops", "locked"),
  "py-multiline": progress("py-multiline", "locked"),
};
