/*
  Repository layer. Pages import from here, never from `@/lib/mock` directly, so
  that swapping the mock source for Supabase queries later is a localized change.
  Functions are intentionally simple/synchronous for the mock phase.
*/
import { LESSONS, LESSON_PROGRESS } from "@/lib/mock/lessons";
import {
  SHORTCUT_PROGRESS,
  SHORTCUT_SKILL_PROGRESS,
} from "@/lib/mock/shortcuts";
import {
  SHORTCUT_LESSONS,
  SHORTCUTS,
  SHORTCUT_LESSON_COUNT,
} from "@/lib/shortcuts/catalog";
import {
  ACHIEVEMENT_DEFS,
  type AchievementContext,
} from "@/lib/mock/achievements";
import { CURRENT_USER } from "@/lib/mock/currentUser";
import type {
  Achievement,
  CurrentUser,
  Lesson,
  LessonProgress,
  LessonTrack,
  ShortcutDefinition,
  ShortcutId,
  ShortcutLesson,
  ShortcutProgress,
  ShortcutSkillProgress,
} from "./types";

export function getLessons(): Lesson[] {
  return [...LESSONS].sort((a, b) => a.order - b.order);
}

export function getLessonsByTrack(track: LessonTrack): Lesson[] {
  return getLessons().filter((lesson) => lesson.track === track);
}

export function getPythonLessons(): Lesson[] {
  return getLessonsByTrack("python");
}

export const PYTHON_LESSON_COUNT = LESSONS.filter(
  (l) => l.track === "python",
).length;

export { SHORTCUT_LESSON_COUNT };

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}

export function getLessonProgress(id: string): LessonProgress | undefined {
  return LESSON_PROGRESS[id];
}

export function getAllProgress(): Record<string, LessonProgress> {
  return LESSON_PROGRESS;
}

export function getShortcutLessons(): ShortcutLesson[] {
  return [...SHORTCUT_LESSONS].sort((a, b) => a.order - b.order);
}

export function getShortcutLessonById(id: string): ShortcutLesson | undefined {
  return SHORTCUT_LESSONS.find((lesson) => lesson.id === id);
}

export function getShortcutLessonProgress(
  id: string,
): ShortcutProgress | undefined {
  return SHORTCUT_PROGRESS[id];
}

export function getShortcutDefinitions(): ShortcutDefinition[] {
  return Object.values(SHORTCUTS);
}

export function getShortcutDefinition(id: ShortcutId): ShortcutDefinition {
  return SHORTCUTS[id];
}

export function getShortcutSkillProgress(): ShortcutSkillProgress[] {
  return Object.values(SHORTCUT_SKILL_PROGRESS);
}

export function getCurrentUser(): CurrentUser {
  return CURRENT_USER;
}

export function getCurrentLesson(): Lesson | undefined {
  return getLessonById(CURRENT_USER.currentLessonId);
}

function maxProgressValue(field: "bestWpm" | "bestAccuracy"): number {
  return Object.values(LESSON_PROGRESS).reduce((max, p) => {
    const value = p[field];
    return value !== null && value > max ? value : max;
  }, 0);
}

function buildAchievementContext(): AchievementContext {
  const user = getCurrentUser();
  const pythonCompleted = getPythonLessons().filter(
    (lesson) => getLessonProgress(lesson.id)?.status === "completed",
  ).length;

  return {
    lessonsCompleted: user.lessonsCompleted,
    bestWpm: maxProgressValue("bestWpm"),
    bestAccuracy: maxProgressValue("bestAccuracy"),
    streakDays: user.streakDays,
    pythonCompleted,
  };
}

export function getAchievements(): Achievement[] {
  const ctx = buildAchievementContext();
  return ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    requirement: def.requirement,
    earned: def.isEarned(ctx),
  }));
}

export * from "./types";
