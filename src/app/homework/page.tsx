"use client";

import { useState } from "react";
import { CalendarDays, CheckCircle2, Circle, ClipboardCheck, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RequirementBadges } from "@/components/classroom/RequirementBadges";
import { useClassroom } from "@/lib/classroom/ClassroomProvider";
import {
  evalContextFromUser,
  evaluateAssignment,
} from "@/lib/classroom/evaluate";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";
import type { Assignment } from "@/lib/data/types";

function formatDueDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function HomeworkPage() {
  const { ready, joinedClass, joinClass, leaveClass, assignmentsForClass } =
    useClassroom();
  const { user } = useUserProgress();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await joinClass(code);
    if (!result.ok) {
      setError("We couldn't find a class with that code. Check it and try again.");
      return;
    }
    setError(null);
    setCode("");
  };

  if (!ready) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Homework" title="My homework" />
        <Card className="text-center text-ink-soft">Loading…</Card>
      </div>
    );
  }

  if (!joinedClass) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Homework"
          title="Join your class"
          subtitle="Enter the class code from your teacher to see your assigned homework."
        />
        <Card className="warm-panel mx-auto w-full max-w-md space-y-5 border-brand/15">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_18px_rgba(249,115,22,0.18)]">
              <KeyRound className="size-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div>
              <h2 className="font-bold text-ink">Enter your class code</h2>
              <p className="text-sm text-ink-soft">
                Your teacher will share it in class.
              </p>
            </div>
          </div>
          <form onSubmit={handleJoin} className="space-y-3">
            <label className="block space-y-1 text-sm font-semibold text-ink-soft">
              Class code
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SPEED-0000"
                aria-label="Class code"
                className="h-12 w-full rounded-button border border-line bg-surface px-4 text-center text-lg font-bold uppercase tracking-wider text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </label>
            {error && <p className="text-sm font-semibold text-danger">{error}</p>}
            <Button type="submit" size="lg" className="w-full">
              Join class
            </Button>
          </form>
          <p className="rounded-button bg-white/70 px-3 py-2 text-center text-xs text-ink-faint">
            Ask your teacher for your class code.
          </p>
        </Card>
      </div>
    );
  }

  const assignments = assignmentsForClass(joinedClass.id);
  const ctx = evalContextFromUser(user);
  const completedCount = assignments.filter(
    (a) => evaluateAssignment(ctx, a).complete,
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Homework"
        title={joinedClass.name}
        subtitle={`${completedCount} of ${assignments.length} assignments complete`}
        actions={
          <Button variant="ghost" onClick={leaveClass}>
            Leave class
          </Button>
        }
      />

      {assignments.length === 0 ? (
        <Card className="warm-panel border-brand/15 text-center text-ink-soft">
          No homework assigned yet. Practice is still available from the lesson library.
        </Card>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <HomeworkCard key={a.id} assignment={a} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  );
}

function HomeworkCard({
  assignment,
  ctx,
}: {
  assignment: Assignment;
  ctx: ReturnType<typeof evalContextFromUser>;
}) {
  const evaluation = evaluateAssignment(ctx, assignment);

  return (
    <Card className="space-y-4 hover:border-brand/20 hover:shadow-[0_12px_30px_rgba(88,64,38,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-tint text-brand-dark">
              <ClipboardCheck className="size-4" strokeWidth={1.8} aria-hidden />
            </span>
            <h3 className="text-lg font-bold tracking-tight text-ink">
              {assignment.title}
            </h3>
          </div>
          <Badge tone="neutral" icon={CalendarDays} className="mt-2">
            Due {formatDueDate(assignment.dueDate)}
          </Badge>
        </div>
        {evaluation.complete ? (
          <Badge tone="success" icon={CheckCircle2}>
            Complete
          </Badge>
        ) : (
          <Badge tone="brand">In progress</Badge>
        )}
      </div>

      <RequirementBadges assignment={assignment} />

      <ProgressBar
        value={evaluation.progressPct}
        tone={evaluation.complete ? "success" : "brand"}
        label={`${assignment.title} progress`}
      />

      <ul className="space-y-1.5">
        {evaluation.criteria.map((c) => (
          <li
            key={c.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-ink-soft">
              {c.met ? (
                <CheckCircle2
                  className="size-4 text-brand"
                  strokeWidth={1.8}
                  aria-hidden
                />
              ) : (
                <Circle
                  className="size-4 text-ink-faint"
                  strokeWidth={1.8}
                  aria-hidden
                />
              )}
              {c.label}
            </span>
            <span
              className={
                c.met
                  ? "font-semibold text-success"
                  : "font-semibold text-ink-soft"
              }
            >
              {c.actual} / {c.target}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
