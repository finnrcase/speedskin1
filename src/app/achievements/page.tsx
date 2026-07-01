import { CheckCircle2, Lock, Medal } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
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
    <div className="space-y-7">
      <PageHeader
        eyebrow="Progress"
        title="Your progress"
        subtitle="Milestones and next goals."
      />

      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-ink">
            {earned.length} of {achievements.length} milestones
          </h2>
          {nextUp && (
            <p className="mt-1 text-sm text-ink-soft">
              Next: {nextUp.title}
            </p>
          )}
        </div>
        <ProgressBar value={earnedPct} label="Achievements unlocked" />
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
                "flex min-h-44 flex-col items-start gap-3 overflow-hidden hover:border-brand/20",
                status === "next" && "border-brand/30 bg-brand-tint",
                status === "locked" && "opacity-70",
              )}
            >
              <AchievementMark icon={a.icon} earned={a.earned} status={status} />
              <h3 className="text-base font-bold tracking-tight text-ink">
                {a.title}
              </h3>
              <p className="text-xs text-ink-soft">
                {a.earned ? a.description : a.requirement}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                {a.earned ? (
                  <CheckCircle2 className="size-4 text-success" strokeWidth={1.8} />
                ) : status === "next" ? (
                  <Medal className="size-4 text-brand" strokeWidth={1.8} />
                ) : (
                  <Lock className="size-4" strokeWidth={1.8} />
                )}
                {a.earned ? "Earned" : status === "next" ? "Next" : "Locked"}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
