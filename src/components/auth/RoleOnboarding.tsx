"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const roles: { role: UserRole; title: string; copy: string }[] = [
  {
    role: "student",
    title: "Student",
    copy: "Practice lessons, join classes, and complete homework.",
  },
  {
    role: "teacher",
    title: "Teacher",
    copy: "Create classes, share join codes, and assign work.",
  },
  {
    role: "admin",
    title: "Admin",
    copy: "Review all classrooms and manage the SpeedSkin workspace.",
  },
];

export function RoleOnboarding() {
  const { completeRoleOnboarding, profile, user, authError } = useAuth();
  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await completeRoleOnboarding(role, fullName);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_38%),linear-gradient(135deg,#fffaf3,#fff7ed)] px-4 py-8">
      <Card className="w-full max-w-xl border-brand/15 bg-white/90 p-6 shadow-[0_24px_70px_rgba(88,64,38,0.14)]">
        <Badge tone="brand" icon={ShieldCheck}>
          One more step
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink">
          Choose your SpeedSkin role
        </h1>
        <p className="mt-2 text-sm leading-6 text-ink-soft">
          Google sign-in worked. Pick how you will use SpeedSkin so we can send
          you to the right dashboard next time.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block space-y-1.5 text-sm font-semibold text-ink-soft">
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={user?.email?.split("@")[0] ?? "Your name"}
              className="h-12 w-full rounded-button border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </label>

          <div className="grid gap-2">
            {roles.map((option) => (
              <button
                key={option.role}
                type="button"
                onClick={() => setRole(option.role)}
                aria-pressed={role === option.role}
                className={cn(
                  "rounded-button border px-4 py-3 text-left transition",
                  role === option.role
                    ? "border-brand/40 bg-brand-tint ring-2 ring-brand/10"
                    : "border-line bg-white hover:border-brand/25",
                )}
              >
                <span className="font-bold text-ink">{option.title}</span>
                <span className="mt-1 block text-sm leading-6 text-ink-soft">
                  {option.copy}
                </span>
              </button>
            ))}
          </div>

          {authError && (
            <p className="rounded-button bg-danger-light px-3 py-2 text-sm font-semibold text-danger">
              {authError}
            </p>
          )}

          <Button type="submit" size="lg" disabled={busy} className="w-full justify-center">
            Save role and continue
          </Button>
        </form>
      </Card>
    </main>
  );
}
