import type { Academy, AcademyId } from "@/lib/data/types";

export const ACADEMIES: readonly Academy[] = [
  {
    id: "keyboard",
    name: "Keyboard Academy",
    shortName: "Keyboard",
    description: "Build accurate, comfortable typing from the home row onward.",
    topics: ["keyboard geography", "accuracy", "speed", "symbols"],
    order: 1,
  },
  {
    id: "language",
    name: "Language Academy",
    shortName: "Language",
    description: "Strengthen vocabulary, grammar, reading, and written expression.",
    topics: ["vocabulary", "spelling", "grammar", "comprehension"],
    order: 2,
  },
  {
    id: "chromebook",
    name: "Chromebook Academy",
    shortName: "Chromebook",
    description: "Use school devices, tabs, files, search, and shortcuts with confidence.",
    topics: ["device basics", "tabs", "files", "accessibility"],
    order: 3,
  },
  {
    id: "digital",
    name: "Digital Academy",
    shortName: "Digital",
    description: "Make safer, smarter choices online and with emerging technology.",
    topics: ["passwords", "privacy", "scams", "AI literacy"],
    order: 4,
  },
  {
    id: "communication",
    name: "Communication Academy",
    shortName: "Communication",
    description: "Write clearly and respectfully for the right audience.",
    topics: ["email", "tone", "clarity", "asking for help"],
    order: 5,
  },
  {
    id: "people",
    name: "People Academy",
    shortName: "People",
    description: "Practice listening, collaboration, boundaries, and conflict skills.",
    topics: ["listening", "conflict", "apologies", "collaboration"],
    order: 6,
  },
  {
    id: "money",
    name: "Money Academy",
    shortName: "Money",
    description: "Learn practical saving, spending, budgeting, and comparison skills.",
    topics: ["saving", "spending", "budgeting", "banking"],
    order: 7,
  },
  {
    id: "life",
    name: "Life Academy",
    shortName: "Life",
    description: "Plan time, break down tasks, and follow through on priorities.",
    topics: ["planning", "priorities", "habits", "deadlines"],
    order: 8,
  },
] as const;

export const ACADEMY_IDS = ACADEMIES.map((academy) => academy.id);

export function getAcademyById(id: AcademyId): Academy {
  const academy = ACADEMIES.find((item) => item.id === id);
  if (!academy) throw new Error(`Unknown academy: ${id}`);
  return academy;
}

