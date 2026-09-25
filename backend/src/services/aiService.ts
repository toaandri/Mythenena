import OpenAI from "openai";

// Service IA — OpenAI GPT-4o-mini
// Toutes les interactions avec l'API OpenAI passent par ici

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Génère la prochaine question adaptative du questionnaire.
 * Retourne une Question validée ou null si le questionnaire est terminé.
 */
export async function generateNextQuestion(
  _answersHistory: unknown[],
  _language: "fr" | "mg"
): Promise<unknown | null> {
  // TODO: construire le prompt avec l'historique des réponses
  // Demander à GPT de générer { question, choices, domain }
  // Valider le format avant de retourner
  // Retourner null si MAX_ADAPTIVE_QUESTIONS atteint ou si couverture suffisante
  throw new Error("Not implemented");
}

/**
 * Envoie un message dans la conversation de soutien.
 * Injecte le contexte du questionnaire en system prompt.
 */
export async function chat(
  _messages: unknown[],
  _userMessage: string,
  _language: "fr" | "mg",
  _surveyContext?: string
): Promise<string> {
  // TODO: construire le system prompt (écoute active, TCC, pas de diagnostic)
  // Appeler openai.chat.completions.create avec gpt-4o-mini
  // Retourner le texte de la réponse
  throw new Error("Not implemented");
}

/**
 * Génère la synthèse pédagogique à partir des réponses.
 * Ne doit PAS produire de diagnostic ni de score clinique.
 */
export async function generateSynthesis(
  _answers: unknown[],
  _language: "fr" | "mg"
): Promise<unknown> {
  // TODO: construire le prompt de synthèse
  // Valider que la réponse ne contient pas de probabilités de maladie
  throw new Error("Not implemented");
}

export default { generateNextQuestion, chat, generateSynthesis };
