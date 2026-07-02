import type { CurrentUser } from "@/lib/data/types";

export const CURRENT_USER: CurrentUser = {
  id: "me",
  name: "Jordan",
  avatar: "JD",
  level: 4,
  streakDays: 6,
  lessonsCompleted: 3,
  completedLessonIds: [
    "l1-home-row-letters",
    "l2-home-row-words",
    "l3-top-bottom-rows",
  ],
  pythonLessonsCompleted: 0,
  shortcutLessonsCompleted: 1,
  completedShortcutLessonIds: ["shortcut-l1-copy"],
  shortcutMasteryPct: 20,
  shortcutAverageReactionMs: 1430,
  totalLessons: 13,
  averageWpm: 29,
  averageAccuracy: 95,
  minutesPracticed: 84,
  weakKeys: ["q", "z", ";"],
  weakShortcuts: ["undo", "paste"],
  currentLessonId: "l4-capital-letters",
};
