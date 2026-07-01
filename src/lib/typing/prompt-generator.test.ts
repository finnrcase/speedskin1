import { describe, expect, it } from "vitest";
import { generatePrompt, type Rng } from "./prompt-generator";

/** Deterministic RNG (mulberry32) so tests are stable. */
function seeded(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe("generatePrompt", () => {
  it("home row letters only use home-row keys and spaces", () => {
    for (let s = 1; s <= 20; s += 1) {
      const out = generatePrompt({ category: "letters" }, seeded(s));
      expect(out).toMatch(/^[asdfghjkl ]+$/);
      expect(out.length).toBeGreaterThan(0);
    }
  });

  it("home row words only use home-row letters", () => {
    for (let s = 1; s <= 20; s += 1) {
      const out = generatePrompt({ category: "words" }, seeded(s));
      expect(out).toMatch(/^[asdfghjkl ]+$/);
    }
  });

  it("numbers only contain digits and spaces", () => {
    for (let s = 1; s <= 20; s += 1) {
      const out = generatePrompt({ category: "numbers" }, seeded(s));
      expect(out).toMatch(/^[0-9 ]+$/);
    }
  });

  it("capitals contain at least one uppercase letter", () => {
    const out = generatePrompt({ category: "capitals" }, seeded(3));
    expect(out).toMatch(/[A-Z]/);
    expect(out).toMatch(/^[A-Za-z ]+$/);
  });

  it("punctuation prompts contain punctuation", () => {
    const out = generatePrompt({ category: "punctuation" }, seeded(5));
    expect(out).toMatch(/[.,!?;]/);
  });

  it("timed prompts are long enough to fill the clock", () => {
    const out = generatePrompt({ category: "timed" }, seeded(7));
    expect(out.length).toBeGreaterThanOrEqual(200);
  });

  it("python prompts are produced regardless of category", () => {
    const out = generatePrompt(
      { category: "sentences", promptType: "python" },
      seeded(9),
    );
    expect(out).toMatch(/print|range|def|for|while|=|\[/);
  });

  it("python topics narrow the content", () => {
    const conds = generatePrompt(
      { category: "code", promptType: "python", topic: "conditions" },
      seeded(11),
    );
    expect(conds).toMatch(/if|elif|else/);
  });

  it("multiline python topic produces newlines", () => {
    const out = generatePrompt(
      { category: "code", promptType: "python", topic: "multiline" },
      seeded(13),
    );
    expect(out).toContain("\n");
  });

  it("is deterministic for a given seed", () => {
    expect(generatePrompt({ category: "rows" }, seeded(42))).toBe(
      generatePrompt({ category: "rows" }, seeded(42)),
    );
  });
});
