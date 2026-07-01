/*
  Pure classroom helpers: assignment evaluation, the natural-language student
  summary, weak-key formatting, and class stats. No React/DOM — easy to test and
  reuse, and a clean seam for swapping mock data with Supabase later.
*/
import type {
  Assignment,
  AssignmentEvaluation,
  CurrentUser,
  EvalContext,
  Student,
} from "@/lib/data/types";
import { shortcutLabel } from "@/lib/shortcuts/catalog";

export function evalContextFromStudent(s: Student): EvalContext {
  return {
    level: numberOrZero(s.level),
    wpm: numberOrZero(s.wpm),
    accuracy: numberOrZero(s.accuracy),
    practiceMinutes: numberOrZero(s.practiceMinutes),
    pythonCompleted: numberOrZero(s.pythonLessonsCompleted),
    shortcutCompleted: numberOrZero(s.shortcutLessonsCompleted),
    shortcutMasteryPct: numberOrZero(s.shortcutMasteryPct),
  };
}

export function evalContextFromUser(u: CurrentUser): EvalContext {
  return {
    level: u.level,
    wpm: u.averageWpm,
    accuracy: u.averageAccuracy,
    practiceMinutes: u.minutesPracticed,
    pythonCompleted: u.pythonLessonsCompleted,
    shortcutCompleted: u.shortcutLessonsCompleted,
    shortcutMasteryPct: u.shortcutMasteryPct,
  };
}

/** Evaluate an assignment's requirements against a learner's stats. */
export function evaluateAssignment(
  ctx: EvalContext,
  a: Assignment,
): AssignmentEvaluation {
  const criteria: AssignmentEvaluation["criteria"] = [];

  if (a.requiredLevel !== undefined) {
    criteria.push({
      label: "Reach level",
      target: String(a.requiredLevel),
      actual: String(ctx.level),
      met: ctx.level >= a.requiredLevel,
    });
  }
  if (a.minWpm !== undefined) {
    criteria.push({
      label: "Typing speed",
      target: `${a.minWpm} WPM`,
      actual: `${ctx.wpm} WPM`,
      met: ctx.wpm >= a.minWpm,
    });
  }
  if (a.minAccuracy !== undefined) {
    criteria.push({
      label: "Accuracy",
      target: `${a.minAccuracy}%`,
      actual: `${ctx.accuracy}%`,
      met: ctx.accuracy >= a.minAccuracy,
    });
  }
  if (a.requiredMinutes !== undefined) {
    criteria.push({
      label: "Practice time",
      target: `${a.requiredMinutes} min`,
      actual: `${ctx.practiceMinutes} min`,
      met: ctx.practiceMinutes >= a.requiredMinutes,
    });
  }
  if (a.minPythonLessons !== undefined) {
    criteria.push({
      label: "Python lessons",
      target: String(a.minPythonLessons),
      actual: String(ctx.pythonCompleted),
      met: ctx.pythonCompleted >= a.minPythonLessons,
    });
  }
  if (a.minShortcutLessons !== undefined) {
    criteria.push({
      label: "Shortcut lessons",
      target: String(a.minShortcutLessons),
      actual: String(ctx.shortcutCompleted),
      met: ctx.shortcutCompleted >= a.minShortcutLessons,
    });
  }
  if (a.minShortcutMasteryPct !== undefined) {
    criteria.push({
      label: "Shortcut mastery",
      target: `${a.minShortcutMasteryPct}%`,
      actual: `${ctx.shortcutMasteryPct}%`,
      met: ctx.shortcutMasteryPct >= a.minShortcutMasteryPct,
    });
  }

  const metCount = criteria.filter((c) => c.met).length;
  const total = criteria.length;
  return {
    criteria,
    metCount,
    total,
    complete: total > 0 && metCount === total,
    progressPct: total === 0 ? 0 : Math.round((metCount / total) * 100),
  };
}

const KEY_NAMES: Record<string, string> = {
  ";": "semicolon",
  ",": "comma",
  ".": "period",
  "/": "slash",
  "'": "apostrophe",
  "-": "hyphen",
  "=": "equals",
  "[": "left bracket",
  "]": "right bracket",
  " ": "space",
};

/** Turn a raw key into a readable label ("q" -> "Q", ";" -> "semicolon"). */
export function keyLabel(key: string): string {
  if (KEY_NAMES[key]) return KEY_NAMES[key];
  return /[a-z]/i.test(key) ? key.toUpperCase() : key;
}

/** Join readable key labels: "Q, P, and semicolon". */
export function formatWeakKeys(keys: string[]): string {
  const labels = keys.map(keyLabel);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export function formatWeakShortcuts(ids: Student["weakShortcuts"]): string {
  const labels = shortcutList(ids).map(shortcutLabel);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

const TREND: Record<Student["status"], string> = {
  ahead: "is improving quickly",
  "on-track": "is making steady progress",
  "needs-practice": "could use some extra practice",
};

/**
 * Plain-language progress summary, e.g.
 * "Ava is improving quickly, averaging 28 WPM with 92% accuracy.
 *  Main weak keys: Q, P, and semicolon."
 */
export function summarizeStudent(s: Student): string {
  const firstName = s.name.split(" ")[0];
  const weakKeys = Array.isArray(s.weakKeys) ? s.weakKeys : [];
  const weakShortcuts = shortcutList(s.weakShortcuts);
  const trend = TREND[s.status] ?? TREND["on-track"];
  let summary = `${firstName} ${trend}, averaging ${numberOrZero(s.wpm)} WPM with ${numberOrZero(s.accuracy)}% accuracy.`;
  if (weakKeys.length > 0) {
    summary += ` Main weak keys: ${formatWeakKeys(weakKeys)}.`;
  }
  if (weakShortcuts.length > 0) {
    summary += ` Shortcut focus: ${formatWeakShortcuts(weakShortcuts)}.`;
  }
  return summary;
}

export interface ClassStats {
  averageWpm: number;
  averageAccuracy: number;
  activeToday: number;
  totalPracticeMinutes: number;
  studentCount: number;
  averageShortcutMasteryPct: number;
  averageShortcutReactionMs: number;
  mostMissedShortcuts: Student["weakShortcuts"];
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function numberOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function shortcutList(value: unknown): Student["weakShortcuts"] {
  return Array.isArray(value) ? (value as Student["weakShortcuts"]) : [];
}

export function computeClassStats(students: Student[]): ClassStats {
  const shortcutCounts = new Map<Student["weakShortcuts"][number], number>();
  for (const student of students) {
    for (const shortcutId of shortcutList(student.weakShortcuts)) {
      shortcutCounts.set(shortcutId, (shortcutCounts.get(shortcutId) ?? 0) + 1);
    }
  }

  return {
    averageWpm: average(students.map((s) => numberOrZero(s.wpm))),
    averageAccuracy: average(students.map((s) => numberOrZero(s.accuracy))),
    activeToday: students.filter((s) => /today|min ago/i.test(s.lastActive))
      .length,
    totalPracticeMinutes: students.reduce(
      (sum, s) => sum + numberOrZero(s.practiceMinutes),
      0,
    ),
    studentCount: students.length,
    averageShortcutMasteryPct: average(
      students.map((s) => numberOrZero(s.shortcutMasteryPct)),
    ),
    averageShortcutReactionMs: average(
      students.map((s) => numberOrZero(s.shortcutAverageReactionMs)),
    ),
    mostMissedShortcuts: [...shortcutCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([shortcutId]) => shortcutId),
  };
}
