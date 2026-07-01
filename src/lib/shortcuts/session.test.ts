import { describe, expect, it } from "vitest";
import { SHORTCUT_LESSONS } from "./catalog";
import { createShortcutSession } from "./session";

describe("createShortcutSession", () => {
  it("builds the requested number of prompts", () => {
    const lesson = SHORTCUT_LESSONS.find((item) => item.id === "shortcut-l2-copy-paste");
    expect(lesson).toBeDefined();
    const session = createShortcutSession(lesson!, () => 0.3);
    expect(session).toHaveLength(lesson!.sessionLength);
  });

  it("includes every shortcut learned in the level at least once", () => {
    const lesson = SHORTCUT_LESSONS.find((item) => item.id === "shortcut-l5-browser");
    expect(lesson).toBeDefined();
    const session = createShortcutSession(lesson!, () => 0.7);
    const ids = new Set(session.map((task) => task.shortcutId));
    for (const shortcutId of lesson!.shortcutIds) {
      expect(ids.has(shortcutId)).toBe(true);
    }
  });
});
