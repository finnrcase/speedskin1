import {
  Brain,
  Code2,
  Command,
  Keyboard,
  Monitor,
  Rocket,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { LessonTrack } from "@/lib/data/types";

/*
  Course catalog for the digital-skills platform. A Course is a learning path;
  the model is intentionally open so future paths (Computer Skills, Internet
  Safety, AI Literacy, Productivity) slot in without restructuring. `source`
  tells the Courses hub how to read live progress for a path.
*/

export type CourseSource =
  | { type: "typing"; track: LessonTrack }
  | { type: "shortcuts" }
  | { type: "future" };

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  Icon: LucideIcon;
  href: string;
  status: "available" | "coming-soon";
  source: CourseSource;
}

export const ACTIVE_COURSES: Course[] = [
  {
    id: "typing",
    title: "Typing",
    subtitle: "Touch-typing foundations",
    description:
      "Learn the keyboard by feel, from the home row to full sentences, one focused level at a time.",
    Icon: Keyboard,
    href: "/lesson#typing-basics",
    status: "available",
    source: { type: "typing", track: "basics" },
  },
  {
    id: "coding",
    title: "Coding",
    subtitle: "Python syntax practice",
    description:
      "Build muscle memory for code symbols — print, variables, loops — so real coding feels familiar.",
    Icon: Code2,
    href: "/lesson#python-typing",
    status: "available",
    source: { type: "typing", track: "python" },
  },
  {
    id: "shortcuts",
    title: "Keyboard Shortcuts",
    subtitle: "Work faster with key combos",
    description:
      "Master Copy, Paste, Undo, Save, Find, and browser commands until they are automatic.",
    Icon: Command,
    href: "/shortcuts",
    status: "available",
    source: { type: "shortcuts" },
  },
];

export const FUTURE_COURSES: Course[] = [
  {
    id: "computer-skills",
    title: "Computer Skills",
    subtitle: "Files, windows, and the desktop",
    description: "Confident everyday computer use.",
    Icon: Monitor,
    href: "#",
    status: "coming-soon",
    source: { type: "future" },
  },
  {
    id: "internet-safety",
    title: "Internet Safety",
    subtitle: "Stay safe online",
    description: "Passwords, privacy, and spotting scams.",
    Icon: ShieldCheck,
    href: "#",
    status: "coming-soon",
    source: { type: "future" },
  },
  {
    id: "ai-literacy",
    title: "AI Literacy",
    subtitle: "Understand and use AI",
    description: "What AI is, and how to use it responsibly.",
    Icon: Brain,
    href: "#",
    status: "coming-soon",
    source: { type: "future" },
  },
  {
    id: "productivity",
    title: "Productivity",
    subtitle: "Tools and good habits",
    description: "Docs, organization, and focused work.",
    Icon: Rocket,
    href: "#",
    status: "coming-soon",
    source: { type: "future" },
  },
];
