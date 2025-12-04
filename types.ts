
export interface ComparisonRow {
  criteria: string;
  requirement: string;
  candidateMatch: string;
  status: "Match" | "Gap" | "Partial";
}

export interface Resource {
  title: string;
  type: "Reading" | "Podcast" | "Document" | "Video";
  link: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "MultipleChoice" | "TrueFalse" | "ShortAnswer";
  options?: string[];
  correctAnswer: string;
}

export interface Assessment {
  title: string;
  type: "Conceptual" | "Practical" | "Challenge";
  questions: QuizQuestion[];
}

export interface WeeklyModule {
  weekNumber: number;
  title: string;
  estimatedHours: string; // New field for study time estimation
  theory: string; 
  podcastScript: string; 
  podcastSummary: string;
  resources: Resource[];
  assessments: Assessment[];
}

export interface FinalEval {
    caseStudy: string;
    questions: QuizQuestion[];
    feedbackReport: string;
}

export interface UserProfile {
  name: string;
  currentRole: string;
  yearsExperience: string;
  topSkills: string[];
}

export interface QuizResult {
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  date: Date;
  passed: boolean;
}

export interface MarketTrends {
    marketGaps: string[];
    growingTech: string[];
    decliningTech: string[];
    emergingRoles: string[];
    recommendations: string[];
}

export interface RedFlagsAnalysis {
    redFlags: Array<{
        title: string;
        description: string;
        severity: "High" | "Medium";
    }>;
    risks: string; // Markdown
    questionsToAsk: string[];
    alternatives: string; // Markdown
}

export interface InterviewQuestion {
    id: string;
    question: string;
    category: "Challenge" | "Trick" | "Pressure" | "Culture";
    intent: string; // The hidden meaning behind the question
    guide: string; // How to answer correctly
}

export interface InterviewSimulation {
    introduction: string;
    questions: InterviewQuestion[];
    generalTips: string[];
}

export interface SeniorFeedback {
    realityCheck: string; // Honest analysis of current state
    doingWell: string[];
    doingPoorly: string[];
    stopDoingImmediately: string[];
    priorities: string[]; // What to focus on to grow
    marketTrends: string[];
    improvementPlan: string; // Markdown actionable plan
}

export interface SalaryNegotiation {
    initialOffer: string; // The text of the offer (salary, equity, benefits)
    recruiterExcuse: string; // "We are at cap", "Equity is valuable"
    lowballRisks: string[]; // Why this might be a trap
    negotiationStrategy: Array<{
        objection: string; // "We can't go higher on base"
        counterScript: string; // What the candidate should say
    }>;
    closingTips: string[];
}

export interface JobTranslation {
    ambiguities: Array<{ quote: string; explanation: string }>; // Explaining exaggerated parts
    dictionary: Array<{ jargon: string; reality: string }>; // "Competitive Salary" -> "Minimum wage"
    hiddenSignals: string[]; // Hidden overload signals
    responsibilities: {
        real: string[]; // What you will actually do
        smoke: string[]; // Fluff/Marketing responsibilities
    };
    honestVersion: string; // The simplified vacancy text (Markdown)
}

export interface AnalysisResult {
  userProfile: UserProfile;
  verdict: "APTO" | "NO APTO";
  verdictExplanation: string;
  vacancyAnalysis: string;
  candidateAnalysis: string;
  comparisonMatrix: ComparisonRow[];
  studyPath: WeeklyModule[];
  finalEvaluation: FinalEval;
  tutorInstructions: string;
  accessibilityStatement: string;
  analysisDuration?: number;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export type AppStep = "upload" | "analyzing" | "results" | "study" | "chat" | "stats" | "market" | "interview" | "senior" | "decoder";

export interface FileAttachment {
  mimeType: string;
  data: string; // Base64 string (without the data: prefix)
  sourceType: "resume" | "job";
}