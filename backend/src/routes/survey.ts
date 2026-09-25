import { Hono } from "hono";

// POST /api/survey/mini/answer     — soumettre réponse mini-sondage
// POST /api/survey/adaptive/next   — obtenir la prochaine question générée par IA
// POST /api/survey/adaptive/answer — soumettre réponse question adaptative
// GET  /api/survey/:sessionId      — récupérer tout l'historique du questionnaire

const survey = new Hono();

survey.post("/mini/answer", async (c) => {
  // TODO: enregistrer les réponses du mini-sondage (5 questions)
  // Body: { sessionId, answers: SurveyAnswer[] }
  return c.json({ message: "TODO" }, 501);
});

survey.post("/adaptive/next", async (c) => {
  // TODO: appeler aiService.generateNextQuestion(history)
  // Valider la question générée avant de la retourner
  // Body: { sessionId }
  return c.json({ message: "TODO" }, 501);
});

survey.post("/adaptive/answer", async (c) => {
  // TODO: enregistrer la réponse + la version exacte de la question affichée
  // Body: { sessionId, answer: SurveyAnswer }
  return c.json({ message: "TODO" }, 501);
});

survey.get("/:sessionId", async (c) => {
  // TODO: retourner toutes les questions et réponses d'une session
  return c.json({ message: "TODO" }, 501);
});

export default survey;
