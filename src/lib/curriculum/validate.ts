import type { CurriculumLesson } from "@/lib/data/types";
import { ACADEMY_IDS } from "./academies";
import { CURRICULUM_LEVELS, GRADE_BANDS, TYPING_LEVELS, getTypingLevel } from "./levels";
import { ACADEMY_CURRICULUM_PLANS, type AcademyCurriculumPlan } from "./plans";

export type CurriculumValidationSeverity = "error" | "warning";

export interface CurriculumValidationIssue {
  severity: CurriculumValidationSeverity;
  code: string;
  path: string;
  message: string;
}

export interface CurriculumValidationResult {
  valid: boolean;
  errors: CurriculumValidationIssue[];
  warnings: CurriculumValidationIssue[];
  issues: CurriculumValidationIssue[];
}

const academyIds = new Set<string>(ACADEMY_IDS);
const gradeBandIds = new Set<string>(GRADE_BANDS.map((band) => band.id));
const curriculumLevelIds = new Set<string>(CURRICULUM_LEVELS.map((level) => level.id));
const typingLevelIds = new Set<string>(TYPING_LEVELS.map((level) => level.id));
const lessonStatuses = new Set(["draft", "published", "archived"]);

function issue(
  issues: CurriculumValidationIssue[],
  severity: CurriculumValidationSeverity,
  code: string,
  path: string,
  message: string,
) {
  issues.push({ severity, code, path, message });
}

function requiredText(
  issues: CurriculumValidationIssue[],
  value: unknown,
  path: string,
  label: string,
) {
  if (typeof value !== "string" || !value.trim()) {
    issue(issues, "error", "required-text", path, `${label} must be nonempty.`);
  }
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function validateTypingPassage(
  lesson: CurriculumLesson,
  path: string,
  issues: CurriculumValidationIssue[],
) {
  const passage = lesson.typingPassage;
  const definition = getTypingLevel(lesson.typingLevel);
  if (!definition) return;

  if (passage.length < definition.suggestedPassageLength.min) {
    issue(
      issues,
      "warning",
      "short-typing-passage",
      `${path}.typingPassage`,
      `Passage has ${passage.length} characters; level ${definition.level} suggests at least ${definition.suggestedPassageLength.min}.`,
    );
  }
  if (passage.length > definition.suggestedPassageLength.max * 2) {
    issue(
      issues,
      "error",
      "long-typing-passage",
      `${path}.typingPassage`,
      `Passage has ${passage.length} characters, more than twice the suggested maximum of ${definition.suggestedPassageLength.max}.`,
    );
  }
  if (lesson.typingLevel === "beginner" && !/^[asdfjkl; ]+$/i.test(passage)) {
    issue(issues, "error", "typing-level-characters", `${path}.typingPassage`, "Beginner passages may use only home-row letters, spaces, and semicolons.");
  }
  if (lesson.typingLevel === "full-alphabet" && !/^[a-z ]+$/i.test(passage)) {
    issue(issues, "error", "typing-level-characters", `${path}.typingPassage`, "Full-alphabet passages should use letters and spaces only.");
  }
  if (["intermediate", "punctuation", "numbers-symbols", "real-world", "fluency", "advanced"].includes(lesson.typingLevel)) {
    if (!/[A-Z]/.test(passage) || !/[.!?]/.test(passage)) {
      issue(issues, "error", "typing-level-sentence", `${path}.typingPassage`, "This typing level requires capitalization and sentence-ending punctuation.");
    }
  }
  if (lesson.typingLevel === "punctuation" && !/[,?'’]/.test(passage)) {
    issue(issues, "error", "typing-level-punctuation", `${path}.typingPassage`, "Punctuation-level passages must practice a comma, question mark, or apostrophe.");
  }
  if (lesson.typingLevel === "numbers-symbols" && (!/\d/.test(passage) || !/[^\w\s.,!?]/.test(passage))) {
    issue(issues, "error", "typing-level-numbers-symbols", `${path}.typingPassage`, "Numbers-and-symbols passages must contain at least one digit and one symbol.");
  }
}

export function validateCurriculum(
  lessons: readonly CurriculumLesson[],
  plans: readonly AcademyCurriculumPlan[] = ACADEMY_CURRICULUM_PLANS,
): CurriculumValidationResult {
  const issues: CurriculumValidationIssue[] = [];
  const lessonIds = new Set<string>();
  const slugs = new Set<string>();
  const sequencePositions = new Set<string>();
  const knownLessonIds = new Set(lessons.map((lesson) => lesson.id));
  const planByAcademy = new Map(plans.map((plan) => [plan.academyId, plan]));

  lessons.forEach((lesson, index) => {
    const path = `lessons[${index}]${lesson?.id ? ` (${lesson.id})` : ""}`;
    requiredText(issues, lesson.id, `${path}.id`, "Lesson ID");
    requiredText(issues, lesson.slug, `${path}.slug`, "Slug");
    requiredText(issues, lesson.title, `${path}.title`, "Title");
    requiredText(issues, lesson.specificTopic, `${path}.specificTopic`, "Specific topic");
    requiredText(issues, lesson.unitId, `${path}.unitId`, "Unit ID");
    requiredText(issues, lesson.typingObjective, `${path}.typingObjective`, "Typing objective");
    requiredText(issues, lesson.learningOutcome, `${path}.learningOutcome`, "Learning outcome");
    requiredText(issues, lesson.miniLesson, `${path}.miniLesson`, "Mini-lesson");
    requiredText(issues, lesson.typingPassage, `${path}.typingPassage`, "Typing passage");
    requiredText(issues, lesson.thinkPrompt, `${path}.thinkPrompt`, "Think prompt");
    requiredText(issues, lesson.locale, `${path}.locale`, "Locale");

    if (lessonIds.has(lesson.id)) issue(issues, "error", "duplicate-lesson-id", `${path}.id`, `Lesson ID "${lesson.id}" is duplicated.`);
    lessonIds.add(lesson.id);
    if (slugs.has(lesson.slug)) issue(issues, "error", "duplicate-slug", `${path}.slug`, `Slug "${lesson.slug}" is duplicated.`);
    slugs.add(lesson.slug);

    if (!academyIds.has(lesson.academy)) issue(issues, "error", "invalid-academy", `${path}.academy`, `Unknown Academy "${lesson.academy}".`);
    if (lesson.broadTrack !== lesson.academy) issue(issues, "error", "academy-track-mismatch", `${path}.broadTrack`, "broadTrack must match academy.");
    if (!gradeBandIds.has(lesson.gradeBand)) issue(issues, "error", "invalid-grade-band", `${path}.gradeBand`, `Unknown grade band "${lesson.gradeBand}".`);
    if (!curriculumLevelIds.has(lesson.curriculumLevel)) issue(issues, "error", "invalid-curriculum-level", `${path}.curriculumLevel`, `Unknown curriculum level "${lesson.curriculumLevel}".`);
    if (!typingLevelIds.has(lesson.typingLevel)) issue(issues, "error", "invalid-typing-level", `${path}.typingLevel`, `Unknown typing level "${lesson.typingLevel}".`);
    if (!lessonStatuses.has(lesson.status)) issue(issues, "error", "invalid-status", `${path}.status`, `Unknown lesson status "${lesson.status}".`);

    const academyPlan = planByAcademy.get(lesson.academy);
    const unit = academyPlan?.units.find((candidate) => candidate.id === lesson.unitId);
    if (!unit) issue(issues, "error", "invalid-unit", `${path}.unitId`, `Unit "${lesson.unitId}" does not belong to ${lesson.academy} Academy.`);

    if (!Number.isInteger(lesson.sequence) || lesson.sequence < 1) issue(issues, "error", "invalid-sequence", `${path}.sequence`, "Sequence must be a positive integer.");
    const sequenceKey = `${lesson.academy}:${lesson.sequence}`;
    if (sequencePositions.has(sequenceKey)) issue(issues, "error", "duplicate-sequence", `${path}.sequence`, `Sequence ${lesson.sequence} is duplicated in ${lesson.academy} Academy.`);
    sequencePositions.add(sequenceKey);
    const roadmapSlots = academyPlan?.units.flatMap((plannedUnit) =>
      plannedUnit.topicSequence.map((title) => ({ title, unitId: plannedUnit.id })),
    );
    const roadmapSlot = roadmapSlots?.[lesson.sequence - 1];
    if (!roadmapSlot) {
      issue(issues, "error", "invalid-roadmap-slot", `${path}.sequence`, `Sequence ${lesson.sequence} does not identify a planned ${lesson.academy} roadmap slot.`);
    } else {
      if (roadmapSlot.title !== lesson.title) issue(issues, "error", "roadmap-title-mismatch", `${path}.title`, `Roadmap slot ${lesson.sequence} is "${roadmapSlot.title}", not "${lesson.title}".`);
      if (roadmapSlot.unitId !== lesson.unitId) issue(issues, "error", "roadmap-unit-mismatch", `${path}.unitId`, `Roadmap slot ${lesson.sequence} belongs to unit "${roadmapSlot.unitId}".`);
    }

    if (wordCount(lesson.miniLesson) > 180) issue(issues, "error", "mini-lesson-too-long", `${path}.miniLesson`, "Mini-lesson exceeds the 180-word authoring maximum.");
    if (lesson.thinkMinLength !== undefined && lesson.thinkMinLength < 10) issue(issues, "error", "think-min-too-small", `${path}.thinkMinLength`, "Think minimum must be at least 10 characters.");
    if (lesson.thinkMaxLength !== undefined && lesson.thinkMinLength !== undefined && lesson.thinkMaxLength <= lesson.thinkMinLength) issue(issues, "error", "invalid-think-range", `${path}.thinkMaxLength`, "Think maximum must exceed its minimum.");

    if (!Array.isArray(lesson.targetedTypingSkills) || lesson.targetedTypingSkills.length === 0) issue(issues, "error", "missing-typing-skills", `${path}.targetedTypingSkills`, "List at least one targeted typing skill.");
    if (!Array.isArray(lesson.tags) || lesson.tags.length < 2) issue(issues, "error", "missing-tags", `${path}.tags`, "Provide at least two useful tags.");
    if (new Set(lesson.tags).size !== lesson.tags.length) issue(issues, "error", "duplicate-tags", `${path}.tags`, "Tags must be unique within a lesson.");

    if (!Number.isFinite(lesson.estimatedTime) || lesson.estimatedTime < 2 || lesson.estimatedTime > 20) issue(issues, "error", "invalid-estimated-time", `${path}.estimatedTime`, "Estimated time must be between 2 and 20 minutes.");
    if (lesson.estimatedMinutes !== lesson.estimatedTime) issue(issues, "error", "estimated-time-mismatch", `${path}.estimatedMinutes`, "estimatedMinutes must match estimatedTime for legacy compatibility.");
    if (!Number.isFinite(lesson.xpValue) || lesson.xpValue < 10 || lesson.xpValue > 75) issue(issues, "error", "invalid-xp", `${path}.xpValue`, "Base XP must be between 10 and 75.");

    if (!lesson.mastery || lesson.mastery.targetAccuracy < 70 || lesson.mastery.targetAccuracy > 100) issue(issues, "error", "invalid-mastery-accuracy", `${path}.mastery.targetAccuracy`, "Mastery accuracy must be between 70 and 100.");
    if (!lesson.mastery || lesson.mastery.targetQuizPercentage < 0 || lesson.mastery.targetQuizPercentage > 100) issue(issues, "error", "invalid-mastery-quiz", `${path}.mastery.targetQuizPercentage`, "Mastery quiz target must be between 0 and 100.");
    if (!lesson.mastery || !Number.isInteger(lesson.mastery.minimumSuccessfulAttempts) || lesson.mastery.minimumSuccessfulAttempts < 1 || lesson.mastery.minimumSuccessfulAttempts > 5) issue(issues, "error", "invalid-mastery-attempts", `${path}.mastery.minimumSuccessfulAttempts`, "Successful-attempt target must be an integer from 1 to 5.");

    if (!Array.isArray(lesson.quizBank) || lesson.quizBank.length < 5) {
      issue(issues, "error", "incomplete-quiz-bank", `${path}.quizBank`, "Quiz bank must contain at least five questions; runtime selects three.");
    } else {
      const questionIds = new Set<string>();
      lesson.quizBank.forEach((question, questionIndex) => {
        const questionPath = `${path}.quizBank[${questionIndex}]`;
        requiredText(issues, question.id, `${questionPath}.id`, "Question ID");
        requiredText(issues, question.prompt, `${questionPath}.prompt`, "Question prompt");
        requiredText(issues, question.explanation, `${questionPath}.explanation`, "Question explanation");
        if (questionIds.has(question.id)) issue(issues, "error", "duplicate-question-id", `${questionPath}.id`, `Question ID "${question.id}" is duplicated in this lesson.`);
        questionIds.add(question.id);
        if (!Array.isArray(question.choices) || question.choices.length < 3) issue(issues, "error", "insufficient-choices", `${questionPath}.choices`, "Each question needs at least three choices.");
        const choiceIds = question.choices.map((choice) => choice.id);
        if (new Set(choiceIds).size !== choiceIds.length) issue(issues, "error", "duplicate-choice-id", `${questionPath}.choices`, "Choice IDs must be unique within a question.");
        question.choices.forEach((choice, choiceIndex) => requiredText(issues, choice.label, `${questionPath}.choices[${choiceIndex}].label`, "Choice label"));
        if (choiceIds.filter((id) => id === question.correctChoiceId).length !== 1) issue(issues, "error", "invalid-correct-choice", `${questionPath}.correctChoiceId`, "correctChoiceId must identify exactly one choice.");
      });
    }

    if (lesson.sampleText !== lesson.typingPassage) issue(issues, "error", "sample-passage-mismatch", `${path}.sampleText`, "sampleText must match typingPassage for the legacy typing engine.");
    lesson.prerequisiteLessonIds?.forEach((prerequisiteId, prerequisiteIndex) => {
      if (prerequisiteId === lesson.id) issue(issues, "error", "self-prerequisite", `${path}.prerequisiteLessonIds[${prerequisiteIndex}]`, "A lesson cannot require itself.");
      if (!knownLessonIds.has(prerequisiteId)) issue(issues, "error", "unknown-prerequisite", `${path}.prerequisiteLessonIds[${prerequisiteIndex}]`, `Unknown prerequisite lesson "${prerequisiteId}".`);
    });
    validateTypingPassage(lesson, path, issues);
  });

  const errors = issues.filter((item) => item.severity === "error");
  const warnings = issues.filter((item) => item.severity === "warning");
  return { valid: errors.length === 0, errors, warnings, issues };
}

export function validateAcademyPlans(
  plans: readonly AcademyCurriculumPlan[] = ACADEMY_CURRICULUM_PLANS,
): CurriculumValidationResult {
  const issues: CurriculumValidationIssue[] = [];
  const planAcademies = new Set<string>();
  const unitIds = new Set<string>();

  plans.forEach((plan, planIndex) => {
    const path = `plans[${planIndex}] (${plan.academyId})`;
    if (!academyIds.has(plan.academyId)) issue(issues, "error", "invalid-plan-academy", `${path}.academyId`, `Unknown Academy "${plan.academyId}".`);
    if (planAcademies.has(plan.academyId)) issue(issues, "error", "duplicate-academy-plan", `${path}.academyId`, `Academy plan "${plan.academyId}" is duplicated.`);
    planAcademies.add(plan.academyId);
    requiredText(issues, plan.purpose, `${path}.purpose`, "Academy purpose");
    requiredText(issues, plan.typingProgressionNotes, `${path}.typingProgressionNotes`, "Typing progression notes");
    if (!plan.outcomes.length) issue(issues, "error", "missing-academy-outcomes", `${path}.outcomes`, "Academy must define end outcomes.");
    if (!plan.v1Topics.length) issue(issues, "error", "missing-v1-topics", `${path}.v1Topics`, "Academy must identify V1 priority topics.");
    if (!plan.laterTopics.length) issue(issues, "error", "missing-later-topics", `${path}.laterTopics`, "Academy must identify later topics.");
    if (!Number.isInteger(plan.suggestedCoreLessonCount) || plan.suggestedCoreLessonCount < 1) issue(issues, "error", "invalid-planned-count", `${path}.suggestedCoreLessonCount`, "Suggested lesson count must be a positive integer.");
    const slotCount = plan.units.reduce((total, unit) => total + unit.topicSequence.length, 0);
    if (slotCount !== plan.suggestedCoreLessonCount) issue(issues, "error", "planned-count-mismatch", `${path}.units`, `Units contain ${slotCount} slots but plan targets ${plan.suggestedCoreLessonCount}.`);
    plan.units.forEach((unit, unitIndex) => {
      const unitPath = `${path}.units[${unitIndex}]`;
      if (unitIds.has(unit.id)) issue(issues, "error", "duplicate-unit-id", `${unitPath}.id`, `Unit ID "${unit.id}" is duplicated.`);
      unitIds.add(unit.id);
      requiredText(issues, unit.title, `${unitPath}.title`, "Unit title");
      requiredText(issues, unit.description, `${unitPath}.description`, "Unit description");
      if (!unit.outcomes.length) issue(issues, "error", "missing-unit-outcomes", `${unitPath}.outcomes`, "Unit must define outcomes.");
      if (!unit.recommendedCurriculumLevels.length) issue(issues, "error", "missing-unit-curriculum-levels", `${unitPath}.recommendedCurriculumLevels`, "Unit must recommend at least one curriculum level.");
      if (!unit.recommendedTypingLevels.length) issue(issues, "error", "missing-unit-typing-levels", `${unitPath}.recommendedTypingLevels`, "Unit must recommend at least one typing level.");
      if (!unit.topicSequence.length || unit.topicSequence.some((topic) => !topic.trim())) issue(issues, "error", "invalid-topic-sequence", `${unitPath}.topicSequence`, "Unit topic sequence must contain nonempty slots.");
      if (new Set(unit.topicSequence).size !== unit.topicSequence.length) issue(issues, "error", "duplicate-topic-slot", `${unitPath}.topicSequence`, "Topic slots must be unique within a unit.");
      unit.recommendedCurriculumLevels.forEach((id) => {
        if (!curriculumLevelIds.has(id)) issue(issues, "error", "invalid-unit-curriculum-level", `${unitPath}.recommendedCurriculumLevels`, `Unknown curriculum level "${id}".`);
      });
      unit.recommendedTypingLevels.forEach((id) => {
        if (!typingLevelIds.has(id)) issue(issues, "error", "invalid-unit-typing-level", `${unitPath}.recommendedTypingLevels`, `Unknown typing level "${id}".`);
      });
    });
  });

  ACADEMY_IDS.forEach((academyId) => {
    if (!planAcademies.has(academyId)) issue(issues, "error", "missing-academy-plan", "plans", `Missing curriculum plan for ${academyId} Academy.`);
  });
  const errors = issues.filter((item) => item.severity === "error");
  const warnings = issues.filter((item) => item.severity === "warning");
  return { valid: errors.length === 0, errors, warnings, issues };
}

export function formatCurriculumIssues(issues: readonly CurriculumValidationIssue[]) {
  return issues.map((item) => `[${item.severity.toUpperCase()}] ${item.code} at ${item.path}: ${item.message}`).join("\n");
}

export function assertValidCurriculum(lessons: readonly CurriculumLesson[]) {
  const lessonResult = validateCurriculum(lessons);
  const planResult = validateAcademyPlans();
  const errors = [...lessonResult.errors, ...planResult.errors];
  if (errors.length) throw new Error(`Curriculum validation failed:\n${formatCurriculumIssues(errors)}`);
  return { lessonResult, planResult };
}
