"use client";

import { useState } from "react";
import { Globe2, LogIn, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const roleOptions: { role: UserRole; title: string; copy: string }[] = [
  {
    role: "student",
    title: "Student",
    copy: "I am learning.",
  },
  {
    role: "teacher",
    title: "Teacher",
    copy: "I teach a class.",
  },
  {
    role: "admin",
    title: "Admin",
    copy: "I manage SpeedSkin.",
  },
];

function inputClass() {
  return "h-12 w-full rounded-button border border-line bg-white px-4 text-sm text-ink outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/25";
}

export function AuthLanding() {
  const {
    authError,
    authMessage,
    signInWithEmail,
    signInWithGoogle,
    signInAsDemo,
    signUpWithEmail,
    status,
  } = useAuth();
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
    <main className="grid min-h-dvh place-items-center bg-cream px-4 py-8">
      <div className="w-full max-w-md space-y-5">
        <section className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-white">
            S
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-ink">
            SpeedSkin
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Learn typing, coding, and keyboard shortcuts.
          </p>
        </section>

        <Card className="bg-white">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              Sign in
            </h2>
            <p className="text-sm text-ink-soft">Choose how to continue.</p>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="space-y-3 rounded-card border border-line bg-cream p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
                <p className="text-sm font-bold text-ink">Demo mode</p>
              </div>
              <p className="text-xs text-ink-soft">
                Test the full classroom workflow locally.
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
                  window.location.assign(
                    role === "teacher" ? "/teacher" : role === "admin" ? "/admin" : "/",
                  );
                }}
              >
                <Sparkles className="size-4" strokeWidth={1.8} aria-hidden />
                Explore the demo
              </Button>
            </div>

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

        </Card>
      </div>
    </main>
  );
}
