"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2, KeyRound, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const roleOptions: { role: UserRole; title: string; copy: string }[] = [
  {
    role: "student",
    title: "Student",
    copy: "Practice lessons, join classes, and finish homework.",
  },
  {
    role: "teacher",
    title: "Teacher",
    copy: "Create classes, assign missions, and review progress.",
  },
  {
    role: "admin",
    title: "Admin",
    copy: "Manage the product workspace and support classrooms.",
  },
];

function inputClass() {
  return "h-12 w-full rounded-button border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25";
}

function homeForRole(role: UserRole) {
  if (role === "teacher") return "/teacher";
  if (role === "admin") return "/admin";
  return "/";
}

export function AuthLanding() {
  const {
    authError,
    authMessage,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    signInAsDemo,
    status,
  } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const unconfigured = status === "unconfigured";

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unconfigured) return;
    setBusy(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail({
          email,
          password,
          fullName: fullName.trim() || email.split("@")[0],
          role,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (unconfigured) return;
    setBusy(true);
    try {
      await signInWithGoogle();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_36%),linear-gradient(135deg,#fffaf3,#f8efe2_54%,#fff7ed)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100dvh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-6">
          <Badge tone="brand" icon={Sparkles}>
            SpeedSkin classroom accounts
          </Badge>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-6xl">
              Keyboard confidence, saved for every student.
            </h1>
            <p className="text-lg leading-8 text-ink-soft">
              Sign in to keep typing progress, coding practice, shortcut
              mastery, classes, and homework connected to a real account.
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["Student progress", "Lessons stay with each learner."],
              ["Teacher ownership", "Classes and assignments belong to you."],
              ["Secure data", "Supabase Auth and RLS protect records."],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-card border border-white/70 bg-white/72 p-4 shadow-[0_12px_30px_rgba(88,64,38,0.08)]"
              >
                <ShieldCheck className="size-5 text-brand" strokeWidth={1.8} />
                <h2 className="mt-3 text-sm font-bold text-ink">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-ink-soft">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <Card className="border-brand/15 bg-white/88 p-5 shadow-[0_24px_70px_rgba(88,64,38,0.15)] sm:p-6">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Welcome to SpeedSkin
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Log in or create your account
            </h2>
            <p className="text-sm leading-6 text-ink-soft">
              Choose the role that matches how you use SpeedSkin.
            </p>
          </div>

          {unconfigured && (
            <div className="mt-5 space-y-3 rounded-card border border-brand/20 bg-brand-tint/60 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
                <p className="text-sm font-bold text-ink">
                  Try the demo — no account needed
                </p>
              </div>
              <p className="text-xs leading-5 text-ink-soft">
                Accounts need Supabase configured. Meanwhile, explore SpeedSkin
                with sample data. Pick a role to start:
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {roleOptions.map((option) => (
                  <button
                    key={option.role}
                    type="button"
                    onClick={() => setRole(option.role)}
                    aria-pressed={role === option.role}
                    className={cn(
                      "rounded-button border px-3 py-2 text-center text-sm font-bold transition",
                      role === option.role
                        ? "border-brand/40 bg-white text-ink ring-2 ring-brand/10"
                        : "border-line bg-white/70 text-ink-soft hover:border-brand/25",
                    )}
                  >
                    {option.title}
                  </button>
                ))}
              </div>
              <Button
                type="button"
                size="lg"
                className="w-full justify-center"
                onClick={() => {
                  signInAsDemo(role, fullName);
                  router.replace(homeForRole(role));
                }}
              >
                <Sparkles className="size-4" strokeWidth={1.8} aria-hidden />
                Explore the demo
              </Button>
            </div>
          )}

          <div className="mt-5 grid gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleGoogle}
              disabled={busy || unconfigured}
              className="w-full justify-center"
            >
              <Globe2 className="size-4" strokeWidth={1.8} aria-hidden />
              Continue with Google
            </Button>

            <div className="grid grid-cols-2 gap-2 rounded-button bg-cream p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={cn(
                  "rounded-[10px] px-3 py-2 text-sm font-semibold transition",
                  mode === "login"
                    ? "bg-white text-ink shadow-[0_1px_8px_rgba(88,64,38,0.08)]"
                    : "text-ink-soft",
                )}
              >
                Log in with email
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={cn(
                  "rounded-[10px] px-3 py-2 text-sm font-semibold transition",
                  mode === "signup"
                    ? "bg-white text-ink shadow-[0_1px_8px_rgba(88,64,38,0.08)]"
                    : "text-ink-soft",
                )}
              >
                Create account
              </button>
            </div>
          </div>

          <form onSubmit={handleEmail} className="mt-5 space-y-4">
            {mode === "signup" && (
              <>
                <label className="block space-y-1.5 text-sm font-semibold text-ink-soft">
                  Full name
                  <input
                    className={inputClass()}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Lee"
                    autoComplete="name"
                  />
                </label>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink-soft">
                    Choose your role
                  </p>
                  <div className="grid gap-2">
                    {roleOptions.map((option) => (
                      <button
                        key={option.role}
                        type="button"
                        onClick={() => setRole(option.role)}
                        aria-pressed={role === option.role}
                        className={cn(
                          "rounded-button border px-3 py-2 text-left transition",
                          role === option.role
                            ? "border-brand/40 bg-brand-tint text-ink ring-2 ring-brand/10"
                            : "border-line bg-white text-ink-soft hover:border-brand/25",
                        )}
                      >
                        <span className="block text-sm font-bold text-ink">
                          {option.title}
                        </span>
                        <span className="block text-xs leading-5">
                          {option.copy}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="block space-y-1.5 text-sm font-semibold text-ink-soft">
              Email
              <input
                type="email"
                className={inputClass()}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-ink-soft">
              Password
              <input
                type="password"
                className={inputClass()}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </label>

            {authError && (
              <p className="rounded-button bg-danger-light px-3 py-2 text-sm font-semibold text-danger">
                {authError}
              </p>
            )}
            {authMessage && (
              <p className="rounded-button bg-success-light px-3 py-2 text-sm font-semibold text-success">
                {authMessage}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={busy || unconfigured}
              className="w-full justify-center"
            >
              {mode === "login" ? (
                <LogIn className="size-4" strokeWidth={1.8} aria-hidden />
              ) : (
                <UserPlus className="size-4" strokeWidth={1.8} aria-hidden />
              )}
              {mode === "login" ? "Log in with email" : "Create account"}
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-2 rounded-button bg-cream px-3 py-2 text-xs leading-5 text-ink-faint">
            <KeyRound className="size-4 shrink-0 text-brand" strokeWidth={1.8} />
            Sessions persist with Supabase cookies, so learners stay signed in
            across refreshes.
          </div>
        </Card>
      </div>
    </main>
  );
}
