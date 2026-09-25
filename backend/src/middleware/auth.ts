import { Context, Next } from "hono";

/**
 * Middleware d'authentification par session anonyme.
 * Vérifie le JWT dans le header Authorization: Bearer <token>
 * et injecte sessionId dans le contexte Hono.
 */
export async function authMiddleware(c: Context, next: Next) {
  // TODO:
  // 1. Lire le header Authorization
  // 2. Vérifier et décoder le JWT (secret dans process.env.JWT_SECRET)
  // 3. Injecter c.set("sessionId", payload.sessionId)
  // 4. Retourner 401 si token invalide ou absent
  await next();
}

export default authMiddleware;
