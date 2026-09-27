"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleCheck,
  Gauge,
  HeartPulse,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import { TypingArea } from "@/components/typing/TypingArea";
import { Badge } from "@/components/ui/Badge";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  calculateXp,
  getAcademyProgress,
  getNextAcademyLesson,
  scoreQuiz,
  selectQuizQuestions,
} from "@/lib/curriculum";
import type {
  CurriculumLesson,
  LessonAttempt,
  LessonScore,
  LessonStage,
  QuizAnswer,
} from "@/lib/data/types";
import { useUserProgress } from "@/lib/progress/UserProgressProvider";
import type { TypingResult } from "@/lib/typing/useTypingEngine";
import { cn } from "@/lib/utils";

const STAGES: { id: LessonStage; label: string }[] = [
  { id: "learn", label: "Learn" },
  { id: "type", label: "Type" },
  { id: "think", label: "Think" },
  { id: "check", label: "Check" },
  { id: "score", label: "Score" },
];

interface AcademyLessonRunnerProps {
  lesson: CurriculumLesson;
  academyName: string;
}

export function AcademyLessonRunner({
  lesson,
  academyName,
}: AcademyLessonRunnerProps) {
  const {
    user,
    keyboardHealth,
    academyAttempts,
    recordCurriculumAttempt,
  } = useUserProgress();
  const [stage, setStage] = useState<LessonStage>("learn");
  const [typingResult, setTypingResult] = useState<TypingResult | null>(null);
  const [thinkResponse, setThinkResponse] = useState("");
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<{
    answers: QuizAnswer[];
    score: LessonScore;
  } | null>(null);
  const [runId, setRunId] = useState(0);
  const [awardedXp, setAwardedXp] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [questions, setQuestions] = useState(() =>
    selectQuizQuestions(lesson.quizBank, 3),
  );
  const submissionLockedRef = useRef(false);

  const stageIndex = STAGES.findIndex((item) => item.id === stage);
  const minThinkLength = lesson.thinkMinLength ?? 10;
  const maxThinkLength = lesson.thinkMaxLength ?? 400;
  const thinkReady = thinkResponse.trim().length >= minThinkLength;
  const allQuestionsAnswered = questions.every(
    (question) => selections[question.id],
  );
  const nextLesson = getNextAcademyLesson([
    ...user.completedLessonIds,
    lesson.id,
  ]);

  const handleTypingComplete = useCallback((result: TypingResult) => {
    setTypingResult(result);
    setStage("think");
  }, []);

  const submitQuiz = async () => {
    if (
      stage !== "check" ||
      submissionLockedRef.current ||
      quizResult ||
      !typingResult ||
      !allQuestionsAnswered
    ) return;
    submissionLockedRef.current = true;
    setSaving(true);
    setSaveError(null);
    const result = scoreQuiz(questions, selections);
    const completedAt = new Date().toISOString();
    const alreadyAwarded = academyAttempts.some(
      (attempt) => attempt.lessonId === lesson.id && attempt.xpEarned > 0,
    );
    const earned = alreadyAwarded
      ? 0
      : calculateXp({
          baseXp: lesson.xpValue,
          typingAccuracy: typingResult.accuracy,
          quizPercentage: result.score.percentage,
        });
    const attempt: LessonAttempt = {
      id: crypto.randomUUID(),
      lessonId: lesson.id,
      academy: lesson.academy,
      startedAt,
      completedAt,
      thinkResponse: thinkResponse.trim(),
      quizAnswers: result.answers,
      quizScore: result.score,
      typingResult,
      xpEarned: earned,
    };
    const saved = await recordCurriculumAttempt(lesson, attempt);
    if (!saved) {
      submissionLockedRef.current = false;
      setSaving(false);
      setSaveError(
        "We couldn't save this attempt. Your answers are still here—check your connection and try again.",
      );
      return;
    }
    setQuizResult(result);
    setAwardedXp(earned);
    setSaving(false);
    setStage("score");
  };

  const retry = () => {
    setStage("learn");
    setTypingResult(null);
    setThinkResponse("");
    setSelections({});
    setQuizResult(null);
    setAwardedXp(0);
    setSaving(false);
    setSaveError(null);
    setQuestions(selectQuizQuestions(lesson.quizBank, 3));
    setStartedAt(new Date().toISOString());
    submissionLockedRef.current = false;
    setRunId((value) => value + 1);
  };

  const academyProgress = getAcademyProgress(lesson.academy, [
    ...user.completedLessonIds,
    ...(quizResult ? [lesson.id] : []),
  ]);

  return (
    <div className="space-y-5">
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {STAGES.find((item) => item.id === stage)?.label} stage
      </p>
      <nav aria-label="Lesson stages">
        <ol className="grid grid-cols-5 gap-1 rounded-card border border-line bg-surface p-2 sm:gap-2">
          {STAGES.map((item, index) => {
            const active = item.id === stage;
            const complete = index < stageIndex;
            return (
              <li
                key={item.id}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex min-h-11 items-center justify-center gap-1 rounded-button px-1 text-xs font-bold sm:text-sm",
                  active && "bg-brand text-white",
                  complete && "bg-brand-tint text-brand-dark",
                  !active && !complete && "text-ink-faint",
                )}
              >
                {complete && <Check className="hidden size-4 sm:block" aria-hidden />}
                {item.label}
              </li>
            );
          })}
        </ol>
      </nav>

      {stage === "learn" && (
        <Card className="space-y-6 border-brand/15 bg-white p-6 sm:p-8">
          <div className="max-w-3xl space-y-3">
            <Badge tone="brand" icon={BookOpen}>Learn · about 1 minute</Badge>
            <h2 className="text-2xl font-bold tracking-tight text-ink">
              {lesson.title}
            </h2>
            <p className="text-base leading-7 text-ink-soft">{lesson.miniLesson}</p>
          </div>
          {lesson.vocabulary.length > 0 && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {lesson.vocabulary.map((item) => (
                <div key={item.term} className="rounded-button border border-line bg-cream p-4">
                  <dt className="font-bold text-ink">{item.term}</dt>
                  <dd className="mt-1 text-sm text-ink-soft">{item.definition}</dd>
                </div>
              ))}
            </dl>
          )}
          <Button size="lg" onClick={() => setStage("type")}>
            Start typing
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Card>
      )}

      {stage === "type" && (
        <div className="space-y-3">
          <div>
            <Badge tone="brand">Type · central practice</Badge>
            <p className="mt-2 text-sm text-ink-soft">{lesson.typingObjective}</p>
          </div>
          <TypingArea
            key={`${lesson.id}-${runId}`}
            lesson={lesson}
            target={lesson.typingPassage}
            timeLimitSeconds={lesson.timeLimitSeconds}
            recordResult={false}
            showResults={false}
            onComplete={handleTypingComplete}
          />
        </div>
      )}

      {stage === "think" && typingResult && (
        <Card className="space-y-5 border-brand/15 bg-white p-6 sm:p-8">
          <div>
            <Badge tone="brand">Think · your own words</Badge>
            <h2 className="mt-3 text-xl font-bold text-ink">Pause and apply it</h2>
            <p className="mt-2 text-base leading-7 text-ink-soft">{lesson.thinkPrompt}</p>
          </div>
          <label className="block space-y-2 text-sm font-semibold text-ink" htmlFor="think-response">
            Your response
            <textarea
              id="think-response"
              value={thinkResponse}
              onChange={(event) => setThinkResponse(event.target.value)}
              maxLength={maxThinkLength}
              aria-describedby="think-response-help"
              rows={4}
              className="w-full rounded-card border border-line bg-surface p-4 text-base font-normal leading-6 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              placeholder="Write a short response..."
            />
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p id="think-response-help" className="text-xs text-ink-faint" aria-live="polite">
              {thinkResponse.trim().length}/{maxThinkLength} characters · at least {minThinkLength}
            </p>
            <Button onClick={() => setStage("check")} disabled={!thinkReady}>
              Check my understanding
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          </div>
        </Card>
      )}

      {stage === "check" && (
        <Card className="space-y-6 border-brand/15 bg-white p-5 sm:p-7">
          <div>
            <Badge tone="brand">Check · 3 quick questions</Badge>
            <h2 className="mt-3 text-xl font-bold text-ink">What did you learn?</h2>
          </div>
          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <fieldset key={question.id} className="space-y-3">
                <legend className="font-bold text-ink">
                  {questionIndex + 1}. {question.prompt}
                </legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={cn(
                        "flex min-h-12 cursor-pointer items-center gap-3 rounded-button border p-3 text-sm font-semibold focus-within:ring-2 focus-within:ring-brand/30",
                        selections[question.id] === choice.id
                          ? "border-brand/40 bg-brand-tint text-ink"
                          : "border-line bg-surface text-ink-soft hover:border-brand/25",
                      )}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={choice.id}
                        checked={selections[question.id] === choice.id}
                        onChange={() =>
                          setSelections((current) => ({
                            ...current,
                            [question.id]: choice.id,
                          }))
                        }
                        className="accent-brand"
                      />
                      {choice.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          {saveError && (
            <p role="alert" className="rounded-button border border-danger/20 bg-danger-light px-3 py-2 text-sm font-semibold text-danger">
              {saveError}
            </p>
          )}
          <Button onClick={submitQuiz} disabled={!allQuestionsAnswered || saving}>
            {saving ? "Saving attempt…" : "See my score"}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Card>
      )}

      {stage === "score" && typingResult && quizResult && (
        <div className="space-y-5" aria-live="polite">
          <Card className="space-y-6 border-brand/20 bg-brand-tint/50 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge tone="success" icon={CircleCheck}>Lesson complete</Badge>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink">
                  Useful work, completed.
                </h2>
                <p className="mt-2 text-ink-soft">
                  You practiced typing and applied the {lesson.specificTopic} concept.
                </p>
              </div>
              <div className="rounded-card border border-brand/15 bg-white px-5 py-4 text-center">
                <Sparkles className="mx-auto size-5 text-brand" aria-hidden />
                <p className="mt-1 text-2xl font-bold text-ink">+{awardedXp} XP</p>
                {awardedXp === 0 && (
                  <p className="mt-1 text-xs text-ink-faint">XP is awarded once per lesson.</p>
                )}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <ScoreStat icon={Gauge} label="Typing speed" value={`${typingResult.wpm} WPM`} />
              <ScoreStat icon={Target} label="Accuracy" value={`${typingResult.accuracy}%`} />
              <ScoreStat icon={Check} label="Knowledge" value={`${quizResult.score.correctAnswers}/${quizResult.score.totalQuestions}`} />
              <ScoreStat icon={HeartPulse} label="Keyboard Health" value={`${keyboardHealth}`} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex justify-between text-sm font-semibold text-ink-soft">
                  <span>{academyName} progress</span>
                  <span>{academyProgress.completed}/{academyProgress.total}</span>
                </div>
                <ProgressBar value={academyProgress.percentage} label={`${academyName} progress`} />
              </div>
              <div className="rounded-button border border-line bg-white p-3 text-sm text-ink-soft">
                {typingResult.mistakes} typing {typingResult.mistakes === 1 ? "mistake" : "mistakes"} · {Math.max(1, Math.round(typingResult.elapsedMs / 1000))} seconds · {Math.max(1, user.streakDays)} day streak
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {nextLesson ? (
                <Link href={`/lesson/${nextLesson.id}`} className={buttonClasses("primary", "lg")}>
                  Continue
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : (
                <Link href="/academies" className={buttonClasses("primary", "lg")}>
                  Back to Academies
                </Link>
              )}
              <Button size="lg" variant="outline" onClick={retry}>
                <RotateCcw className="size-4" aria-hidden />
                Practice again
              </Button>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-lg font-bold text-ink">Answer review</h3>
            {questions.map((question) => {
              const answer = quizResult.answers.find((item) => item.questionId === question.id);
              return (
                <div key={question.id} className="rounded-button border border-line bg-cream p-4">
                  <p className="font-semibold text-ink">
                    {answer?.correct ? "Correct" : "Review"}: {question.prompt}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{question.explanation}</p>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

function ScoreStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
        <Icon className="size-4 text-brand" aria-hidden />
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
