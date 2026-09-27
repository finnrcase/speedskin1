import type {
  AcademyId,
  CurriculumLevel,
  TypingLevel,
} from "@/lib/data/types";

export interface CurriculumUnit {
  id: string;
  title: string;
  description: string;
  outcomes: readonly string[];
  recommendedCurriculumLevels: readonly CurriculumLevel[];
  recommendedTypingLevels: readonly TypingLevel[];
  topicSequence: readonly string[];
}

export interface AcademyCurriculumPlan {
  academyId: AcademyId;
  purpose: string;
  outcomes: readonly string[];
  units: readonly CurriculumUnit[];
  suggestedCoreLessonCount: number;
  typingProgressionNotes: string;
  v1Topics: readonly string[];
  laterTopics: readonly string[];
}

export const ACADEMY_CURRICULUM_PLANS: readonly AcademyCurriculumPlan[] = [
  {
    academyId: "keyboard",
    purpose: "Build accurate, comfortable, independent control of the full keyboard.",
    outcomes: [
      "Use consistent finger placement and return to home-row landmarks.",
      "Type common school and life text accurately across the full keyboard.",
      "Use capitals, punctuation, numbers, and symbols without abandoning technique.",
      "Sustain accurate typing and make deliberate corrections.",
    ],
    suggestedCoreLessonCount: 30,
    typingProgressionNotes: "This Academy owns the complete typing ladder: constrained home row through advanced mixed-keyboard fluency. Accuracy gates precede speed goals.",
    v1Topics: ["home-row control", "full alphabet", "sentences", "punctuation", "numbers and symbols", "sustained fluency"],
    laterTopics: ["ergonomics deep dive", "numeric keypad", "specialized transcription", "personal speed plans"],
    units: [
      {
        id: "keyboard-foundations",
        title: "Foundations",
        description: "Locate home-row landmarks and build controlled finger movement.",
        outcomes: ["Find home row by touch.", "Use assigned fingers at an accuracy-first pace."],
        recommendedCurriculumLevels: ["foundation", "developing"],
        recommendedTypingLevels: ["beginner"],
        topicSequence: ["Home Row Landmarks", "Steady Home Row Words", "F and J Anchors", "Left-Hand Control", "Right-Hand Control", "Accuracy Before Speed"],
      },
      {
        id: "keyboard-alphabet",
        title: "Full Alphabet",
        description: "Reach across all letter rows and return to a stable home position.",
        outcomes: ["Use all letter keys.", "Reach without moving the whole hand."],
        recommendedCurriculumLevels: ["foundation", "developing", "applied"],
        recommendedTypingLevels: ["full-alphabet"],
        topicSequence: ["Reach and Return", "Top-Row Reaches", "Bottom-Row Reaches", "Common Letter Patterns", "Whole-Alphabet Words", "Alphabet Accuracy Checkpoint"],
      },
      {
        id: "keyboard-sentences",
        title: "Sentences",
        description: "Add spacing, capitalization, and sentence-ending punctuation.",
        outcomes: ["Use Shift with the opposite hand.", "Type complete sentences with reliable spacing."],
        recommendedCurriculumLevels: ["developing", "applied"],
        recommendedTypingLevels: ["intermediate", "punctuation"],
        topicSequence: ["Spacebar Rhythm", "Capital Letters", "Periods", "Question Marks", "Commas and Pauses", "Apostrophes and Contractions"],
      },
      {
        id: "keyboard-symbols",
        title: "Numbers and Symbols",
        description: "Use number-row reaches and common school or workplace symbols.",
        outcomes: ["Type numbers accurately.", "Combine numbers, symbols, and prose without losing position."],
        recommendedCurriculumLevels: ["applied", "analytical"],
        recommendedTypingLevels: ["numbers-symbols", "real-world"],
        topicSequence: ["Number Row", "Money Symbols", "At Signs and Email", "Hyphens and Slashes", "Parentheses and Colons", "Mixed Symbols Checkpoint"],
      },
      {
        id: "keyboard-fluency",
        title: "Fluency and Control",
        description: "Sustain accurate technique in longer, more realistic passages.",
        outcomes: ["Maintain accuracy over time.", "Diagnose recurring errors and choose a useful practice response."],
        recommendedCurriculumLevels: ["applied", "analytical", "synthesis"],
        recommendedTypingLevels: ["real-world", "fluency", "advanced"],
        topicSequence: ["Real-World Messages", "Longer Paragraphs", "Correction Strategy", "Personal Weak Keys", "Sustained Fluency", "Advanced Keyboard Challenge"],
      },
    ],
  },
  {
    academyId: "language",
    purpose: "Strengthen the language skills students use to read, write, and explain ideas.",
    outcomes: ["Use context and word parts to interpret vocabulary.", "Write clearer sentences and summaries.", "Revise language for meaning and correctness."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Move from sentence typing toward punctuation-rich revision and short original responses; vocabulary difficulty must not dictate keyboard difficulty.",
    v1Topics: ["context clues", "word parts", "sentence clarity", "grammar", "summarizing"],
    laterTopics: ["rhetorical choices", "source synthesis", "genre conventions"],
    units: [
      { id: "language-words", title: "Words in Context", description: "Build practical strategies for understanding and choosing words.", outcomes: ["Infer meaning from context.", "Choose precise useful words."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "punctuation"], topicSequence: ["Context Clues", "Prefixes", "Suffixes", "Multiple-Meaning Words", "Precise Word Choice"] },
      { id: "language-sentences", title: "Clear Sentences", description: "Construct and revise complete, readable sentences.", outcomes: ["Recognize sentence parts.", "Revise unclear or incorrect sentences."], recommendedCurriculumLevels: ["developing", "applied", "analytical"], recommendedTypingLevels: ["intermediate", "punctuation", "real-world"], topicSequence: ["Complete Sentences", "Subjects and Verbs", "Punctuation for Meaning", "Combining Ideas", "Revision for Clarity"] },
      { id: "language-meaning", title: "Reading and Explaining", description: "Identify central meaning and communicate it concisely.", outcomes: ["Identify a main idea and evidence.", "Summarize without copying."], recommendedCurriculumLevels: ["developing", "applied", "analytical", "synthesis"], recommendedTypingLevels: ["punctuation", "real-world", "fluency"], topicSequence: ["Main Idea", "Supporting Details", "Inference", "Summarizing", "Explain It in Your Own Words"] },
    ],
  },
  {
    academyId: "chromebook",
    purpose: "Help students operate school devices and organize digital work confidently.",
    outcomes: ["Navigate tabs, windows, files, and settings.", "Choose efficient shortcuts and organization habits.", "Use accessibility and troubleshooting tools appropriately."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Use realistic file names, searches, and short school messages; introduce shortcut notation only after its required symbols are comfortable.",
    v1Topics: ["tabs", "files", "search", "shortcuts", "accessibility"],
    laterTopics: ["offline workflows", "advanced settings", "device care plans"],
    units: [
      { id: "chromebook-navigation", title: "Navigate", description: "Move through the browser and device interface with purpose.", outcomes: ["Manage tabs and windows.", "Find common controls."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "punctuation"], topicSequence: ["Tabs With a Purpose", "Windows and Desks", "Address Bar Search", "Back, Forward, and Refresh", "Downloads Shelf"] },
      { id: "chromebook-files", title: "Files and Work", description: "Name, store, find, and submit school work.", outcomes: ["Use useful file names.", "Locate and organize saved work."], recommendedCurriculumLevels: ["developing", "applied", "analytical"], recommendedTypingLevels: ["punctuation", "numbers-symbols", "real-world"], topicSequence: ["Useful File Names", "Folders", "Downloads and Uploads", "Cloud vs Device", "Submit the Right File"] },
      { id: "chromebook-tools", title: "Efficient and Accessible", description: "Use shortcuts, accessibility settings, and basic troubleshooting.", outcomes: ["Select an efficient tool.", "Try safe troubleshooting steps."], recommendedCurriculumLevels: ["applied", "analytical", "synthesis"], recommendedTypingLevels: ["numbers-symbols", "real-world", "fluency"], topicSequence: ["Essential Shortcuts", "Find on Page", "Accessibility Tools", "Safe Restart and Updates", "Troubleshooting Checklist"] },
    ],
  },
  {
    academyId: "digital",
    purpose: "Develop safer, more thoughtful participation in online spaces and emerging technology.",
    outcomes: ["Protect accounts and personal information.", "Recognize common manipulation and scam signals.", "Evaluate online information and AI output before acting."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Use authentic account, search, and reporting language without asking students to enter private information.",
    v1Topics: ["passwords", "privacy", "scams", "information evaluation", "AI literacy"],
    laterTopics: ["data brokers", "platform incentives", "advanced source verification"],
    units: [
      { id: "digital-security", title: "Accounts and Privacy", description: "Protect access and make deliberate sharing choices.", outcomes: ["Use stronger credential habits.", "Identify information that should stay private."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "punctuation", "numbers-symbols"], topicSequence: ["Strong, Memorable Passwords", "Multi-Factor Authentication", "Personal Information", "Privacy Settings", "Shared Device Safety"] },
      { id: "digital-judgment", title: "Online Judgment", description: "Pause, inspect, and respond safely to online claims and pressure.", outcomes: ["Recognize scam signals.", "Check a claim before sharing."], recommendedCurriculumLevels: ["developing", "applied", "analytical"], recommendedTypingLevels: ["punctuation", "real-world", "fluency"], topicSequence: ["Phishing Clues", "Urgency and Pressure", "Check the Source", "Images and Context", "Report and Block"] },
      { id: "digital-ai", title: "AI and Digital Creation", description: "Use generated content as a tool that still requires human judgment.", outcomes: ["Describe AI limitations.", "Verify and revise generated output."], recommendedCurriculumLevels: ["applied", "analytical", "synthesis"], recommendedTypingLevels: ["real-world", "fluency", "advanced"], topicSequence: ["What Generative AI Does", "Confident but Wrong", "Useful Prompts", "Verify Before You Use", "Responsible AI Choices"] },
    ],
  },
  {
    academyId: "communication",
    purpose: "Build clear, respectful communication matched to audience and purpose.",
    outcomes: ["Choose an appropriate channel and tone.", "Write specific requests and responses.", "Revise messages for clarity, respect, and needed context."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Progress from complete sentences to realistic emails and multi-sentence messages with everyday punctuation.",
    v1Topics: ["audience", "tone", "email", "asking for help", "feedback"],
    laterTopics: ["presentations", "persuasion", "formal workplace messages"],
    units: [
      { id: "communication-basics", title: "Purpose and Audience", description: "Decide what the reader needs and how to say it.", outcomes: ["Name a message purpose.", "Adjust wording for an audience."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "punctuation"], topicSequence: ["Purpose First", "Know Your Audience", "Clear Subject Lines", "Important Details", "Choose the Right Channel"] },
      { id: "communication-messages", title: "Useful Messages", description: "Construct respectful requests, updates, and replies.", outcomes: ["Ask a clear question.", "Provide sufficient context."], recommendedCurriculumLevels: ["developing", "applied", "analytical"], recommendedTypingLevels: ["punctuation", "real-world"], topicSequence: ["Ask for Help Clearly", "Professional Greetings", "Progress Updates", "Clarifying Questions", "Close and Proofread"] },
      { id: "communication-feedback", title: "Feedback and Repair", description: "Give feedback, interpret tone, and repair misunderstandings.", outcomes: ["Give specific constructive feedback.", "Revise a message after a misunderstanding."], recommendedCurriculumLevels: ["applied", "analytical", "synthesis"], recommendedTypingLevels: ["real-world", "fluency", "advanced"], topicSequence: ["Specific Feedback", "Tone in Text", "Disagree Respectfully", "Repair a Misunderstanding", "Communication Challenge"] },
    ],
  },
  {
    academyId: "people",
    purpose: "Practice interpersonal habits that support collaboration, boundaries, and conflict repair.",
    outcomes: ["Listen for meaning and ask useful follow-up questions.", "State boundaries and needs respectfully.", "Contribute to teams and repair manageable conflicts."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Use dialogue, short reflections, and collaborative messages; scenarios should stay school-appropriate and avoid therapeutic claims.",
    v1Topics: ["listening", "perspective", "boundaries", "conflict", "collaboration"],
    laterTopics: ["leadership", "negotiation", "complex group dynamics"],
    units: [
      { id: "people-listening", title: "Listen and Understand", description: "Pay attention, check meaning, and recognize perspective.", outcomes: ["Use active-listening behaviors.", "Separate perspective from agreement."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "punctuation"], topicSequence: ["Listen to Understand", "Follow-Up Questions", "Different Perspectives", "Include Quiet Voices", "Check Your Assumption"] },
      { id: "people-boundaries", title: "Needs and Boundaries", description: "Communicate limits and respond to others' limits respectfully.", outcomes: ["State a clear boundary.", "Recognize a respectful response."], recommendedCurriculumLevels: ["developing", "applied", "analytical"], recommendedTypingLevels: ["punctuation", "real-world"], topicSequence: ["Name What You Need", "Say No Respectfully", "Respect Another No", "Ask Before Sharing", "When to Get Adult Help"] },
      { id: "people-collaboration", title: "Collaboration and Repair", description: "Share work, navigate disagreement, and make repairs.", outcomes: ["Choose a fair team action.", "Use a specific apology and next step."], recommendedCurriculumLevels: ["applied", "analytical", "synthesis"], recommendedTypingLevels: ["real-world", "fluency", "advanced"], topicSequence: ["Fair Team Roles", "Useful Disagreement", "Solve a Small Conflict", "A Real Apology", "Team Reflection"] },
    ],
  },
  {
    academyId: "money",
    purpose: "Build practical habits for earning, saving, spending, comparing, and planning money.",
    outcomes: ["Distinguish needs, wants, goals, and tradeoffs.", "Create and evaluate a simple budget.", "Compare common financial choices while recognizing risk and uncertainty."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Introduce number-row and currency-symbol practice in concrete scenarios; financial reasoning and keyboard mechanics remain independently leveled.",
    v1Topics: ["needs and wants", "earning", "saving", "budgeting", "comparison"],
    laterTopics: ["credit", "interest", "taxes", "investing fundamentals"],
    units: [
      { id: "money-basics", title: "Money Basics", description: "Understand sources, uses, and tradeoffs for limited money.", outcomes: ["Distinguish needs and wants.", "Explain a spending tradeoff."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "numbers-symbols"], topicSequence: ["Needs vs Wants", "Earning Money", "Spending Choices", "Prices and Value", "Receipts and Change"] },
      { id: "money-saving", title: "Saving", description: "Set money aside for future needs, goals, and surprises.", outcomes: ["Explain why people save.", "Create a simple saving plan."], recommendedCurriculumLevels: ["foundation", "developing", "applied", "analytical"], recommendedTypingLevels: ["numbers-symbols", "real-world"], topicSequence: ["Save Half First", "Why Save?", "Saving Goals", "Time and Tradeoffs", "Emergency Funds"] },
      { id: "money-budgeting", title: "Budgeting and Comparing", description: "Plan limited money and compare options using relevant facts.", outcomes: ["Build a simple balanced budget.", "Compare total cost and value."], recommendedCurriculumLevels: ["applied", "analytical", "synthesis"], recommendedTypingLevels: ["numbers-symbols", "real-world", "fluency"], topicSequence: ["What Is a Budget?", "Income and Expenses", "Balance a Budget", "Compare Total Cost", "Money Decision Challenge"] },
    ],
  },
  {
    academyId: "life",
    purpose: "Develop practical planning, prioritization, habit, and follow-through skills.",
    outcomes: ["Break large tasks into visible next actions.", "Prioritize work using time and importance.", "Choose planning and habit strategies, then adjust them using evidence."],
    suggestedCoreLessonCount: 15,
    typingProgressionNotes: "Use schedules, dates, checklists, and realistic planning messages while avoiding claims that one productivity system fits everyone.",
    v1Topics: ["task breakdown", "priorities", "time estimates", "habits", "deadlines"],
    laterTopics: ["long-term projects", "workplace planning", "personal system design"],
    units: [
      { id: "life-starting", title: "Start the Work", description: "Turn vague work into a clear action and realistic estimate.", outcomes: ["Name a visible first step.", "Estimate and begin a short task."], recommendedCurriculumLevels: ["foundation", "developing", "applied"], recommendedTypingLevels: ["intermediate", "punctuation"], topicSequence: ["Find the First Step", "Define Done", "Estimate the Time", "Use a Short Timer", "Reduce Starting Friction"] },
      { id: "life-planning", title: "Plan and Prioritize", description: "Sequence actions and protect important deadlines.", outcomes: ["Order task steps.", "Choose a priority using stated reasons."], recommendedCurriculumLevels: ["developing", "applied", "analytical"], recommendedTypingLevels: ["punctuation", "numbers-symbols", "real-world"], topicSequence: ["Important vs Urgent", "Work Backward", "Calendar the Deadline", "Plan for Interruptions", "A Realistic Daily Plan"] },
      { id: "life-habits", title: "Follow Through", description: "Use cues, tracking, and reflection to improve a repeatable system.", outcomes: ["Design a small habit cue.", "Adjust a plan based on what happened."], recommendedCurriculumLevels: ["applied", "analytical", "synthesis"], recommendedTypingLevels: ["real-world", "fluency", "advanced"], topicSequence: ["Small Repeatable Habits", "Cues and Reminders", "Track What Matters", "Recover After a Miss", "Build Your Own System"] },
    ],
  },
] as const;

export function getAcademyCurriculumPlan(academyId: AcademyId) {
  return ACADEMY_CURRICULUM_PLANS.find((plan) => plan.academyId === academyId);
}

export function getCurriculumUnit(academyId: AcademyId, unitId: string) {
  return getAcademyCurriculumPlan(academyId)?.units.find((unit) => unit.id === unitId);
}

export const PLANNED_CORE_LESSON_TOTAL = ACADEMY_CURRICULUM_PLANS.reduce(
  (total, plan) => total + plan.suggestedCoreLessonCount,
  0,
);
