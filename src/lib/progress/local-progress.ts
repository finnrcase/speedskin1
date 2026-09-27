import {
  getLessons,
  getShortcutLessons,
  type LessonAttempt,
  type LessonProgress,
  type LessonStatus,
  type LessonTrack,
  type ShortcutProgress,
  type ShortcutSkillProgress,
} from "@/lib/data";
import { getCurriculumLessonById } from "@/lib/curriculum";
import { defaultShortcutSkillProgress } from "@/lib/shortcuts/mastery";

export interface LessonProgressRecord extends LessonProgress {
  track: LessonTrack;
  completedSessions: number;
  minutesPracticed: number;
}

export interface LocalProgressState {
  lessonProgress: Record<string, LessonProgressRecord>;
  shortcutLessonProgress: Record<string, ShortcutProgress>;
  shortcutSkillProgress: ShortcutSkillProgress[];
  academyAttempts: LessonAttempt[];
}

const LESSON_STATUSES = new Set<LessonStatus>([
  "completed",
  "current",
  "locked",
  "available",
]);
const LESSON_TRACKS = new Set<LessonTrack>(["basics", "python", "shortcuts"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function nonNegativeInteger(value: unknown, fallback = 0): number {
  return Math.max(0, Math.round(finiteNumber(value, fallback)));
}

function nullableNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function collectionValues(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return isRecord(value) ? Object.values(value) : [];
}

function normalizeLessonProgress(value: unknown) {
  const lessons = new Map(getLessons().map((lesson) => [lesson.id, lesson]));
  const records = collectionValues(value).flatMap((candidate) => {
    if (!isRecord(candidate) || typeof candidate.lessonId !== "string") return [];
    const lesson = lessons.get(candidate.lessonId);
    if (!lesson) return [];
    const status = LESSON_STATUSES.has(candidate.status as LessonStatus)
      ? (candidate.status as LessonStatus)
      : "available";
    const track = LESSON_TRACKS.has(candidate.track as LessonTrack)
      ? (candidate.track as LessonTrack)
      : lesson.track;
    return [{
      lessonId: lesson.id,
      status,
      bestWpm: nullableNumber(candidate.bestWpm),
      bestAccuracy: nullableNumber(candidate.bestAccuracy),
      stars: Math.min(3, nonNegativeInteger(candidate.stars)) as 0 | 1 | 2 | 3,
      track,
      completedSessions: nonNegativeInteger(candidate.completedSessions),
      minutesPracticed: nonNegativeInteger(candidate.minutesPracticed),
    } satisfies LessonProgressRecord];
  });
  return Object.fromEntries(records.map((record) => [record.lessonId, record]));
}

function normalizeShortcutLessonProgress(value: unknown) {
  const lessonIds = new Set(getShortcutLessons().map((lesson) => lesson.id));
  const records = collectionValues(value).flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.lessonId !== "string" ||
      !lessonIds.has(candidate.lessonId)
    ) return [];
    return [{
      lessonId: candidate.lessonId,
      status: LESSON_STATUSES.has(candidate.status as LessonStatus)
        ? (candidate.status as LessonStatus)
        : "available",
      bestAccuracy: nullableNumber(candidate.bestAccuracy),
      averageReactionMs: nullableNumber(candidate.averageReactionMs),
      completedSessions: nonNegativeInteger(candidate.completedSessions),
    } satisfies ShortcutProgress];
  });
  return Object.fromEntries(records.map((record) => [record.lessonId, record]));
}

function normalizeShortcutSkills(value: unknown): ShortcutSkillProgress[] {
  const defaults = defaultShortcutSkillProgress();
  const knownIds = new Set(defaults.map((item) => item.shortcutId));
  return collectionValues(value).flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.shortcutId !== "string" ||
      !knownIds.has(candidate.shortcutId as ShortcutSkillProgress["shortcutId"])
    ) return [];
    const fallback = defaults.find((item) => item.shortcutId === candidate.shortcutId)!;
    const masteryState =
      candidate.masteryState === "Learning" ||
      candidate.masteryState === "Practicing" ||
      candidate.masteryState === "Comfortable" ||
      candidate.masteryState === "Mastered"
        ? candidate.masteryState
        : fallback.masteryState;
    return [{
      shortcutId: fallback.shortcutId,
      correctAttempts: nonNegativeInteger(candidate.correctAttempts),
      incorrectAttempts: nonNegativeInteger(candidate.incorrectAttempts),
      averageReactionMs: nullableNumber(candidate.averageReactionMs),
      masteryState,
    } satisfies ShortcutSkillProgress];
  });
}

function normalizeAcademyAttempts(value: unknown): LessonAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      typeof candidate.lessonId !== "string"
    ) return [];
    const lesson = getCurriculumLessonById(candidate.lessonId);
    if (!lesson) return [];
    const rawAnswers = Array.isArray(candidate.quizAnswers)
      ? candidate.quizAnswers
      : [];
    const quizAnswers = rawAnswers.flatMap((answer) => {
      if (
        !isRecord(answer) ||
        typeof answer.questionId !== "string" ||
        typeof answer.selectedChoiceId !== "string" ||
        typeof answer.correct !== "boolean"
      ) return [];
      return [{
        questionId: answer.questionId,
        selectedChoiceId: answer.selectedChoiceId,
        correct: answer.correct,
      }];
    });
    const rawScore = isRecord(candidate.quizScore) ? candidate.quizScore : {};
    const rawTyping = isRecord(candidate.typingResult)
      ? candidate.typingResult
      : {};
    const correctAnswers = nonNegativeInteger(
      rawScore.correctAnswers,
      quizAnswers.filter((answer) => answer.correct).length,
    );
    const totalQuestions = nonNegativeInteger(
      rawScore.totalQuestions,
      quizAnswers.length,
    );
    const percentage = Math.min(
      100,
      nonNegativeInteger(
        rawScore.percentage,
        totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0,
      ),
    );
    return [{
      id: candidate.id,
      lessonId: lesson.id,
      academy: lesson.academy,
      startedAt: typeof candidate.startedAt === "string" ? candidate.startedAt : "",
      completedAt:
        typeof candidate.completedAt === "string" ? candidate.completedAt : "",
      thinkResponse:
        typeof candidate.thinkResponse === "string" ? candidate.thinkResponse : "",
      quizAnswers,
      quizScore: { correctAnswers, totalQuestions, percentage },
      typingResult: {
        wpm: nonNegativeInteger(rawTyping.wpm),
        accuracy: Math.min(100, nonNegativeInteger(rawTyping.accuracy)),
        mistakes: nonNegativeInteger(rawTyping.mistakes),
        elapsedMs: nonNegativeInteger(rawTyping.elapsedMs),
        correctChars: nonNegativeInteger(rawTyping.correctChars),
        totalChars: nonNegativeInteger(rawTyping.totalChars),
      },
      xpEarned: nonNegativeInteger(candidate.xpEarned),
    } satisfies LessonAttempt];
  });
}

/** Migrate persisted demo progress field-by-field without discarding valid data. */
export function normalizeLocalProgress(value: unknown): LocalProgressState {
  const source = isRecord(value) ? value : {};
  return {
    lessonProgress: normalizeLessonProgress(source.lessonProgress),
    shortcutLessonProgress: normalizeShortcutLessonProgress(
      source.shortcutLessonProgress,
    ),
    shortcutSkillProgress: normalizeShortcutSkills(source.shortcutSkillProgress),
    academyAttempts: normalizeAcademyAttempts(source.academyAttempts),
  };
}
