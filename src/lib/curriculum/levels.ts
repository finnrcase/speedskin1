import type {
  CurriculumLevel,
  GradeBand,
  TypingLevel,
} from "@/lib/data/types";

export interface CurriculumLevelDefinition {
  id: CurriculumLevel;
  level: number;
  name: string;
  description: string;
  expectedStudentBehaviors: readonly string[];
  suitableAssessmentStyles: readonly string[];
}

export interface TypingLevelDefinition {
  id: TypingLevel;
  level: number;
  name: string;
  description: string;
  expectedCharacterTypes: readonly string[];
  suggestedPassageLength: { min: number; max: number };
  recommendedAccuracy: number;
  wpmRole: string;
}

export interface GradeBandDefinition {
  id: GradeBand;
  name: string;
  grades: string;
  readingComplexity: string;
  vocabularyComplexity: string;
  scenarioComplexity: string;
  originalResponseLength: string;
  conceptBoundaries: string;
}

/** SpeedSkin's internal progression framework, not a validated learning taxonomy. */
export const CURRICULUM_LEVELS: readonly CurriculumLevelDefinition[] = [
  {
    id: "foundation",
    level: 1,
    name: "Recognize",
    description: "Notice, remember, distinguish, and select clear examples.",
    expectedStudentBehaviors: ["identify", "remember", "distinguish", "choose an obvious example"],
    suitableAssessmentStyles: ["definition match", "example/non-example", "direct recall"],
  },
  {
    id: "developing",
    level: 2,
    name: "Understand",
    description: "Explain, classify, summarize, or interpret an idea in context.",
    expectedStudentBehaviors: ["explain in their own words", "classify", "summarize", "interpret"],
    suitableAssessmentStyles: ["short explanation", "classification", "best summary"],
  },
  {
    id: "applied",
    level: 3,
    name: "Apply",
    description: "Use the concept in a realistic situation or produce a fitting example.",
    expectedStudentBehaviors: ["use a procedure", "make a straightforward decision", "produce an example"],
    suitableAssessmentStyles: ["scenario choice", "worked example", "guided application"],
  },
  {
    id: "analytical",
    level: 4,
    name: "Analyze",
    description: "Compare options, diagnose a problem, and recognize tradeoffs or consequences.",
    expectedStudentBehaviors: ["compare", "diagnose", "identify tradeoffs", "predict consequences"],
    suitableAssessmentStyles: ["option comparison", "error diagnosis", "cause-and-effect scenario"],
  },
  {
    id: "synthesis",
    level: 5,
    name: "Decide and Create",
    description: "Construct a response, synthesize information, or solve an open-ended scenario.",
    expectedStudentBehaviors: ["make a reasoned choice", "construct a response", "synthesize", "solve"],
    suitableAssessmentStyles: ["open scenario", "response construction", "reasoned recommendation"],
  },
] as const;

export const TYPING_LEVELS: readonly TypingLevelDefinition[] = [
  {
    id: "beginner",
    level: 1,
    name: "Home Row Control",
    description: "Constrained home-row letters and short lowercase words with accuracy first.",
    expectedCharacterTypes: ["home-row lowercase letters", "spaces", "semicolon when taught"],
    suggestedPassageLength: { min: 30, max: 80 },
    recommendedAccuracy: 90,
    wpmRole: "Do not gate mastery on WPM; prioritize correct fingers and control.",
  },
  {
    id: "full-alphabet",
    level: 2,
    name: "Full Alphabet",
    description: "All lowercase letters, common short words, and spaces.",
    expectedCharacterTypes: ["a-z", "spaces"],
    suggestedPassageLength: { min: 45, max: 120 },
    recommendedAccuracy: 90,
    wpmRole: "Observe fluency, but accuracy remains the gate.",
  },
  {
    id: "intermediate",
    level: 3,
    name: "Complete Sentences",
    description: "Normal sentences using capitalization and periods.",
    expectedCharacterTypes: ["a-z", "A-Z", "spaces", "periods"],
    suggestedPassageLength: { min: 70, max: 180 },
    recommendedAccuracy: 91,
    wpmRole: "Use WPM as descriptive feedback, not a primary mastery requirement.",
  },
  {
    id: "punctuation",
    level: 4,
    name: "Everyday Punctuation",
    description: "Commas, question marks, apostrophes, and varied sentence forms.",
    expectedCharacterTypes: ["letters", "capitalization", "commas", "question marks", "apostrophes", "periods"],
    suggestedPassageLength: { min: 80, max: 220 },
    recommendedAccuracy: 92,
    wpmRole: "Speed may rise naturally after punctuation remains accurate.",
  },
  {
    id: "numbers-symbols",
    level: 5,
    name: "Numbers and Common Symbols",
    description: "Numbers, mixed capitalization, and common symbols in meaningful text.",
    expectedCharacterTypes: ["letters", "numbers", "currency and common symbols", "punctuation"],
    suggestedPassageLength: { min: 80, max: 220 },
    recommendedAccuracy: 92,
    wpmRole: "Treat symbol accuracy as more important than raw speed.",
  },
  {
    id: "real-world",
    level: 6,
    name: "Real-World Messages",
    description: "Longer passages and realistic emails or messages with complex punctuation.",
    expectedCharacterTypes: ["mixed-case prose", "multi-sentence punctuation", "common symbols"],
    suggestedPassageLength: { min: 120, max: 300 },
    recommendedAccuracy: 93,
    wpmRole: "Use WPM as secondary evidence of comfortable sustained typing.",
  },
  {
    id: "fluency",
    level: 7,
    name: "Sustained Fluency",
    description: "Numbers, symbols, punctuation, and longer combinations at a steady pace.",
    expectedCharacterTypes: ["full keyboard combinations", "paragraph punctuation"],
    suggestedPassageLength: { min: 180, max: 420 },
    recommendedAccuracy: 94,
    wpmRole: "Consider WPM only after accuracy is consistently at target.",
  },
  {
    id: "advanced",
    level: 8,
    name: "Advanced Mixed Keyboard",
    description: "Challenging mixed-keyboard passages requiring accurate sustained control.",
    expectedCharacterTypes: ["full keyboard", "dense mixed symbols", "long-form text"],
    suggestedPassageLength: { min: 250, max: 600 },
    recommendedAccuracy: 95,
    wpmRole: "Speed goals may complement, but never replace, accuracy evidence.",
  },
] as const;

export const GRADE_BANDS: readonly GradeBandDefinition[] = [
  {
    id: "3-5",
    name: "Elementary",
    grades: "Grades 3-5",
    readingComplexity: "Short concrete sentences with explicit connections and familiar contexts.",
    vocabularyComplexity: "Everyday vocabulary; define necessary domain terms in place.",
    scenarioComplexity: "One decision or consequence at a time with limited competing information.",
    originalResponseLength: "Usually 1-2 sentences.",
    conceptBoundaries: "Concrete school, home, friendship, device, and basic money choices; avoid adult financial products or mature social situations.",
  },
  {
    id: "6-8",
    name: "Middle",
    grades: "Grades 6-8",
    readingComplexity: "Connected paragraphs with moderate inference and realistic school-life context.",
    vocabularyComplexity: "General academic vocabulary plus clearly explained domain terms.",
    scenarioComplexity: "Several relevant facts, simple tradeoffs, and near-term consequences.",
    originalResponseLength: "Usually 2-3 sentences.",
    conceptBoundaries: "Account safety, group dynamics, basic budgeting, communication, and planning without high-stakes adult obligations.",
  },
  {
    id: "9-12",
    name: "High",
    grades: "Grades 9-12",
    readingComplexity: "Denser authentic language, multiple perspectives, and justified inference.",
    vocabularyComplexity: "Academic and practical domain vocabulary, defined when uncommon.",
    scenarioComplexity: "Multiple constraints, longer consequences, tradeoffs, and reasoned decisions.",
    originalResponseLength: "Usually 2-4 sentences or a concise structured response.",
    conceptBoundaries: "Workplace communication, banking fundamentals, credit awareness, complex digital choices, and independent planning without personalized legal or financial advice.",
  },
  {
    id: "any",
    name: "Cross-grade",
    grades: "Grades 3-12",
    readingComplexity: "Plain language that does not rely on grade-specific background knowledge.",
    vocabularyComplexity: "Widely understood terms with concise definitions where needed.",
    scenarioComplexity: "Universal, low-risk situations that remain meaningful across age groups.",
    originalResponseLength: "Prompt specifies a flexible 1-4 sentence response.",
    conceptBoundaries: "Only concepts and scenarios appropriate across the full supported range.",
  },
] as const;

export function getCurriculumLevel(id: CurriculumLevel) {
  return CURRICULUM_LEVELS.find((level) => level.id === id);
}

export function getTypingLevel(id: TypingLevel) {
  return TYPING_LEVELS.find((level) => level.id === id);
}

export function getGradeBand(id: GradeBand) {
  return GRADE_BANDS.find((band) => band.id === id);
}
