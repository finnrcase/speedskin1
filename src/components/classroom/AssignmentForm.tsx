"use client";

import { useState } from "react";
import { BookOpen, Code2, Command } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { NewAssignmentInput } from "@/lib/classroom/ClassroomProvider";
import type { LessonTrack } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface AssignmentFormProps {
  classId: string;
  onCreate: (input: NewAssignmentInput) => void;
  onCancel: () => void;
}

const inputClass =
  "h-11 w-full rounded-button border border-line bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
const labelClass = "block space-y-1 text-sm font-semibold text-ink-soft";

const assignmentTypes: {
  track: LessonTrack;
  title: string;
  copy: string;
  Icon: typeof BookOpen;
}[] = [
  {
    track: "basics",
    title: "Typing",
    copy: "Level, WPM, accuracy, and practice time.",
    Icon: BookOpen,
  },
  {
    track: "python",
    title: "Coding",
    copy: "Python syntax practice plus accuracy.",
    Icon: Code2,
  },
  {
    track: "shortcuts",
    title: "Keyboard Shortcuts",
    copy: "Shortcut lessons and mastery percentage.",
    Icon: Command,
  },
];

function optionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function AssignmentForm({ classId, onCreate, onCancel }: AssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [requiredTrack, setRequiredTrack] = useState<LessonTrack>("basics");
  const [requiredLevel, setRequiredLevel] = useState("");
  const [minWpm, setMinWpm] = useState("");
  const [minAccuracy, setMinAccuracy] = useState("");
  const [requiredMinutes, setRequiredMinutes] = useState("");
  const [minPythonLessons, setMinPythonLessons] = useState("");
  const [minShortcutLessons, setMinShortcutLessons] = useState("");
  const [minShortcutMasteryPct, setMinShortcutMasteryPct] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    onCreate({
      classId,
      title: title.trim(),
      dueDate,
      requiredTrack,
      requiredLevel: optionalNumber(requiredLevel),
      minWpm: optionalNumber(minWpm),
      minAccuracy: optionalNumber(minAccuracy),
      requiredMinutes: optionalNumber(requiredMinutes),
      minPythonLessons: optionalNumber(minPythonLessons),
      minShortcutLessons: optionalNumber(minShortcutLessons),
      minShortcutMasteryPct: optionalNumber(minShortcutMasteryPct),
    });
  };

  return (
    <Card as="section" className="space-y-4 border-brand/15 bg-cream">
      <h3 className="text-lg font-bold tracking-tight text-ink">
        New assignment
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Title
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Home Row Mastery"
              required
            />
          </label>
          <label className={labelClass}>
            Due date
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </label>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Assignment type
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {assignmentTypes.map(({ track, title: optionTitle, copy, Icon }) => (
            <button
              key={track}
              type="button"
              onClick={() => setRequiredTrack(track)}
              aria-pressed={requiredTrack === track}
              className={cn(
                "rounded-button border px-3 py-3 text-left transition no-select",
                requiredTrack === track
                  ? "border-brand/35 bg-brand-tint ring-2 ring-brand/10"
                  : "border-line bg-white hover:border-brand/25",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-bold text-ink">
                <Icon className="size-4 text-brand" strokeWidth={1.8} />
                {optionTitle}
              </span>
              <span className="mt-1 block text-xs leading-5 text-ink-soft">
                {copy}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Requirements
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className={labelClass}>
            Required level
            <input
              type="number"
              min={1}
              className={inputClass}
              value={requiredLevel}
              onChange={(e) => setRequiredLevel(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className={labelClass}>
            Min WPM
            <input
              type="number"
              min={0}
              className={inputClass}
              value={minWpm}
              onChange={(e) => setMinWpm(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className={labelClass}>
            Min accuracy %
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={minAccuracy}
              onChange={(e) => setMinAccuracy(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className={labelClass}>
            Practice minutes
            <input
              type="number"
              min={0}
              className={inputClass}
              value={requiredMinutes}
              onChange={(e) => setRequiredMinutes(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className={labelClass}>
            Python lessons (optional)
            <input
              type="number"
              min={0}
              className={inputClass}
              value={minPythonLessons}
              onChange={(e) => setMinPythonLessons(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className={labelClass}>
            Shortcut lessons
            <input
              type="number"
              min={0}
              className={inputClass}
              value={minShortcutLessons}
              onChange={(e) => setMinShortcutLessons(e.target.value)}
              placeholder="—"
            />
          </label>
          <label className={labelClass}>
            Shortcut mastery %
            <input
              type="number"
              min={0}
              max={100}
              className={inputClass}
              value={minShortcutMasteryPct}
              onChange={(e) => setMinShortcutMasteryPct(e.target.value)}
              placeholder="—"
            />
          </label>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Create assignment</Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
