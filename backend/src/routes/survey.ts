import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import type { SurveyQuestionRow } from "../db/schema";
import * as surveyService from "../services/surveyService";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import * as aiService from "../services/aiService";

const answerBody = z.object({
  questionId: z.string().min(1).max(64),
  /** null ou absent = question passée, si `skipped` est vrai. */
  choiceIds: z.array(z.string().min(1).max(64)).max(20).nullish(),
  textAnswer: z.string().max(surveyService.MAX_TEXT_ANSWER_LENGTH).nullish(),
  /** Le bouton « Passer » : une information inconnue, jamais un symptôme. */
  skipped: z.boolean().default(false),
});

const batchBody = z.object({
  answers: z.array(answerBody).min(1).max(10),
});

export function createSurveyRoutes(deps: { repos: Repos; config?: { geminiApiKey?: string } }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  // L'authentification est appliquée par le routeur parent (cf. app.ts).

  app.get("/mini", async (c) => {
    const sessionId = c.get("sessionId");
    const view = await surveyService.getMiniSurvey(deps.repos, sessionId);
    return c.json(view);
  });

  app.get("/mini/progress", async (c) => {
    const sessionId = c.get("sessionId");
    return c.json(await surveyService.getMiniProgress(deps.repos, sessionId));
  });

  app.post("/mini/answer", zValidator("json", answerBody), async (c) => {
    const sessionId = c.get("sessionId");
    const body = c.req.valid("json");

    const question = await deps.repos.surveys.findQuestion(
      surveyService.MINI_SURVEY_TYPE,
      body.questionId
    );
    if (!question) {
      throw ApiError.notFound("Question introuvable", "question_not_found");
    }

    const answer = await surveyService.saveAnswer(deps.repos, sessionId, question, {
      questionId: body.questionId,
      skipped: body.skipped,
      ...(body.choiceIds !== undefined ? { choiceIds: body.choiceIds } : {}),
      ...(body.textAnswer !== undefined ? { textAnswer: body.textAnswer } : {}),
    });

    return c.json(
      {
        answer: surveyService.toAnswerDto(answer),
        progress: await surveyService.getMiniProgress(deps.repos, sessionId),
      },
      201
    );
  });

  app.post("/mini/answers", zValidator("json", batchBody), async (c) => {
    const sessionId = c.get("sessionId");
    const { answers } = c.req.valid("json");

    // Toutes les questions sont résolues AVANT toute écriture : un lot invalide
    // ne doit jamais laisser une réponse à moitié enregistrée.
    const questions = [];
    for (const input of answers) {
      const question = await deps.repos.surveys.findQuestion(
        surveyService.MINI_SURVEY_TYPE,
        input.questionId
      );
      if (!question) {
        throw ApiError.notFound(`Question introuvable : ${input.questionId}`, "question_not_found");
      }
      questions.push(question);
    }

    const saved = [];
    for (const [index, input] of answers.entries()) {
      saved.push(
        await surveyService.saveAnswer(deps.repos, sessionId, questions[index] as SurveyQuestionRow, {
          questionId: input.questionId,
          skipped: input.skipped,
          ...(input.choiceIds !== undefined ? { choiceIds: input.choiceIds } : {}),
          ...(input.textAnswer !== undefined ? { textAnswer: input.textAnswer } : {}),
        })
      );
    }

    return c.json(
      {
        answers: saved.map(surveyService.toAnswerDto),
        progress: await surveyService.getMiniProgress(deps.repos, sessionId),
      },
      201
    );
  });

  // --- Questionnaire adaptatif (étape 2) — alimenté par Gemini -------------

  app.post("/adaptive/next", async (c) => {
    if (!deps.config?.geminiApiKey) {
      throw new ApiError(503, "service_unavailable", "GEMINI_API_KEY non configurée — le module IA est indisponible.");
    }
    const sessionId = c.get("sessionId");

    // Récupérer l'historique adaptatif de la session
    const history = await deps.repos.surveys.listAnswers(sessionId, "adaptive");

    let question: aiService.AdaptiveQuestion | null;
    try {
      // Lire la langue depuis les préférences de session
      const session = await deps.repos.sessions.findById(sessionId);
      const language = (session?.language as "fr" | "mg") ?? "fr";
      question = await aiService.generateNextQuestion(history, language);
    } catch (err) {
      if (err instanceof aiService.ServiceUnavailableError) {
        throw new ApiError(503, "service_unavailable", err.message);
      }
      throw err;
    }

    if (!question) {
      return c.json({ done: true, question: null });
    }

    // Construire une question IA avec le format attendu par le client
    const questionId = `adaptive-${newId()}`;
    return c.json({
      done: false,
      question: {
        id: questionId,
        domain: question.domain,
        reason: question.reason,
        text: question.question,
        choices: question.choices.map((label, i) => ({
          id: `${questionId}-c${i}`,
          label,
        })),
        type: "single",
        allowSkip: true,
        surveyType: "adaptive",
      },
    });
  });

  app.post(
    "/adaptive/answer",
    zValidator("json", answerBody),
    async (c) => {
      const sessionId = c.get("sessionId");
      const body = c.req.valid("json");

      // Pour les questions adaptatives, on persiste directement sans validation
      // stricte des choiceIds (les choix sont générés dynamiquement par l'IA)
      await deps.repos.surveys.upsertAnswer({
        id: newId(),
        sessionId,
        surveyType: "adaptive",
        questionId: body.questionId,
        questionText: body.questionId, // on n'a que l'id ici, le texte est dans le client
        choicesSnapshot: body.choiceIds ?? [],
        choiceIds: body.skipped ? null : (body.choiceIds ?? null),
        textAnswer: body.textAnswer ?? null,
        skipped: body.skipped,
        domain: "unknown", // le domaine sera enrichi via l'historique Gemini
        answeredAt: new Date(),
      });

      return c.json({ saved: true }, 201);
    }
  );

  return app;
}
