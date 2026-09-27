import type { AcademyId, CurriculumLesson } from "@/lib/data/types";
import { ACADEMIES } from "./academies";
import { CURRICULUM_LEVELS, TYPING_LEVELS } from "./levels";
import { CURRICULUM_LESSONS } from "./lessons";
import { ACADEMY_CURRICULUM_PLANS } from "./plans";
import { formatCurriculumIssues, validateAcademyPlans, validateCurriculum } from "./validate";

export interface AcademyCoverage {
  academyId: AcademyId;
  academyName: string;
  authoredCoreLessons: number;
  plannedCoreLessons: number;
  curriculumLevels: string[];
  typingLevels: string[];
  gradeBands: string[];
  flags: string[];
}

export function getCurriculumCoverage(
  lessons: readonly CurriculumLesson[] = CURRICULUM_LESSONS,
): AcademyCoverage[] {
  const idCounts = new Map<string, number>();
  lessons.forEach((lesson) => idCounts.set(lesson.id, (idCounts.get(lesson.id) ?? 0) + 1));
  return ACADEMIES.map((academy) => {
    const plan = ACADEMY_CURRICULUM_PLANS.find((item) => item.academyId === academy.id);
    const academyLessons = lessons.filter((lesson) => lesson.academy === academy.id);
    const coreLessons = academyLessons.filter((lesson) => lesson.isCore);
    const sequences = coreLessons.map((lesson) => lesson.sequence);
    const flags: string[] = [];
    if (!academyLessons.length) flags.push("No lessons authored");
    if (academyLessons.some((lesson) => (idCounts.get(lesson.id) ?? 0) > 1)) flags.push("Duplicate lesson IDs");
    if (new Set(sequences).size !== sequences.length) flags.push("Duplicate sequence positions");
    if (academyLessons.some((lesson) => lesson.quizBank.length < 5)) flags.push("Incomplete quiz bank");
    if (!plan) flags.push("Missing Academy plan");
    return {
      academyId: academy.id,
      academyName: academy.name,
      authoredCoreLessons: coreLessons.length,
      plannedCoreLessons: plan?.suggestedCoreLessonCount ?? 0,
      curriculumLevels: [...new Set(academyLessons.map((lesson) => lesson.curriculumLevel))],
      typingLevels: [...new Set(academyLessons.map((lesson) => lesson.typingLevel))],
      gradeBands: [...new Set(academyLessons.map((lesson) => lesson.gradeBand))],
      flags,
    };
  });
}

export function buildCurriculumCoverageReport(
  lessons: readonly CurriculumLesson[] = CURRICULUM_LESSONS,
) {
  const coverage = getCurriculumCoverage(lessons);
  const validation = validateCurriculum(lessons);
  const planValidation = validateAcademyPlans();
  const representedCurriculumLevels = new Set(lessons.map((lesson) => lesson.curriculumLevel));
  const representedTypingLevels = new Set(lessons.map((lesson) => lesson.typingLevel));
  const missingCurriculumLevels = CURRICULUM_LEVELS.filter(
    (level) => !representedCurriculumLevels.has(level.id),
  ).map((level) => `${level.level} (${level.name})`);
  const missingTypingLevels = TYPING_LEVELS.filter(
    (level) => !representedTypingLevels.has(level.id),
  ).map((level) => `${level.level} (${level.name})`);
  const lines = ["SpeedSkin curriculum coverage", "============================", ""];

  coverage.forEach((academy) => {
    lines.push(academy.academyName);
    lines.push(`${academy.authoredCoreLessons} / ${academy.plannedCoreLessons} core lessons authored`);
    lines.push(`Curriculum levels represented: ${academy.curriculumLevels.join(", ") || "none"}`);
    lines.push(`Typing levels represented: ${academy.typingLevels.join(", ") || "none"}`);
    lines.push(`Grade bands: ${academy.gradeBands.join(", ") || "none"}`);
    if (academy.flags.length) lines.push(`Flags: ${academy.flags.join("; ")}`);
    lines.push("");
  });

  lines.push(`Total: ${coverage.reduce((sum, item) => sum + item.authoredCoreLessons, 0)} / ${coverage.reduce((sum, item) => sum + item.plannedCoreLessons, 0)} core lessons authored`);
  lines.push(`Missing curriculum levels across authored content: ${missingCurriculumLevels.join(", ") || "none"}`);
  lines.push(`Missing typing levels across authored content: ${missingTypingLevels.join(", ") || "none"}`);
  lines.push(`Validation: ${validation.errors.length + planValidation.errors.length} errors, ${validation.warnings.length + planValidation.warnings.length} warnings`);
  const issues = [...validation.issues, ...planValidation.issues];
  if (issues.length) lines.push("", formatCurriculumIssues(issues));
  return lines.join("\n");
}
