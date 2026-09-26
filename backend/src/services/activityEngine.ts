/**
 * Moteur d'activités interactives.
 *
 * Sélectionne une activité de la bibliothèque selon 6 axes d'état,
 * adapte le choix au profil Kolb de la personne, et génère les
 * instructions guidées pour mener l'activité.
 *
 * Règle fondamentale : le moteur choisit UNIQUEMENT dans la bibliothèque
 * activityLibrary — jamais en dehors, jamais librement inventé.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ActivityLibraryRow, LearningPreferencesRow } from "../db/schema";

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

/** Les 6 axes d'état envoyés par le client pour sélectionner une activité. */
export interface StateAxes {
  /** État émotionnel principal (optionnel) */
  emotionalState?: "tension" | "tristesse" | "rumination" | "fatigue" | "agitation" | "colère" | "solitude" | "autre";
  /** Niveau d'énergie disponible */
  energyLevel?: "very_low" | "low" | "medium" | "high";
  /** Durée disponible en secondes */
  availableSeconds?: number;
  /** Objectif immédiat de l'utilisateur */
  goal?: "calmer" | "comprendre" | "agir" | "exprimer" | "connexion";
  /** Contexte (ex: "travail", "maison", "transport") */
  context?: string;
  /** Langue préférée */
  language?: "fr" | "mg";
}

export interface ActivityRecommendation {
  activity: ActivityLibraryRow;
  reason: string;
  guidedInstructions: string;
  guidedInstructionsMg?: string;
}

// ---------------------------------------------------------------------------
// Filtrage par les 6 axes
// ---------------------------------------------------------------------------

/**
 * Filtre la bibliothèque selon les axes d'état.
 * Retourne les activités compatibles triées par pertinence.
 */
export function filterActivities(
  library: ActivityLibraryRow[],
  axes: StateAxes
): ActivityLibraryRow[] {
  const active = library.filter((a) => a.isActive);

  // Filtrer par durée disponible
  const byDuration = axes.availableSeconds
    ? active.filter((a) => a.durationMinSeconds <= axes.availableSeconds!)
    : active;

  // Filtrer par niveau d'énergie
  const byEnergy = axes.energyLevel
    ? byDuration.filter((a) => !a.energyLevels?.length || a.energyLevels.includes(axes.energyLevel!))
    : byDuration;

  // Filtrer par état cible
  const byState = axes.emotionalState
    ? byEnergy.filter((a) => !a.stateTargets?.length || a.stateTargets.includes(axes.emotionalState!))
    : byEnergy;

  // Si aucune activité compatible, retourner toutes les actives (fallback)
  return byState.length > 0 ? byState : active;
}

/**
 * Adapte la sélection finale selon le profil Kolb de la personne.
 * Les personnes avec un score "action" élevé préfèrent les activités accommodating/converging.
 * Les personnes avec un score "observation" élevé préfèrent diverging/assimilating.
 */
export function adaptToKolb(
  candidates: ActivityLibraryRow[],
  learningPrefs: LearningPreferencesRow | undefined
): ActivityLibraryRow[] {
  if (!learningPrefs) return candidates;
  if (!candidates.length) return candidates;

  const { actionScore, observationScore, conceptualizationScore, applicationScore } = learningPrefs;
  const maxScore = Math.max(actionScore, observationScore, conceptualizationScore, applicationScore);

  let preferredMode: string;
  if (maxScore === actionScore) preferredMode = "accommodating";
  else if (maxScore === observationScore) preferredMode = "diverging";
  else if (maxScore === conceptualizationScore) preferredMode = "assimilating";
  else preferredMode = "converging";

  const kolbFiltered = candidates.filter((a) => a.kolbModes?.includes(preferredMode));
  return kolbFiltered.length > 0 ? kolbFiltered : candidates;
}

// ---------------------------------------------------------------------------
// Sélection finale et génération des instructions
// ---------------------------------------------------------------------------

/**
 * Sélectionne la meilleure activité et génère des instructions guidées
 * personnalisées via Gemini.
 */
export async function selectAndGuide(
  library: ActivityLibraryRow[],
  axes: StateAxes,
  learningPrefs: LearningPreferencesRow | undefined
): Promise<ActivityRecommendation | null> {
  const filtered = filterActivities(library, axes);
  const adapted = adaptToKolb(filtered, learningPrefs);

  if (!adapted.length) return null;

  // Choisir la première (la plus pertinente après filtrage)
  const chosen = adapted[0]!;

  // Générer les instructions guidées via Gemini
  const instructions = await generateGuidedInstructions(chosen, axes);

  return {
    activity: chosen,
    reason: buildReason(chosen, axes),
    guidedInstructions: instructions.fr,
    guidedInstructionsMg: instructions.mg,
  };
}

function buildReason(activity: ActivityLibraryRow, axes: StateAxes): string {
  const parts: string[] = [];
  if (axes.emotionalState) parts.push(`pour accompagner l'état de ${axes.emotionalState}`);
  if (axes.energyLevel) parts.push(`adapté à un niveau d'énergie ${axes.energyLevel}`);
  if (axes.availableSeconds) parts.push(`réalisable en ${Math.round(axes.availableSeconds / 60)} min`);
  return parts.length > 0
    ? `Activité "${activity.name}" sélectionnée : ${parts.join(", ")}.`
    : `Activité "${activity.name}" recommandée selon votre profil.`;
}

async function generateGuidedInstructions(
  activity: ActivityLibraryRow,
  axes: StateAxes
): Promise<{ fr: string; mg?: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return { fr: activity.descriptionFr, mg: activity.descriptionMg ?? undefined };
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_TEXT_MODEL ?? "gemini-flash-lite-latest" });

    const prompt = `
Tu génères des instructions guidées personnalisées pour une activité de bien-être.

Activité : "${activity.name}" (catégorie : ${activity.category})
Description de base : ${activity.descriptionFr}
État de la personne : ${axes.emotionalState ?? "non précisé"}
Énergie disponible : ${axes.energyLevel ?? "non précisée"}
Durée disponible : ${axes.availableSeconds ? `${Math.round(axes.availableSeconds / 60)} minutes` : "non précisée"}

Génère des instructions étape par étape, chaleureuses, accessibles et adaptées au contexte.
Maximum 150 mots en français. Commence par accueillir la personne là où elle en est.

Réponds avec ce JSON :
\`\`\`json
{
  "fr": "instructions en français",
  "mg": "instructions en malagasy (optionnel, si possible)"
}
\`\`\`
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/s);
    if (match) {
      const parsed = JSON.parse(match[1] as string) as { fr?: string; mg?: string };
      return {
        fr: parsed.fr ?? activity.descriptionFr,
        mg: parsed.mg ?? activity.descriptionMg ?? undefined,
      };
    }
  } catch {
    // Repli sur la description de base
  }

  return { fr: activity.descriptionFr, mg: activity.descriptionMg ?? undefined };
}

export default { filterActivities, adaptToKolb, selectAndGuide };
