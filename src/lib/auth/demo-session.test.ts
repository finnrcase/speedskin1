import { describe, expect, it } from "vitest";
import {
  DEMO_PERSISTENCE_SECONDS,
  demoRoleCookie,
  expiredDemoRoleCookie,
  isValidDemoProfile,
} from "./demo-session";

const validProfile = {
  id: "demo-student",
  userId: "demo-student",
  email: "demo-student@speedskin.app",
  fullName: "Jordan Learner",
  avatarUrl: null,
  role: "student",
  createdAt: "2026-09-27T00:00:00.000Z",
  updatedAt: "2026-09-27T00:00:00.000Z",
  lastLogin: "2026-09-27T00:00:00.000Z",
};

describe("demo session persistence", () => {
  it("accepts profiles created by demo sign-in", () => {
    expect(isValidDemoProfile(validProfile)).toBe(true);
  });

  it("rejects invalid roles and mismatched demo identities", () => {
    expect(isValidDemoProfile({ ...validProfile, role: "owner" })).toBe(false);
    expect(isValidDemoProfile({ ...validProfile, id: "demo-admin" })).toBe(false);
    expect(isValidDemoProfile({ ...validProfile, fullName: "" })).toBe(false);
  });

  it("uses the same seven-day cookie contract for demo restoration", () => {
    expect(demoRoleCookie("student")).toBe(
      `speedskin-demo-role=student; path=/; max-age=${DEMO_PERSISTENCE_SECONDS}; SameSite=Lax`,
    );
    expect(expiredDemoRoleCookie()).toBe(
      "speedskin-demo-role=; path=/; max-age=0; SameSite=Lax",
    );
  });
});
