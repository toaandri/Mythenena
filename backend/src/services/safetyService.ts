import { SAFETY_KEYWORDS_FR, SAFETY_KEYWORDS_MG, EMERGENCY_RESOURCES } from "../../../shared/constants/urgency";
import type { SafetyAlert } from "../../../shared/types/chat";

export type SafetyLevel = "ok" | "info" | "warning" | "critical";

/**
 * Analyse un texte entrant (message utilisateur ou réponse IA)
 * et retourne un niveau de sécurité + une alerte si nécessaire.
 *
 * ⚠️ Ne pas se limiter aux mots-clés : prendre en compte le contexte.
 * ⚠️ Ne pas censurer l'expression de souffrance — seulement le danger immédiat.
 */
export async function checkText(
  text: string,
  _language: "fr" | "mg"
): Promise<{ level: SafetyLevel; alert?: SafetyAlert }> {
  // TODO: 
  // 1. Vérifier les mots-clés (SAFETY_KEYWORDS_FR / MG) — détection rapide
  // 2. Si mot-clé trouvé → appeler GPT pour confirmer le contexte (pas de faux positif)
  // 3. Retourner le niveau approprié et les ressources d'urgence si critical
  // 4. Prévoir un message de repli si le service IA échoue
  
  const lowerText = text.toLowerCase();
  const keywords = _language === "mg" ? SAFETY_KEYWORDS_MG : SAFETY_KEYWORDS_FR;
  const hasKeyword = keywords.some((kw) => lowerText.includes(kw));

  if (hasKeyword) {
    // TODO: confirmer avec GPT avant de retourner critical
    return {
      level: "warning",
      alert: {
        level: "warning",
        message:
          "Tu n'es pas seul(e). Des personnes sont là pour t'aider.",
        resources: EMERGENCY_RESOURCES,
      },
    };
  }

  return { level: "ok" };
}

export default { checkText };
