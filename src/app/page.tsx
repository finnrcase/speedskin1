"use client";

import Link from "next/link";
import { ArrowRight, Code2, Command, Flame, Gauge, HeartPulse, Sparkles, Target } from "lucide-react";
import { AcademyIcon } from "@/components/academies/AcademyIcon";
import { HomeworkSummaryCard } from "@/components/classroom/HomeworkSummaryCard";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { buttonClasses } from "@/components/ui/Button";
import { getAcademies, getAcademyById, getAcademyProgress, getNextAcademyLesson } from "@/lib/curriculum";
import { getLessonsByTrack, getShortcutLessons } from "@/lib/data";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";

export default function DashboardPage() {
  const { user, xp, keyboardHealth, getLessonProgress, getShortcutLessonProgress } = useUserProgress();
  const nextLesson = getNextAcademyLesson(user.completedLessonIds);
  const nextAcademy = nextLesson ? getAcademyById(nextLesson.academy) : null;
  const academyLessons = getAcademies().reduce((sum, academy) => sum + getAcademyProgress(academy.id, []).total, 0);
  const completedAcademyLessons = getAcademies().reduce(
    (sum, academy) => sum + getAcademyProgress(academy.id, user.completedLessonIds).completed,
    0,
  );
  const overallPct = academyLessons ? Math.round((completedAcademyLessons / academyLessons) * 100) : 0;
  const nextPython = getLessonsByTrack("python").find((lesson) => getLessonProgress(lesson.id).status !== "completed");
  const nextShortcut = getShortcutLessons().find((lesson) => getShortcutLessonProgress(lesson.id).status !== "completed");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-brand">Academy mode</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink">Ready for today, {user.name}?</h1>
        <p className="text-ink-soft">One useful lesson. About five focused minutes.</p>
      </header>

      <Card as="section" className="border-brand/20 bg-brand-tint/55 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
              {nextLesson ? <AcademyIcon academy={nextLesson.academy} /> : <Sparkles className="size-6" aria-hidden />}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-dark">{nextAcademy?.name ?? "Academy review"}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{nextLesson?.title ?? "You completed every published lesson"}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">{nextLesson?.miniLesson ?? "Choose an Academy to practice a lesson again."}</p>
            </div>
          </div>
          <Link href={nextLesson ? `/lesson/${nextLesson.id}` : "/academies"} className={buttonClasses("primary", "lg", "shrink-0")}>
            {nextLesson ? "Continue lesson" : "Browse Academies"}<ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={Gauge} label="Typing speed" value={`${user.averageWpm} WPM`} />
        <Metric icon={Target} label="Accuracy" value={`${user.averageAccuracy}%`} />
        <Metric icon={HeartPulse} label="Keyboard Health" value={`${keyboardHealth}`} />
        <Metric icon={Sparkles} label="XP earned" value={`${xp}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">All Academies</p><h2 className="mt-1 text-xl font-bold text-ink">Overall progress</h2></div>
            <Link href="/academies" className="text-sm font-semibold text-brand">View all</Link>
          </div>
          <ProgressBar value={overallPct} label="Overall Academy progress" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {getAcademies().map((academy) => {
              const progress = getAcademyProgress(academy.id, user.completedLessonIds);
              return (
                <Link key={academy.id} href={`/academies/${academy.id}`} className="rounded-button border border-line bg-cream p-3 hover:border-brand/25">
                  <div className="flex items-center gap-2 text-sm font-bold text-ink"><AcademyIcon academy={academy.id} className="size-4 text-brand" />{academy.shortName}</div>
                  <p className="mt-1 text-xs text-ink-faint">{progress.completed}/{progress.total} complete</p>
                </Link>
              );
            })}
          </div>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-full bg-brand-tint text-brand-dark"><Flame className="size-5" aria-hidden /></span><div><p className="text-2xl font-bold text-ink">{user.streakDays} days</p><p className="text-sm text-ink-soft">Current learning streak</p></div></div>
          <p className="text-sm leading-6 text-ink-soft">Keyboard Health is 70% accuracy, 20% Academy progress, and 10% weak-key health.</p>
        </Card>
      </section>

      <section className="space-y-4"><h2 className="text-2xl font-bold tracking-tight text-ink">Homework due</h2><HomeworkSummaryCard /></section>

      <section className="space-y-4 border-t border-line pt-7">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-faint">Specialized practice</p><h2 className="mt-1 text-xl font-bold text-ink">Python and shortcuts</h2></div><Link href="/courses" className="text-sm font-semibold text-brand">See practice areas</Link></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PracticeCard icon={Code2} title="Python typing" detail={nextPython?.title ?? "Review Python syntax"} href={nextPython ? `/lesson/${nextPython.id}` : "/lesson#python-typing"} />
          <PracticeCard icon={Command} title="Shortcut trainer" detail={nextShortcut?.title ?? "Review keyboard shortcuts"} href={nextShortcut ? `/shortcuts/${nextShortcut.id}` : "/shortcuts"} />
        </div>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <Card className="p-4"><Icon className="size-5 text-brand" aria-hidden /><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">{label}</p><p className="mt-1 text-2xl font-bold text-ink">{value}</p></Card>;
}

function PracticeCard({ icon: Icon, title, detail, href }: { icon: typeof Code2; title: string; detail: string; href: string }) {
  return <Link href={href}><Card className="flex items-center gap-4 hover:border-brand/25"><span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand-dark"><Icon className="size-5" aria-hidden /></span><div className="flex-1"><h3 className="font-bold text-ink">{title}</h3><p className="text-sm text-ink-soft">{detail}</p></div><ArrowRight className="size-4 text-brand" aria-hidden /></Card></Link>;
}
