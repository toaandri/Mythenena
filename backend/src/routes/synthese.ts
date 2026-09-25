/**
 * Synthèse pédagogique et orientation (étape 5) — PHASE IA, non livrée.
 *
 * La table `syntheses` et la structure de stockage existent déjà ; seule la
 * génération par IA manque. Aucun score, aucune probabilité de maladie et aucun
 * classement de pathologies ne doivent être produits par ce module.
 */

import { Hono } from "hono";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";

export function createSyntheseRoutes(_deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  app.post("/generate", (c) => {
    throw ApiError.notImplemented("synthèse générée par IA");
  });

  app.get("/:sessionId", (c) => {
    throw ApiError.notImplemented("synthèse générée par IA");
  });

  app.post("/:sessionId/correct", (c) => {
    throw ApiError.notImplemented("synthèse générée par IA");
  });

  return app;
}
