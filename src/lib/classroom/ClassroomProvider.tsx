"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";
import type {
  Assignment,
  Classroom,
  CurrentUser,
  Student,
  Teacher,
} from "@/lib/data/types";
import { STUDENTS } from "@/lib/mock/students";
import {
  SEED_ASSIGNMENTS,
  SEED_CLASSES,
  TEACHER,
} from "@/lib/mock/classroom";
import { generateJoinCode } from "./codes";
import type {
  AssignmentRow,
  ClassMembershipRow,
  ClassroomRow,
  LessonProgressRow,
  ProfileRow,
  ShortcutLessonProgressRow,
  ShortcutSkillProgressRow,
} from "@/lib/supabase/types";

const STORAGE_KEY = "speedskin:classroom";

export type NewAssignmentInput = Omit<Assignment, "id">;

interface Deltas {
  extraClasses: Classroom[];
  extraAssignments: Assignment[];
  joinedClassId: string | null;
  joinedStudent: Student | null;
  archivedClassIds: string[];
  deletedClassIds: string[];
  removedStudentIds: string[];
  joinCodeOverrides: Record<string, string>;
}

const EMPTY_DELTAS: Deltas = {
  extraClasses: [],
  extraAssignments: [],
  joinedClassId: null,
  joinedStudent: null,
  archivedClassIds: [],
  deletedClassIds: [],
  removedStudentIds: [],
  joinCodeOverrides: {},
};

export interface JoinResult {
  ok: boolean;
  classroom?: Classroom;
}

interface RemoteState {
  classes: Classroom[];
  students: Student[];
  assignments: Assignment[];
  joinedClassId: string | null;
}

const EMPTY_REMOTE: RemoteState = {
  classes: [],
  students: [],
  assignments: [],
  joinedClassId: null,
};

interface ClassroomContextValue {
  ready: boolean;
  teacher: Teacher;
  classes: Classroom[];
  students: Student[];
  assignments: Assignment[];
  joinedClassId: string | null;
  joinedClass: Classroom | null;
  studentsForClass: (classId: string) => Student[];
  assignmentsForClass: (classId: string) => Assignment[];
  createClass: (name: string) => Classroom;
  createAssignment: (input: NewAssignmentInput) => Assignment;
  removeStudent: (classId: string, studentId: string) => void;
  archiveClass: (classId: string) => void;
  deleteClass: (classId: string) => void;
  regenerateJoinCode: (classId: string) => string | null;
  joinClass: (code: string) => Promise<JoinResult>;
  leaveClass: () => void;
}

const ClassroomContext = createContext<ClassroomContextValue | null>(null);

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function newId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}`;
}

function studentFromUser(user: CurrentUser, classId: string): Student {
  return {
    id: user.id === "me" ? "me-student" : user.id,
    name: user.name,
    avatar: user.avatar,
    classId,
    level: user.level,
    wpm: user.averageWpm,
    accuracy: user.averageAccuracy,
    lessonsCompleted: user.lessonsCompleted,
    completedLessonIds: user.completedLessonIds,
    pythonLessonsCompleted: user.pythonLessonsCompleted,
    shortcutLessonsCompleted: user.shortcutLessonsCompleted,
    completedShortcutLessonIds: user.completedShortcutLessonIds,
    shortcutMasteryPct: user.shortcutMasteryPct,
    shortcutAverageReactionMs: user.shortcutAverageReactionMs,
    practiceMinutes: user.minutesPracticed,
    weakKeys: user.weakKeys,
    weakShortcuts: user.weakShortcuts,
    streakDays: user.streakDays,
    lastActive: "Just now",
    status: user.averageAccuracy < 90 ? "needs-practice" : "on-track",
  };
}

function normalizeStudent(student: Student): Student {
  const legacy = student as Partial<Student>;
  const status =
    legacy.status === "ahead" ||
    legacy.status === "on-track" ||
    legacy.status === "needs-practice"
      ? legacy.status
      : "on-track";

  return {
    ...student,
    pythonLessonsCompleted: legacy.pythonLessonsCompleted ?? 0,
    shortcutLessonsCompleted: legacy.shortcutLessonsCompleted ?? 0,
    completedLessonIds: Array.isArray(legacy.completedLessonIds)
      ? legacy.completedLessonIds
      : [],
    completedShortcutLessonIds: Array.isArray(legacy.completedShortcutLessonIds)
      ? legacy.completedShortcutLessonIds
      : [],
    shortcutMasteryPct: legacy.shortcutMasteryPct ?? 0,
    shortcutAverageReactionMs: legacy.shortcutAverageReactionMs ?? 0,
    practiceMinutes: legacy.practiceMinutes ?? 0,
    weakKeys: Array.isArray(legacy.weakKeys) ? legacy.weakKeys : [],
    weakShortcuts: Array.isArray(legacy.weakShortcuts)
      ? legacy.weakShortcuts
      : [],
    streakDays: legacy.streakDays ?? 0,
    lastActive: legacy.lastActive ?? "Just now",
    status,
  };
}

function classroomFromRow(row: ClassroomRow): Classroom {
  return {
    id: row.id,
    name: row.name,
    joinCode: row.join_code,
    teacherId: row.teacher_id,
    createdAt: row.created_at.slice(0, 10),
    archivedAt: row.archived_at ?? null,
  };
}

function assignmentFromRow(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    classId: row.class_id,
    title: row.title,
    dueDate: row.due_date,
    targetMode: (row.target_mode as Assignment["targetMode"]) ?? undefined,
    lessonIds: row.lesson_ids ?? undefined,
    targetLabel: row.target_label ?? undefined,
    requiredLevel: row.required_level ?? undefined,
    requiredTrack: row.required_track ?? undefined,
    minWpm: row.min_wpm ?? undefined,
    minAccuracy: row.min_accuracy ?? undefined,
    requiredMinutes: row.required_minutes ?? undefined,
    minPythonLessons: row.min_python_lessons ?? undefined,
    minShortcutLessons: row.min_shortcut_lessons ?? undefined,
    minShortcutMasteryPct: row.min_shortcut_mastery_pct ?? undefined,
    academyId: (row.academy_id as Assignment["academyId"]) ?? undefined,
    typingLevel: (row.typing_level as Assignment["typingLevel"]) ?? undefined,
    curriculumLevel:
      (row.curriculum_level as Assignment["curriculumLevel"]) ?? undefined,
  };
}

function assignmentToInsert(input: NewAssignmentInput, createdBy: string) {
  return {
    class_id: input.classId,
    title: input.title,
    due_date: input.dueDate,
    required_level: input.requiredLevel ?? null,
    required_track: input.requiredTrack ?? null,
    min_wpm: input.minWpm ?? null,
    min_accuracy: input.minAccuracy ?? null,
    required_minutes: input.requiredMinutes ?? null,
    min_python_lessons: input.minPythonLessons ?? null,
    min_shortcut_lessons: input.minShortcutLessons ?? null,
    min_shortcut_mastery_pct: input.minShortcutMasteryPct ?? null,
    target_mode: input.targetMode ?? null,
    lesson_ids: input.lessonIds ?? null,
    target_label: input.targetLabel ?? null,
    academy_id: input.academyId ?? null,
    typing_level: input.typingLevel ?? null,
    curriculum_level: input.curriculumLevel ?? null,
    created_by: createdBy,
  };
}

function studentFromRemote({
  profile,
  classId,
  lessonRows,
  shortcutLessonRows,
  shortcutSkillRows,
}: {
  profile: ProfileRow;
  classId: string;
  lessonRows: LessonProgressRow[];
  shortcutLessonRows: ShortcutLessonProgressRow[];
  shortcutSkillRows: ShortcutSkillProgressRow[];
}): Student {
  const completedLessons = lessonRows.filter((row) => row.status === "completed");
  const typingRows = completedLessons.filter((row) => row.track === "basics");
  const pythonRows = completedLessons.filter((row) => row.track === "python");
  const wpmRows = completedLessons
    .map((row) => row.best_wpm)
    .filter((value): value is number => value !== null);
  const accuracyRows = completedLessons
    .map((row) => row.best_accuracy)
    .filter((value): value is number => value !== null);
  const averageWpm = wpmRows.length
    ? Math.round(wpmRows.reduce((sum, value) => sum + value, 0) / wpmRows.length)
    : 0;
  const averageAccuracy = accuracyRows.length
    ? Math.round(
        accuracyRows.reduce((sum, value) => sum + value, 0) /
          accuracyRows.length,
      )
    : 100;
  const completedShortcutLessons = shortcutLessonRows.filter(
    (row) => row.status === "completed",
  ).length;
  const mastered = shortcutSkillRows.filter(
    (row) => row.mastery_state === "Comfortable" || row.mastery_state === "Mastered",
  ).length;
  const shortcutMasteryPct = shortcutSkillRows.length
    ? Math.round((mastered / shortcutSkillRows.length) * 100)
    : 0;
  const reactionRows = shortcutSkillRows
    .map((row) => row.average_reaction_ms)
    .filter((value): value is number => value !== null);
  const shortcutAverageReactionMs = reactionRows.length
    ? Math.round(
        reactionRows.reduce((sum, value) => sum + value, 0) /
          reactionRows.length,
      )
    : 0;
  const weakShortcuts = [...shortcutSkillRows]
    .filter((row) => row.incorrect_attempts > 0)
    .sort((a, b) => b.incorrect_attempts - a.incorrect_attempts)
    .slice(0, 3)
    .map((row) => row.shortcut_id as Student["weakShortcuts"][number]);
  const practiceMinutes = lessonRows.reduce(
    (sum, row) => sum + row.minutes_practiced,
    0,
  );

  return {
    id: profile.id,
    name: profile.full_name,
    avatar:
      profile.full_name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "SS",
    classId,
    level: Math.max(1, typingRows.length + 1),
    wpm: averageWpm,
    accuracy: averageAccuracy,
    lessonsCompleted: completedLessons.length,
    completedLessonIds: completedLessons.map((row) => row.lesson_id),
    pythonLessonsCompleted: pythonRows.length,
    shortcutLessonsCompleted: completedShortcutLessons,
    completedShortcutLessonIds: shortcutLessonRows
      .filter((row) => row.status === "completed")
      .map((row) => row.lesson_id),
    shortcutMasteryPct,
    shortcutAverageReactionMs,
    practiceMinutes,
    weakKeys: [],
    weakShortcuts,
    streakDays: completedLessons.length ? 1 : 0,
    lastActive: "Synced",
    status: averageAccuracy < 90 ? "needs-practice" : "on-track",
  };
}

export function ClassroomProvider({ children }: { children: React.ReactNode }) {
  const { profile, status, supabase } = useAuth();
  const { user } = useUserProgress();
  const [deltas, setDeltas] = useState<Deltas>(EMPTY_DELTAS);
  const [remote, setRemote] = useState<RemoteState>(EMPTY_REMOTE);
  const [ready, setReady] = useState(false);
  const deltasRef = useRef(deltas);
  const isDemoProfile = profile?.id.startsWith("demo-") ?? false;

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Deltas;
          const normalized: Deltas = {
            ...EMPTY_DELTAS,
            ...parsed,
            extraClasses: Array.isArray(parsed.extraClasses)
              ? parsed.extraClasses
              : [],
            extraAssignments: Array.isArray(parsed.extraAssignments)
              ? parsed.extraAssignments
              : [],
            archivedClassIds: Array.isArray(parsed.archivedClassIds)
              ? parsed.archivedClassIds
              : [],
            deletedClassIds: Array.isArray(parsed.deletedClassIds)
              ? parsed.deletedClassIds
              : [],
            removedStudentIds: Array.isArray(parsed.removedStudentIds)
              ? parsed.removedStudentIds
              : [],
            joinCodeOverrides:
              parsed.joinCodeOverrides && typeof parsed.joinCodeOverrides === "object"
                ? parsed.joinCodeOverrides
                : {},
            joinedStudent: parsed.joinedStudent
              ? normalizeStudent(parsed.joinedStudent)
              : null,
          };
          deltasRef.current = normalized;
          setDeltas(normalized);
        }
      } catch {
        // Ignore corrupt local classroom state.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const commit = useCallback((next: Deltas) => {
    deltasRef.current = next;
    setDeltas(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Persistence is best-effort.
    }
  }, []);

  useEffect(() => {
    const current = deltasRef.current;
    if (!current.joinedClassId || !current.joinedStudent) return;
    if (current.joinedStudent.id !== user.id) return;
    const nextStudent = studentFromUser(user, current.joinedClassId);
    if (JSON.stringify(current.joinedStudent) === JSON.stringify(nextStudent)) return;
    commit({
      ...current,
      joinedStudent: nextStudent,
    });
  }, [commit, user]);

  const loadRemote = useCallback(async () => {
    if (!supabase || status !== "authenticated" || !profile || isDemoProfile) return;

    setReady(false);
    const [classResult, assignmentResult, membershipResult] = await Promise.all([
      supabase.from("classrooms").select("*").order("created_at", { ascending: true }),
      supabase.from("assignments").select("*").order("due_date", { ascending: true }),
      supabase.from("class_memberships").select("*"),
    ]);

    const classes = (classResult.data ?? []).map(classroomFromRow);
    const assignments = (assignmentResult.data ?? []).map(assignmentFromRow);
    const memberships = (membershipResult.data ?? []) as ClassMembershipRow[];
    const studentIds = [...new Set(memberships.map((row) => row.student_id))];

    let students: Student[] = [];
    if (studentIds.length > 0) {
      const [profileRows, lessonRows, shortcutLessonRows, shortcutSkillRows] =
        await Promise.all([
          supabase.from("profiles").select("*").in("id", studentIds),
          supabase.from("lesson_progress").select("*").in("user_id", studentIds),
          supabase
            .from("shortcut_lesson_progress")
            .select("*")
            .in("user_id", studentIds),
          supabase
            .from("shortcut_skill_progress")
            .select("*")
            .in("user_id", studentIds),
        ]);

      const profiles = new Map(
        (profileRows.data ?? []).map((row) => [row.id, row as ProfileRow]),
      );
      students = memberships
        .map((membership) => {
          const studentProfile = profiles.get(membership.student_id);
          if (!studentProfile) return null;
          return studentFromRemote({
            profile: studentProfile,
            classId: membership.class_id,
            lessonRows: (lessonRows.data ?? []).filter(
              (row) => row.user_id === membership.student_id,
            ),
            shortcutLessonRows: (shortcutLessonRows.data ?? []).filter(
              (row) => row.user_id === membership.student_id,
            ),
            shortcutSkillRows: (shortcutSkillRows.data ?? []).filter(
              (row) => row.user_id === membership.student_id,
            ),
          });
        })
        .filter((student): student is Student => Boolean(student));
    }

    const ownMembership = memberships.find((row) => row.student_id === profile.id);
    setRemote({
      classes,
      students,
      assignments,
      joinedClassId: ownMembership?.class_id ?? null,
    });
    setReady(true);
  }, [isDemoProfile, profile, status, supabase]);

  useEffect(() => {
    if (supabase && status === "authenticated" && profile && !isDemoProfile) {
      const id = window.setTimeout(() => void loadRemote(), 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [isDemoProfile, loadRemote, profile, status, supabase]);

  const usingRemote = Boolean(
    supabase && status === "authenticated" && profile && !isDemoProfile,
  );

  const localClasses = useMemo(
    () =>
      [
        ...SEED_CLASSES.map((item) => ({
          ...item,
          joinCode: deltas.joinCodeOverrides[item.id] ?? item.joinCode,
          archivedAt: deltas.archivedClassIds.includes(item.id)
            ? new Date().toISOString()
            : item.archivedAt,
        })),
        ...deltas.extraClasses.map((item) => ({
          ...item,
          joinCode: deltas.joinCodeOverrides[item.id] ?? item.joinCode,
          archivedAt: deltas.archivedClassIds.includes(item.id)
            ? (item.archivedAt ?? new Date().toISOString())
            : item.archivedAt,
        })),
      ].filter((item) => !deltas.deletedClassIds.includes(item.id)),
    [
      deltas.archivedClassIds,
      deltas.deletedClassIds,
      deltas.extraClasses,
      deltas.joinCodeOverrides,
    ],
  );
  const localAssignments = useMemo(
    () => [...SEED_ASSIGNMENTS, ...deltas.extraAssignments],
    [deltas.extraAssignments],
  );
  const localStudents = useMemo(
    () =>
      (deltas.joinedStudent
        ? [...STUDENTS, normalizeStudent(deltas.joinedStudent)]
        : STUDENTS
      ).filter((student) => !deltas.removedStudentIds.includes(student.id)),
    [deltas.joinedStudent, deltas.removedStudentIds],
  );

  const classes = (usingRemote ? remote.classes : localClasses).filter(
    (item) => !item.archivedAt,
  );
  const assignments = usingRemote ? remote.assignments : localAssignments;
  const students = usingRemote ? remote.students : localStudents;
  const joinedClassId = usingRemote ? remote.joinedClassId : deltas.joinedClassId;

  const createClass = useCallback(
    (name: string): Classroom => {
      const teacherId = profile?.id ?? TEACHER.id;
      const taken = new Set(classes.map((c) => c.joinCode));
      let joinCode = generateJoinCode();
      while (taken.has(joinCode)) joinCode = generateJoinCode();

      const classroom: Classroom = {
        id: newId("c"),
        name: name.trim() || "Untitled Class",
        joinCode,
        teacherId,
        createdAt: todayIso(),
      };

      if (usingRemote && supabase && profile) {
        setRemote((current) => ({
          ...current,
          classes: [...current.classes, classroom],
        }));
        void supabase.from("classrooms").insert({
          id: classroom.id,
          name: classroom.name,
          join_code: classroom.joinCode,
          teacher_id: profile.id,
        });
        return classroom;
      }

      const current = deltasRef.current;
      commit({
        ...current,
        extraClasses: [...current.extraClasses, classroom],
      });
      return classroom;
    },
    [classes, commit, profile, supabase, usingRemote],
  );

  const removeStudent = useCallback(
    (classId: string, studentId: string) => {
      if (usingRemote && supabase) {
        setRemote((current) => ({
          ...current,
          students: current.students.filter(
            (student) => !(student.classId === classId && student.id === studentId),
          ),
          joinedClassId:
            current.joinedClassId === classId && profile?.id === studentId
              ? null
              : current.joinedClassId,
        }));
        void supabase
          .from("class_memberships")
          .delete()
          .eq("class_id", classId)
          .eq("student_id", studentId);
        return;
      }

      const current = deltasRef.current;
      commit({
        ...current,
        removedStudentIds: current.removedStudentIds.includes(studentId)
          ? current.removedStudentIds
          : [...current.removedStudentIds, studentId],
        joinedClassId:
          current.joinedStudent?.id === studentId && current.joinedClassId === classId
            ? null
            : current.joinedClassId,
        joinedStudent:
          current.joinedStudent?.id === studentId &&
          current.joinedStudent.classId === classId
            ? null
            : current.joinedStudent,
      });
    },
    [commit, profile?.id, supabase, usingRemote],
  );

  const archiveClass = useCallback(
    (classId: string) => {
      const archivedAt = new Date().toISOString();
      if (usingRemote && supabase) {
        setRemote((current) => ({
          ...current,
          classes: current.classes.map((item) =>
            item.id === classId ? { ...item, archivedAt } : item,
          ),
          joinedClassId: current.joinedClassId === classId ? null : current.joinedClassId,
        }));
        void supabase.from("classrooms").update({ archived_at: archivedAt }).eq("id", classId);
        return;
      }
      const current = deltasRef.current;
      commit({
        ...current,
        extraClasses: current.extraClasses.map((item) =>
          item.id === classId ? { ...item, archivedAt } : item,
        ),
        archivedClassIds: current.archivedClassIds.includes(classId)
          ? current.archivedClassIds
          : [...current.archivedClassIds, classId],
        joinedClassId: current.joinedClassId === classId ? null : current.joinedClassId,
        joinedStudent:
          current.joinedStudent?.classId === classId ? null : current.joinedStudent,
      });
    },
    [commit, supabase, usingRemote],
  );

  const deleteClass = useCallback(
    (classId: string) => {
      if (usingRemote && supabase) {
        setRemote((current) => ({
          ...current,
          classes: current.classes.filter((item) => item.id !== classId),
          assignments: current.assignments.filter((item) => item.classId !== classId),
          students: current.students.filter((item) => item.classId !== classId),
          joinedClassId: current.joinedClassId === classId ? null : current.joinedClassId,
        }));
        void supabase.from("classrooms").delete().eq("id", classId);
        return;
      }
      const current = deltasRef.current;
      commit({
        ...current,
        extraClasses: current.extraClasses.filter((item) => item.id !== classId),
        extraAssignments: current.extraAssignments.filter(
          (item) => item.classId !== classId,
        ),
        deletedClassIds: current.deletedClassIds.includes(classId)
          ? current.deletedClassIds
          : [...current.deletedClassIds, classId],
        removedStudentIds: [
          ...new Set([
            ...current.removedStudentIds,
            ...STUDENTS.filter((student) => student.classId === classId).map(
              (student) => student.id,
            ),
          ]),
        ],
        joinedClassId: current.joinedClassId === classId ? null : current.joinedClassId,
        joinedStudent:
          current.joinedStudent?.classId === classId ? null : current.joinedStudent,
      });
    },
    [commit, supabase, usingRemote],
  );

  const regenerateJoinCode = useCallback(
    (classId: string): string | null => {
      const taken = new Set(classes.filter((c) => c.id !== classId).map((c) => c.joinCode));
      let joinCode = generateJoinCode();
      while (taken.has(joinCode)) joinCode = generateJoinCode();
      if (usingRemote && supabase) {
        setRemote((current) => ({
          ...current,
          classes: current.classes.map((item) =>
            item.id === classId ? { ...item, joinCode } : item,
          ),
        }));
        void supabase.from("classrooms").update({ join_code: joinCode }).eq("id", classId);
        return joinCode;
      }
      const current = deltasRef.current;
      commit({
        ...current,
        extraClasses: current.extraClasses.map((item) =>
          item.id === classId ? { ...item, joinCode } : item,
        ),
        joinCodeOverrides: {
          ...current.joinCodeOverrides,
          [classId]: joinCode,
        },
      });
      return joinCode;
    },
    [classes, commit, supabase, usingRemote],
  );

  const createAssignment = useCallback(
    (input: NewAssignmentInput): Assignment => {
      const assignment: Assignment = { id: newId("a"), ...input };

      if (usingRemote && supabase && profile) {
        setRemote((current) => ({
          ...current,
          assignments: [...current.assignments, assignment],
        }));
        void supabase
          .from("assignments")
          .insert({ id: assignment.id, ...assignmentToInsert(input, profile.id) });
        return assignment;
      }

      const current = deltasRef.current;
      commit({
        ...current,
        extraAssignments: [...current.extraAssignments, assignment],
      });
      return assignment;
    },
    [commit, profile, supabase, usingRemote],
  );

  const joinClass = useCallback(
    async (code: string): Promise<JoinResult> => {
      const normalized = code.trim().toUpperCase();

      if (usingRemote && supabase) {
        const { data, error } = await supabase.rpc("join_class_by_code", {
          p_join_code: normalized,
        });
        if (error || !data?.[0]) return { ok: false };

        const row = data[0];
        const classroom: Classroom = {
          id: row.id,
          name: row.name,
          joinCode: row.join_code,
          teacherId: row.teacher_id,
          createdAt: row.created_at.slice(0, 10),
        };
        setRemote((current) => ({
          ...current,
          classes: current.classes.some((item) => item.id === classroom.id)
            ? current.classes
            : [...current.classes, classroom],
          students: [
            ...current.students.filter((student) => student.id !== user.id),
            studentFromUser(user, classroom.id),
          ],
          joinedClassId: classroom.id,
        }));
        void loadRemote();
        return { ok: true, classroom };
      }

      const current = deltasRef.current;
      const classroom = localClasses.find((c) => c.joinCode === normalized);
      if (!classroom) return { ok: false };

      commit({
        ...current,
        joinedClassId: classroom.id,
        joinedStudent: studentFromUser(user, classroom.id),
      });
      return { ok: true, classroom };
    },
    [commit, loadRemote, localClasses, supabase, user, usingRemote],
  );

  const leaveClass = useCallback(() => {
    if (usingRemote && supabase && joinedClassId && profile) {
      const leavingClassId = joinedClassId;
      setRemote((current) => ({
        ...current,
        joinedClassId: null,
        students: current.students.filter(
          (student) =>
            !(student.id === profile.id && student.classId === leavingClassId),
        ),
      }));
      void supabase
        .from("class_memberships")
        .delete()
        .eq("class_id", leavingClassId)
        .eq("student_id", profile.id);
      return;
    }

    commit({
      ...deltasRef.current,
      joinedClassId: null,
      joinedStudent: null,
    });
  }, [commit, joinedClassId, profile, supabase, usingRemote]);

  const teacher: Teacher = useMemo(
    () =>
      profile
        ? {
            id: profile.id,
            name: profile.fullName,
            email: profile.email,
          }
        : TEACHER,
    [profile],
  );

  const value = useMemo<ClassroomContextValue>(() => {
    const joinedClass = classes.find((c) => c.id === joinedClassId) ?? null;
    return {
      ready,
      teacher,
      classes,
      students,
      assignments,
      joinedClassId,
      joinedClass,
      studentsForClass: (classId) =>
        students.filter((s) => s.classId === classId),
      assignmentsForClass: (classId) =>
        assignments.filter((a) => a.classId === classId),
      createClass,
      createAssignment,
      removeStudent,
      archiveClass,
      deleteClass,
      regenerateJoinCode,
      joinClass,
      leaveClass,
    };
  }, [
    assignments,
    classes,
    createAssignment,
    createClass,
    deleteClass,
    regenerateJoinCode,
    joinClass,
    joinedClassId,
    leaveClass,
    archiveClass,
    removeStudent,
    ready,
    students,
    teacher,
  ]);

  return (
    <ClassroomContext.Provider value={value}>
      {children}
    </ClassroomContext.Provider>
  );
}

export function useClassroom(): ClassroomContextValue {
  const ctx = useContext(ClassroomContext);
  if (!ctx) {
    throw new Error("useClassroom must be used within a ClassroomProvider");
  }
  return ctx;
}
