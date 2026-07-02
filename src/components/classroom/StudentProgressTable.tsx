import { Badge } from "@/components/ui/Badge";
import {
  evalContextFromStudent,
  evaluateAssignment,
  keyLabel,
} from "@/lib/classroom/evaluate";
import type { Assignment, Student, StudentStatus } from "@/lib/data/types";
import { shortcutLabel } from "@/lib/shortcuts/catalog";

const STATUS_META: Record<
  StudentStatus,
  { label: string; tone: "success" | "info" | "danger" }
> = {
  ahead: { label: "Ahead", tone: "success" },
  "on-track": { label: "On track", tone: "info" },
  "needs-practice": { label: "Needs practice", tone: "danger" },
};

interface StudentProgressTableProps {
  students: Student[];
  assignments: Assignment[];
  pythonTotal: number;
  shortcutTotal: number;
  onRemoveStudent?: (studentId: string) => void;
}

function homeworkDone(student: Student, assignments: Assignment[]): number {
  const ctx = evalContextFromStudent(student);
  return assignments.filter((a) => evaluateAssignment(ctx, a).complete).length;
}

function practiceLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

export function StudentProgressTable({
  students,
  assignments,
  pythonTotal,
  shortcutTotal,
  onRemoveStudent,
}: StudentProgressTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-line bg-surface shadow-[0_6px_18px_rgba(88,64,38,0.05)]">
      <table className="w-full min-w-[1080px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line bg-cream text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <th className="px-4 py-3">Student</th>
            <th className="px-3 py-3">Level</th>
            <th className="px-3 py-3">WPM</th>
            <th className="px-3 py-3">Acc.</th>
            <th className="px-3 py-3">Lessons</th>
            <th className="px-3 py-3">Practice</th>
            <th className="px-3 py-3">Last active</th>
            <th className="px-3 py-3">Weak keys</th>
            <th className="px-3 py-3">Python</th>
            <th className="px-3 py-3">Shortcuts</th>
            <th className="px-3 py-3">Mastery</th>
            <th className="px-3 py-3">Reaction</th>
            <th className="px-3 py-3">Missed shortcuts</th>
            <th className="px-3 py-3">Homework</th>
            {onRemoveStudent && <th className="px-3 py-3">Manage</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const status = STATUS_META[s.status];
            const done = homeworkDone(s, assignments);
            return (
              <tr
                key={s.id}
                className="border-b border-line align-middle transition-colors last:border-0 hover:bg-brand-tint/35"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand-dark"
                      aria-hidden
                    >
                      {s.avatar}
                    </span>
                    <div>
                      <div className="font-semibold text-ink">{s.name}</div>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums text-ink">{s.level}</td>
                <td className="px-3 py-3 font-semibold tabular-nums text-ink">
                  {s.wpm}
                </td>
                <td className="px-3 py-3 tabular-nums text-ink">{s.accuracy}%</td>
                <td className="px-3 py-3 tabular-nums text-ink">
                  {s.lessonsCompleted}
                </td>
                <td className="px-3 py-3 tabular-nums text-ink-soft">
                  {practiceLabel(s.practiceMinutes)}
                </td>
                <td className="px-3 py-3 text-ink-soft">{s.lastActive}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1">
                    {s.weakKeys.map((k) => (
                      <span
                        key={k}
                        className="rounded border border-line bg-cream px-1.5 py-0.5 text-xs font-semibold text-ink-soft"
                      >
                        {keyLabel(k)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 tabular-nums text-ink-soft">
                  {s.pythonLessonsCompleted}/{pythonTotal}
                </td>
                <td className="px-3 py-3 tabular-nums text-ink-soft">
                  {s.shortcutLessonsCompleted}/{shortcutTotal}
                </td>
                <td className="px-3 py-3 tabular-nums text-ink">
                  {s.shortcutMasteryPct}%
                </td>
                <td className="px-3 py-3 tabular-nums text-ink-soft">
                  {(s.shortcutAverageReactionMs / 1000).toFixed(1)}s
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.weakShortcuts.map((shortcutId) => (
                      <span
                        key={shortcutId}
                        className="rounded border border-line bg-cream px-1.5 py-0.5 text-xs font-semibold text-ink-soft"
                      >
                        {shortcutLabel(shortcutId)}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <span
                    className={
                      done === assignments.length && assignments.length > 0
                        ? "font-semibold text-success"
                        : "font-semibold text-ink-soft"
                    }
                  >
                    {done}/{assignments.length}
                  </span>
                </td>
                {onRemoveStudent && (
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => onRemoveStudent(s.id)}
                      className="rounded-button border border-line bg-white px-2 py-1 text-xs font-bold text-danger hover:border-danger/40"
                    >
                      Remove
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
