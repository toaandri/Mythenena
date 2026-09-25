/**
 * Discussion personnalisée avec l'IA (étape 3).
 *
 * Chaque message passe par safetyService avant d'être envoyé à Gemini.
 * En cas d'alerte critique, le parcours ordinaire est interrompu et les
 * ressources d'urgence sont retournées.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import * as aiService from "../services/aiService";
import * as safetyService from "../services/safetyService";
import { getDb } from "../db";
import { chatMessages } from "../db/schema";
import type { ChatMessageInput } from "../services/aiService";

const messageBody = z.object({
  message: z.string().min(1).max(4000),
  language: z.enum(["fr", "mg"]).default("fr"),
});

export function createChatRoutes(_deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * POST /api/chat/message
   * Envoie un message, obtient une réponse IA, persiste les deux.
   */
  app.post("/message", zValidator("json", messageBody), async (c) => {
    // Vérifier la clé Gemini en premier — avant tout appel DB
    if (!process.env.GEMINI_API_KEY) {
      throw new ApiError(503, "service_unavailable", "GEMINI_API_KEY non configurée — le module IA est indisponible.");
    }

    const sessionId = c.get("sessionId");
    const { message, language } = c.req.valid("json");
    const db = getDb();

    // 1. Vérification de sécurité sur le message entrant
    const safetyCheck = await safetyService.checkText(message, language);
    if (safetyCheck.level === "critical") {
      return c.json(
        {
          safetyAlert: safetyCheck.alert,
          message: null,
        },
        200
      );
    }

    // 2. Récupérer l'historique de la conversation
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));

    const historyInput: ChatMessageInput[] = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // 3. Récupérer le contexte du sondage pour enrichir le prompt
    const surveyAnswers = await _deps.repos.surveys.listAnswers(sessionId);
    const surveyContext =
      surveyAnswers.length > 0
        ? surveyAnswers
            .filter((a) => !a.skipped)
            .map((a) => `${a.domain}: ${JSON.stringify(a.choiceIds ?? a.textAnswer ?? "passé")}`)
            .join(", ")
        : undefined;

    // 4. Appel Gemini
    let aiResponse: string;
    try {
      aiResponse = await aiService.chat(historyInput, message, language, surveyContext);
    } catch (err) {
      if (err instanceof aiService.ServiceUnavailableError) {
        throw new ApiError(503, "service_unavailable", err.message);
      }
      throw err;
    }

    // 5. Vérification de sécurité sur la réponse générée
    const responseSafetyCheck = await safetyService.checkText(aiResponse, language);

    // 6. Persister message utilisateur + réponse IA
    const userMsgId = newId();
    const aiMsgId = newId();
    const now = new Date();

    await db.insert(chatMessages).values([
      {
        id: userMsgId,
        sessionId,
        role: "user",
        content: message,
        flagged: safetyCheck.level !== "ok",
        createdAt: now,
      },
      {
        id: aiMsgId,
        sessionId,
        role: "assistant",
        content: aiResponse,
        flagged: responseSafetyCheck.level !== "ok",
        createdAt: new Date(now.getTime() + 1),
      },
    ]);

    return c.json({
      message: {
        id: aiMsgId,
        role: "assistant",
        content: aiResponse,
        timestamp: new Date(now.getTime() + 1).toISOString(),
        flagged: responseSafetyCheck.level !== "ok",
      },
      safetyAlert: safetyCheck.alert ?? responseSafetyCheck.alert ?? undefined,
    });
  });

  /**
   * GET /api/chat/:sessionId
   * Retourne l'historique des messages d'une session.
   */
  app.get("/:sessionId", async (c) => {
    const sessionId = c.get("sessionId");
    const paramSessionId = c.req.param("sessionId");

    // Un utilisateur ne peut accéder qu'à sa propre conversation
    if (sessionId !== paramSessionId) {
      throw ApiError.forbidden("Accès refusé à cette conversation.");
    }

    const db = getDb();
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));

    return c.json({
      sessionId,
      messages: history.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
        flagged: m.flagged,
      })),
    });
  });

  return app;
}
