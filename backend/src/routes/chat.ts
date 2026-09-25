import { Hono } from "hono";

// POST /api/chat/message   — envoyer un message, recevoir réponse IA
// GET  /api/chat/:sessionId — récupérer l'historique de la conversation

const chat = new Hono();

chat.post("/message", async (c) => {
  // TODO: 
  // 1. Extraire le message depuis le body (ChatRequest)
  // 2. Passer par safetyService.checkInput(message)
  //    → si critical : retourner SafetyAlert sans appeler l'IA
  // 3. Construire le contexte depuis l'historique + résumé du questionnaire
  // 4. Appeler aiService.chat(context, message, language)
  // 5. Passer la réponse par safetyService.checkOutput(response)
  // 6. Enregistrer les deux messages en base
  // 7. Retourner ChatResponse
  return c.json({ message: "TODO" }, 501);
});

chat.get("/:sessionId", async (c) => {
  // TODO: retourner l'historique de la conversation (si retainHistory = true)
  return c.json({ message: "TODO" }, 501);
});

export default chat;
