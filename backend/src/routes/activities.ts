/**
 * Routes du module Activités Interactives.
 *
 * GET  /api/activities                 — Liste les activités disponibles (filtrée par axes)
 * POST /api/activities/recommend       — Recommande une activité selon les 6 axes d'état
 * POST /api/activities/sessions        — Démarre une session d'activité
 * POST /api/activities/sessions/:id/complete — Complète une session
 * POST /api/activities/sessions/:id/abandon  — Abandonne une session
 * GET  /api/activities/sessions/history      — Historique des sessions de l'utilisateur
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import { selectAndGuide, filterActivities, adaptToKolb } from "../services/activityEngine";
import type { StateAxes } from "../services/activityEngine";

const stateAxesSchema = z.object({
  emotionalState: z.enum(["tension", "tristesse", "rumination", "fatigue", "agitation", "colère", "solitude", "autre"]).optional(),
  energyLevel: z.enum(["very_low", "low", "medium", "high"]).optional(),
  availableSeconds: z.number().int().min(30).max(3600).optional(),
  goal: z.enum(["calmer", "comprendre", "agir", "exprimer", "connexion"]).optional(),
  context: z.string().max(100).optional(),
  language: z.enum(["fr", "mg"]).default("fr"),
});

const startSessionBody = stateAxesSchema.extend({
  activitySlug: z.string().min(1),
});

const completeSessionBody = z.object({
  feedback: z.enum(["better", "same", "worse"]).optional(),
  feedbackNote: z.string().max(500).optional(),
});

export function createActivitiesRoutes(deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * GET /api/activities
   * Liste les activités actives, avec filtrage optionnel par axes d'état.
   */
  app.get("/", async (c) => {
    const query = c.req.query();
    const library = await deps.repos.activities.listActive();

    const axes: StateAxes = {};
    if (query.emotionalState) axes.emotionalState = query.emotionalState as StateAxes["emotionalState"];
    if (query.energyLevel) axes.energyLevel = query.energyLevel as StateAxes["energyLevel"];
    if (query.availableSeconds) axes.availableSeconds = parseInt(query.availableSeconds, 10);

    const filtered = Object.keys(axes).length > 0 ? filterActivities(library, axes) : library;

    return c.json({
      activities: filtered.map((a) => ({
        slug: a.slug,
        name: a.name,
        category: a.category,
        durationMinSeconds: a.durationMinSeconds,
        durationMaxSeconds: a.durationMaxSeconds,
        descriptionFr: a.descriptionFr,
        descriptionMg: a.descriptionMg,
        kolbModes: a.kolbModes,
        stateTargets: a.stateTargets,
        energyLevels: a.energyLevels,
      })),
      total: filtered.length,
    });
  });

  /**
   * POST /api/activities/recommend
   * Recommande la meilleure activité selon les 6 axes d'état et le profil Kolb.
   */
  app.post("/recommend", zValidator("json", stateAxesSchema), async (c) => {
    const userId = c.get("sessionId");
    const axes = c.req.valid("json") as StateAxes;

    const [library, learningPrefs] = await Promise.all([
      deps.repos.activities.listActive(),
      deps.repos.profile.getLearningPreferences(userId),
    ]);

    if (!library.length) {
      return c.json({ recommendation: null, message: "Aucune activité disponible." });
    }

    const recommendation = await selectAndGuide(library, axes, learningPrefs);

    if (!recommendation) {
      return c.json({ recommendation: null, message: "Aucune activité compatible trouvée." });
    }

    return c.json({
      recommendation: {
        slug: recommendation.activity.slug,
        name: recommendation.activity.name,
        category: recommendation.activity.category,
        durationMinSeconds: recommendation.activity.durationMinSeconds,
        durationMaxSeconds: recommendation.activity.durationMaxSeconds,
        reason: recommendation.reason,
        guidedInstructions: recommendation.guidedInstructions,
        guidedInstructionsMg: recommendation.guidedInstructionsMg,
      },
    });
  });

  /**
   * POST /api/activities/sessions
   * Démarre une session d'activité pour l'utilisateur.
   */
  app.post("/sessions", zValidator("json", startSessionBody), async (c) => {
    const userId = c.get("sessionId");
    const { activitySlug, ...axes } = c.req.valid("json");

    const activity = await deps.repos.activities.findBySlug(activitySlug);
    if (!activity || !activity.isActive) {
      throw ApiError.notFound("Activité introuvable.");
    }

    const session = await deps.repos.activities.createSession({
      id: newId(),
      userId,
      activitySlug,
      stateAxes: axes as Record<string, unknown>,
    });

    return c.json({ activitySession: session }, 201);
  });

  /**
   * POST /api/activities/sessions/:id/complete
   * Marque une session comme terminée avec feedback optionnel.
   */
  app.post("/sessions/:id/complete", zValidator("json", completeSessionBody), async (c) => {
    const userId = c.get("sessionId");
    const id = c.req.param("id");
    const { feedback, feedbackNote } = c.req.valid("json");

    // Vérifier que la session appartient à l'utilisateur
    const sessions = await deps.repos.activities.listUserSessions(userId, 100);
    const found = sessions.find((s) => s.id === id);
    if (!found) throw ApiError.notFound("Session d'activité introuvable.");
    if (found.userId !== userId) throw ApiError.forbidden("Accès refusé.");

    const updated = await deps.repos.activities.completeSession(id, feedback, feedbackNote);
    return c.json({ activitySession: updated });
  });

  /**
   * POST /api/activities/sessions/:id/abandon
   * Abandonne une session d'activité.
   */
  app.post("/sessions/:id/abandon", async (c) => {
    const userId = c.get("sessionId");
    const id = c.req.param("id");

    const sessions = await deps.repos.activities.listUserSessions(userId, 100);
    const found = sessions.find((s) => s.id === id);
    if (!found) throw ApiError.notFound("Session d'activité introuvable.");

    await deps.repos.activities.abandonSession(id);
    return c.json({ message: "Session abandonnée." });
  });

  /**
   * GET /api/activities/sessions/history
   * Historique des sessions d'activité de l'utilisateur.
   */
  app.get("/sessions/history", async (c) => {
    const userId = c.get("sessionId");
    const limitParam = c.req.query("limit");
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 100) : 20;

    const sessions = await deps.repos.activities.listUserSessions(userId, limit);

    return c.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        activitySlug: s.activitySlug,
        startedAt: s.startedAt.toISOString(),
        completedAt: s.completedAt?.toISOString() ?? null,
        feedback: s.feedback,
        wasAbandoned: s.wasAbandoned,
      })),
    });
  });

  return app;
}
