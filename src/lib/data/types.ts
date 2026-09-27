/*
  Domain types. These mirror the shape we expect future Supabase tables to have,
  so the mock data layer can be swapped for real queries with minimal churn.
*/

export type LessonCategory =
  | "letters"
  | "words"
  | "rows"
  | "capitals"
  | "punctuation"
  | "numbers"
  | "sentences"
  | "timed"
  | "code";

/** The engine is content-agnostic; STEP 2 adds a "python" prompt type. */
export type PromptType = "english" | "python";

/** Sub-topic that narrows what a generated prompt contains. */
export type PromptTopic =
  | "strings"
  | "numbers"
  | "conditions"
  | "loops"
  | "multiline";

/** Learning paths shown as separate tracks in the UI. */
export type LessonTrack = "basics" | "python" | "shortcuts";

export type AcademyId =
  | "keyboard"
  | "language"
  | "chromebook"
  | "digital"
  | "communication"
  | "people"
  | "money"
  | "life";

export type GradeBand = "3-5" | "6-8" | "9-12" | "any";
export type CurriculumLevel =
  | "foundation"
  | "developing"
  | "applied"
  | "analytical"
  | "synthesis";
export type TypingLevel =
  | "beginner"
  | "full-alphabet"
  | "intermediate"
  | "punctuation"
  | "numbers-symbols"
  | "real-world"
  | "fluency"
  | "advanced";
export type CurriculumLessonStatus = "draft" | "published" | "archived";
export type LessonStage = "learn" | "type" | "think" | "check" | "score";

export interface Academy {
  id: AcademyId;
  name: string;
  shortName: string;
  description: string;
  topics: string[];
  order: number;
}

export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation: string;
}

export interface VocabularyItem {
  term: string;
  definition: string;
}

export type LessonStatus = "completed" | "current" | "locked" | "available";

export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole | null;
  createdAt: string;
  updatedAt: string;
  lastLogin: string | null;
}

export interface Lesson {
  id: string;
  level: number;
  order: number;
  title: string;
  focus: string;
  category: LessonCategory;
  promptType: PromptType;
  /** Which learning path this lesson belongs to. */
  track: LessonTrack;
  /** Narrows generated content (mainly for Python topics). */
  promptTopic?: PromptTopic;
  /** Fixed sample used by the STEP 1 engine; later steps generate prompts. */
  sampleText: string;
  estimatedMinutes: number;
  /** Optional time budget for timed challenges, in seconds. */
  timeLimitSeconds?: number;
}

/**
 * A reusable Academy lesson. Legacy Python lessons intentionally keep using
 * `Lesson`; Academy lessons add structured curriculum without changing the IDs
 * used by existing typing progress.
 */
export interface CurriculumLesson extends Lesson {
  slug: string;
  academy: AcademyId;
  broadTrack: AcademyId;
  specificTopic: string;
  unitId: string;
  gradeBand: GradeBand;
  curriculumLevel: CurriculumLevel;
  typingLevel: TypingLevel;
  typingObjective: string;
  targetedTypingSkills: string[];
  learningOutcome: string;
  miniLesson: string;
  typingPassage: string;
  thinkPrompt: string;
  thinkMinLength?: number;
  thinkMaxLength?: number;
  quizBank: QuizQuestion[];
  vocabulary: VocabularyItem[];
  tags: string[];
  estimatedTime: number;
  xpValue: number;
  mastery: LessonMasteryCriteria;
  prerequisiteLessonIds?: string[];
  isCore: boolean;
  sequence: number;
  status: CurriculumLessonStatus;
  locale?: string;
  relatedPracticeHref?: string;
}

export interface LessonMasteryCriteria {
  targetAccuracy: number;
  targetQuizPercentage: number;
  minimumSuccessfulAttempts: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedChoiceId: string;
  correct: boolean;
}

export interface LessonScore {
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
}

export interface LessonAttempt {
  id: string;
  lessonId: string;
  academy: AcademyId;
  startedAt: string;
  completedAt: string;
  thinkResponse: string;
  quizAnswers: QuizAnswer[];
  quizScore: LessonScore;
  typingResult: {
    wpm: number;
    accuracy: number;
    mistakes: number;
    elapsedMs: number;
    correctChars: number;
    totalChars: number;
  };
  xpEarned: number;
}

export interface AcademyProgress {
  academy: AcademyId;
  completed: number;
  total: number;
  percentage: number;
  nextLessonId: string | null;
}

export interface LessonProgress {
  lessonId: string;
  status: LessonStatus;
  bestWpm: number | null;
  bestAccuracy: number | null;
  stars: 0 | 1 | 2 | 3;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  /** Human-readable unlock condition for locked badges. */
  requirement: string;
}

export type StudentStatus = "ahead" | "on-track" | "needs-practice";

export interface Student {
  id: string;
  name: string;
  avatar: string;
  /** Class this student belongs to (FK to Classroom.id). */
  classId: string;
  level: number;
  wpm: number;
  accuracy: number;
  lessonsCompleted: number;
  completedLessonIds?: string[];
  /** Python-track lessons completed (out of PYTHON_LESSON_COUNT). */
  pythonLessonsCompleted: number;
  /** Keyboard shortcut lessons completed (out of SHORTCUT_LESSON_COUNT). */
  shortcutLessonsCompleted: number;
  completedShortcutLessonIds?: string[];
  /** Percentage of shortcut skills in Comfortable or Mastered states. */
  shortcutMasteryPct: number;
  /** Average shortcut reaction time in milliseconds. */
  shortcutAverageReactionMs: number;
  /** Total practice time in minutes. */
  practiceMinutes: number;
  /** Most missed characters, worst first (e.g. ["q", "p", ";"]). */
  weakKeys: string[];
  /** Most missed shortcuts, worst first. */
  weakShortcuts: ShortcutId[];
  streakDays: number;
  lastActive: string;
  status: StudentStatus;
  /** Deterministic 0-100 metric derived from accuracy, progress, and weak keys. */
  keyboardHealth?: number;
}

export interface CurrentUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  streakDays: number;
  lessonsCompleted: number;
  completedLessonIds: string[];
  pythonLessonsCompleted: number;
  shortcutLessonsCompleted: number;
  completedShortcutLessonIds: string[];
  shortcutMasteryPct: number;
  shortcutAverageReactionMs: number;
  totalLessons: number;
  averageWpm: number;
  averageAccuracy: number;
  minutesPracticed: number;
  weakKeys: string[];
  weakShortcuts: ShortcutId[];
  currentLessonId: string;
  xp?: number;
  keyboardHealth?: number;
}

// ---- Keyboard shortcut learning ----

export type ShortcutPlatform = "windows" | "mac";

export type ShortcutId =
  | "copy"
  | "paste"
  | "undo"
  | "cut"
  | "redo"
  | "select-all"
  | "save"
  | "find"
  | "new-tab"
  | "close-tab";

export type ShortcutMasteryState =
  | "Learning"
  | "Practicing"
  | "Comfortable"
  | "Mastered";

export interface ShortcutDefinition {
  id: ShortcutId;
  label: string;
  key: string;
  description: string;
  missionPrompts: string[];
}

export interface ShortcutLesson {
  id: string;
  level: number;
  order: number;
  title: string;
  focus: string;
  shortcutIds: ShortcutId[];
  estimatedMinutes: number;
  sessionLength: number;
  isBoss?: boolean;
}

export interface ShortcutTask {
  id: string;
  shortcutId: ShortcutId;
  prompt: string;
}

export interface ShortcutProgress {
  lessonId: string;
  status: LessonStatus;
  bestAccuracy: number | null;
  averageReactionMs: number | null;
  completedSessions: number;
}

export interface ShortcutSkillProgress {
  shortcutId: ShortcutId;
  correctAttempts: number;
  incorrectAttempts: number;
  averageReactionMs: number | null;
  masteryState: ShortcutMasteryState;
}

export interface ShortcutAttempt {
  shortcutId: ShortcutId;
  correct: boolean;
  reactionMs: number;
  expectedCombo: string;
  actualCombo: string;
  createdAt: string;
}

// ---- Classroom system (teachers, classes, assignments, progress) ----

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

export interface Classroom {
  id: string;
  name: string;
  /** Unique join code, e.g. "SPEED-4821". */
  joinCode: string;
  teacherId: string;
  /** ISO date string. */
  createdAt: string;
  /** Archived classrooms are hidden from active teaching flows. */
  archivedAt?: string | null;
}

export type AssignmentTargetMode =
  | "individual"
  | "multiple"
  | "range"
  | "unit"
  | "randomized"
  | "checkpoint"
  | "category";

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  /** ISO date string. */
  dueDate: string;
  targetMode?: AssignmentTargetMode;
  lessonIds?: string[];
  targetLabel?: string;
  /** Optional requirements; an assignment needs at least one. */
  requiredLevel?: number;
  requiredTrack?: LessonTrack;
  minWpm?: number;
  minAccuracy?: number;
  requiredMinutes?: number;
  /** Optional Python typing requirement: minimum Python lessons completed. */
  minPythonLessons?: number;
  /** Optional keyboard shortcut requirement: minimum shortcut lessons completed. */
  minShortcutLessons?: number;
  /** Optional keyboard shortcut requirement: class/student mastery percentage. */
  minShortcutMasteryPct?: number;
  academyId?: AcademyId;
  typingLevel?: TypingLevel;
  curriculumLevel?: CurriculumLevel;
}

/** A single practice session — the shape of a future `progress_logs` row. */
export interface ProgressLog {
  id: string;
  studentId: string;
  lessonId: string;
  wpm: number;
  accuracy: number;
  durationSeconds: number;
  mistakes: number;
  date: string;
}

/** Inputs the assignment evaluator needs; derived from a Student or CurrentUser. */
export interface EvalContext {
  level: number;
  wpm: number;
  accuracy: number;
  practiceMinutes: number;
  completedLessonIds?: string[];
  pythonCompleted: number;
  shortcutCompleted: number;
  completedShortcutLessonIds?: string[];
  shortcutMasteryPct: number;
}

export interface AssignmentCriterion {
  label: string;
  target: string;
  actual: string;
  met: boolean;
}

export interface AssignmentEvaluation {
  criteria: AssignmentCriterion[];
  metCount: number;
  total: number;
  complete: boolean;
  progressPct: number;
}
