/**
 * Discussion personnalisée avec l'IA (étape 3) — PHASE IA, non livrée.
 *
 * Le contrat d'API est réservé pour que le module puisse se brancher sans
 * refonte du client. Les endpoints répondent explicitement 501 plutôt que de
 * renvoyer une erreur générique : ce n'est pas un bug, c'est un périmètre.
 */

import { Hono } from "hono";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";

export function createChatRoutes(_deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  app.post("/message", (c) => {
    throw ApiError.notImplemented("conversation d'écoute avec l'IA");
  });

  app.get("/:sessionId", (c) => {
    throw ApiError.notImplemented("historique de la conversation avec l'IA");
  });

  return app;
}
