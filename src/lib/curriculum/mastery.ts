import type {
  AcademyId,
  CurriculumLesson,
  LessonAttempt,
  TypingLevel,
} from "@/lib/data/types";

export interface LessonMasteryResult {
  complete: boolean;
  mastered: boolean;
  successfulAttempts: number;
  requiredSuccessfulAttempts: number;
  bestAccuracy: number;
  bestQuizPercentage: number;
}

export function evaluateLessonMastery(
  lesson: CurriculumLesson,
  attempts: readonly LessonAttempt[],
): LessonMasteryResult {
  const lessonAttempts = attempts.filter((attempt) => attempt.lessonId === lesson.id);
  const successfulAttempts = lessonAttempts.filter(
    (attempt) =>
      attempt.typingResult.accuracy >= lesson.mastery.targetAccuracy &&
      attempt.quizScore.percentage >= lesson.mastery.targetQuizPercentage,
  ).length;

  return {
    complete: lessonAttempts.length > 0,
    mastered: successfulAttempts >= lesson.mastery.minimumSuccessfulAttempts,
    successfulAttempts,
    requiredSuccessfulAttempts: lesson.mastery.minimumSuccessfulAttempts,
    bestAccuracy: lessonAttempts.reduce(
      (best, attempt) => Math.max(best, attempt.typingResult.accuracy),
      0,
    ),
    bestQuizPercentage: lessonAttempts.reduce(
      (best, attempt) => Math.max(best, attempt.quizScore.percentage),
      0,
    ),
  };
}

export function isTypingSkillMastered({
  typingLevel,
  lessons,
  attempts,
  minimumDistinctLessons = 2,
}: {
  typingLevel: TypingLevel;
  lessons: readonly CurriculumLesson[];
  attempts: readonly LessonAttempt[];
  minimumDistinctLessons?: number;
}): boolean {
  if (minimumDistinctLessons < 1) return false;
  const qualifyingLessonIds = new Set(
    lessons
      .filter((lesson) => lesson.typingLevel === typingLevel)
      .filter((lesson) =>
        attempts.some(
          (attempt) =>
            attempt.lessonId === lesson.id &&
            attempt.typingResult.accuracy >= lesson.mastery.targetAccuracy,
        ),
      )
      .map((lesson) => lesson.id),
  );
  return qualifyingLessonIds.size >= minimumDistinctLessons;
}

export function getAcademyMasteryProgress(
  academy: AcademyId,
  lessons: readonly CurriculumLesson[],
  attempts: readonly LessonAttempt[],
) {
  const coreLessons = lessons.filter(
    (lesson) => lesson.academy === academy && lesson.isCore && lesson.status === "published",
  );
  const completed = coreLessons.filter(
    (lesson) => evaluateLessonMastery(lesson, attempts).complete,
  ).length;
  const mastered = coreLessons.filter(
    (lesson) => evaluateLessonMastery(lesson, attempts).mastered,
  ).length;
  return {
    academy,
    completed,
    mastered,
    total: coreLessons.length,
    completionPercentage: coreLessons.length
      ? Math.round((completed / coreLessons.length) * 100)
      : 0,
    masteryPercentage: coreLessons.length
      ? Math.round((mastered / coreLessons.length) * 100)
      : 0,
  };
}
