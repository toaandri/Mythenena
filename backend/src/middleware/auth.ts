/**
 * Middlewares d'accès.
 *
 * La plateforme ne demande JAMAIS d'identité réelle : l'authentification consiste
 * uniquement à prouver qu'on détient le jeton d'une session anonyme. Les
 * modérateurs du forum sont les seuls comptes explicitement identifiés, via un
 * jeton statique administration.
 */

import { timingSafeEqual } from "node:crypto";
import type { Context, MiddlewareHandler, Next } from "hono";
import type { AppConfig } from "../config/config";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { extractBearerToken, verifyToken } from "../services/authService";
import { ApiError } from "../utils/errors";

function safeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Exige un jeton de session anonyme valide et charge la session en base. */
export function createAuthMiddleware(deps: {
  repos: Repos;
  secret: string;
}): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    const token = extractBearerToken(c.req.header("Authorization"));
    if (!token) {
      throw ApiError.unauthorized("Session requise. Démarre une session pour continuer.", "missing_token");
    }

    const payload = await verifyToken(token, deps.secret);
    if (payload.typ !== "session") {
      throw ApiError.unauthorized("Jeton de session attendu.", "wrong_token_type");
    }

    const session = await deps.repos.sessions.findById(payload.sub);
    if (!session) {
      // La session a été supprimée : le jeton devient inutilisable.
      throw ApiError.unauthorized("Session introuvable ou supprimée.", "session_not_found");
    }

    c.set("sessionId", session.id);
    c.set("session", session);
    await next();
  };
}

/**
 * Authentification optionnelle pour les lectures publiques : permet d'afficher
 * l'état « est-ce ma publication » sans bloquer les visiteurs non connectés.
 */
export function createOptionalAuthMiddleware(deps: {
  repos: Repos;
  secret: string;
}): MiddlewareHandler<AppBindings> {
  return async (c, next) => {
    const token = extractBearerToken(c.req.header("Authorization"));
    if (!token) return next();

    try {
      const payload = await verifyToken(token, deps.secret);
      if (payload.typ !== "session") return next();
      const session = await deps.repos.sessions.findById(payload.sub);
      if (!session) return next();
      c.set("sessionId", session.id);
      c.set("session", session);
    } catch {
      // Un jeton invalide n'empêche pas la lecture publique.
    }

    await next();
  };
}

/** Exige un jeton de modération. Réservé à la file de traitement des signalements. */
export function createModeratorMiddleware(config: AppConfig): MiddlewareHandler {
  return async (c: Context, next: Next) => {
    const token = extractBearerToken(c.req.header("Authorization"));
    if (!token) {
      throw ApiError.unauthorized("Authentification de modérateur requise.", "missing_token");
    }

    const payload = await verifyToken(token, config.jwtSecret);
    if (payload.typ !== "moderator") {
      throw ApiError.forbidden("Accès réservé aux modérateurs.", "not_a_moderator");
    }

    await next();
  };
}

/** Vérifie un jeton d'administration statique, en comparaison à temps constant. */
export function isValidModeratorToken(config: AppConfig, candidate: string): boolean {
  return config.moderatorTokens.some((token) => safeEquals(token, candidate));
}
