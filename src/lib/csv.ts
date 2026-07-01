import type { Student } from "@/lib/data/types";
import { formatWeakShortcuts, keyLabel } from "@/lib/classroom/evaluate";

/** Quote a field if it contains a comma, quote, or newline (RFC 4180). */
export function escapeCsvField(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Build a CSV string from rows. */
export function toCsv(rows: (string | number)[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(",")).join("\n");
}

/** Build the classroom roster CSV (header + one row per student). */
export function buildRosterCsv(
  students: Student[],
  pythonTotal: number,
  shortcutTotal: number,
): string {
  const header = [
    "Name",
    "Current Level",
    "Average WPM",
    "Average Accuracy",
    "Lessons Completed",
    "Practice Minutes",
    "Python Progress",
    "Shortcut Progress",
    "Shortcut Mastery",
    "Shortcut Reaction",
    "Most Missed Shortcuts",
    "Weak Keys",
    "Last Active",
  ];
  const rows = students.map((s) => [
    s.name,
    s.level,
    s.wpm,
    `${s.accuracy}%`,
    s.lessonsCompleted,
    s.practiceMinutes,
    `${s.pythonLessonsCompleted}/${pythonTotal}`,
    `${s.shortcutLessonsCompleted}/${shortcutTotal}`,
    `${s.shortcutMasteryPct}%`,
    `${s.shortcutAverageReactionMs}ms`,
    formatWeakShortcuts(s.weakShortcuts),
    s.weakKeys.map(keyLabel).join(" "),
    s.lastActive,
  ]);
  return toCsv([header, ...rows]);
}
