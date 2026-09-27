import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, Timer } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LessonRunner } from "@/components/lessons/LessonRunner";
import { AcademyLessonRunner } from "@/components/lessons/AcademyLessonRunner";
import { generatePrompt } from "@/lib/typing/prompt-generator";
import { getLessonById, getLessons } from "@/lib/data";
import {
  getAcademyById,
  getCurriculumLessonById,
} from "@/lib/curriculum";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getLessonById(id);
  if (!lesson) notFound();

  const curriculumLesson = getCurriculumLessonById(lesson.id);
  if (curriculumLesson) {
    const academy = getAcademyById(curriculumLesson.academy);
    return (
      <div className="space-y-6">
        <Link
          href="/academies"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden />
          All Academies
        </Link>

        <header className="warm-panel rounded-card border border-brand/15 p-5 shadow-[0_12px_30px_rgba(88,64,38,0.07)] sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="brand">{academy.name}</Badge>
            <Badge tone="neutral">{curriculumLesson.gradeBand}</Badge>
            <Badge tone="info">{curriculumLesson.estimatedTime} min</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
            {curriculumLesson.title}
          </h1>
          <p className="mt-2 max-w-2xl text-ink-soft">
            {curriculumLesson.specificTopic} · {curriculumLesson.typingObjective}
          </p>
        </header>

        <AcademyLessonRunner
          key={curriculumLesson.id}
          lesson={curriculumLesson}
          academyName={academy.shortName}
        />
      </div>
    );
  }

  const lessons = getLessons();
  const next = lessons.find((l) => l.order === lesson.order + 1);

  // Seed the first prompt on the server so SSR and hydration agree; the client
  // generates fresh random prompts on retry / shuffle from then on.
  const initialPrompt = generatePrompt({
    category: lesson.category,
    promptType: lesson.promptType,
    topic: lesson.promptTopic,
  });

  return (
    <div className="space-y-6">
      <Link
        href="/lesson"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden />
        All lessons
      </Link>

      <header className="warm-panel rounded-card border border-brand/15 p-5 shadow-[0_12px_30px_rgba(88,64,38,0.07)] sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="brand">Level {lesson.level}</Badge>
          {lesson.promptType === "python" && (
            <Badge tone="info" icon={Code2}>
              Python
            </Badge>
          )}
          {lesson.timeLimitSeconds && (
            <Badge tone="info" icon={Timer}>
              Timed challenge
            </Badge>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{lesson.focus}</p>
        {lesson.promptType === "python" && (
          <p className="mt-4 rounded-button border border-white/70 bg-white/75 px-3 py-2 text-sm text-ink-soft">
            Typing practice for coding syntax — not a code editor. Just build
            muscle memory for the symbols you’ll use when you program.
          </p>
        )}
      </header>

      <LessonRunner
        lesson={lesson}
        category={lesson.category}
        promptType={lesson.promptType}
        topic={lesson.promptTopic}
        initialPrompt={initialPrompt}
        timeLimitSeconds={lesson.timeLimitSeconds}
        nextHref={next ? `/lesson/${next.id}` : undefined}
      />
    </div>
  );
}
