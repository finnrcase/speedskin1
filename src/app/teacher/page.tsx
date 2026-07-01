"use client";

import { useState } from "react";
import {
  Activity,
  BookOpenCheck,
  ClipboardList,
  Clock3,
  Command,
  Download,
  Gauge,
  KeyRound,
  Plus,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useClassroom } from "@/lib/classroom/ClassroomProvider";
import { computeClassStats, summarizeStudent } from "@/lib/classroom/evaluate";
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

  const practiceHours = Math.round(stats.totalPracticeMinutes / 60);

  return (
    <div className="space-y-8">
      <Card className="warm-panel border-brand/15">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_24px_rgba(249,115,22,0.22)]">
              <Users className="size-7" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="space-y-2">
              <p className="inline-flex rounded-full bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                Teacher dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {activeClass?.name ?? "Your classes"}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink-soft">
                {teacher.name} can review practice, assign typing goals, and
                spot where students need support.
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
          <div className="rounded-button border border-white/70 bg-white/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
              Admin-friendly
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Clear progress data without extra noise.
            </p>
          </div>
          <div className="rounded-button border border-white/70 bg-white/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <BookOpenCheck className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
              {students.length} students
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Practice status and homework in one place.
            </p>
          </div>
          <div className="rounded-button border border-white/70 bg-white/70 p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardList className="size-4 text-brand" strokeWidth={1.8} aria-hidden />
              {assignments.length} assignments
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Due dates, goals, and completion at a glance.
            </p>
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
        <Card className="grid gap-5 overflow-hidden border-brand/20 bg-gradient-to-br from-brand to-brand-dark text-white sm:grid-cols-[1fr_auto] sm:items-center">
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
            Students enter the code on the Homework page. Their assignment view
            updates automatically after joining {activeClass.name}.
          </div>
        </Card>
      )}

      {/* Class overview cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
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
          label="Practice"
          value={`${practiceHours}h`}
          icon={Clock3}
          tone="info"
          detail="Total class time"
        />
        <StatCard
          label="Shortcut mastery"
          value={`${stats.averageShortcutMasteryPct}%`}
          icon={Command}
          tone="success"
          detail="Comfortable or mastered"
          progress={stats.averageShortcutMasteryPct}
        />
        <StatCard
          label="Shortcut reaction"
          value={(stats.averageShortcutReactionMs / 1000).toFixed(1)}
          unit="s"
          icon={Clock3}
          tone="neutral"
          detail="Class average"
          progress={Math.max(
            0,
            100 - (stats.averageShortcutReactionMs / 2600) * 100,
          )}
        />
      </section>

      <Card className="border-brand/15 bg-cream">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Keyboard shortcuts
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-ink">
              Most-missed shortcuts
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.mostMissedShortcuts.map((shortcutId) => (
              <span
                key={shortcutId}
                className="rounded-button border border-line bg-white px-3 py-2 text-sm font-semibold text-ink-soft"
              >
                {shortcutLabel(shortcutId)}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* Assignments */}
      <section className="space-y-4 border-t border-line pt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Classroom goals
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
              Assignments
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-soft">
              Set clear goals for level progress, speed, accuracy, practice
              time, or Python typing.
            </p>
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
        />
      </section>

      {/* Per-student summaries */}
      <section className="space-y-4 border-t border-line pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Quick notes
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">
            Student summaries
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {students.map((s) => (
            <Card key={s.id} className="flex gap-3 hover:border-brand/20 hover:shadow-[0_10px_26px_rgba(88,64,38,0.08)]">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-bold text-brand-dark"
                aria-hidden
              >
                {s.avatar}
              </span>
              <p className="text-sm text-ink-soft">{summarizeStudent(s)}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
