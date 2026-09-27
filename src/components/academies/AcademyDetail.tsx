"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { AcademyIcon } from "./AcademyIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClasses } from "@/components/ui/Button";
import {
  getAcademyProgress,
  getCurriculumLevel,
  getLessonsByAcademy,
  getTypingLevel,
} from "@/lib/curriculum";
import type { Academy } from "@/lib/data/types";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export function AcademyDetail({ academy }: { academy: Academy }) {
  const { user } = useUserProgress();
  const lessons = getLessonsByAcademy(academy.id);
  const progress = getAcademyProgress(academy.id, user.completedLessonIds);

  return (
    <div className="space-y-7">
      <header className="warm-panel rounded-card border border-brand/15 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
              <AcademyIcon academy={academy.id} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">Academy</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink">{academy.name}</h1>
              <p className="mt-2 max-w-2xl text-ink-soft">{academy.description}</p>
            </div>
          </div>
          <div className="min-w-40 rounded-card border border-line bg-white p-4">
            <div className="flex justify-between text-xs font-semibold text-ink-faint">
              <span>Progress</span><span>{progress.percentage}%</span>
            </div>
            <ProgressBar value={progress.percentage} label={`${academy.name} progress`} />
          </div>
        </div>
      </header>

      {lessons.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {lessons.map((lesson) => {
            const complete = user.completedLessonIds.includes(lesson.id);
            return (
              <Card key={lesson.id} className="flex h-full flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={complete ? "success" : "brand"} icon={complete ? CheckCircle2 : undefined}>
                    {complete ? "Completed" : `Lesson ${lesson.sequence}`}
                  </Badge>
                  <Badge tone="neutral">{getTypingLevel(lesson.typingLevel)?.name} typing</Badge>
                  <Badge tone="neutral">{getCurriculumLevel(lesson.curriculumLevel)?.name} concept</Badge>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold tracking-tight text-ink">{lesson.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-ink-soft">{lesson.miniLesson}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                    <Clock3 className="size-4" aria-hidden />{lesson.estimatedTime} min
                  </span>
                  <Link href={`/lesson/${lesson.id}`} className={buttonClasses(complete ? "outline" : "primary", "sm")}>
                    {complete ? "Practice" : "Start"}<ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card className="border-dashed bg-surface-muted text-center">
          <h2 className="text-xl font-bold text-ink">Curriculum is being prepared</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
            This Academy is part of the shared architecture. Reviewed lessons can be added as content without building another player.
          </p>
          <Link href="/academies" className={buttonClasses("outline", "md", "mt-5")}>
            Explore other Academies
          </Link>
        </Card>
      )}
    </div>
  );
}
