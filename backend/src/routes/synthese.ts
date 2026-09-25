/**
 * Synthèse pédagogique et orientation (étape 5).
 *
 * Génère une synthèse exploratoire à partir des réponses au questionnaire.
 * AUCUN diagnostic, AUCUN score clinique, AUCUNE probabilité de maladie.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import * as aiService from "../services/aiService";
import { getDb } from "../db";
import { syntheses, synthesisCorrections } from "../db/schema";

const generateBody = z.object({
  language: z.enum(["fr", "mg"]).default("fr"),
});

const correctBody = z.object({
  domainId: z.string().min(1).max(64),
  userNote: z.string().min(1).max(2000),
});

export function createSyntheseRoutes(deps: { repos: Repos; config?: { geminiApiKey?: string } }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * POST /api/synthese/generate
   * Génère une synthèse à partir des réponses de la session.
   */
  app.post("/generate", zValidator("json", generateBody), async (c) => {
    if (!deps.config?.geminiApiKey) {
      throw new ApiError(503, "service_unavailable", "GEMINI_API_KEY non configurée — le module IA est indisponible.");
    }
    const sessionId = c.get("sessionId");
    const { language } = c.req.valid("json");
    const db = getDb();

    // Récupérer toutes les réponses de la session (mini + adaptative)
    const answers = await deps.repos.surveys.listAnswers(sessionId);
    if (answers.length === 0) {
      throw ApiError.badRequest(
        "Aucune réponse disponible pour générer une synthèse. Réponds d'abord au questionnaire.",
        { code: "no_answers" }
      );
    }

    let output: aiService.SynthesisOutput;
    try {
      output = await aiService.generateSynthesis(answers, language);
    } catch (err) {
      if (err instanceof aiService.ServiceUnavailableError) {
        throw new ApiError(503, "service_unavailable", err.message);
      }
      throw err;
    }

    // Persister la synthèse
    const synthesisId = newId();
    await db.insert(syntheses).values({
      id: synthesisId,
      sessionId,
      summary: output.summary,
      summaryMg: output.summaryMg ?? null,
      domainsData: output.domainsData,
      suggestedActions: output.suggestedActions,
      generatedAt: new Date(),
    });

    return c.json(
      {
        id: synthesisId,
        sessionId,
        summary: output.summary,
        summaryMg: output.summaryMg,
        domainsData: output.domainsData,
        suggestedActions: output.suggestedActions,
        isExploratory: true,
        generatedAt: new Date().toISOString(),
      },
      201
    );
  });

  /**
   * GET /api/synthese/:sessionId
   * Retourne la dernière synthèse d'une session.
   */
  app.get("/:sessionId", async (c) => {
    const sessionId = c.get("sessionId");
    const paramSessionId = c.req.param("sessionId");

    if (sessionId !== paramSessionId) {
      throw ApiError.forbidden("Accès refusé à cette synthèse.");
    }

    const db = getDb();
    const [latest] = await db
      .select()
      .from(syntheses)
      .where(eq(syntheses.sessionId, sessionId))
      .orderBy(desc(syntheses.generatedAt))
      .limit(1);

    if (!latest) {
      throw ApiError.notFound(
        "Aucune synthèse disponible. Lance d'abord POST /api/synthese/generate.",
        "synthesis_not_found"
      );
    }

    return c.json({
      id: latest.id,
      sessionId: latest.sessionId,
      summary: latest.summary,
      summaryMg: latest.summaryMg,
      domainsData: latest.domainsData,
      suggestedActions: latest.suggestedActions,
      isExploratory: true,
      generatedAt: latest.generatedAt.toISOString(),
    });
  });

  /**
   * POST /api/synthese/:sessionId/correct
   * Persiste une correction utilisateur sur un domaine de la synthèse.
   */
  app.post("/:sessionId/correct", zValidator("json", correctBody), async (c) => {
    const sessionId = c.get("sessionId");
    const paramSessionId = c.req.param("sessionId");

    if (sessionId !== paramSessionId) {
      throw ApiError.forbidden("Accès refusé.");
    }

    const { domainId, userNote } = c.req.valid("json");
    const db = getDb();

    const correctionId = newId();
    await db.insert(synthesisCorrections).values({
      id: correctionId,
      sessionId,
      domainId,
      userNote,
      correctedAt: new Date(),
    });

    return c.json({ id: correctionId, domainId, userNote }, 201);
  });

  return app;
}
