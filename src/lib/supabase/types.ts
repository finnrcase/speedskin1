export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "student" | "teacher" | "admin";
export type DbLessonTrack = "basics" | "python" | "shortcuts";
export type DbLessonStatus = "completed" | "current" | "locked" | "available";
export type DbShortcutMasteryState =
  | "Learning"
  | "Practicing"
  | "Comfortable"
  | "Mastered";

type TableDef<Row, Insert, Update = Partial<Insert>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface ProfileRow {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
}

export interface ClassroomRow {
  id: string;
  name: string;
  join_code: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface ClassMembershipRow {
  id: string;
  class_id: string;
  student_id: string;
  created_at: string;
}

export interface AssignmentRow {
  id: string;
  class_id: string;
  title: string;
  due_date: string;
  required_level: number | null;
  required_track: DbLessonTrack | null;
  min_wpm: number | null;
  min_accuracy: number | null;
  required_minutes: number | null;
  min_python_lessons: number | null;
  min_shortcut_lessons: number | null;
  min_shortcut_mastery_pct: number | null;
  target_mode: string | null;
  lesson_ids: string[] | null;
  target_label: string | null;
  academy_id: string | null;
  typing_level: string | null;
  curriculum_level: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface LessonProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  track: DbLessonTrack;
  status: DbLessonStatus;
  best_wpm: number | null;
  best_accuracy: number | null;
  stars: number;
  completed_sessions: number;
  minutes_practiced: number;
  updated_at: string;
}

export interface ProgressLogRow {
  id: string;
  user_id: string;
  lesson_id: string;
  track: DbLessonTrack;
  wpm: number;
  accuracy: number;
  duration_seconds: number;
  mistakes: number;
  date: string;
  created_at: string;
}

export interface LessonAttemptRow {
  id: string;
  user_id: string;
  lesson_id: string;
  academy_id: string;
  think_response: string;
  quiz_answers: Json;
  quiz_correct: number;
  quiz_total: number;
  quiz_percentage: number;
  wpm: number;
  accuracy: number;
  mistakes: number;
  duration_seconds: number;
  correct_chars: number;
  total_chars: number;
  xp_earned: number;
  started_at: string;
  completed_at: string;
}

export interface ShortcutSkillProgressRow {
  id: string;
  user_id: string;
  shortcut_id: string;
  correct_attempts: number;
  incorrect_attempts: number;
  average_reaction_ms: number | null;
  mastery_state: DbShortcutMasteryState;
  updated_at: string;
}

export interface ShortcutLessonProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  status: DbLessonStatus;
  best_accuracy: number | null;
  average_reaction_ms: number | null;
  completed_sessions: number;
  updated_at: string;
}

export interface ShortcutAttemptRow {
  id: string;
  user_id: string;
  lesson_id: string | null;
  shortcut_id: string;
  correct: boolean;
  reaction_ms: number;
  expected_combo: string;
  actual_combo: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<
        ProfileRow,
        {
          id: string;
          email: string;
          full_name: string;
          role?: UserRole | null;
        },
        {
          email?: string;
          full_name?: string;
          role?: UserRole | null;
        }
      >;
      classrooms: TableDef<
        ClassroomRow,
        {
          id?: string;
          name: string;
          join_code: string;
          teacher_id: string;
        },
        {
          name?: string;
          join_code?: string;
          teacher_id?: string;
        }
      >;
      class_memberships: TableDef<
        ClassMembershipRow,
        {
          id?: string;
          class_id: string;
          student_id: string;
        }
      >;
      assignments: TableDef<
        AssignmentRow,
        {
          id?: string;
          class_id: string;
          title: string;
          due_date: string;
          required_level?: number | null;
          required_track?: DbLessonTrack | null;
          min_wpm?: number | null;
          min_accuracy?: number | null;
          required_minutes?: number | null;
          min_python_lessons?: number | null;
          min_shortcut_lessons?: number | null;
          min_shortcut_mastery_pct?: number | null;
          target_mode?: string | null;
          lesson_ids?: string[] | null;
          target_label?: string | null;
          academy_id?: string | null;
          typing_level?: string | null;
          curriculum_level?: string | null;
          created_by: string;
        }
      >;
      lesson_progress: TableDef<
        LessonProgressRow,
        {
          id?: string;
          user_id: string;
          lesson_id: string;
          track: DbLessonTrack;
          status?: DbLessonStatus;
          best_wpm?: number | null;
          best_accuracy?: number | null;
          stars?: number;
          completed_sessions?: number;
          minutes_practiced?: number;
        }
      >;
      progress_logs: TableDef<
        ProgressLogRow,
        {
          id?: string;
          user_id: string;
          lesson_id: string;
          track: DbLessonTrack;
          wpm: number;
          accuracy: number;
          duration_seconds: number;
          mistakes: number;
          date?: string;
        }
      >;
      lesson_attempts: TableDef<
        LessonAttemptRow,
        {
          id?: string;
          user_id: string;
          lesson_id: string;
          academy_id: string;
          think_response: string;
          quiz_answers: Json;
          quiz_correct: number;
          quiz_total: number;
          quiz_percentage: number;
          wpm: number;
          accuracy: number;
          mistakes: number;
          duration_seconds: number;
          correct_chars: number;
          total_chars: number;
          xp_earned: number;
          started_at: string;
          completed_at: string;
        }
      >;
      shortcut_skill_progress: TableDef<
        ShortcutSkillProgressRow,
        {
          id?: string;
          user_id: string;
          shortcut_id: string;
          correct_attempts?: number;
          incorrect_attempts?: number;
          average_reaction_ms?: number | null;
          mastery_state?: DbShortcutMasteryState;
        }
      >;
      shortcut_lesson_progress: TableDef<
        ShortcutLessonProgressRow,
        {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: DbLessonStatus;
          best_accuracy?: number | null;
          average_reaction_ms?: number | null;
          completed_sessions?: number;
        }
      >;
      shortcut_attempts: TableDef<
        ShortcutAttemptRow,
        {
          id?: string;
          user_id: string;
          lesson_id?: string | null;
          shortcut_id: string;
          correct: boolean;
          reaction_ms: number;
          expected_combo: string;
          actual_combo: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      join_class_by_code: {
        Args: { p_join_code: string };
        Returns: Pick<
          ClassroomRow,
          "id" | "name" | "join_code" | "teacher_id" | "created_at"
        >[];
      };
    };
    Enums: {
      user_role: UserRole;
      lesson_track: DbLessonTrack;
      lesson_status: DbLessonStatus;
      shortcut_mastery_state: DbShortcutMasteryState;
    };
    CompositeTypes: Record<string, never>;
  };
};
