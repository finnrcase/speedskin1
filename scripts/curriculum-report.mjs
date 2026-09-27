import { createServer } from "vite";

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
});

try {
  const [{ CURRICULUM_LESSONS }, report, validation] = await Promise.all([
    server.ssrLoadModule("/src/lib/curriculum/lessons.ts"),
    server.ssrLoadModule("/src/lib/curriculum/report.ts"),
    server.ssrLoadModule("/src/lib/curriculum/validate.ts"),
  ]);
  const { lessonResult, planResult } = validation.assertValidCurriculum(
    CURRICULUM_LESSONS,
  );
  if (process.argv.includes("--validate-only")) {
    console.log(
      `Curriculum valid: ${CURRICULUM_LESSONS.length} lessons, ${lessonResult.warnings.length + planResult.warnings.length} warnings.`,
    );
  } else {
    console.log(report.buildCurriculumCoverageReport(CURRICULUM_LESSONS));
  }
} finally {
  await server.close();
}
