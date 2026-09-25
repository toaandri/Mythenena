// Types partagés — Questionnaire & Sondage

export type Language = "fr" | "mg";

export type QuestionType = "single" | "multiple" | "scale" | "text";

export interface Choice {
  id: string;
  label: string; // FR
  labelMg?: string; // Malagasy
}

export interface Question {
  id: string;
  text: string;
  textMg?: string;
  type: QuestionType;
  choices: Choice[];
  domain: SurveyDomain;
  allowSkip: boolean;
}

export type SurveyDomain =
  | "mood"
  | "sleep"
  | "stress"
  | "relationships"
  | "motivation"
  | "anxiety"
  | "energy"
  | "selfEsteem"
  | "isolation";

export interface SurveyAnswer {
  questionId: string;
  questionText: string;
  choiceIds: string[] | null; // null = skipped
  textAnswer?: string;
  skipped: boolean;
  answeredAt: string; // ISO date
}

export interface MiniSurvey {
  sessionId: string;
  answers: SurveyAnswer[];
  completedAt?: string;
}

export interface AdaptiveSurvey {
  sessionId: string;
  questions: Question[];
  answers: SurveyAnswer[];
  isComplete: boolean;
  completedAt?: string;
}
