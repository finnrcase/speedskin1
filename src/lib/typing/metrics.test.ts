import { describe, expect, it } from "vitest";
import { buildCharStates, computeAccuracy, computeWpm } from "./metrics";

describe("computeWpm", () => {
  it("returns 0 before meaningful time has passed", () => {
    expect(computeWpm(10, 200)).toBe(0);
    expect(computeWpm(0, 5000)).toBe(0);
  });

  it("computes net WPM using a 5-character word", () => {
    // 25 correct chars (5 words) in 60s => 5 WPM
    expect(computeWpm(25, 60_000)).toBe(5);
    // 200 chars (40 words) in 60s => 40 WPM
    expect(computeWpm(200, 60_000)).toBe(40);
  });
});

describe("computeAccuracy", () => {
  it("is 100% with no keystrokes", () => {
    expect(computeAccuracy(0, 0)).toBe(100);
  });

  it("is the share of correct keystrokes", () => {
    expect(computeAccuracy(9, 1)).toBe(90);
    expect(computeAccuracy(3, 1)).toBe(75);
  });
});

describe("buildCharStates", () => {
  it("marks past chars correct, the cursor current, and the rest pending", () => {
    expect(buildCharStates(4, 2, false)).toEqual([
      "correct",
      "correct",
      "current",
      "pending",
    ]);
  });

  it("flashes the current char as incorrect on a wrong key", () => {
    expect(buildCharStates(3, 1, true)).toEqual([
      "correct",
      "incorrect",
      "pending",
    ]);
  });
});
