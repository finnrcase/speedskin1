import { CheckCircle2, Lock, Medal, Sparkles, Trophy } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AchievementMark } from "@/components/ui/AchievementMark";
import { cn } from "@/lib/utils";
import { getAchievements } from "@/lib/data";

export default function AchievementsPage() {
  const achievements = getAchievements();
  const earned = achievements.filter((a) => a.earned);
  const nextUp = achievements.find((a) => !a.earned);
  const earnedPct = (earned.length / achievements.length) * 100;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Achievements"
        title="Milestones"
        subtitle="Track meaningful progress in speed, accuracy, consistency, and coding practice."
      />

      <Card className="hero-panel space-y-4 border-brand/15">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Achievement trail
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              {earned.length} of {achievements.length} milestones earned
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
              Earn badges for speed, accuracy, consistency, and Python typing.
            </p>
          </div>
          <span className="flex size-14 items-center justify-center rounded-[1.25rem] bg-brand text-white shadow-[0_12px_28px_rgba(249,115,22,0.2)]" aria-hidden>
            <Trophy className="size-7" strokeWidth={1.8} />
          </span>
        </div>
        <ProgressBar value={earnedPct} label="Achievements unlocked" />
        {nextUp && (
          <div className="rounded-card border border-white/70 bg-white/80 p-4">
            <Badge tone="brand" icon={Sparkles}>Next up</Badge>
            <p className="mt-2 font-bold text-ink">{nextUp.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{nextUp.requirement}</p>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {achievements.map((a) => {
          const status: "earned" | "next" | "locked" = a.earned
            ? "earned"
            : a.id === nextUp?.id
              ? "next"
              : "locked";
          return (
            <Card
              key={a.id}
              className={cn(
                "relative flex min-h-52 flex-col items-start gap-3 overflow-hidden hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_12px_30px_rgba(88,64,38,0.08)]",
                status === "next" && "border-brand/30 bg-brand-tint",
                status === "locked" && "opacity-70",
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand via-gold to-transparent" />
              <AchievementMark icon={a.icon} earned={a.earned} status={status} />
              <h3 className="text-base font-bold tracking-tight text-ink">
                {a.title}
              </h3>
              <p className="text-xs text-ink-soft">
                {a.earned ? a.description : a.requirement}
              </p>
              {a.earned ? (
                <Badge tone="success" icon={CheckCircle2}>
                  Earned
                </Badge>
              ) : status === "next" ? (
                <Badge tone="brand" icon={Medal}>
                  Next up
                </Badge>
              ) : (
                <Badge tone="neutral" icon={Lock}>Locked</Badge>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
