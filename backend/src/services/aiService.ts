/**
 * Service IA — Gemini (Google AI Free Tier)
 *
 * Remplace les stubs OpenAI par des implémentations réelles.
 * Les clés sont lues depuis process.env ; si elles sont absentes,
 * une ApiError 503 est levée immédiatement.
 *
 * Principes éthiques :
 *  - Aucun diagnostic, aucun score clinique, aucune probabilité de maladie.
 *  - Les réponses générées sont présentées comme exploratoires.
 *  - En cas d'indisponibilité de l'IA, des messages de repli sont utilisés.
 */

import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import { MAX_ADAPTIVE_QUESTIONS } from "../../../shared/constants/urgency";
import type { SurveyAnswerRow } from "../db/schema";

// ---------------------------------------------------------------------------
// Utilitaires internes
// ---------------------------------------------------------------------------

function getModel(): GenerativeModel {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new ServiceUnavailableError(
      "GEMINI_API_KEY non configurée — le module IA est indisponible."
    );
  }
  const modelName = process.env.GEMINI_TEXT_MODEL ?? "gemini-1.5-flash";
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: modelName });
}

/** Erreur dédiée aux services IA manquants (levée comme 503 par le handler). */
export class ServiceUnavailableError extends Error {
  readonly status = 503;
  readonly code = "service_unavailable";
  constructor(message: string) {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

/** Extrait le premier bloc JSON d'une réponse textuelle de Gemini. */
function extractJson(text: string): unknown {
  const match = text.match(/```json\s*([\s\S]*?)```/) ?? text.match(/(\{[\s\S]*\})/);
  if (!match) throw new Error("Aucun bloc JSON trouvé dans la réponse de Gemini");
  return JSON.parse(match[1] as string);
}

// ---------------------------------------------------------------------------
// Questionnaire adaptatif (étape 2)
// ---------------------------------------------------------------------------

export interface AdaptiveQuestion {
  domain: string;
  reason: string;
  question: string;
  choices: string[];
}

/**
 * Génère la prochaine question adaptative.
 * Retourne null si la limite de questions est atteinte ou si la couverture
 * est suffisante (tous les domaines explorés ou réponses concluantes).
 */
export async function generateNextQuestion(
  answersHistory: SurveyAnswerRow[],
  language: "fr" | "mg"
): Promise<AdaptiveQuestion | null> {
  // Limite stricte : ne jamais dépasser MAX_ADAPTIVE_QUESTIONS
  if (answersHistory.length >= MAX_ADAPTIVE_QUESTIONS) return null;

  const model = getModel();
  const lang = language === "mg" ? "malagasy" : "français";

  const historySummary = answersHistory
    .map((a) => `- Domaine: ${a.domain}, Question: "${a.questionText}", Passée: ${a.skipped}, Réponses: ${JSON.stringify(a.choiceIds ?? a.textAnswer ?? "—")}`)
    .join("\n");

  const alreadySkipped = answersHistory.filter((a) => a.skipped).map((a) => a.domain);
  const coveredDomains = [...new Set(answersHistory.map((a) => a.domain))];

  const prompt = `
Tu es un assistant de soutien en santé mentale pour Madagascar.
Tu génères des questions d'évaluation bienveillantes et non stigmatisantes.

Historique des réponses (${answersHistory.length}/${MAX_ADAPTIVE_QUESTIONS} questions) :
${historySummary || "(aucune réponse encore)"}

Domaines déjà couverts : ${coveredDomains.join(", ") || "aucun"}
Domaines passés (ne pas réinsister) : ${alreadySkipped.join(", ") || "aucun"}
Domaines disponibles : mood, sleep, stress, relationships, motivation, anxiety, energy, selfEsteem, isolation

Règles STRICTES :
1. Ne jamais poser un diagnostic, ne jamais attribuer d'étiquette médicale.
2. La formulation doit être empathique, accessible, sans jargon clinique.
3. Ne pas réinsister sur un domaine déjà passé par l'utilisateur.
4. Toujours inclure "Autre / difficile à déterminer" et "Passer" dans les choix.
5. Langue de réponse : ${lang}.
6. Si tous les domaines ont été suffisamment couverts, répondre {"done": true}.

Réponds UNIQUEMENT avec ce JSON (ou {"done": true}) :
\`\`\`json
{
  "domain": "stress",
  "reason": "explication courte de pourquoi ce domaine",
  "question": "texte de la question",
  "choices": ["Choix 1", "Choix 2", "Choix 3", "Autre / difficile à déterminer", "Passer"]
}
\`\`\`
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text) as Record<string, unknown>;

    // Vérifier si Gemini estime la couverture suffisante
    if (parsed.done === true) return null;

    // Valider le format
    if (
      typeof parsed.domain !== "string" ||
      typeof parsed.reason !== "string" ||
      typeof parsed.question !== "string" ||
      !Array.isArray(parsed.choices) ||
      parsed.choices.length < 2
    ) {
      throw new Error("Format de question invalide retourné par Gemini");
    }

    return {
      domain: parsed.domain as string,
      reason: parsed.reason as string,
      question: parsed.question as string,
      choices: parsed.choices as string[],
    };
  } catch (err) {
    if (err instanceof ServiceUnavailableError) throw err;
    // En cas d'erreur de génération, on indique la fin du questionnaire
    // plutôt que de laisser l'utilisateur bloqué.
    console.error("[aiService] generateNextQuestion error:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Conversation de soutien (étape 3)
// ---------------------------------------------------------------------------

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

/**
 * Génère une réponse de soutien basée sur TCC et écoute active.
 * Bilingue français/malagasy selon le choix de l'utilisateur.
 */
export async function chat(
  messages: ChatMessageInput[],
  userMessage: string,
  language: "fr" | "mg",
  surveyContext?: string
): Promise<string> {
  const model = getModel();
  const lang = language === "mg" ? "malagasy" : "français";

  const systemPrompt = `
Tu es un compagnon d'écoute bienveillant pour la plateforme Mythenena à Madagascar.
Ton rôle est d'offrir un espace d'écoute active et de soutien émotionnel, pas de faire de la thérapie.

Principes FONDAMENTAUX :
1. NE JAMAIS poser de diagnostic, prescrire un traitement ou attribuer une étiquette psychologique.
2. NE JAMAIS inventer de numéros d'urgence ni prétendre qu'un professionnel a été alerté.
3. Utiliser des techniques d'écoute active : reformulation, validation émotionnelle, questions ouvertes.
4. Langue principale : ${lang}. Si l'utilisateur écrit dans une autre langue, s'adapter.
5. Formulations accessibles, sans jargon clinique ni termes stigmatisants.
6. Si l'utilisateur exprime de la détresse grave ou des idées suicidaires, orienter vers des ressources humaines.
7. Rappeler régulièrement que Mythenena est un outil de soutien, pas un substitut médical.
${surveyContext ? `\nContexte du questionnaire préalable :\n${surveyContext}` : ""}

Réponds de manière chaleureuse, courte (3-5 phrases max), et invite à continuer à partager.
`;

  const contents = [
    ...messages.map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    })),
    {
      role: "user" as const,
      parts: [{ text: userMessage }],
    },
  ];

  try {
    const chat = model.startChat({
      systemInstruction: systemPrompt,
      history: contents.slice(0, -1),
    });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    if (err instanceof ServiceUnavailableError) throw err;
    console.error("[aiService] chat error:", err);
    // Message de repli si l'IA échoue
    return language === "mg"
      ? "Misaotra anao noho ny fahasahiananao niteny. Azafady miezaha indray kely."
      : "Merci de m'avoir partagé ça. Je suis là pour t'écouter. Peux-tu me dire un peu plus ?";
  }
}

// ---------------------------------------------------------------------------
// Synthèse pédagogique (étape 5)
// ---------------------------------------------------------------------------

export interface SynthesisOutput {
  summary: string;
  summaryMg?: string;
  domainsData: Array<{
    domain: string;
    labelFr: string;
    observations: string[];
    isUncertain: boolean;
  }>;
  suggestedActions: Array<{
    type: "resources" | "professional" | "community" | "exercise";
    labelFr: string;
    labelMg?: string;
  }>;
}

/**
 * Génère une synthèse exploratoire et pédagogique à partir des réponses.
 * AUCUN score clinique, AUCUNE probabilité de maladie, AUCUN diagnostic.
 */
export async function generateSynthesis(
  answers: SurveyAnswerRow[],
  language: "fr" | "mg"
): Promise<SynthesisOutput> {
  const model = getModel();
  const lang = language === "mg" ? "malagasy" : "français";

  const answeredQuestions = answers.filter((a) => !a.skipped);
  const skippedCount = answers.filter((a) => a.skipped).length;

  const answersSummary = answeredQuestions
    .map((a) => `- Domaine: ${a.domain} | Question: "${a.questionText}" | Réponses: ${JSON.stringify(a.choiceIds ?? a.textAnswer ?? "—")}`)
    .join("\n");

  const prompt = `
Tu génères une synthèse exploratoire bienveillante pour un utilisateur de Mythenena (Madagascar).

Réponses de l'utilisateur (${answeredQuestions.length} réponses, ${skippedCount} questions passées) :
${answersSummary || "(aucune réponse)"}

Règles ABSOLUES :
1. AUCUN diagnostic, AUCUN score clinique, AUCUNE probabilité de maladie.
2. Présenter comme exploratoire : ce que l'utilisateur a exprimé, pas ce qu'il "a".
3. Les questions passées restent des INCONNUS — ne pas les interpréter.
4. Proposer des actions concrètes et accessibles (ressources, professionnels, exercices, communauté).
5. Ton pédagogique, empathique, sans jargon. Langue principale : ${lang}.
6. Synthèse courte (150-200 mots en français, optionnel en malagasy).

Réponds UNIQUEMENT avec ce JSON :
\`\`\`json
{
  "summary": "texte de synthèse en français",
  "summaryMg": "texte de synthèse en malagasy (optionnel)",
  "domainsData": [
    {
      "domain": "stress",
      "labelFr": "Stress et pression",
      "observations": ["phrase 1 basée sur les réponses"],
      "isUncertain": false
    }
  ],
  "suggestedActions": [
    {
      "type": "resources",
      "labelFr": "Consulter les ressources sur la gestion du stress",
      "labelMg": "texte optionnel"
    }
  ]
}
\`\`\`
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJson(text) as Record<string, unknown>;

    // Valider le format minimal
    if (typeof parsed.summary !== "string") {
      throw new Error("Format de synthèse invalide");
    }

    return {
      summary: parsed.summary as string,
      summaryMg: typeof parsed.summaryMg === "string" ? parsed.summaryMg : undefined,
      domainsData: Array.isArray(parsed.domainsData)
        ? (parsed.domainsData as SynthesisOutput["domainsData"])
        : [],
      suggestedActions: Array.isArray(parsed.suggestedActions)
        ? (parsed.suggestedActions as SynthesisOutput["suggestedActions"])
        : [],
    };
  } catch (err) {
    if (err instanceof ServiceUnavailableError) throw err;
    console.error("[aiService] generateSynthesis error:", err);
    // Synthèse de repli si l'IA échoue
    return {
      summary:
        "Merci d'avoir partagé vos réponses. Une synthèse complète sera disponible prochainement. " +
        "N'hésitez pas à consulter les ressources disponibles ou à contacter un professionnel.",
      domainsData: [],
      suggestedActions: [
        { type: "resources", labelFr: "Consulter la bibliothèque de ressources" },
        { type: "professional", labelFr: "Trouver un professionnel à Madagascar" },
      ],
    };
  }
}

export default { generateNextQuestion, chat, generateSynthesis };
