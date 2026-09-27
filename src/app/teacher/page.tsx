"use client";

import { useState } from "react";
import {
  Activity,
  Archive,
  BookOpenCheck,
  ClipboardList,
  Command,
  Download,
  Gauge,
  KeyRound,
  HeartPulse,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useClassroom } from "@/lib/classroom/ClassroomProvider";
import { computeClassStats } from "@/lib/classroom/evaluate";
import { StudentProgressTable } from "@/components/classroom/StudentProgressTable";
import { AssignmentCompletionTable } from "@/components/classroom/AssignmentCompletionTable";
import { AssignmentForm } from "@/components/classroom/AssignmentForm";
import { buildRosterCsv } from "@/lib/csv";
import { PYTHON_LESSON_COUNT, SHORTCUT_LESSON_COUNT } from "@/lib/data";
import { shortcutLabel } from "@/lib/shortcuts/catalog";

export default function TeacherPage() {
  const {
    classes,
    teacher,
    studentsForClass,
    assignmentsForClass,
  createClass,
  createAssignment,
  removeStudent,
  archiveClass,
  deleteClass,
  regenerateJoinCode,
  } = useClassroom();

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  const activeClassId = selectedClassId ?? classes[0]?.id ?? null;
  const activeClass = classes.find((c) => c.id === activeClassId) ?? null;
  const students = activeClassId ? studentsForClass(activeClassId) : [];
  const assignments = activeClassId ? assignmentsForClass(activeClassId) : [];
  const stats = computeClassStats(students);
  const weakestKeys = [...new Set(students.flatMap((student) => student.weakKeys))].slice(0, 4);
  const weakestShortcuts = stats.mostMissedShortcuts;

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const created = createClass(newClassName);
    setSelectedClassId(created.id);
    setNewClassName("");
    setShowClassForm(false);
  };

  const handleExportCsv = () => {
    if (!activeClass) return;
    const csv = buildRosterCsv(
      students,
      PYTHON_LESSON_COUNT,
      SHORTCUT_LESSON_COUNT,
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeClass.name.replace(/\s+/g, "-").toLowerCase()}-roster.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const attentionCount = students.length - stats.studentsOnPace;

  return (
    <div className="space-y-7">
      <Card className="border-brand/15 bg-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-white">
              <Users className="size-7" strokeWidth={1.8} aria-hidden />
            </span>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {activeClass?.name ?? "Your classes"}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {teacher.name}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
            <Button variant="outline" onClick={handleExportCsv} disabled={!students.length}>
              <Download className="size-4" strokeWidth={1.8} aria-hidden />
              Export CSV
            </Button>
            <Button onClick={() => setShowClassForm((v) => !v)}>
              <Plus className="size-4" strokeWidth={1.8} aria-hidden />
              New class
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-button border border-line bg-cream p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
              {attentionCount} need attention
            </div>
          </div>
          <div className="rounded-button border border-line bg-cream p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <BookOpenCheck className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
              {students.length} students
            </div>
          </div>
          <div className="rounded-button border border-line bg-cream p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardList className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
              {assignments.length} assignments
            </div>
          </div>
        </div>
      </Card>

      {/* Class switcher */}
      {classes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {classes.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedClassId(c.id)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold no-select",
                c.id === activeClassId
                  ? "bg-brand text-white shadow-[0_8px_18px_rgba(249,115,22,0.18)]"
                  : "border border-line bg-surface text-ink-soft hover:border-brand/25 hover:bg-cream hover:text-ink",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Create class form */}
      {showClassForm && (
        <Card as="section" className="bg-surface-muted">
          <form onSubmit={handleCreateClass} className="flex flex-col gap-3 sm:flex-row">
            <input
              className="h-11 flex-1 rounded-button border border-line bg-surface px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="Class name, e.g. Class 7A"
              aria-label="Class name"
            />
            <div className="flex gap-2">
              <Button type="submit">Create class</Button>
              <Button type="button" variant="ghost" onClick={() => setShowClassForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Join code */}
      {activeClass && (
        <Card className="grid gap-4 border-brand/20 bg-brand text-white sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30">
              <KeyRound className="size-6" strokeWidth={1.8} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-white/85">
                Class join code
              </p>
              <p className="mt-1 whitespace-nowrap font-mono text-3xl font-bold tracking-[0.08em] text-white sm:text-5xl sm:tracking-[0.14em]">
                {activeClass.joinCode}
              </p>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
                Share this code with students to join your class.
              </p>
            </div>
          </div>
          <div className="rounded-card border border-white/20 bg-white/15 p-4 text-sm text-white/85">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => activeClass && regenerateJoinCode(activeClass.id)}
              >
                <RefreshCcw className="size-4" strokeWidth={1.8} aria-hidden />
                Regenerate code
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => activeClass && archiveClass(activeClass.id)}
              >
                <Archive className="size-4" strokeWidth={1.8} aria-hidden />
                Archive
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => activeClass && deleteClass(activeClass.id)}
              >
                <Trash2 className="size-4" strokeWidth={1.8} aria-hidden />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Class overview cards */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Keyboard Health"
          value={stats.averageKeyboardHealth}
          icon={HeartPulse}
          tone="brand"
          detail="Accuracy, progress, and weak keys"
          progress={stats.averageKeyboardHealth}
        />
        <StatCard
          label="Avg speed"
          value={stats.averageWpm}
          unit="wpm"
          icon={Gauge}
          tone="brand"
          detail="Class target: 40 WPM"
          progress={(stats.averageWpm / 40) * 100}
        />
        <StatCard
          label="Avg accuracy"
          value={`${stats.averageAccuracy}%`}
          icon={Target}
          tone="success"
          detail="Goal: 95%"
          progress={stats.averageAccuracy}
        />
        <StatCard
          label="Active today"
          value={stats.activeToday}
          icon={Activity}
          tone="info"
          detail={`${students.length} enrolled`}
          progress={students.length ? (stats.activeToday / students.length) * 100 : 0}
        />
        <StatCard
          label="Students"
          value={students.length}
          icon={Users}
          tone="neutral"
          detail="Roster ready"
        />
        <StatCard
          label="Assignments"
          value={assignments.length}
          icon={ClipboardList}
          tone="brand"
          detail="Active goals"
        />
        <StatCard
          label="Shortcut mastery"
          value={`${stats.averageShortcutMasteryPct}%`}
          icon={Command}
          tone="success"
          detail="Comfortable or mastered"
          progress={stats.averageShortcutMasteryPct}
        />
      </section>

      {/* Assignments */}
      <section className="space-y-4 border-t border-line pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              Assignments
            </h2>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowAssignmentForm((v) => !v)}
            disabled={!activeClassId}
          >
            <Plus className="size-4" strokeWidth={1.8} aria-hidden />
            New assignment
          </Button>
        </div>
        {showAssignmentForm && activeClassId && (
          <AssignmentForm
            classId={activeClassId}
            onCreate={(input) => {
              createAssignment(input);
              setShowAssignmentForm(false);
            }}
            onCancel={() => setShowAssignmentForm(false)}
          />
        )}
        <AssignmentCompletionTable assignments={assignments} students={students} />
      </section>

      <section className="grid gap-3 border-t border-line pt-6 lg:grid-cols-3">
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Students needing help
          </p>
          <p className="text-2xl font-bold text-ink">{attentionCount}</p>
          <p className="text-sm text-ink-soft">
            {stats.studentsOnPace} on pace · {stats.needingAccuracyPractice} need accuracy practice · {stats.significantlyBehind} significantly behind · {stats.otherPracticeNeeds} need other practice.
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Typing weak spots
          </p>
          <p className="text-sm font-semibold text-ink">
            {weakestKeys.length ? weakestKeys.join(", ") : "No weak keys yet"}
          </p>
        </Card>
        <Card className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Shortcut weak spots
          </p>
          <p className="text-sm font-semibold text-ink">
            {weakestShortcuts.length
              ? weakestShortcuts.map(shortcutLabel).join(", ")
              : "No missed shortcuts yet"}
          </p>
        </Card>
      </section>

      {/* Student progress table */}
      <section className="space-y-4 border-t border-line pt-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Roster view
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              Student progress
            </h2>
          </div>
          <span className="text-xs text-ink-faint lg:hidden">
            Swipe for more columns
          </span>
        </div>
        <StudentProgressTable
          students={students}
          assignments={assignments}
          pythonTotal={PYTHON_LESSON_COUNT}
          shortcutTotal={SHORTCUT_LESSON_COUNT}
          onRemoveStudent={
            activeClassId
              ? (studentId) => removeStudent(activeClassId, studentId)
              : undefined
          }
        />
      </section>

    </div>
  );
}
