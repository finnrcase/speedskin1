import { Laptop, Monitor, type LucideIcon } from "lucide-react";
import type {
  ShortcutDefinition,
  ShortcutId,
  ShortcutLesson,
  ShortcutPlatform,
} from "@/lib/data/types";
import type { DeviceType } from "@/lib/device/devices";

export const SHORTCUTS: Record<ShortcutId, ShortcutDefinition> = {
  copy: {
    id: "copy",
    label: "Copy",
    key: "c",
    description: "Copy selected text or files.",
    missionPrompts: [
      "You wrote a paragraph. Copy it.",
      "Save a quote for later by copying it.",
      "Copy the answer before moving it.",
    ],
  },
  paste: {
    id: "paste",
    label: "Paste",
    key: "v",
    description: "Place copied content where the cursor is.",
    missionPrompts: [
      "Move the copied sentence into your notes. Paste it.",
      "You copied a link. Paste it into the document.",
      "Put the answer where it belongs. Paste it.",
    ],
  },
  undo: {
    id: "undo",
    label: "Undo",
    key: "z",
    description: "Reverse the last action.",
    missionPrompts: [
      "You made a mistake. Undo it.",
      "The last edit was wrong. Undo it.",
      "Bring back the sentence you changed. Undo.",
    ],
  },
  cut: {
    id: "cut",
    label: "Cut",
    key: "x",
    description: "Remove selected content and copy it.",
    missionPrompts: [
      "Move a sentence to a new spot. Cut it first.",
      "Take out the selected word and keep it ready. Cut it.",
      "You need to move a heading. Cut it.",
    ],
  },
  redo: {
    id: "redo",
    label: "Redo",
    key: "y",
    description: "Repeat an action that was undone.",
    missionPrompts: [
      "That undo was a mistake. Redo it.",
      "Put the change back. Redo it.",
      "Restore the action you just reversed. Redo.",
    ],
  },
  "select-all": {
    id: "select-all",
    label: "Select All",
    key: "a",
    description: "Select everything in the current field or page.",
    missionPrompts: [
      "You need the whole document. Select all.",
      "Highlight every word before copying. Select all.",
      "Choose the full page of text. Select all.",
    ],
  },
  save: {
    id: "save",
    label: "Save",
    key: "s",
    description: "Save the current work.",
    missionPrompts: [
      "You finished your homework. Save it.",
      "Your project is ready. Save it.",
      "Lock in your changes before closing. Save.",
    ],
  },
  find: {
    id: "find",
    label: "Find",
    key: "f",
    description: "Open search within a page or document.",
    missionPrompts: [
      "You need to find a word on the page. Open Find.",
      "Search your notes for a vocabulary word. Open Find.",
      "Look for a name in the article. Open Find.",
    ],
  },
  "new-tab": {
    id: "new-tab",
    label: "New Tab",
    key: "t",
    description: "Open a new browser tab.",
    missionPrompts: [
      "Open a fresh place to research. New tab.",
      "Keep this page and start another search. New tab.",
      "You need another browser page. Open a new tab.",
    ],
  },
  "close-tab": {
    id: "close-tab",
    label: "Close Tab",
    key: "w",
    description: "Close the current browser tab.",
    missionPrompts: [
      "You are done with this tab. Close it.",
      "Clean up your browser by closing the tab.",
      "The research page is no longer needed. Close tab.",
    ],
  },
};

export const SHORTCUT_LESSONS: ShortcutLesson[] = [
  {
    id: "shortcut-l1-copy",
    level: 1,
    order: 1,
    title: "Copy Control",
    focus: "Start with the shortcut students use every day.",
    shortcutIds: ["copy"],
    estimatedMinutes: 2,
    sessionLength: 8,
  },
  {
    id: "shortcut-l2-copy-paste",
    level: 2,
    order: 2,
    title: "Copy & Paste",
    focus: "Move information quickly without retyping it.",
    shortcutIds: ["copy", "paste"],
    estimatedMinutes: 3,
    sessionLength: 10,
  },
  {
    id: "shortcut-l3-undo",
    level: 3,
    order: 3,
    title: "Fix Mistakes Fast",
    focus: "Add Undo so mistakes feel easy to recover from.",
    shortcutIds: ["copy", "paste", "undo"],
    estimatedMinutes: 4,
    sessionLength: 12,
  },
  {
    id: "shortcut-boss-core",
    level: 3,
    order: 4,
    title: "Boss: Core Commands",
    focus: "Randomly mix Copy, Paste, and Undo until they feel automatic.",
    shortcutIds: ["copy", "paste", "undo"],
    estimatedMinutes: 4,
    sessionLength: 14,
    isBoss: true,
  },
  {
    id: "shortcut-l4-editing",
    level: 4,
    order: 5,
    title: "Editing Toolkit",
    focus: "Add Cut, Redo, and Select All for real document work.",
    shortcutIds: ["copy", "paste", "undo", "cut", "redo", "select-all"],
    estimatedMinutes: 5,
    sessionLength: 14,
  },
  {
    id: "shortcut-l5-browser",
    level: 5,
    order: 6,
    title: "Browser & Homework Flow",
    focus: "Add Save, Find, New Tab, and Close Tab.",
    shortcutIds: [
      "copy",
      "paste",
      "undo",
      "cut",
      "redo",
      "select-all",
      "save",
      "find",
      "new-tab",
      "close-tab",
    ],
    estimatedMinutes: 6,
    sessionLength: 16,
  },
  {
    id: "shortcut-boss-all",
    level: 5,
    order: 7,
    title: "Boss: Keyboard Superpowers",
    focus: "Randomly mix every shortcut learned so far.",
    shortcutIds: [
      "copy",
      "paste",
      "undo",
      "cut",
      "redo",
      "select-all",
      "save",
      "find",
      "new-tab",
      "close-tab",
    ],
    estimatedMinutes: 6,
    sessionLength: 18,
    isBoss: true,
  },
];

export const SHORTCUT_LESSON_COUNT = SHORTCUT_LESSONS.length;

export interface ShortcutCourse {
  title: string;
  href: string;
  description: string;
  detail: string;
  Icon: LucideIcon;
}

export const SHORTCUT_PLATFORM_META: Record<
  ShortcutPlatform,
  { modifier: "Ctrl" | "Cmd"; Icon: LucideIcon }
> = {
  windows: { modifier: "Ctrl", Icon: Laptop },
  mac: { modifier: "Cmd", Icon: Monitor },
};

export function shortcutPlatformForDevice(device: DeviceType): ShortcutPlatform {
  return device === "mac" || device === "ipad" || device === "iphone"
    ? "mac"
    : "windows";
}

export function shortcutComboLabel(
  shortcut: ShortcutDefinition,
  platform: ShortcutPlatform,
): string {
  return `${SHORTCUT_PLATFORM_META[platform].modifier}+${shortcut.key.toUpperCase()}`;
}

export function shortcutLabel(id: ShortcutId): string {
  return SHORTCUTS[id].label;
}
