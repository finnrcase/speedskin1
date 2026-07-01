import type {
  ShortcutProgress,
  ShortcutSkillProgress,
} from "@/lib/data/types";
import { SHORTCUT_LESSONS, SHORTCUTS } from "@/lib/shortcuts/catalog";
import { masteryStateFor } from "@/lib/shortcuts/mastery";

function lessonProgress(
  lessonId: string,
  status: ShortcutProgress["status"],
  bestAccuracy: number | null = null,
  averageReactionMs: number | null = null,
  completedSessions = 0,
): ShortcutProgress {
  return {
    lessonId,
    status,
    bestAccuracy,
    averageReactionMs,
    completedSessions,
  };
}

function skillProgress(
  shortcutId: ShortcutSkillProgress["shortcutId"],
  correctAttempts: number,
  incorrectAttempts: number,
  averageReactionMs: number | null,
): ShortcutSkillProgress {
  return {
    shortcutId,
    correctAttempts,
    incorrectAttempts,
    averageReactionMs,
    masteryState: masteryStateFor({
      correctAttempts,
      incorrectAttempts,
      averageReactionMs,
    }),
  };
}

export const SHORTCUT_PROGRESS: Record<string, ShortcutProgress> = {
  "shortcut-l1-copy": lessonProgress("shortcut-l1-copy", "completed", 96, 1180, 2),
  "shortcut-l2-copy-paste": lessonProgress(
    "shortcut-l2-copy-paste",
    "current",
    88,
    1420,
    1,
  ),
  "shortcut-l3-undo": lessonProgress("shortcut-l3-undo", "available"),
  "shortcut-boss-core": lessonProgress("shortcut-boss-core", "locked"),
  "shortcut-l4-editing": lessonProgress("shortcut-l4-editing", "locked"),
  "shortcut-l5-browser": lessonProgress("shortcut-l5-browser", "locked"),
  "shortcut-boss-all": lessonProgress("shortcut-boss-all", "locked"),
};

export const SHORTCUT_SKILL_PROGRESS: Record<
  ShortcutSkillProgress["shortcutId"],
  ShortcutSkillProgress
> = {
  copy: skillProgress("copy", 9, 1, 980),
  paste: skillProgress("paste", 4, 2, 1540),
  undo: skillProgress("undo", 2, 2, 1880),
  cut: skillProgress("cut", 0, 0, null),
  redo: skillProgress("redo", 0, 0, null),
  "select-all": skillProgress("select-all", 0, 0, null),
  save: skillProgress("save", 0, 0, null),
  find: skillProgress("find", 0, 0, null),
  "new-tab": skillProgress("new-tab", 0, 0, null),
  "close-tab": skillProgress("close-tab", 0, 0, null),
};

export const SHORTCUT_TOTAL_SKILLS = Object.keys(SHORTCUTS).length;
export const SHORTCUT_TOTAL_LESSONS = SHORTCUT_LESSONS.length;
