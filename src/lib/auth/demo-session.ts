import type { UserProfile, UserRole } from "@/lib/data/types";

export const DEMO_PROFILE_KEY = "speedskin:demo-profile";
export const DEMO_ROLE_COOKIE = "speedskin-demo-role";
export const DEMO_PERSISTENCE_SECONDS = 7 * 24 * 60 * 60;

export function isUserRole(value: unknown): value is UserRole {
  return value === "student" || value === "teacher" || value === "admin";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isValidDemoProfile(
  value: unknown,
): value is UserProfile & { role: UserRole } {
  if (!isRecord(value) || !isUserRole(value.role)) return false;
  const expectedId = `demo-${value.role}`;
  return (
    value.id === expectedId &&
    value.userId === expectedId &&
    typeof value.email === "string" &&
    typeof value.fullName === "string" &&
    value.fullName.trim().length > 0 &&
    (value.avatarUrl === null || typeof value.avatarUrl === "string") &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    (value.lastLogin === null || typeof value.lastLogin === "string")
  );
}

export function demoRoleCookie(role: UserRole): string {
  return `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=${DEMO_PERSISTENCE_SECONDS}; SameSite=Lax`;
}

export function expiredDemoRoleCookie(): string {
  return `${DEMO_ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
