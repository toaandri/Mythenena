import { create } from "zustand";
import type { SurveyAnswer } from "../../shared/types/survey";

// State du questionnaire (mini-sondage + adaptatif)
interface SurveyState {
  miniAnswers: SurveyAnswer[];
  adaptiveAnswers: SurveyAnswer[];
  isComplete: boolean;

  addMiniAnswer: (answer: SurveyAnswer) => void;
  addAdaptiveAnswer: (answer: SurveyAnswer) => void;
  setComplete: (value: boolean) => void;
  reset: () => void;
}

export const useSurveyStore = create<SurveyState>((set) => ({
  miniAnswers: [],
  adaptiveAnswers: [],
  isComplete: false,

  addMiniAnswer: (answer) =>
    set((state) => ({ miniAnswers: [...state.miniAnswers, answer] })),
  addAdaptiveAnswer: (answer) =>
    set((state) => ({ adaptiveAnswers: [...state.adaptiveAnswers, answer] })),
  setComplete: (value) => set({ isComplete: value }),
  reset: () => set({ miniAnswers: [], adaptiveAnswers: [], isComplete: false }),
}));
