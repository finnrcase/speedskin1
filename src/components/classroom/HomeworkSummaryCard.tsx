"use client";

import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useClassroom } from "@/lib/classroom/ClassroomProvider";
import {
  evalContextFromUser,
  evaluateAssignment,
} from "@/lib/classroom/evaluate";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export function HomeworkSummaryCard() {
  const { ready, joinedClass, assignmentsForClass } = useClassroom();
  const { user } = useUserProgress();

  // Not joined (or pre-hydration): invite the student to join.
  if (!ready || !joinedClass) {
    return (
      <Link href="/homework" className="block">
        <Card className="flex items-center justify-between gap-4 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_30px_rgba(88,64,38,0.08)]">
          <div className="flex items-center gap-4">
            <span className="flex size-11 items-center justify-center rounded-full bg-brand-tint text-brand-dark" aria-hidden>
              <ClipboardCheck className="size-5" strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-ink">
                Join your class
              </h2>
              <p className="text-sm text-ink-soft">
                Enter your teacher&apos;s code to see assigned homework.
              </p>
            </div>
          </div>
          <ArrowRight className="size-5 text-brand" strokeWidth={1.8} aria-hidden />
        </Card>
      </Link>
    );
  }

  const assignments = assignmentsForClass(joinedClass.id);
  const ctx = evalContextFromUser(user);
  const done = assignments.filter((a) => evaluateAssignment(ctx, a).complete).length;
  const pct = assignments.length === 0 ? 0 : (done / assignments.length) * 100;

  return (
    <Link href="/homework" className="block">
      <Card className="space-y-3 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_30px_rgba(88,64,38,0.08)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-dark" aria-hidden>
              <ClipboardCheck className="size-5" strokeWidth={1.8} />
            </span>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              {joinedClass.name} homework
            </h2>
          </div>
          <span className="text-sm font-semibold text-ink-soft">
            {done}/{assignments.length} done
          </span>
        </div>
        <ProgressBar value={pct} tone="success" label="Homework complete" />
      </Card>
    </Link>
  );
}
