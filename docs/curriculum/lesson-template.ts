import type { CurriculumLesson } from "@/lib/data/types";

/**
 * Copy this object into src/lib/curriculum/lessons.ts and replace every
 * `replace-*` value. Read Finn-Build-Sheet.md before changing status to
 * `published`. Keep sampleText identical to typingPassage.
 */
export const LESSON_TEMPLATE: CurriculumLesson = {
  id: "replace-stable-lesson-id",
  slug: "replace-readable-slug",
  academy: "keyboard",
  broadTrack: "keyboard", // Must match academy.
  specificTopic: "replace narrow topic",
  unitId: "keyboard-foundations", // Must exist in plans.ts for this Academy.
  title: "Replace Student-Facing Title",
  gradeBand: "3-5", // 3-5, 6-8, 9-12, or genuinely cross-grade `any`.
  curriculumLevel: "foundation", // Conceptual demand, independent of typing.
  typingLevel: "beginner", // Keyboard mechanics, independent of concept.
  typingObjective: "Replace with one observable keyboard-mechanics goal.",
  targetedTypingSkills: ["replace exact key or mechanic"],
  learningOutcome: "Replace with one observable end-of-lesson outcome.",
  miniLesson: "Replace with one clear idea that takes roughly 60-90 seconds to read.",
  typingPassage: "asdf jkl; asdf jkl; asdf jkl; asdf jkl;",
  thinkPrompt: "Replace with a prompt requiring an original response.",
  thinkMinLength: 15,
  thinkMaxLength: 240,
  quizBank: [
    {
      id: "replace-question-1",
      prompt: "Replace with a clear question about the outcome.",
      choices: [
        { id: "a", label: "Replace plausible choice" },
        { id: "b", label: "Replace correct choice" },
        { id: "c", label: "Replace plausible choice" },
      ],
      correctChoiceId: "b",
      explanation: "Explain briefly why the correct choice is correct.",
    },
    // Add four more reviewed questions. Five is the minimum bank size.
    { id: "replace-question-2", prompt: "Replace question.", choices: [{ id: "a", label: "Choice" }, { id: "b", label: "Correct" }, { id: "c", label: "Choice" }], correctChoiceId: "b", explanation: "Replace explanation." },
    { id: "replace-question-3", prompt: "Replace question.", choices: [{ id: "a", label: "Choice" }, { id: "b", label: "Correct" }, { id: "c", label: "Choice" }], correctChoiceId: "b", explanation: "Replace explanation." },
    { id: "replace-question-4", prompt: "Replace question.", choices: [{ id: "a", label: "Choice" }, { id: "b", label: "Correct" }, { id: "c", label: "Choice" }], correctChoiceId: "b", explanation: "Replace explanation." },
    { id: "replace-question-5", prompt: "Replace application question.", choices: [{ id: "a", label: "Choice" }, { id: "b", label: "Correct" }, { id: "c", label: "Choice" }], correctChoiceId: "b", explanation: "Replace explanation." },
  ],
  vocabulary: [{ term: "replace term", definition: "Replace concise useful definition." }],
  tags: ["replace-topic-tag", "replace-skill-tag"],
  estimatedTime: 5,
  xpValue: 40,
  mastery: {
    targetAccuracy: 90, // Usually the typing level recommendation.
    targetQuizPercentage: 67,
    minimumSuccessfulAttempts: 1,
  },
  prerequisiteLessonIds: [], // Remove when no true prerequisite exists.
  isCore: true,
  sequence: 1, // Unique within this Academy.
  status: "draft",
  locale: "en-US",

  // Legacy compatibility fields retained by the current typing/progress engine.
  level: 1,
  order: 1,
  focus: "Replace concise focus.",
  category: "letters",
  promptType: "english",
  track: "basics",
  sampleText: "asdf jkl; asdf jkl; asdf jkl; asdf jkl;",
  estimatedMinutes: 5,
};
