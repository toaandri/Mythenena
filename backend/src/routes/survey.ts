import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import type { SurveyQuestionRow } from "../db/schema";
import * as surveyService from "../services/surveyService";
import { ApiError } from "../utils/errors";

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

export function createSurveyRoutes(deps: { repos: Repos }): Hono<AppBindings> {
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

  // --- Modules relevant de la phase IA -------------------------------------
  // Conservés pour documenter le contrat d'API, mais inactifs tant que le
  // moteur de questionnaire adaptatif n'est pas livré.

  app.post("/adaptive/next", (c) => {
    throw ApiError.notImplemented("questionnaire adaptatif généré par IA");
  });

  app.post("/adaptive/answer", (c) => {
    throw ApiError.notImplemented("questionnaire adaptatif généré par IA");
  });

  return app;
}
