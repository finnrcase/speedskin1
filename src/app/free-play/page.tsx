"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Dices, Search } from "lucide-react";
import { AcademyIcon } from "@/components/academies/AcademyIcon";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  GRADE_BANDS,
  TYPING_LEVELS,
  getAcademies,
  getFreePlayLessons,
  getSurpriseLesson,
  getTypingLevel,
} from "@/lib/curriculum";
import type { AcademyId, GradeBand, TypingLevel } from "@/lib/data/types";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export default function FreePlayPage() {
  const { user, academyAttempts } = useUserProgress();
  const [academy, setAcademy] = useState<AcademyId | "all">("all");
  const [gradeBand, setGradeBand] = useState<GradeBand | "all">("all");
  const [typingLevel, setTypingLevel] = useState<TypingLevel | "all">("all");
  const [search, setSearch] = useState("");
  const filters = useMemo(
    () => ({
      academy: academy === "all" ? undefined : academy,
      gradeBand: gradeBand === "all" ? undefined : gradeBand,
      typingLevel: typingLevel === "all" ? undefined : typingLevel,
      search,
    }),
    [academy, gradeBand, search, typingLevel],
  );
  const lessons = getFreePlayLessons(filters, user.completedLessonIds);
  const surprise = useMemo(
    () =>
      getSurpriseLesson(
        user.completedLessonIds,
        Math.random,
        filters,
        academyAttempts[0]?.lessonId,
      ),
    [academyAttempts, filters, user.completedLessonIds],
  );

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Free Play"
        title="Choose an extra practice"
        subtitle="Explore the same Academy curriculum at your own pace."
        actions={surprise ? (
          <Link href={`/lesson/${surprise.id}`} className={buttonClasses("primary", "md")}>
            <Dices className="size-4" aria-hidden />Surprise me
          </Link>
        ) : undefined}
      />

      <Card className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_2fr]">
        <label className="space-y-1 text-sm font-semibold text-ink-soft">
          Academy
          <select value={academy} onChange={(event) => setAcademy(event.target.value as AcademyId | "all")} className="h-11 w-full rounded-button border border-line bg-white px-3 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30">
            <option value="all">All Academies</option>
            {getAcademies().map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold text-ink-soft">
          Grade band
          <select value={gradeBand} onChange={(event) => setGradeBand(event.target.value as GradeBand | "all")} className="h-11 w-full rounded-button border border-line bg-white px-3 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30">
            <option value="all">Any grade band</option>
            {GRADE_BANDS.filter((band) => band.id !== "any").map((band) => (
              <option key={band.id} value={band.id}>{band.grades}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold text-ink-soft">
          Typing skill
          <select value={typingLevel} onChange={(event) => setTypingLevel(event.target.value as TypingLevel | "all")} className="h-11 w-full rounded-button border border-line bg-white px-3 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30">
            <option value="all">Any typing level</option>
            {TYPING_LEVELS.map((level) => (
              <option key={level.id} value={level.id}>Level {level.level}: {level.name}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm font-semibold text-ink-soft">
          Lesson or topic
          <span className="relative block">
            <Search className="absolute left-3 top-3.5 size-4 text-ink-faint" aria-hidden />
            <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-11 w-full rounded-button border border-line bg-white pl-10 pr-3 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30" placeholder="Search topics" />
          </span>
        </label>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="flex h-full flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand-dark"><AcademyIcon academy={lesson.academy} className="size-5" /></span>
              <Badge tone="neutral">{getTypingLevel(lesson.typingLevel)?.name}</Badge>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-ink">{lesson.title}</h2>
              <p className="mt-1 text-sm text-ink-soft">{lesson.specificTopic}</p>
            </div>
            <Link href={`/lesson/${lesson.id}`} className={buttonClasses("secondary", "md", "w-full")}>
              Practice<ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        ))}
      </section>
      {!lessons.length && (
        <Card className="text-center">
          <p className="font-semibold text-ink">No unlocked lessons match those filters.</p>
          <Button variant="ghost" className="mt-3" onClick={() => { setAcademy("all"); setGradeBand("all"); setTypingLevel("all"); setSearch(""); }}>Clear filters</Button>
        </Card>
      )}
    </div>
  );
}
