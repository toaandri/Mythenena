/**
 * Jetons de session : JWT signé (HS256) via hono/jwt.
 *
 * La session est ANONYME — le jeton ne contient qu'un identifiant technique
 * opaque (`sub`). Aucune donnée de santé, aucun pseudonyme n'y figure.
 */

import { sign, verify } from "hono/jwt";
import type { AppConfig } from "../config/config";
import { ApiError } from "../utils/errors";

export const TOKEN_VERSION = 1;

export type TokenKind = "session" | "moderator";

export interface TokenPayload {
  /** sessionId pour un jeton de session, "moderator" pour un jeton de modération. */
  sub: string;
  typ: TokenKind;
  v: number;
  [claim: string]: unknown;
}

export async function signSessionToken(
  sessionId: string,
  config: Pick<AppConfig, "jwtSecret" | "jwtTtlSeconds">
): Promise<string> {
  const payload: TokenPayload = { sub: sessionId, typ: "session", v: TOKEN_VERSION };
  return sign(payload, config.jwtSecret, "HS256");
}

export async function signModeratorToken(config: Pick<AppConfig, "jwtSecret" | "jwtTtlSeconds">): Promise<string> {
  const payload: TokenPayload = { sub: "moderator", typ: "moderator", v: TOKEN_VERSION };
  return sign(payload, config.jwtSecret, "HS256");
}

/** Extrait le jeton d'un header `Authorization: Bearer <token>`. */
export function extractBearerToken(header: string | undefined | null): string | null {
  if (!header) return null;
  const [scheme, value] = header.split(" ");
  if (!value || scheme?.toLowerCase() !== "bearer") return null;
  const token = value.trim();
  return token.length > 0 ? token : null;
}

/** Vérifie la signature et la version du jeton. Lève une ApiError 401 en cas d'échec. */
export async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  let payload: unknown;
  try {
    payload = await verify(token, secret, "HS256");
  } catch {
    throw ApiError.unauthorized("Jeton de session invalide ou expiré", "invalid_token");
  }

  if (typeof payload !== "object" || payload === null) {
    throw ApiError.unauthorized("Jeton de session invalide", "invalid_token");
  }

  const candidate = payload as Partial<TokenPayload>;
  if (candidate.v !== TOKEN_VERSION) {
    throw ApiError.unauthorized("Version de jeton non prise en charge", "token_version_mismatch");
  }
  if (candidate.typ !== "session" && candidate.typ !== "moderator") {
    throw ApiError.unauthorized("Type de jeton inconnu", "invalid_token");
  }
  if (typeof candidate.sub !== "string" || candidate.sub.length === 0) {
    throw ApiError.unauthorized("Jeton de session incomplet", "invalid_token");
  }

  return candidate as TokenPayload;
}
