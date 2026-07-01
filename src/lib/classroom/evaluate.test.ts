import { describe, expect, it } from "vitest";
import {
  computeClassStats,
  evaluateAssignment,
  formatWeakKeys,
  keyLabel,
  summarizeStudent,
} from "./evaluate";
import { generateJoinCode } from "./codes";
import type { Assignment, EvalContext, Student } from "@/lib/data/types";

const baseStudent: Student = {
  id: "s1",
  name: "Ava Thompson",
  avatar: "AT",
  classId: "c-6b",
  level: 6,
  wpm: 28,
  accuracy: 92,
  lessonsCompleted: 14,
  pythonLessonsCompleted: 3,
  shortcutLessonsCompleted: 4,
  shortcutMasteryPct: 70,
  shortcutAverageReactionMs: 1280,
  practiceMinutes: 240,
  weakKeys: ["q", "p", ";"],
  weakShortcuts: ["redo", "find"],
  streakDays: 9,
  lastActive: "Today",
  status: "ahead",
};

describe("formatWeakKeys / keyLabel", () => {
  it("names symbols and uppercases letters", () => {
    expect(keyLabel("q")).toBe("Q");
    expect(keyLabel(";")).toBe("semicolon");
  });

  it("joins with commas and a final 'and'", () => {
    expect(formatWeakKeys(["q", "p", ";"])).toBe("Q, P, and semicolon");
    expect(formatWeakKeys(["q", "p"])).toBe("Q and P");
    expect(formatWeakKeys(["q"])).toBe("Q");
  });
});

describe("summarizeStudent", () => {
  it("matches the spec example phrasing", () => {
    expect(summarizeStudent(baseStudent)).toBe(
      "Ava is improving quickly, averaging 28 WPM with 92% accuracy. Main weak keys: Q, P, and semicolon. Shortcut focus: Redo and Find.",
    );
  });

  it("handles older local demo students without shortcut fields", () => {
    const legacyStudent = {
      ...baseStudent,
      weakShortcuts: undefined,
      shortcutAverageReactionMs: undefined,
      shortcutMasteryPct: undefined,
    } as unknown as Student;

    expect(summarizeStudent(legacyStudent)).toBe(
      "Ava is improving quickly, averaging 28 WPM with 92% accuracy. Main weak keys: Q, P, and semicolon.",
    );
    expect(computeClassStats([legacyStudent]).mostMissedShortcuts).toEqual([]);
    expect(computeClassStats([legacyStudent]).averageShortcutReactionMs).toBe(0);
  });
});

describe("evaluateAssignment", () => {
  const ctx: EvalContext = {
    level: 4,
    wpm: 28,
    accuracy: 92,
    practiceMinutes: 40,
    pythonCompleted: 0,
    shortcutCompleted: 2,
    shortcutMasteryPct: 45,
  };

  it("builds one criterion per defined requirement", () => {
    const a: Assignment = {
      id: "a1",
      classId: "c-6b",
      title: "Test",
      dueDate: "2026-06-30",
      minWpm: 30,
      minAccuracy: 90,
    };
    const e = evaluateAssignment(ctx, a);
    expect(e.total).toBe(2);
    expect(e.metCount).toBe(1); // accuracy met, wpm not
    expect(e.complete).toBe(false);
    expect(e.progressPct).toBe(50);
  });

  it("is complete when every requirement is met", () => {
    const a: Assignment = {
      id: "a2",
      classId: "c-6b",
      title: "Easy",
      dueDate: "2026-06-30",
      minAccuracy: 90,
      requiredMinutes: 30,
    };
    const e = evaluateAssignment(ctx, a);
    expect(e.complete).toBe(true);
    expect(e.progressPct).toBe(100);
  });

  it("evaluates keyboard shortcut homework requirements", () => {
    const a: Assignment = {
      id: "a3",
      classId: "c-6b",
      title: "Shortcut Starter",
      dueDate: "2026-06-30",
      minShortcutLessons: 2,
      minShortcutMasteryPct: 60,
    };
    const e = evaluateAssignment(ctx, a);
    expect(e.total).toBe(2);
    expect(e.metCount).toBe(1);
    expect(e.complete).toBe(false);
    expect(e.criteria.map((c) => c.label)).toEqual([
      "Shortcut lessons",
      "Shortcut mastery",
    ]);
  });
});

describe("generateJoinCode", () => {
  it("matches the SPEED-#### format", () => {
    expect(generateJoinCode(() => 0.5)).toMatch(/^SPEED-\d{4}$/);
    for (let i = 0; i < 50; i += 1) {
      expect(generateJoinCode()).toMatch(/^SPEED-\d{4}$/);
    }
  });
});
