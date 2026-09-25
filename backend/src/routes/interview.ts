/**
 * Routes du module Entretien Analytique.
 *
 * POST /api/interview/start        — Démarrer une nouvelle session d'entretien
 * GET  /api/interview/:id          — Récupérer une session et ses tours
 * POST /api/interview/:id/respond  — Envoyer un message (streaming SSE)
 * POST /api/interview/:id/complete — Clôturer une session
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import { streamInterviewResponse } from "../services/interviewEngine";

const startBody = z.object({
  objective: z.string().min(1).max(500),
});

const respondBody = z.object({
  message: z.string().min(1).max(4000),
  language: z.enum(["fr", "mg"]).default("fr"),
});

export function createInterviewRoutes(deps: { repos: Repos; config?: { geminiApiKey?: string } }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * POST /api/interview/start
   * Crée une nouvelle session d'entretien analytique pour la session courante.
   */
  app.post("/start", zValidator("json", startBody), async (c) => {
    const userId = c.get("sessionId");
    const { objective } = c.req.valid("json");

    // Vérifier si une session active existe déjà
    const existing = await deps.repos.interview.findActiveSessionByUser(userId);
    if (existing) {
      return c.json({
        interviewSession: existing,
        resumed: true,
        message: "Session d'entretien active récupérée.",
      });
    }

    const session = await deps.repos.interview.createSession({
      id: newId(),
      userId,
      objective,
    });

    return c.json({ interviewSession: session, resumed: false }, 201);
  });

  /**
   * GET /api/interview/:id
   * Récupère une session d'entretien avec ses tours de parole.
   */
  app.get("/:id", async (c) => {
    const userId = c.get("sessionId");
    const id = c.req.param("id");

    const session = await deps.repos.interview.findSessionById(id);
    if (!session) throw ApiError.notFound("Session d'entretien introuvable.");
    if (session.userId !== userId) throw ApiError.forbidden("Accès refusé.");

    const turns = await deps.repos.interview.listTurns(id);

    return c.json({
      interviewSession: session,
      turns: turns.map((t) => ({
        id: t.id,
        role: t.role,
        content: t.content,
        methodUsed: t.methodUsed,
        timestamp: t.createdAt.toISOString(),
      })),
    });
  });

  /**
   * POST /api/interview/:id/respond
   * Envoie un message utilisateur et stream la réponse IA via SSE.
   *
   * Le client doit écouter les événements SSE :
   *   data: {"type":"token","text":"..."}
   *   data: {"type":"safety_alert","alert":{...}}
   *   data: [DONE]
   */
  app.post("/:id/respond", zValidator("json", respondBody), async (c) => {
    const userId = c.get("sessionId");
    const id = c.req.param("id");
    const { message, language } = c.req.valid("json");

    if (!deps.config?.geminiApiKey) {
      throw new ApiError(503, "service_unavailable", "GEMINI_API_KEY non configurée.");
    }

    const session = await deps.repos.interview.findSessionById(id);
    if (!session) throw ApiError.notFound("Session d'entretien introuvable.");
    if (session.userId !== userId) throw ApiError.forbidden("Accès refusé.");
    if (session.status !== "active") {
      throw new ApiError(400, "session_closed", "Cette session d'entretien est terminée.");
    }

    // Streaming SSE
    return new Response(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          try {
            const gen = streamInterviewResponse(
              session,
              message,
              language,
              deps.repos.interview,
              deps.repos.profile
            );
            for await (const chunk of gen) {
              controller.enqueue(encoder.encode(chunk));
            }
          } catch (err) {
            const errorMsg = `data: ${JSON.stringify({ type: "error", message: "Erreur interne" })}\n\n`;
            controller.enqueue(encoder.encode(errorMsg));
          } finally {
            controller.close();
          }
        },
      }),
      {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Accel-Buffering": "no",
        },
      }
    );
  });

  /**
   * POST /api/interview/:id/complete
   * Clôture une session d'entretien.
   */
  app.post("/:id/complete", async (c) => {
    const userId = c.get("sessionId");
    const id = c.req.param("id");

    const session = await deps.repos.interview.findSessionById(id);
    if (!session) throw ApiError.notFound("Session d'entretien introuvable.");
    if (session.userId !== userId) throw ApiError.forbidden("Accès refusé.");

    const updated = await deps.repos.interview.updateSession(id, { status: "completed" });
    return c.json({ interviewSession: updated, message: "Session d'entretien clôturée." });
  });

  return app;
}
