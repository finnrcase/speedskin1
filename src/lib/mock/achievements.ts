/*
  Achievements are defined declaratively with an `isEarned` predicate evaluated
  against the learner's stats. Keeping the criteria as data (rather than a stored
  boolean) means the same definitions can later be evaluated against real
  Supabase-backed progress without changing the UI.
*/

export interface AchievementContext {
  lessonsCompleted: number;
  bestWpm: number;
  bestAccuracy: number;
  streakDays: number;
  pythonCompleted: number;
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  isEarned: (ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "first-lesson",
    title: "First Lesson",
    description: "Completed the first assigned lesson.",
    icon: "first-lesson",
    requirement: "Finish your first lesson",
    isEarned: (c) => c.lessonsCompleted >= 1,
  },
  {
    id: "five-lessons",
    title: "5 Lessons Complete",
    description: "Completed five lessons.",
    icon: "five-lessons",
    requirement: "Finish 5 lessons",
    isEarned: (c) => c.lessonsCompleted >= 5,
  },
  {
    id: "ten-lessons",
    title: "10 Lessons Complete",
    description: "Completed ten lessons.",
    icon: "ten-lessons",
    requirement: "Finish 10 lessons",
    isEarned: (c) => c.lessonsCompleted >= 10,
  },
  {
    id: "accuracy-90",
    title: "90% Accuracy",
    description: "Reached 90% accuracy in a lesson.",
    icon: "accuracy-90",
    requirement: "Reach 90% accuracy",
    isEarned: (c) => c.bestAccuracy >= 90,
  },
  {
    id: "accuracy-95",
    title: "95% Accuracy",
    description: "Reached 95% accuracy in a lesson.",
    icon: "accuracy-95",
    requirement: "Reach 95% accuracy",
    isEarned: (c) => c.bestAccuracy >= 95,
  },
  {
    id: "wpm-20",
    title: "20 WPM",
    description: "Reached 20 words per minute.",
    icon: "wpm-20",
    requirement: "Type at 20 WPM",
    isEarned: (c) => c.bestWpm >= 20,
  },
  {
    id: "wpm-30",
    title: "30 WPM",
    description: "Reached 30 words per minute.",
    icon: "wpm-30",
    requirement: "Type at 30 WPM",
    isEarned: (c) => c.bestWpm >= 30,
  },
  {
    id: "streak-7",
    title: "7 Day Streak",
    description: "Practiced seven days in a row.",
    icon: "streak-7",
    requirement: "Practice 7 days in a row",
    isEarned: (c) => c.streakDays >= 7,
  },
  {
    id: "python-beginner",
    title: "Python Beginner",
    description: "Finished the first Python lesson.",
    icon: "python-beginner",
    requirement: "Finish your first Python lesson",
    isEarned: (c) => c.pythonCompleted >= 1,
  },
];
