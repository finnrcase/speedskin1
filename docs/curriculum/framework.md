# Curriculum progression framework

This document is the readable companion to `src/lib/curriculum/levels.ts`. SpeedSkin uses these internal production levels to keep lessons consistent. They are practical authoring categories, not a scientifically validated taxonomy and not labels for student ability.

## Conceptual curriculum levels

1. **Recognize** (`foundation`) — identify, remember, distinguish, or choose a clear example. Suitable checks include definition matches, example/non-example choices, and direct recall.
2. **Understand** (`developing`) — explain, classify, summarize, or interpret. Suitable checks include short explanations, classification, and choosing the best summary.
3. **Apply** (`applied`) — use a concept in a realistic situation, make a straightforward decision, or produce an example. Suitable checks include guided scenarios and worked examples.
4. **Analyze** (`analytical`) — compare options, diagnose a problem, identify tradeoffs, or predict consequences. Suitable checks include option comparisons, error diagnosis, and cause-and-effect scenarios.
5. **Decide and Create** (`synthesis`) — construct a response, synthesize information, solve an open-ended scenario, or make a reasoned recommendation.

Conceptual difficulty is independent from keyboard difficulty. A lesson may introduce an analytically demanding idea with easy typing or reinforce a simple idea with advanced typing mechanics.

## Typing levels

| Level | ID and name | Expected mechanics | Suggested characters | Accuracy | Role of WPM |
| --- | --- | --- | --- | ---: | --- |
| 1 | `beginner` — Home Row Control | Home-row placement and constrained short words | 30–80 | 90% | Never a mastery gate; correct fingers and control come first. |
| 2 | `full-alphabet` — Full Alphabet | All lowercase letters and spaces | 45–120 | 90% | Observe fluency, but gate on accuracy. |
| 3 | `intermediate` — Complete Sentences | Capitals, spaces, and periods | 70–180 | 91% | Descriptive feedback only. |
| 4 | `punctuation` — Everyday Punctuation | Commas, questions, apostrophes, varied sentences | 80–220 | 92% | Speed follows accurate punctuation. |
| 5 | `numbers-symbols` — Numbers and Common Symbols | Number row, currency, common symbols, mixed case | 80–220 | 92% | Symbol accuracy matters more than speed. |
| 6 | `real-world` — Real-World Messages | Longer emails/messages and complex punctuation | 120–300 | 93% | Secondary evidence of comfortable sustained typing. |
| 7 | `fluency` — Sustained Fluency | Full-keyboard combinations and longer paragraphs | 180–420 | 94% | Consider only after consistent accuracy. |
| 8 | `advanced` — Advanced Mixed Keyboard | Dense symbols and sustained long-form text | 250–600 | 95% | May complement, never replace, accuracy evidence. |

Lengths are character guidance, not rigid prose formulas. The validator catches gross mismatches and a human reviewer checks naturalness.

## Grade bands

### Elementary (`3-5`)

- Concrete sentences and familiar contexts.
- Everyday vocabulary; define necessary domain terms.
- One decision or consequence at a time.
- Usually a 1–2 sentence original response.
- Use school, home, friendship, device, and basic-money situations. Avoid adult financial products and mature social scenarios.

### Middle (`6-8`)

- Connected paragraphs with moderate inference.
- General academic vocabulary with explained domain terms.
- Several relevant facts and simple tradeoffs.
- Usually a 2–3 sentence original response.
- Account safety, group dynamics, basic budgeting, communication, and planning are appropriate; avoid high-stakes adult obligations.

### High (`9-12`)

- Denser authentic language, multiple perspectives, and justified inference.
- Academic and practical domain vocabulary.
- Multiple constraints, longer consequences, and reasoned tradeoffs.
- Usually a 2–4 sentence or concise structured response.
- Workplace communication, banking fundamentals, credit awareness, digital judgment, and independent planning are appropriate without personalized legal or financial advice.

### Cross-grade (`any`)

Use only when plain language, background knowledge, scenario, and response demand are genuinely appropriate for grades 3–12. It is not a shortcut for skipping an audience decision.

## Mastery V1

- **Lesson complete:** at least one saved attempt after all five runtime stages.
- **Lesson mastered:** the required number of attempts meet both the lesson's typing-accuracy and quiz targets.
- **Typing skill mastered:** the relevant accuracy target is demonstrated across at least two distinct lessons at that typing level.
- **Academy progress:** report core lessons completed and mastered separately as percentages of currently published core lessons.

WPM is intentionally absent from beginner mastery and from the default lesson-mastery calculation. This deterministic model creates reliable future adaptation inputs without pretending to provide semantic grading or a complete adaptive system.
