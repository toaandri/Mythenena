import { SAFETY_KEYWORDS_FR, SAFETY_KEYWORDS_MG, EMERGENCY_RESOURCES } from "../../../shared/constants/urgency";
import type { SafetyAlert } from "../../../shared/types/chat";

export type SafetyLevel = "ok" | "info" | "warning" | "critical";

/**
 * Analyse un texte entrant (message utilisateur ou réponse IA)
 * et retourne un niveau de sécurité + une alerte si nécessaire.
 *
 * Détection par mots-clés : rapide, sans appel IA, fail-safe.
 * Le niveau "critical" interrompt le parcours normal dans toutes les routes
 * et retourne les ressources d'urgence sans passer par Gemini.
 *
 * ⚠️ Ne pas censurer l'expression de souffrance — seulement le danger immédiat.
 * ⚠️ SAFETY_KEYWORDS_MG doit être validé par des locuteurs natifs avant production.
 */
export async function checkText(
  text: string,
  _language: "fr" | "mg"
): Promise<{ level: SafetyLevel; alert?: SafetyAlert }> {
  const lowerText = text.toLowerCase();

  // Vérifier les deux listes : FR pour tous les textes (mélange FR/MG fréquent),
  // MG ajouté selon la langue déclarée.
  const keywordsFr = SAFETY_KEYWORDS_FR;
  const keywordsMg = SAFETY_KEYWORDS_MG;
  const allKeywords = _language === "mg"
    ? [...keywordsFr, ...keywordsMg]
    : keywordsFr;

  const hasKeyword = allKeywords.some((kw) => lowerText.includes(kw.toLowerCase()));

  if (hasKeyword) {
    const message = _language === "mg"
      ? "Tsy irery ianao. Misy olona vonona hanampy anao."
      : "Tu n'es pas seul(e). Des personnes sont là pour t'aider.";

    return {
      level: "critical",
      alert: {
        level: "critical",
        message,
        resources: EMERGENCY_RESOURCES,
      },
    };
  }

  return { level: "ok" };
}

export default { checkText };
