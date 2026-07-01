import type { Assignment, Classroom, Teacher } from "@/lib/data/types";
import { SEED_CLASS_ID } from "./students";

export const TEACHER: Teacher = {
  id: "t-rivera",
  name: "Ms. Rivera",
  email: "rivera@school.edu",
};

export const SEED_CLASSES: Classroom[] = [
  {
    id: SEED_CLASS_ID,
    name: "Class 6B",
    joinCode: "SPEED-6021",
    teacherId: TEACHER.id,
    createdAt: "2026-04-01",
  },
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "a-home-row",
    classId: SEED_CLASS_ID,
    title: "Home Row Mastery",
    dueDate: "2026-06-20",
    requiredLevel: 3,
    minAccuracy: 90,
    requiredMinutes: 30,
  },
  {
    id: "a-speed",
    classId: SEED_CLASS_ID,
    title: "Speed Builder",
    dueDate: "2026-06-25",
    minWpm: 30,
    requiredMinutes: 45,
  },
  {
    id: "a-python",
    classId: SEED_CLASS_ID,
    title: "Python Starter",
    dueDate: "2026-06-30",
    requiredTrack: "python",
    minPythonLessons: 1,
    minAccuracy: 85,
  },
  {
    id: "a-shortcuts",
    classId: SEED_CLASS_ID,
    title: "Keyboard Superpowers",
    dueDate: "2026-07-03",
    requiredTrack: "shortcuts",
    minShortcutLessons: 2,
    minShortcutMasteryPct: 40,
  },
];
