/*
  Random prompt generation per difficulty level. Pure module (no React, no DOM)
  so it runs on the server (to seed the first prompt) and the client (to make a
  fresh prompt on retry), and is easy to unit test.

  An optional `rng` lets tests inject a deterministic random source.
*/
import type {
  LessonCategory,
  PromptTopic,
  PromptType,
} from "@/lib/data/types";

export type Rng = () => number;

export interface PromptSpec {
  category: LessonCategory;
  promptType?: PromptType;
  topic?: PromptTopic;
}

function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickMany<T>(rng: Rng, arr: readonly T[], count: number): T[] {
  return Array.from({ length: count }, () => pick(rng, arr));
}

/** Home row keys used for the earliest drills. */
const HOME_ROW = "asdfghjkl";

const HOME_ROW_WORDS = [
  "as", "ask", "sad", "dad", "lad", "fall", "flask", "glass", "salad", "gas",
  "hall", "gash", "lash", "flag", "gall", "ash", "has", "gala", "half", "shall",
] as const;

const ROW_WORDS = [
  "the", "quick", "red", "fox", "type", "very", "cute", "cat", "move", "brown",
  "jump", "walk", "run", "wind", "port", "yarn", "trip", "quiet", "robot", "prize",
  "water", "tower", "river", "music", "table", "north", "power", "great",
] as const;

const CAPITAL_WORDS = [
  "The", "Fox", "Cat", "Monday", "April", "New", "York", "City", "River",
  "Maple", "School", "Friday", "June", "Ocean", "Mountain", "Captain", "Tuesday",
  "Lake", "Bridge", "Forest",
] as const;

const PUNCT_FRAGMENTS = [
  "Hello, world!", "Yes, please.", "Wait... what?", "Stop, look, listen.",
  "Ready, set, go!", "Is it done?", "No way!", "One, two, three.",
  "Okay; let's go.", "Well, maybe.",
] as const;

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog.",
  "Practice every day to get faster and better.",
  "Typing well takes time, focus, and patience.",
  "A short walk in the park can clear your mind.",
  "Bright ideas often arrive when we least expect them.",
  "Reading books opens doors to brand new worlds.",
] as const;

/* Python snippets grouped by topic — typing practice for basic syntax. */
const PYTHON_BANKS: Record<PromptTopic, readonly string[]> = {
  strings: [
    'print("Hello, world!")',
    'name = "Alex"',
    "print(name)",
    'message = "Hi there"',
    'print("Python is fun")',
    'greeting = "Hello"',
  ],
  numbers: [
    "score = 10",
    "x = 5",
    "total = x + score",
    "count = 0",
    "price = 19",
    "result = 3 * 7",
  ],
  conditions: [
    "if score > 5:",
    "if x == 10:",
    'if name == "Alex":',
    "if count >= 3:",
    "elif x < 0:",
    "else:",
  ],
  loops: [
    "for i in range(5):",
    "for n in nums:",
    "while count < 5:",
    "def greet(name):",
    "def add(a, b):",
    "return a + b",
  ],
  multiline: [
    'def greet(name):\n    print("Hi", name)',
    "for i in range(3):\n    print(i)",
    'if score > 5:\n    print("win")',
    "x = 5\ny = 10\nprint(x + y)",
    "total = 0\nfor n in nums:\n    total += n",
  ],
};

const PYTHON_DEFAULT = PYTHON_BANKS.strings;

function homeRowLetters(rng: Rng): string {
  const tokenCount = randInt(rng, 8, 10);
  const tokens = Array.from({ length: tokenCount }, () => {
    const len = randInt(rng, 2, 4);
    return Array.from({ length: len }, () =>
      HOME_ROW[Math.floor(rng() * HOME_ROW.length)],
    ).join("");
  });
  return tokens.join(" ");
}

function numbers(rng: Rng): string {
  const tokenCount = randInt(rng, 6, 9);
  const tokens = Array.from({ length: tokenCount }, () => {
    const len = randInt(rng, 1, 4);
    return Array.from({ length: len }, () => randInt(rng, 0, 9)).join("");
  });
  return tokens.join(" ");
}

function timed(rng: Rng): string {
  // Long enough that a learner rarely finishes before the timer ends.
  const parts: string[] = [];
  let length = 0;
  while (length < 220) {
    const sentence = pick(rng, SENTENCES);
    parts.push(sentence);
    length += sentence.length + 1;
  }
  return parts.join(" ");
}

/**
 * Generate a random prompt for a lesson. `promptType: "python"` produces code
 * regardless of category, demonstrating that the engine is content-agnostic.
 */
export function generatePrompt(spec: PromptSpec, rng: Rng = Math.random): string {
  const { category, promptType = "english", topic } = spec;

  if (promptType === "python") {
    const bank = topic ? PYTHON_BANKS[topic] : PYTHON_DEFAULT;
    return pick(rng, bank);
  }

  switch (category) {
    case "letters":
      return homeRowLetters(rng);
    case "words":
      return pickMany(rng, HOME_ROW_WORDS, randInt(rng, 7, 9)).join(" ");
    case "rows":
      return pickMany(rng, ROW_WORDS, randInt(rng, 7, 9)).join(" ");
    case "capitals":
      return pickMany(rng, CAPITAL_WORDS, randInt(rng, 4, 6)).join(" ");
    case "punctuation":
      return pickMany(rng, PUNCT_FRAGMENTS, randInt(rng, 2, 3)).join(" ");
    case "numbers":
      return numbers(rng);
    case "sentences":
      return pick(rng, SENTENCES);
    case "timed":
      return timed(rng);
    case "code":
      return pick(rng, topic ? PYTHON_BANKS[topic] : PYTHON_DEFAULT);
    default:
      return pick(rng, SENTENCES);
  }
}
