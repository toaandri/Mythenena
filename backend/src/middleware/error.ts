import { ZodError } from "zod";
import type { Hono } from "hono";
import type { AppBindings } from "../types/context";
import { isApiError } from "../utils/errors";

/** Réponse d'erreur homogène : `{ error: { code, message, details? } }`. */
export function registerErrorHandlers(app: Hono<AppBindings>): void {
  app.notFound((c) =>
    c.json({ error: { code: "route_not_found", message: "Route inconnue." } }, 404)
  );

  app.onError((error, c) => {
    if (error instanceof ZodError) {
      return c.json(
        {
          error: {
            code: "validation_error",
            message: "Données invalides.",
            details: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          },
        },
        400
      );
    }

    if (isApiError(error)) {
      return c.json(
        {
          error: {
            code: error.code,
            message: error.message,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        },
        error.status
      );
    }

    // 401 émise par hono/jwt (jeton expiré, signature invalide).
    if (error instanceof Error && error.name === "JwtExpired") {
      return c.json(
        {
          error: {
            code: "token_expired",
            message: "Session expirée. Reprends une nouvelle session.",
          },
        },
        401
      );
    }

    console.error("[erreur non gérée]", error);
    return c.json(
      {
        error: {
          code: "internal_error",
          message: "Une erreur interne est survenue. Réessaie dans un instant.",
        },
      },
      500
    );
  });
}
