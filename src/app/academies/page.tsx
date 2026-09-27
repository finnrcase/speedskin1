"use client";

import Link from "next/link";
import { ArrowRight, Dices } from "lucide-react";
import { AcademyIcon } from "@/components/academies/AcademyIcon";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClasses } from "@/components/ui/Button";
import { getAcademies, getAcademyProgress } from "@/lib/curriculum";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export default function AcademiesPage() {
  const { user } = useUserProgress();

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academy mode"
        title="Eight Academies. One way to learn."
        subtitle="Learn a useful idea, type it, apply it, and check your understanding."
        actions={
          <Link href="/free-play" className={buttonClasses("outline", "md")}>
            <Dices className="size-4" aria-hidden />
            Free Play
          </Link>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {getAcademies().map((academy) => {
          const progress = getAcademyProgress(academy.id, user.completedLessonIds);
          const action = progress.total === 0
            ? "Preview Academy"
            : progress.completed === 0
              ? "Start Academy"
              : progress.completed === progress.total
                ? "Practice again"
                : "Continue";
          return (
            <Card key={academy.id} className="flex h-full flex-col gap-4 hover:border-brand/25">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand-dark">
                <AcademyIcon academy={academy.id} />
              </span>
              <div className="flex-1">
                <h2 className="text-lg font-bold tracking-tight text-ink">{academy.name}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-soft">{academy.description}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-ink-faint">
                  <span>{progress.completed}/{progress.total} lessons</span>
                  <span>{progress.percentage}%</span>
                </div>
                <ProgressBar value={progress.percentage} label={`${academy.name} progress`} />
              </div>
              <Link href={`/academies/${academy.id}`} className={buttonClasses("secondary", "md", "w-full")}>
                {action}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
