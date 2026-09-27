"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthLanding } from "@/components/auth/AuthLanding";
import { RoleOnboarding } from "@/components/auth/RoleOnboarding";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { UserRole } from "@/lib/data/types";

function homeForRole(role: UserRole) {
  if (role === "teacher") return "/teacher";
  if (role === "admin") return "/admin";
  return "/";
}

const STUDENT_ROUTES = [
  "/",
  "/courses",
  "/lesson",
  "/shortcuts",
  "/homework",
  "/achievements",
];

function pathMatches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function isAuthenticationPath(pathname: string) {
  return pathMatches(pathname, "/auth") || pathname === "/onboarding";
}

function roleCanAccess(pathname: string, role: UserRole) {
  if (pathMatches(pathname, "/settings")) return true;
  if (pathMatches(pathname, "/admin")) return role === "admin";
  if (pathMatches(pathname, "/teacher")) return role === "teacher" || role === "admin";
  if (STUDENT_ROUTES.some((route) => pathMatches(pathname, route))) {
    return role === "student";
  }
  return true;
}

export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const { profile, status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !profile?.role) return;
    if (isAuthenticationPath(pathname)) {
      router.replace(homeForRole(profile.role));
      return;
    }
    if (!roleCanAccess(pathname, profile.role)) {
      router.replace(homeForRole(profile.role));
    }
  }, [pathname, profile?.role, router, status]);

  if (pathname.startsWith("/auth/callback")) {
    return children;
  }

  if (status === "loading") {
    return (
      <main className="grid min-h-dvh place-items-center bg-cream px-4">
        <Card className="text-center text-sm font-semibold text-ink-soft">
          Loading your SpeedSkin workspace…
        </Card>
      </main>
    );
  }

  if (status === "unconfigured" || status === "signed-out") {
    return <AuthLanding />;
  }

  if (status === "needs-role" || !profile?.role) {
    return <RoleOnboarding />;
  }

  if (isAuthenticationPath(pathname)) {
    return (
      <AppShell>
        <Card className="text-center text-sm font-semibold text-ink-soft">
          Opening your dashboardâ€¦
        </Card>
      </AppShell>
    );
  }

  if (!roleCanAccess(pathname, profile.role)) {
    return (
      <main className="grid min-h-dvh place-items-center bg-cream px-4">
        <Card className="text-center text-sm font-semibold text-ink-soft">
          Redirecting to your dashboard…
        </Card>
      </main>
    );
  }

  return <AppShell>{children}</AppShell>;
}
