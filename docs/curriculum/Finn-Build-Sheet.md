# Finn Build Sheet

Use this sheet to author one SpeedSkin lesson without needing to understand the app. The TypeScript template is [`lesson-template.ts`](./lesson-template.ts). The structured Academy outcomes and open slots are in `src/lib/curriculum/plans.ts` and summarized in [`roadmap.md`](./roadmap.md).

## 1. Identity

| Field | Requirement |
| --- | --- |
| `id` | Stable kebab-case ID. Never reuse or casually rename a published ID. |
| `slug` | Unique human-readable URL slug. |
| `title` | Short student-facing lesson title. |
| `academy` / `broadTrack` | One of the eight Academy IDs; both values must match. |
| `specificTopic` | Narrow concept taught by this lesson. |
| `unitId` | Existing unit ID from the Academy plan. |
| `sequence` | Unique positive position inside the Academy. |
| `isCore` | `true` when it fills one of the planned core slots. |
| legacy fields | `level`, `order`, `focus`, `category`, `promptType`, `track`, `sampleText`, and `estimatedMinutes` remain required for current app compatibility. |

## 2. Audience and difficulty

- `gradeBand`: `3-5`, `6-8`, `9-12`, or `any` only when the same wording and scenario truly work across grades.
- `curriculumLevel`: choose from SpeedSkin's five-level internal framework. This represents conceptual thinking, not student intelligence.
- `typingLevel`: choose from the separate eight-level keyboard framework. It represents mechanics, not concept difficulty.
- Keep reading complexity and response expectations inside the selected grade-band definition.

These are internal production frameworks, not scientifically validated taxonomies or labels for students.

## 3. Outcome and mastery

- `learningOutcome`: one observable statement describing what the student can do after the lesson.
- `mastery.targetAccuracy`: normally use the typing level's recommended accuracy.
- `mastery.targetQuizPercentage`: normally `67`, equivalent to two correct answers when runtime selects three.
- `mastery.minimumSuccessfulAttempts`: normally `1`; use more only when repeated evidence is educationally justified.
- `prerequisiteLessonIds`: optional stable lesson IDs that truly must come first.

Completion and mastery are different. Completion means a student finished all five stages and saved an attempt. Mastery additionally requires one or more attempts meeting both the accuracy and quiz targets. Beginner mastery must not depend on high WPM.

## 4. Type

- `typingObjective`: one observable keyboard-mechanics goal.
- `targetedTypingSkills`: the exact keys or mechanics practiced.
- `typingPassage`: reinforces the lesson's concept; never filler.
- `sampleText`: exactly the same text as `typingPassage` while the legacy engine requires both.
- Match the selected typing level's character types and approximate passage-length range.
- Do not introduce mechanics that have not been taught unless the lesson intentionally introduces them.

## 5. Learn

- `miniLesson` teaches one main idea.
- Aim for roughly 60–90 seconds of reading and never exceed 180 words.
- Use plain language that works without teacher explanation.
- Remove history, trivia, or secondary advice that does not support the outcome.

## 6. Think

- `thinkPrompt` requires an original response; it cannot be answered by copying the passage.
- `thinkMinLength` and `thinkMaxLength` are character limits, not grading rules.
- Elementary responses are usually 1–2 sentences, Middle 2–3, and High 2–4.
- Do not ask students to disclose passwords, private data, financial account details, trauma, or other sensitive information.

## 7. Check

- `quizBank` contains at least five unique questions; runtime randomly selects three.
- Every question needs a unique ID, a clear prompt, at least three plausible choices, exactly one valid `correctChoiceId`, and a short explanation.
- Prefer at least one realistic application question when the outcome supports it.
- Test the lesson outcome, not unrelated trivia or tiny wording details.
- Distractors should be plausible but not deceptive.
- Explanations say why the correct choice is correct and reinforce the concept.

## 8. Language and metadata

- `vocabulary`: include only genuinely useful terms, each with a concise definition.
- `locale`: currently `en-US` unless reviewed content supports another locale.
- `tags`: at least two unique searchable tags.
- `estimatedTime` and `estimatedMinutes`: matching values from 2–20 minutes.
- `xpValue`: base XP from 10–75. WPM never changes XP.
- `status`: `draft`, `published`, or `archived`.
- `relatedPracticeHref`: optional link to a relevant existing practice tool.

## 9. Quality sign-off

Before publishing, verify:

- The lesson teaches exactly one central idea and matches an Academy outcome and roadmap slot.
- The Learn, Type, Think, and Check content all provide evidence for the same learning outcome.
- Typing mechanics match the declared typing level.
- Reading, scenario, and response demands fit the grade band.
- Facts, calculations, safety claims, and terminology were manually checked.
- The content does not duplicate an existing lesson or sequence position.
- The lesson avoids stereotypes, unnecessary shame, manipulative distractors, and requests for sensitive information.
- `npm run curriculum:validate` and `npm run curriculum:report` pass before review.

## Completed example

```ts
{
  id: "academy-money-saving-half",
  slug: "save-half",
  academy: "money",
  broadTrack: "money",
  specificTopic: "saving",
  unitId: "money-saving",
  title: "Save Half First",
  gradeBand: "3-5",
  curriculumLevel: "foundation",
  typingLevel: "numbers-symbols",
  typingObjective: "Type numbers, dollar amounts, and complete sentences accurately.",
  targetedTypingSkills: ["number row", "dollar sign", "capitalization", "periods"],
  learningOutcome: "Calculate half of a simple amount and explain why planned savings should be set aside before optional spending.",
  miniLesson: "Saving means keeping some money for later instead of spending it now. If you decide to save half, divide the total into two equal parts before you buy anything.",
  typingPassage: "If I earn $20 and save half, I put $10 aside. The other $10 is available for spending or another goal.",
  thinkPrompt: "If you earned $20 and wanted to save half, how much would you save? Explain your thinking.",
  thinkMinLength: 15,
  thinkMaxLength: 240,
  quizBank: [/* five reviewed QuizQuestion objects */],
  vocabulary: [
    { term: "save", definition: "To keep money for a future use." },
    { term: "half", definition: "One of two equal parts." },
  ],
  tags: ["saving", "money", "numbers"],
  estimatedTime: 5,
  xpValue: 50,
  mastery: { targetAccuracy: 92, targetQuizPercentage: 67, minimumSuccessfulAttempts: 1 },
  isCore: true,
  sequence: 1,
  status: "published",
  locale: "en-US",
  level: 7,
  order: 17,
  focus: "Practice a simple saving decision.",
  category: "numbers",
  promptType: "english",
  track: "basics",
  sampleText: "If I earn $20 and save half, I put $10 aside. The other $10 is available for spending or another goal.",
  estimatedMinutes: 5,
}
```
