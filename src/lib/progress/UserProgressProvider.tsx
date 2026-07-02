"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CURRENT_USER } from "@/lib/mock/currentUser";
import { useAuth } from "@/lib/auth/AuthProvider";
import {
  getLessons,
  getShortcutLessons,
  type CurrentUser,
  type Lesson,
  type LessonProgress,
  type LessonStatus,
  type LessonTrack,
  type ShortcutAttempt,
  type ShortcutLesson,
  type ShortcutProgress,
  type ShortcutSkillProgress,
} from "@/lib/data";
import { defaultShortcutSkillProgress } from "@/lib/shortcuts/mastery";
import type { TypingResult } from "@/lib/typing/useTypingEngine";
import type {
  DbLessonStatus,
  DbLessonTrack,
  LessonProgressRow,
  ShortcutLessonProgressRow,
  ShortcutSkillProgressRow,
} from "@/lib/supabase/types";

interface LessonProgressRecord extends LessonProgress {
  track: LessonTrack;
  completedSessions: number;
  minutesPracticed: number;
}

interface UserProgressContextValue {
  ready: boolean;
  user: CurrentUser;
  lessonProgress: Record<string, LessonProgressRecord>;
  shortcutLessonProgress: Record<string, ShortcutProgress>;
  shortcutSkillProgress: ShortcutSkillProgress[];
  getLessonProgress: (lessonId: string) => LessonProgress;
  getShortcutLessonProgress: (lessonId: string) => ShortcutProgress;
  recordLessonResult: (lesson: Lesson, result: TypingResult) => void;
  recordShortcutAttempt: (
    lessonId: string,
    attempt: ShortcutAttempt,
    progress: ShortcutSkillProgress,
  ) => void;
  recordShortcutLessonResult: (
    lesson: ShortcutLesson,
    result: { accuracy: number; averageReactionMs: number | null },
  ) => void;
  summaryForUser: (userId?: string) => CurrentUser;
}

const UserProgressContext = createContext<UserProgressContextValue | null>(null);
const LOCAL_PROGRESS_PREFIX = "speedskin:progress:";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "SS";
}


function starsFor(result: TypingResult): 0 | 1 | 2 | 3 {
  if (result.accuracy >= 96 && result.wpm >= 25) return 3;
  if (result.accuracy >= 90) return 2;
  return 1;
}

function toDbTrack(track: LessonTrack): DbLessonTrack {
  return track;
}

function toDbStatus(status: LessonStatus): DbLessonStatus {
  return status;
}

function lessonRecordFromRow(row: LessonProgressRow): LessonProgressRecord {
  return {
    lessonId: row.lesson_id,
    status: row.status,
    bestWpm: row.best_wpm,
    bestAccuracy: row.best_accuracy,
    stars: Math.max(0, Math.min(3, row.stars)) as 0 | 1 | 2 | 3,
    track: row.track,
    completedSessions: row.completed_sessions,
    minutesPracticed: row.minutes_practiced,
  };
}

function shortcutSkillFromRow(row: ShortcutSkillProgressRow): ShortcutSkillProgress {
  return {
    shortcutId: row.shortcut_id as ShortcutSkillProgress["shortcutId"],
    correctAttempts: row.correct_attempts,
    incorrectAttempts: row.incorrect_attempts,
    averageReactionMs: row.average_reaction_ms,
    masteryState: row.mastery_state,
  };
}

function shortcutLessonFromRow(row: ShortcutLessonProgressRow): ShortcutProgress {
  return {
    lessonId: row.lesson_id,
    status: row.status,
    bestAccuracy: row.best_accuracy,
    averageReactionMs: row.average_reaction_ms,
    completedSessions: row.completed_sessions,
  };
}

function emptyLessonProgress(lesson: Lesson, completedOrder: number): LessonProgressRecord {
  let status: LessonStatus = "locked";
  if (lesson.order <= completedOrder + 1) {
    status = lesson.order === completedOrder + 1 ? "current" : "available";
  }
  return {
    lessonId: lesson.id,
    status,
    bestWpm: null,
    bestAccuracy: null,
    stars: 0,
    track: lesson.track,
    completedSessions: 0,
    minutesPracticed: 0,
  };
}

function emptyShortcutProgress(
  lesson: ShortcutLesson,
  completedOrder: number,
): ShortcutProgress {
  let status: LessonStatus = "locked";
  if (lesson.order <= completedOrder + 1) {
    status = lesson.order === completedOrder + 1 ? "current" : "available";
  }
  return {
    lessonId: lesson.id,
    status,
    bestAccuracy: null,
    averageReactionMs: null,
    completedSessions: 0,
  };
}

function mergeShortcutSkills(
  saved: ShortcutSkillProgress[],
): ShortcutSkillProgress[] {
  const savedMap = new Map(saved.map((item) => [item.shortcutId, item]));
  return defaultShortcutSkillProgress().map(
    (item) => savedMap.get(item.shortcutId) ?? item,
  );
}

function deriveUser({
  profileName,
  userId,
  lessonProgress,
  shortcutLessonProgress,
  shortcutSkillProgress,
}: {
  profileName: string;
  userId: string;
  lessonProgress: Record<string, LessonProgressRecord>;
  shortcutLessonProgress: Record<string, ShortcutProgress>;
  shortcutSkillProgress: ShortcutSkillProgress[];
}): CurrentUser {
  const lessons = getLessons();
  const completedLessons = Object.values(lessonProgress).filter(
    (p) => p.status === "completed",
  );
  const completedTyping = completedLessons.filter((p) => p.track === "basics");
  const completedPython = completedLessons.filter((p) => p.track === "python");
  const completedShortcuts = Object.values(shortcutLessonProgress).filter(
    (p) => p.status === "completed",
  );
  const completedLessonIds = completedLessons.map((p) => p.lessonId);
  const completedShortcutLessonIds = completedShortcuts.map((p) => p.lessonId);
  const wpmValues = completedLessons
    .map((p) => p.bestWpm)
    .filter((value): value is number => value !== null);
  const accuracyValues = completedLessons
    .map((p) => p.bestAccuracy)
    .filter((value): value is number => value !== null);
  const averageWpm = wpmValues.length
    ? Math.round(wpmValues.reduce((sum, value) => sum + value, 0) / wpmValues.length)
    : 0;
  const averageAccuracy = accuracyValues.length
    ? Math.round(
        accuracyValues.reduce((sum, value) => sum + value, 0) /
          accuracyValues.length,
      )
    : 100;
  const minutesPracticed = Object.values(lessonProgress).reduce(
    (sum, p) => sum + p.minutesPracticed,
    0,
  );
  const masteredShortcuts = shortcutSkillProgress.filter(
    (p) => p.masteryState === "Comfortable" || p.masteryState === "Mastered",
  ).length;
  const shortcutMasteryPct = shortcutSkillProgress.length
    ? Math.round((masteredShortcuts / shortcutSkillProgress.length) * 100)
    : 0;
  const reactionValues = shortcutSkillProgress
    .map((p) => p.averageReactionMs)
    .filter((value): value is number => value !== null);
  const shortcutAverageReactionMs = reactionValues.length
    ? Math.round(
        reactionValues.reduce((sum, value) => sum + value, 0) /
          reactionValues.length,
      )
    : 0;
  const weakShortcuts = [...shortcutSkillProgress]
    .filter((p) => p.incorrectAttempts > 0)
    .sort((a, b) => b.incorrectAttempts - a.incorrectAttempts)
    .slice(0, 3)
    .map((p) => p.shortcutId);
  const firstOpenLesson =
    lessons.find((lesson) => lessonProgress[lesson.id]?.status !== "completed") ??
    lessons[0];
  const highestCompletedLevel = completedTyping.reduce((max, progress) => {
    const lesson = lessons.find((item) => item.id === progress.lessonId);
    return lesson ? Math.max(max, lesson.level) : max;
  }, 1);

  return {
    id: userId,
    name: profileName,
    avatar: initials(profileName),
    level: highestCompletedLevel,
    streakDays: completedLessons.length ? 1 : 0,
    lessonsCompleted: completedLessons.length,
    completedLessonIds,
    pythonLessonsCompleted: completedPython.length,
    shortcutLessonsCompleted: completedShortcuts.length,
    completedShortcutLessonIds,
    shortcutMasteryPct,
    shortcutAverageReactionMs,
    totalLessons: lessons.length,
    averageWpm,
    averageAccuracy,
    minutesPracticed,
    weakKeys: [],
    weakShortcuts,
    currentLessonId: firstOpenLesson?.id ?? lessons[0]?.id ?? "",
  };
}

export function UserProgressProvider({ children }: { children: React.ReactNode }) {
  const { profile, status, supabase } = useAuth();
  const [lessonProgress, setLessonProgress] = useState<
    Record<string, LessonProgressRecord>
  >({});
  const [shortcutLessonProgress, setShortcutLessonProgress] = useState<
    Record<string, ShortcutProgress>
  >({});
  const [shortcutSkillProgress, setShortcutSkillProgress] = useState<
    ShortcutSkillProgress[]
  >(defaultShortcutSkillProgress());
  const [ready, setReady] = useState(false);

  const userId = profile?.id ?? "guest";
  const isDemoProfile = profile?.id.startsWith("demo-") ?? false;

  useEffect(() => {
    if (status !== "authenticated" || !profile) {
      const id = window.setTimeout(
        () => setReady(status === "signed-out" || status === "unconfigured"),
        0,
      );
      return () => window.clearTimeout(id);
    }

    let active = true;
    const activeProfile = profile;

    async function load() {
      if (!supabase || isDemoProfile) {
        try {
          const raw = window.localStorage.getItem(
            `${LOCAL_PROGRESS_PREFIX}${activeProfile.id}`,
          );
          if (raw) {
            const parsed = JSON.parse(raw) as {
              lessonProgress?: Record<string, LessonProgressRecord>;
              shortcutLessonProgress?: Record<string, ShortcutProgress>;
              shortcutSkillProgress?: ShortcutSkillProgress[];
            };
            if (!active) return;
            setLessonProgress(parsed.lessonProgress ?? {});
            setShortcutLessonProgress(parsed.shortcutLessonProgress ?? {});
            setShortcutSkillProgress(
              mergeShortcutSkills(parsed.shortcutSkillProgress ?? []),
            );
          }
        } catch {
          // Fall back to a fresh local progress state.
        }
        if (active) setReady(true);
        return;
      }

      const [lessonRows, shortcutLessonRows, shortcutSkillRows] =
        await Promise.all([
          supabase
            .from("lesson_progress")
            .select("*")
            .eq("user_id", activeProfile.id),
          supabase
            .from("shortcut_lesson_progress")
            .select("*")
            .eq("user_id", activeProfile.id),
          supabase
            .from("shortcut_skill_progress")
            .select("*")
            .eq("user_id", activeProfile.id),
        ]);

      if (!active) return;

      setLessonProgress(
        Object.fromEntries(
          (lessonRows.data ?? []).map((row) => {
            const record = lessonRecordFromRow(row);
            return [record.lessonId, record];
          }),
        ),
      );
      setShortcutLessonProgress(
        Object.fromEntries(
          (shortcutLessonRows.data ?? []).map((row) => {
            const record = shortcutLessonFromRow(row);
            return [record.lessonId, record];
          }),
        ),
      );
      setShortcutSkillProgress(
        mergeShortcutSkills(
          (shortcutSkillRows.data ?? []).map(shortcutSkillFromRow),
        ),
      );
      setReady(true);
    }

    void load();

    return () => {
      active = false;
    };
  }, [isDemoProfile, profile, status, supabase]);

  useEffect(() => {
    if (status !== "authenticated" || !profile) return;
    if (supabase && !isDemoProfile) return;
    try {
      window.localStorage.setItem(
        `${LOCAL_PROGRESS_PREFIX}${profile.id}`,
        JSON.stringify({
          lessonProgress,
          shortcutLessonProgress,
          shortcutSkillProgress,
        }),
      );
    } catch {
      // Persistence is best-effort.
    }
  }, [
    isDemoProfile,
    lessonProgress,
    profile,
    shortcutLessonProgress,
    shortcutSkillProgress,
    status,
    supabase,
  ]);

  const completedLessonOrder = useMemo(() => {
    const lessons = getLessons();
    return Object.values(lessonProgress).reduce((max, progress) => {
      if (progress.status !== "completed") return max;
      const lesson = lessons.find((item) => item.id === progress.lessonId);
      return lesson ? Math.max(max, lesson.order) : max;
    }, 0);
  }, [lessonProgress]);

  const completedShortcutOrder = useMemo(() => {
    const lessons = getShortcutLessons();
    return Object.values(shortcutLessonProgress).reduce((max, progress) => {
      if (progress.status !== "completed") return max;
      const lesson = lessons.find((item) => item.id === progress.lessonId);
      return lesson ? Math.max(max, lesson.order) : max;
    }, 0);
  }, [shortcutLessonProgress]);

  const getLessonProgress = useCallback(
    (lessonId: string): LessonProgressRecord => {
      const lesson = getLessons().find((item) => item.id === lessonId);
      if (!lesson) {
        return {
          lessonId,
          status: "available",
          bestWpm: null,
          bestAccuracy: null,
          stars: 0,
          track: "basics",
          completedSessions: 0,
          minutesPracticed: 0,
        };
      }
      return lessonProgress[lessonId] ?? emptyLessonProgress(lesson, completedLessonOrder);
    },
    [completedLessonOrder, lessonProgress],
  );

  const getShortcutLessonProgress = useCallback(
    (lessonId: string): ShortcutProgress => {
      const lesson = getShortcutLessons().find((item) => item.id === lessonId);
      if (!lesson) {
        return {
          lessonId,
          status: "available",
          bestAccuracy: null,
          averageReactionMs: null,
          completedSessions: 0,
        };
      }
      return (
        shortcutLessonProgress[lessonId] ??
        emptyShortcutProgress(lesson, completedShortcutOrder)
      );
    },
    [completedShortcutOrder, shortcutLessonProgress],
  );

  const recordLessonResult = useCallback(
    (lesson: Lesson, result: TypingResult) => {
      if (!profile) return;
      const existing = getLessonProgress(lesson.id);
      const minutes = Math.max(1, Math.round(result.elapsedMs / 60000));
      const nextRecord: LessonProgressRecord = {
        ...existing,
        lessonId: lesson.id,
        track: lesson.track,
        status: "completed",
        bestWpm: Math.max(existing.bestWpm ?? 0, result.wpm),
        bestAccuracy: Math.max(existing.bestAccuracy ?? 0, result.accuracy),
        stars: Math.max(existing.stars, starsFor(result)) as 0 | 1 | 2 | 3,
        completedSessions: existing.completedSessions + 1,
        minutesPracticed: existing.minutesPracticed + minutes,
      };
      const next = { ...lessonProgress, [lesson.id]: nextRecord };
      setLessonProgress(next);

      if (supabase && !isDemoProfile) {
        void supabase.from("lesson_progress").upsert(
          {
            user_id: profile.id,
            lesson_id: lesson.id,
            track: toDbTrack(lesson.track),
            status: toDbStatus(nextRecord.status),
            best_wpm: nextRecord.bestWpm,
            best_accuracy: nextRecord.bestAccuracy,
            stars: nextRecord.stars,
            completed_sessions: nextRecord.completedSessions,
            minutes_practiced: nextRecord.minutesPracticed,
          },
          { onConflict: "user_id,lesson_id" },
        );
        void supabase.from("progress_logs").insert({
          user_id: profile.id,
          lesson_id: lesson.id,
          track: toDbTrack(lesson.track),
          wpm: result.wpm,
          accuracy: result.accuracy,
          duration_seconds: Math.max(1, Math.round(result.elapsedMs / 1000)),
          mistakes: result.mistakes,
        });
      }
    },
    [getLessonProgress, isDemoProfile, lessonProgress, profile, supabase],
  );

  const recordShortcutAttempt = useCallback(
    (
      lessonId: string,
      attempt: ShortcutAttempt,
      progress: ShortcutSkillProgress,
    ) => {
      if (!profile) return;
      const nextSkills = mergeShortcutSkills(
        shortcutSkillProgress.map((item) =>
          item.shortcutId === progress.shortcutId ? progress : item,
        ),
      );
      setShortcutSkillProgress(nextSkills);

      if (supabase && !isDemoProfile) {
        void supabase.from("shortcut_skill_progress").upsert(
          {
            user_id: profile.id,
            shortcut_id: progress.shortcutId,
            correct_attempts: progress.correctAttempts,
            incorrect_attempts: progress.incorrectAttempts,
            average_reaction_ms: progress.averageReactionMs,
            mastery_state: progress.masteryState,
          },
          { onConflict: "user_id,shortcut_id" },
        );
        void supabase.from("shortcut_attempts").insert({
          user_id: profile.id,
          lesson_id: lessonId,
          shortcut_id: attempt.shortcutId,
          correct: attempt.correct,
          reaction_ms: attempt.reactionMs,
          expected_combo: attempt.expectedCombo,
          actual_combo: attempt.actualCombo,
        });
      }
    },
    [isDemoProfile, profile, shortcutSkillProgress, supabase],
  );

  const recordShortcutLessonResult = useCallback(
    (
      lesson: ShortcutLesson,
      result: { accuracy: number; averageReactionMs: number | null },
    ) => {
      if (!profile) return;
      const existing = getShortcutLessonProgress(lesson.id);
      const nextRecord: ShortcutProgress = {
        lessonId: lesson.id,
        status: "completed",
        bestAccuracy: Math.max(existing.bestAccuracy ?? 0, result.accuracy),
        averageReactionMs:
          result.averageReactionMs ?? existing.averageReactionMs ?? null,
        completedSessions: existing.completedSessions + 1,
      };
      const next = { ...shortcutLessonProgress, [lesson.id]: nextRecord };
      setShortcutLessonProgress(next);

      if (supabase && !isDemoProfile) {
        void supabase.from("shortcut_lesson_progress").upsert(
          {
            user_id: profile.id,
            lesson_id: lesson.id,
            status: toDbStatus(nextRecord.status),
            best_accuracy: nextRecord.bestAccuracy,
            average_reaction_ms: nextRecord.averageReactionMs,
            completed_sessions: nextRecord.completedSessions,
          },
          { onConflict: "user_id,lesson_id" },
        );
      }
    },
    [
      getShortcutLessonProgress,
      isDemoProfile,
      profile,
      shortcutLessonProgress,
      supabase,
    ],
  );

  const user = useMemo(() => {
    if (!profile) return CURRENT_USER;
    const allLessonProgress = Object.fromEntries(
      getLessons().map((lesson) => [lesson.id, getLessonProgress(lesson.id)]),
    );
    const allShortcutLessonProgress = Object.fromEntries(
      getShortcutLessons().map((lesson) => [
        lesson.id,
        getShortcutLessonProgress(lesson.id),
      ]),
    );
    return deriveUser({
      profileName: profile.fullName,
      userId,
      lessonProgress: allLessonProgress,
      shortcutLessonProgress: allShortcutLessonProgress,
      shortcutSkillProgress,
    });
  }, [
    getLessonProgress,
    getShortcutLessonProgress,
    profile,
    shortcutSkillProgress,
    userId,
  ]);

  const summaryForUser = useCallback(
    (targetUserId?: string) => {
      if (!targetUserId || targetUserId === user.id) return user;
      return CURRENT_USER;
    },
    [user],
  );

  const value = useMemo<UserProgressContextValue>(
    () => ({
      ready,
      user,
      lessonProgress,
      shortcutLessonProgress,
      shortcutSkillProgress,
      getLessonProgress,
      getShortcutLessonProgress,
      recordLessonResult,
      recordShortcutAttempt,
      recordShortcutLessonResult,
      summaryForUser,
    }),
    [
      getLessonProgress,
      getShortcutLessonProgress,
      lessonProgress,
      ready,
      recordLessonResult,
      recordShortcutAttempt,
      recordShortcutLessonResult,
      shortcutLessonProgress,
      shortcutSkillProgress,
      summaryForUser,
      user,
    ],
  );

  return (
    <UserProgressContext.Provider value={value}>
      {children}
    </UserProgressContext.Provider>
  );
}

export function useUserProgress() {
  const ctx = useContext(UserProgressContext);
  if (!ctx) {
    throw new Error("useUserProgress must be used within UserProgressProvider");
  }
  return ctx;
}
