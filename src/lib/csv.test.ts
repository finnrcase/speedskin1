import { describe, expect, it } from "vitest";
import { buildRosterCsv, escapeCsvField, toCsv } from "./csv";
import type { Student } from "@/lib/data/types";

describe("escapeCsvField", () => {
  it("leaves simple values untouched", () => {
    expect(escapeCsvField("Alex")).toBe("Alex");
    expect(escapeCsvField(42)).toBe("42");
  });

  it("quotes and escapes fields with commas or quotes", () => {
    expect(escapeCsvField("Doe, Jane")).toBe('"Doe, Jane"');
    expect(escapeCsvField('a "b" c')).toBe('"a ""b"" c"');
  });
});

describe("buildRosterCsv", () => {
  const students: Student[] = [
    {
      id: "s1",
      name: "Ava Thompson",
      avatar: "AT",
      classId: "c-6b",
      level: 6,
      wpm: 52,
      accuracy: 98,
      lessonsCompleted: 14,
      pythonLessonsCompleted: 3,
      shortcutLessonsCompleted: 5,
      shortcutMasteryPct: 82,
      shortcutAverageReactionMs: 1040,
      practiceMinutes: 240,
      weakKeys: ["q", "p", ";"],
      weakShortcuts: ["close-tab"],
      streakDays: 9,
      lastActive: "2 min ago",
      status: "ahead",
    },
  ];

  it("includes a header and a row per student with python progress", () => {
    const csv = buildRosterCsv(students, 5, 7);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("Python Progress");
    expect(lines[0]).toContain("Shortcut Progress");
    expect(lines[1]).toContain("Ava Thompson");
    expect(lines[1]).toContain("3/5");
    expect(lines[1]).toContain("5/7");
    expect(lines[1]).toContain("Close Tab");
  });

  it("toCsv keeps every row the same column count", () => {
    const csv = toCsv([
      ["a", "b"],
      [1, 2],
    ]);
    expect(csv).toBe("a,b\n1,2");
  });
});
