import type {
  ShortcutDefinition,
  ShortcutId,
  ShortcutLesson,
  ShortcutTask,
} from "@/lib/data/types";
import { SHORTCUTS } from "./catalog";

function pick<T>(items: T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] ?? items[0];
}

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function promptForShortcut(
  shortcut: ShortcutDefinition,
  random: () => number,
): string {
  if (random() < 0.42) return shortcut.label;
  return pick(shortcut.missionPrompts, random);
}

export function createShortcutSession(
  lesson: ShortcutLesson,
  random: () => number = Math.random,
): ShortcutTask[] {
  const learnedIds = lesson.shortcutIds;
  const required = shuffled(learnedIds, random);
  const sequence: ShortcutId[] = [...required];

  while (sequence.length < lesson.sessionLength) {
    sequence.push(pick(learnedIds, random));
  }

  return shuffled(sequence, random).map((shortcutId, index) => ({
    id: `${lesson.id}-${index}-${shortcutId}`,
    shortcutId,
    prompt: promptForShortcut(SHORTCUTS[shortcutId], random),
  }));
}
