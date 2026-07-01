import { CalendarDays, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RequirementBadges } from "./RequirementBadges";
import {
  evalContextFromStudent,
  evaluateAssignment,
} from "@/lib/classroom/evaluate";
import type { Assignment, Student } from "@/lib/data/types";

interface AssignmentCompletionTableProps {
  assignments: Assignment[];
  students: Student[];
}

function formatDueDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function AssignmentCompletionTable({
  assignments,
  students,
}: AssignmentCompletionTableProps) {
  if (assignments.length === 0) {
    return (
      <Card className="warm-panel border-brand/15 text-center text-sm text-ink-soft">
        No assignments yet. Create one to track completion and give students a
        clear typing goal.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const completed = students.filter(
          (s) => evaluateAssignment(evalContextFromStudent(s), a).complete,
        ).length;
        const pct = students.length === 0 ? 0 : (completed / students.length) * 100;
        return (
          <Card
            key={a.id}
            className="space-y-4 hover:border-brand/20 hover:shadow-[0_12px_30px_rgba(88,64,38,0.08)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold tracking-tight text-ink">
                  {a.title}
                </h3>
                <Badge tone="neutral" icon={CalendarDays} className="mt-2">
                  Due {formatDueDate(a.dueDate)}
                </Badge>
              </div>
              <Badge tone={pct === 100 ? "success" : "brand"} icon={CheckCircle2}>
                {completed}/{students.length} complete
              </Badge>
            </div>
            <RequirementBadges assignment={a} />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">
                <span>Class completion</span>
                <span>{Math.round(pct)}%</span>
              </div>
              <ProgressBar
                value={pct}
                tone="success"
                label={`${a.title} completion`}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
