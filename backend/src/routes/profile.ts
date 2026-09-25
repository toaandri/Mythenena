/**
 * Routes du module Profil évolutif.
 *
 * GET /api/profile              — Profil complet reconstruit (aggrégation des deltas)
 * GET /api/profile/hypotheses   — Liste des hypothèses avec statut
 * GET /api/profile/values       — Carte des valeurs
 * GET /api/profile/patterns     — Schémas comportementaux
 * PATCH /api/profile/hypotheses/:id — Corriger une hypothèse
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";

const hypothesisPatch = z.object({
  status: z.enum(["exploring", "plausible", "confirmed", "corrected", "rejected"]).optional(),
  userCorrection: z.string().max(1000).optional(),
});

export function createProfileRoutes(deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * GET /api/profile
   * Retourne le profil complet de l'utilisateur (aggrégation de tous les deltas + données structurées).
   */
  app.get("/", async (c) => {
    const userId = c.get("sessionId");

    const [
      lifeEvents,
      identityDomains,
      values,
      patterns,
      hypotheses,
      contradictions,
      learningPrefs,
      deltas,
    ] = await Promise.all([
      deps.repos.profile.listLifeEvents(userId),
      deps.repos.profile.listIdentityDomains(userId),
      deps.repos.profile.listValues(userId),
      deps.repos.profile.listBehaviorPatterns(userId),
      deps.repos.profile.listHypotheses(userId),
      deps.repos.profile.listContradictions(userId),
      deps.repos.profile.getLearningPreferences(userId),
      deps.repos.interview.listProfileDeltas(userId),
    ]);

    return c.json({
      userId,
      lifeEvents: lifeEvents.map((e) => ({
        id: e.id,
        period: e.period,
        event: e.event,
        emotion: e.emotion,
        meaningGiven: e.meaningGiven,
      })),
      identityDomains: identityDomains.map((d) => ({
        domain: d.domain,
        content: d.content,
        confidence: d.confidence,
      })),
      values: values.map((v) => ({
        valueName: v.valueName,
        claimedImportance: v.claimedImportance,
        confidence: v.confidence,
      })),
      behaviorPatterns: patterns.map((p) => ({
        id: p.id,
        trigger: p.trigger,
        emotion: p.emotion,
        action: p.action,
        confidence: p.confidence,
      })),
      hypotheses: hypotheses.map((h) => ({
        id: h.id,
        text: h.text,
        confidence: h.confidence,
        status: h.status,
        userCorrection: h.userCorrection,
      })),
      contradictions: contradictions.map((c2) => ({
        id: c2.id,
        statementA: c2.statementA,
        statementB: c2.statementB,
        status: c2.status,
      })),
      learningStyle: learningPrefs
        ? {
            actionScore: learningPrefs.actionScore,
            observationScore: learningPrefs.observationScore,
            conceptualizationScore: learningPrefs.conceptualizationScore,
            applicationScore: learningPrefs.applicationScore,
          }
        : null,
      deltaCount: deltas.length,
      /** Indique que ce profil est exploratoire et non clinique */
      disclaimer: "Ce profil est exploratoire et pédagogique. Il ne constitue pas un diagnostic médical ou psychologique.",
    });
  });

  /**
   * GET /api/profile/hypotheses
   */
  app.get("/hypotheses", async (c) => {
    const userId = c.get("sessionId");
    const hypotheses = await deps.repos.profile.listHypotheses(userId);
    return c.json({ hypotheses });
  });

  /**
   * PATCH /api/profile/hypotheses/:id
   * Permet à l'utilisateur de corriger ou confirmer une hypothèse.
   */
  app.patch("/hypotheses/:id", zValidator("json", hypothesisPatch), async (c) => {
    const userId = c.get("sessionId");
    const id = c.req.param("id");
    const patch = c.req.valid("json");

    // Vérifier que l'hypothèse appartient à cet utilisateur
    const hypotheses = await deps.repos.profile.listHypotheses(userId);
    const found = hypotheses.find((h) => h.id === id);
    if (!found) throw ApiError.notFound("Hypothèse introuvable.");

    const updated = await deps.repos.profile.updateHypothesis(id, patch);
    return c.json({ hypothesis: updated });
  });

  /**
   * GET /api/profile/values
   */
  app.get("/values", async (c) => {
    const userId = c.get("sessionId");
    const values = await deps.repos.profile.listValues(userId);
    return c.json({ values });
  });

  /**
   * GET /api/profile/patterns
   */
  app.get("/patterns", async (c) => {
    const userId = c.get("sessionId");
    const patterns = await deps.repos.profile.listBehaviorPatterns(userId);
    return c.json({ patterns });
  });

  return app;
}
