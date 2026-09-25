import { Hono } from "hono";

// POST /api/synthese/generate        — générer la synthèse depuis le questionnaire
// GET  /api/synthese/:sessionId       — récupérer la synthèse
// POST /api/synthese/:sessionId/correct — l'utilisateur corrige une observation

const synthese = new Hono();

synthese.post("/generate", async (c) => {
  // TODO:
  // 1. Récupérer toutes les réponses du questionnaire (mini + adaptatif + chat)
  // 2. Appeler aiService.generateSynthesis(answers)
  // 3. Valider : pas de probabilités de maladie, pas de score clinique
  // 4. Enregistrer et retourner la Synthesis
  // Body: { sessionId }
  return c.json({ message: "TODO" }, 501);
});

synthese.get("/:sessionId", async (c) => {
  // TODO: retourner la synthèse existante d'une session
  return c.json({ message: "TODO" }, 501);
});

synthese.post("/:sessionId/correct", async (c) => {
  // TODO: enregistrer la correction de l'utilisateur sur un domaine
  // Body: SynthesisCorrection
  return c.json({ message: "TODO" }, 501);
});

export default synthese;
