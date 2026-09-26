/**
 * Moteur d'entretien analytique (étape 2+ du plan Mythenena).
 *
 * L'IA mène un entretien structuré en 9 phases, construit un profil évolutif
 * de l'utilisateur et met à jour ce profil après chaque tour.
 *
 * Principes éthiques obligatoires :
 *  - Aucun diagnostic, aucun score clinique, aucune probabilité de maladie.
 *  - Les hypothèses sont toujours formulées comme hypothèses, jamais comme vérités.
 *  - L'utilisateur peut corriger, refuser un sujet ou terminer à tout moment.
 *  - En cas d'alerte de sécurité, le parcours ordinaire est interrompu.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { InterviewRepo } from "../repositories/interview.repo";
import type { ProfileRepo } from "../repositories/profile.repo";
import type { InterviewSessionRow, InterviewTurnRow } from "../db/schema";
import { newId } from "../utils/id";
import { checkText } from "./safetyService";

// ---------------------------------------------------------------------------
// Types publics
// ---------------------------------------------------------------------------

export interface InterviewPhaseContext {
  /** 0 intention | 1 récit libre | 2 clarification chronologique |
   *  3 émotions/significations | 4 valeurs | 5 identité | 6 comportements |
   *  7 hypothèses | 8 cohérence/contradictions | 9 mise à jour profil */
  phase: number;
  phaseLabel: string;
  methodUsed: string;
  questionGoal: string;
}

export interface ProfileDelta {
  newLifeEvents?: Array<{ event: string; period?: string; emotion?: string; meaningGiven?: string }>;
  newHypotheses?: Array<{ text: string; confidence: string }>;
  newPatterns?: Array<{ trigger: string; emotion?: string; action?: string }>;
  newValues?: Array<{ valueName: string; claimedImportance: string }>;
  updatedIdentityDomains?: Array<{ domain: string; content: Record<string, unknown> }>;
  newContradictions?: Array<{ statementA: string; statementB: string; contextDifference?: string }>;
  kolbUpdate?: { action?: number; observation?: number; conceptualization?: number; application?: number };
}

export interface TurnResult {
  turnId: string;
  phase: InterviewPhaseContext;
  delta: ProfileDelta;
}

// ---------------------------------------------------------------------------
// Constantes des phases
// ---------------------------------------------------------------------------

const PHASES: Record<number, { label: string; method: string; goal: string }> = {
  0: { label: "Intention", method: "narrative", goal: "Comprendre l'objectif de la démarche" },
  1: { label: "Récit libre", method: "narrative", goal: "Laisser la personne raconter sans structure imposée" },
  2: { label: "Chronologie", method: "oars", goal: "Placer les événements sur une ligne de temps" },
  3: { label: "Émotions & significations", method: "socratic", goal: "Relier les faits aux émotions et sens donnés" },
  4: { label: "Valeurs", method: "values", goal: "Identifier ce qui compte vraiment pour la personne" },
  5: { label: "Identité", method: "identity", goal: "Explorer les domaines de l'identité personnelle" },
  6: { label: "Comportements", method: "kolb", goal: "Repérer les schémas comportementaux récurrents" },
  7: { label: "Hypothèses", method: "socratic", goal: "Formuler des hypothèses provisoires et les soumettre à la personne" },
  8: { label: "Cohérence", method: "synthesis", goal: "Explorer les contradictions apparentes avec bienveillance" },
  9: { label: "Profil", method: "synthesis", goal: "Mettre à jour le profil évolutif de la personne" },
};

const MAX_PHASE = 9;

// ---------------------------------------------------------------------------
// Utilitaires Gemini
// ---------------------------------------------------------------------------

function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY manquante");
  const modelName = process.env.GEMINI_TEXT_MODEL ?? "gemini-flash-lite-latest";
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
}

function extractJson(text: string): unknown {
  const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/s);
  if (!match) return {};
  try { return JSON.parse(match[1] as string); } catch { return {}; }
}

// ---------------------------------------------------------------------------
// Prompt système
// ---------------------------------------------------------------------------

function buildSystemPrompt(phase: number, phaseInfo: typeof PHASES[0], history: InterviewTurnRow[], language: "fr" | "mg"): string {
  const lang = language === "mg" ? "malagasy" : "français";
  const historyText = history
    .map((t) => `[${t.role === "user" ? "Utilisateur" : "Assistant"}]: ${t.content}`)
    .join("\n");

  return `
Tu es un accompagnateur d'écoute analytique bienveillant pour Mythenena (Madagascar).
Tu mènes un entretien structuré pour aider la personne à mieux se comprendre.

Phase actuelle : ${phaseInfo.label} (phase ${phase}/${MAX_PHASE})
Méthode : ${phaseInfo.method}
Objectif de ce tour : ${phaseInfo.goal}
Langue : ${lang}

RÈGLES ABSOLUES :
1. JAMAIS de diagnostic, score clinique ou étiquette médicale/psychologique.
2. Les hypothèses sont formulées comme des hypothèses vérifiables : "J'ai l'impression que..." ou "Est-ce que ça résonne avec toi ?".
3. L'utilisateur peut refuser un sujet, corriger une interprétation ou terminer à tout moment.
4. Formulations bienveillantes, accessibles, sans jargon clinique.
5. Si la personne exprime une détresse grave, orienter vers des ressources humaines et arrêter l'exploration.
6. Rester centré sur le soutien, l'écoute et l'orientation, sans présenter Mythenena comme un substitut à un humain ou à un professionnel.

Historique de la conversation :
${historyText || "(début de l'entretien)"}

Réponds de manière chaleureuse et concise (2-4 phrases). Termine par une question ouverte adaptée à la phase courante.
`;
}

// ---------------------------------------------------------------------------
// Fonction principale de streaming SSE
// ---------------------------------------------------------------------------

/**
 * Génère la prochaine réponse de l'IA en streaming SSE.
 * Retourne un AsyncIterable de chunks de texte.
 * Après la fin du stream, met à jour le profil en arrière-plan.
 */
export async function* streamInterviewResponse(
  session: InterviewSessionRow,
  userMessage: string,
  language: "fr" | "mg",
  interviewRepo: InterviewRepo,
  profileRepo: ProfileRepo
): AsyncGenerator<string, TurnResult, undefined> {
  // 1. Vérification de sécurité sur le message utilisateur
  const safety = await checkText(userMessage, language);
  if (safety.level === "critical") {
    yield `data: ${JSON.stringify({ type: "safety_alert", alert: safety.alert })}\n\n`;
    yield `data: [DONE]\n\n`;
    return { turnId: "", phase: { phase: session.currentPhase, phaseLabel: "", methodUsed: "", questionGoal: "" }, delta: {} };
  }

  // 2. Persister le tour utilisateur
  const userTurnId = newId();
  await interviewRepo.addTurn({
    id: userTurnId,
    interviewSessionId: session.id,
    role: "user",
    content: userMessage,
  });

  // 3. Récupérer l'historique
  const history = await interviewRepo.listTurns(session.id);
  const phase = session.currentPhase ?? 0;
  const phaseInfo = PHASES[phase] ?? PHASES[0];

  // 4. Streaming de la réponse
  let fullResponse = "";
  const asTurnId = newId();

  try {
    const model = getGeminiModel();
    const systemPrompt = buildSystemPrompt(phase, phaseInfo, history, language);

    const result = await model.generateContentStream([
      { text: systemPrompt },
      { text: `Message de l'utilisateur : ${userMessage}` },
    ]);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullResponse += text;
      yield `data: ${JSON.stringify({ type: "token", text })}\n\n`;
    }
  } catch (err) {
    // Message de repli en cas d'erreur Gemini
    const fallback = language === "mg"
      ? "Misaotra anao. Azo atao ve ny manazava bebe kokoa?"
      : "Merci pour ce partage. Pouvez-vous m'en dire un peu plus ?";
    fullResponse = fallback;
    yield `data: ${JSON.stringify({ type: "token", text: fallback })}\n\n`;
  }

  // 5. Persister la réponse de l'IA
  await interviewRepo.addTurn({
    id: asTurnId,
    interviewSessionId: session.id,
    role: "assistant",
    content: fullResponse,
    methodUsed: phaseInfo.method,
    questionGoal: phaseInfo.goal,
  });

  // 6. Calculer le prochain phase (avance si le turn est suffisamment riche)
  const nextPhase = Math.min(phase + (history.length > 2 ? 1 : 0), MAX_PHASE);
  await interviewRepo.updateSession(session.id, { currentPhase: nextPhase });

  // 7. Extraction du delta profil en arrière-plan (non-bloquant pour le stream)
  const delta = await extractProfileDelta(fullResponse, userMessage, session.userId, profileRepo, asTurnId);

  // 8. Persister le delta
  if (Object.keys(delta).length > 0) {
    await interviewRepo.saveProfileDelta({
      id: newId(),
      userId: session.userId,
      delta: delta as Record<string, unknown>,
      turnId: asTurnId,
    });
  }

  yield `data: [DONE]\n\n`;

  return {
    turnId: asTurnId,
    phase: {
      phase: nextPhase,
      phaseLabel: PHASES[nextPhase]?.label ?? "",
      methodUsed: phaseInfo.method,
      questionGoal: phaseInfo.goal,
    },
    delta,
  };
}

// ---------------------------------------------------------------------------
// Extraction du delta de profil
// ---------------------------------------------------------------------------

async function extractProfileDelta(
  aiResponse: string,
  userMessage: string,
  userId: string,
  profileRepo: ProfileRepo,
  turnId: string
): Promise<ProfileDelta> {
  try {
    const model = getGeminiModel();
    const extractPrompt = `
Analyse ces échanges et extrais les informations structurées pour le profil de la personne.
Message utilisateur : "${userMessage}"
Réponse IA : "${aiResponse}"

Retourne UNIQUEMENT un JSON avec les champs qui ont été identifiés (omets les champs vides) :
\`\`\`json
{
  "newLifeEvents": [{"event": "...", "period": "...", "emotion": "...", "meaningGiven": "..."}],
  "newHypotheses": [{"text": "...", "confidence": "low|medium|high"}],
  "newPatterns": [{"trigger": "...", "emotion": "...", "action": "..."}],
  "newValues": [{"valueName": "...", "claimedImportance": "high|medium|low"}],
  "updatedIdentityDomains": [{"domain": "personal|family|social|cultural|school_work|digital|projected|history", "content": {...}}],
  "newContradictions": [{"statementA": "...", "statementB": "...", "contextDifference": "..."}],
  "kolbUpdate": {"action": 0.0, "observation": 0.0, "conceptualization": 0.0, "application": 0.0}
}
\`\`\`
Ne retourne que les champs pour lesquels il y a clairement quelque chose à extraire. Pas d'inventions.
`;

    const result = await model.generateContent(extractPrompt);
    const text = result.response.text();
    const parsed = extractJson(text) as Partial<ProfileDelta>;

    // Persister chaque type d'élément extrait
    if (parsed.newLifeEvents?.length) {
      for (const ev of parsed.newLifeEvents) {
        await profileRepo.addLifeEvent({ id: newId(), userId, ...ev, evidenceIds: [turnId] });
      }
    }
    if (parsed.newHypotheses?.length) {
      for (const h of parsed.newHypotheses) {
        await profileRepo.addHypothesis({ id: newId(), userId, ...h, evidenceFor: [turnId] });
      }
    }
    if (parsed.newPatterns?.length) {
      for (const p of parsed.newPatterns) {
        await profileRepo.addBehaviorPattern({ id: newId(), userId, ...p, evidenceFor: [turnId] });
      }
    }
    if (parsed.newValues?.length) {
      for (const v of parsed.newValues) {
        await profileRepo.upsertValue({ id: newId(), userId, ...v });
      }
    }
    if (parsed.updatedIdentityDomains?.length) {
      for (const d of parsed.updatedIdentityDomains) {
        await profileRepo.upsertIdentityDomain({ id: newId(), userId, ...d, evidenceIds: [turnId] });
      }
    }
    if (parsed.newContradictions?.length) {
      for (const c of parsed.newContradictions) {
        await profileRepo.addContradiction({ id: newId(), userId, ...c });
      }
    }
    if (parsed.kolbUpdate) {
      const existing = await profileRepo.getLearningPreferences(userId);
      const k = parsed.kolbUpdate;
      await profileRepo.upsertLearningPreferences({
        id: existing?.id ?? newId(),
        userId,
        actionScore: Math.min(1, (existing?.actionScore ?? 0) + (k.action ?? 0)),
        observationScore: Math.min(1, (existing?.observationScore ?? 0) + (k.observation ?? 0)),
        conceptualizationScore: Math.min(1, (existing?.conceptualizationScore ?? 0) + (k.conceptualization ?? 0)),
        applicationScore: Math.min(1, (existing?.applicationScore ?? 0) + (k.application ?? 0)),
        evidenceIds: [...(existing?.evidenceIds ?? []), turnId],
      });
    }

    return parsed as ProfileDelta;
  } catch {
    // Ne pas bloquer le flux si l'extraction échoue
    return {};
  }
}

export default { streamInterviewResponse };
