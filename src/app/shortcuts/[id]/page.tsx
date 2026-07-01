import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Command, Crown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ShortcutTrainer } from "@/components/shortcuts/ShortcutTrainer";
import {
  getShortcutDefinitions,
  getShortcutLessonById,
  getShortcutLessons,
  getShortcutSkillProgress,
} from "@/lib/data";
import { createShortcutSession } from "@/lib/shortcuts/session";

export const dynamic = "force-dynamic";

export default async function ShortcutLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lesson = getShortcutLessonById(id);
  if (!lesson) notFound();

  const lessons = getShortcutLessons();
  const next = lessons.find((item) => item.order === lesson.order + 1);
  const initialTasks = createShortcutSession(lesson);

  return (
    <div className="space-y-6">
      <Link
        href="/shortcuts"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="size-4" strokeWidth={1.8} aria-hidden />
        All shortcut levels
      </Link>

      <header className="warm-panel rounded-card border border-brand/15 p-5 shadow-[0_12px_30px_rgba(88,64,38,0.07)] sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={lesson.isBoss ? "info" : "brand"} icon={lesson.isBoss ? Crown : Command}>
            {lesson.isBoss ? "Boss level" : `Level ${lesson.level}`}
          </Badge>
          <Badge tone="neutral">{lesson.sessionLength} prompts</Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">{lesson.focus}</p>
      </header>

      <ShortcutTrainer
        lesson={lesson}
        shortcuts={getShortcutDefinitions()}
        initialTasks={initialTasks}
        initialProgress={getShortcutSkillProgress()}
        nextHref={next ? `/shortcuts/${next.id}` : undefined}
      />
    </div>
  );
}
