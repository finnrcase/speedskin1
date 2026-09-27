import { ACADEMIES } from "./academies";
import { CURRICULUM_LESSONS } from "./lessons";
import type {
  Academy,
  AcademyId,
  AcademyProgress,
  CurriculumLesson,
  CurriculumLevel,
  GradeBand,
  LessonScore,
  QuizAnswer,
  QuizQuestion,
  TypingLevel,
} from "@/lib/data/types";

export interface LessonFilters {
  academy?: AcademyId;
  gradeBand?: GradeBand;
  curriculumLevel?: CurriculumLevel;
  typingLevel?: TypingLevel;
  tags?: string[];
  search?: string;
  includeDrafts?: boolean;
}

export interface KeyboardHealthInput {
  averageAccuracy: number;
  completedLessons: number;
  totalLessons: number;
  weakKeyCount: number;
}

const finiteNumber = (value: number, fallback = 0) =>
  Number.isFinite(value) ? value : fallback;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, finiteNumber(value, min)));

export function getAcademies(): Academy[] {
  return [...ACADEMIES].sort((a, b) => a.order - b.order);
}

export function getCurriculumLessons(
  filters: LessonFilters = {},
): CurriculumLesson[] {
  const query = filters.search?.trim().toLocaleLowerCase();
  return CURRICULUM_LESSONS.filter((lesson) => {
    if (!filters.includeDrafts && lesson.status !== "published") return false;
    if (filters.academy && lesson.academy !== filters.academy) return false;
    if (
      filters.gradeBand &&
      lesson.gradeBand !== "any" &&
      lesson.gradeBand !== filters.gradeBand
    ) return false;
    if (
      filters.curriculumLevel &&
      lesson.curriculumLevel !== filters.curriculumLevel
    ) return false;
    if (filters.typingLevel && lesson.typingLevel !== filters.typingLevel) return false;
    if (filters.tags?.length && !filters.tags.every((tag) => lesson.tags.includes(tag))) {
      return false;
    }
    if (query) {
      const haystack = [lesson.title, lesson.specificTopic, ...lesson.tags]
        .join(" ")
        .toLocaleLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  }).sort(compareLessons);
}

function compareLessons(a: CurriculumLesson, b: CurriculumLesson) {
  const academyA = ACADEMIES.find((item) => item.id === a.academy)?.order ?? 99;
  const academyB = ACADEMIES.find((item) => item.id === b.academy)?.order ?? 99;
  return academyA - academyB || a.sequence - b.sequence;
}

export function getLessonsByAcademy(academy: AcademyId): CurriculumLesson[] {
  return getCurriculumLessons({ academy });
}

export function getCurriculumLessonById(id: string): CurriculumLesson | undefined {
  return CURRICULUM_LESSONS.find(
    (lesson) => lesson.id === id || lesson.slug === id,
  );
}

export function isCurriculumLesson(
  lesson: { id: string },
): lesson is CurriculumLesson {
  return getCurriculumLessonById(lesson.id) !== undefined;
}

export function getNextAcademyLesson(
  completedLessonIds: Iterable<string>,
  academy?: AcademyId,
): CurriculumLesson | undefined {
  const completed = new Set(completedLessonIds);
  return getCurriculumLessons(academy ? { academy } : {}).find(
    (lesson) => !completed.has(lesson.id),
  );
}

export function getNextLessonAfter(
  lessonId: string,
  completedLessonIds: Iterable<string> = [],
): CurriculumLesson | undefined {
  const current = getCurriculumLessonById(lessonId);
  if (!current) return undefined;
  const completed = new Set(completedLessonIds);
  const ordered = getCurriculumLessons();
  const index = ordered.findIndex((lesson) => lesson.id === current.id);
  return ordered.slice(index + 1).find((lesson) => !completed.has(lesson.id));
}

export function getFreePlayLessons(
  filters: LessonFilters,
  completedLessonIds: Iterable<string> = [],
): CurriculumLesson[] {
  const completed = new Set(completedLessonIds);
  const lessons = getCurriculumLessons(filters);
  return lessons.filter((lesson) => {
    const priorLessons = getLessonsByAcademy(lesson.academy).filter(
      (candidate) => candidate.sequence < lesson.sequence,
    );
    return priorLessons.every((prior) => completed.has(prior.id));
  });
}

export function getSurpriseLesson(
  completedLessonIds: Iterable<string>,
  random: () => number = Math.random,
  filters: LessonFilters = {},
  excludeLessonId?: string,
): CurriculumLesson | undefined {
  const completed = new Set(completedLessonIds);
  const eligible = getFreePlayLessons(filters, completed);
  const unfinished = eligible.filter((lesson) => !completed.has(lesson.id));
  const initialPool = unfinished.length ? unfinished : eligible;
  const alternatives = initialPool.filter(
    (lesson) => lesson.id !== excludeLessonId,
  );
  const pool = alternatives.length ? alternatives : initialPool;
  if (!pool.length) return undefined;
  return pool[Math.floor(clamp(random(), 0, 0.999999) * pool.length)];
}

/** Deterministic Fisher-Yates selection when a seeded/random function is supplied. */
export function selectQuizQuestions(
  bank: readonly QuizQuestion[],
  count = 3,
  random: () => number = Math.random,
): QuizQuestion[] {
  const copy = [...new Map(bank.map((question) => [question.id, question])).values()];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(clamp(random(), 0, 0.999999) * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy.slice(0, Math.min(Math.max(0, count), copy.length));
}

export function scoreQuiz(
  questions: readonly QuizQuestion[],
  selections: Readonly<Record<string, string>>,
): { answers: QuizAnswer[]; score: LessonScore } {
  const answers = questions.map((question) => ({
    questionId: question.id,
    selectedChoiceId: selections[question.id] ?? "",
    correct: selections[question.id] === question.correctChoiceId,
  }));
  const correctAnswers = answers.filter((answer) => answer.correct).length;
  return {
    answers,
    score: {
      correctAnswers,
      totalQuestions: questions.length,
      percentage: questions.length
        ? Math.round((correctAnswers / questions.length) * 100)
        : 0,
    },
  };
}

/** XP rewards completion and care. It never rewards raw typing speed. */
export function calculateXp({
  baseXp,
  typingAccuracy,
  quizPercentage,
}: {
  baseXp: number;
  typingAccuracy: number;
  quizPercentage: number;
}): number {
  const safeAccuracy = clamp(typingAccuracy, 0, 100);
  const accuracyBonus = safeAccuracy >= 97 ? 15 : safeAccuracy >= 92 ? 8 : 0;
  const knowledgeBonus = Math.round(clamp(quizPercentage, 0, 100) / 10);
  const safeBase = clamp(Math.round(finiteNumber(baseXp)), 0, 75);
  return safeBase + accuracyBonus + knowledgeBonus;
}

/** Total XP is bounded to the best awarded attempt per lesson. */
export function calculateTotalXp(
  attempts: ReadonlyArray<{ lessonId: string; xpEarned: number }>,
): number {
  const perLesson = new Map<string, number>();
  for (const attempt of attempts) {
    const xp = clamp(Math.round(finiteNumber(attempt.xpEarned)), 0, 100);
    perLesson.set(attempt.lessonId, Math.max(perLesson.get(attempt.lessonId) ?? 0, xp));
  }
  return [...perLesson.values()].reduce((sum, xp) => sum + xp, 0);
}

/**
 * Keyboard Health (0-100) uses only data the app truly measures:
 * 70% average accuracy + 20% lesson progress + 10% weak-key health.
 * Each reported weak key reduces the final component by 20 points (max five).
 */
export function calculateKeyboardHealth(input: KeyboardHealthInput): number {
  const completedLessons = Math.max(0, finiteNumber(input.completedLessons));
  const totalLessons = Math.max(0, finiteNumber(input.totalLessons));
  if (completedLessons === 0) return 80;
  const accuracy = clamp(input.averageAccuracy, 0, 100);
  const progress = totalLessons
    ? clamp((completedLessons / totalLessons) * 100, 0, 100)
    : 0;
  const weakKeyHealth = 100 - clamp(input.weakKeyCount, 0, 5) * 20;
  return clamp(
    Math.round(accuracy * 0.7 + progress * 0.2 + weakKeyHealth * 0.1),
    0,
    100,
  );
}

function localDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Consecutive active calendar days; repeated attempts on one day count once. */
export function calculateStreak(
  completedAtValues: readonly string[],
  now = new Date(),
): number {
  const days = new Set(
    completedAtValues.flatMap((value) => {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? [] : [localDateKey(date)];
    }),
  );
  const cursor = new Date(now);
  cursor.setHours(0, 0, 0, 0);
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getAcademyProgress(
  academy: AcademyId,
  completedLessonIds: Iterable<string>,
): AcademyProgress {
  const completed = new Set(completedLessonIds);
  const lessons = getLessonsByAcademy(academy);
  const completeCount = lessons.filter((lesson) => completed.has(lesson.id)).length;
  return {
    academy,
    completed: completeCount,
    total: lessons.length,
    percentage: lessons.length ? Math.round((completeCount / lessons.length) * 100) : 0,
    nextLessonId: lessons.find((lesson) => !completed.has(lesson.id))?.id ?? null,
  };
}
