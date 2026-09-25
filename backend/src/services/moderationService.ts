/**
 * Service de modération du forum.
 * Vérifie les publications et réponses avant enregistrement.
 *
 * Règles :
 * - Détecter harcèlement, divulgation d'infos personnelles, contenus dangereux
 * - Distinguer témoignage de souffrance (autorisé) et incitation à se faire du mal (signaler)
 * - Ne pas censurer automatiquement — créer un signalement pour revue humaine si ambigu
 */

export type ModerationResult = {
  allowed: boolean;
  flag: boolean; // mettre en file de modération humaine
  reason?: string;
};

export async function checkContent(_content: string): Promise<ModerationResult> {
  // TODO:
  // 1. Vérifier via OpenAI Moderation API (endpoint /v1/moderations — gratuit)
  // 2. Appliquer règles supplémentaires spécifiques au contexte (détresse vs danger)
  // 3. Retourner allowed=true + flag=true pour les cas ambigus (revue humaine)
  throw new Error("Not implemented");
}

export default { checkContent };
