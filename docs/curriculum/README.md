# Curriculum production workflow

SpeedSkin curriculum is version-controlled product data. The goal is a boring, repeatable workflow in which one reviewed lesson fills one planned slot and the software catches structural mistakes.

## Author the next lesson

1. Run `npm run curriculum:report` and pick the next open roadmap slot.
2. Read the Academy purpose, end outcomes, and unit in `src/lib/curriculum/plans.ts`.
3. Choose a conceptual level from `CURRICULUM_LEVELS`.
4. Independently choose a keyboard-mechanics level from `TYPING_LEVELS`.
5. Copy [`lesson-template.ts`](./lesson-template.ts) into `src/lib/curriculum/lessons.ts` and replace every placeholder.
6. Author Learn around one core idea.
7. Author Type so the passage reinforces that idea and fits the keyboard level.
8. Author Think so students must produce an original response.
9. Author at least five quiz-bank questions, including application where appropriate.
10. Add only useful vocabulary and at least two searchable tags.
11. Run `npm run curriculum:validate`.
12. Run `npm run curriculum:report` and inspect coverage warnings.
13. Manually review factual accuracy, age appropriateness, duplication, reading load, keyboard mechanics, and answer quality.
14. Run the normal lint, test, and build gates before committing.

## Sources of truth

- `src/lib/curriculum/levels.ts`: conceptual levels, typing levels, and grade bands.
- `src/lib/curriculum/plans.ts`: Academy outcomes, units, topic order, and the 135-slot target.
- `src/lib/curriculum/lessons.ts`: authored lesson bodies.
- `src/lib/curriculum/validate.ts`: deterministic structural and practical authoring checks.
- `src/lib/curriculum/mastery.ts`: completion and mastery calculations.
- [`Finn-Build-Sheet.md`](./Finn-Build-Sheet.md): field-by-field human authoring contract.
- [`roadmap.md`](./roadmap.md): readable view of planned lesson slots.

Do not invent another lesson model, add unreviewed bulk content, or use the coverage target as a reason to lower review quality.
