// Hook — gestion du questionnaire adaptatif
// TODO: récupérer prochaine question, soumettre réponse, gérer fin de questionnaire

export function useQuestionnaire(sessionId: string | null) {
  // TODO:
  // - currentQuestion: Question | null
  // - fetchNextQuestion(): appel POST /api/survey/adaptive/next
  // - submitAnswer(answer: SurveyAnswer): appel POST /api/survey/adaptive/answer
  // - isComplete: boolean
  return { currentQuestion: null, fetchNextQuestion: async () => {}, submitAnswer: async (_: unknown) => {}, isComplete: false };
}
