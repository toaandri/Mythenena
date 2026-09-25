import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Erreur applicative portant un statut HTTP et un code machine-lisible.
 * Le handler global `onError` la transforme en réponse JSON homogène.
 */
export class ApiError extends Error {
  readonly status: ContentfulStatusCode;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: ContentfulStatusCode, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message = "Requête invalide", details?: unknown) {
    return new ApiError(400, "bad_request", message, details);
  }

  static validation(message = "Données invalides", details?: unknown) {
    return new ApiError(400, "validation_error", message, details);
  }

  static unauthorized(message = "Authentification requise", code = "unauthorized") {
    return new ApiError(401, code, message);
  }

  static forbidden(message = "Accès refusé", code = "forbidden") {
    return new ApiError(403, code, message);
  }

  static notFound(message = "Ressource introuvable", code = "not_found") {
    return new ApiError(404, code, message);
  }

  static conflict(message = "Conflit d'état", code = "conflict") {
    return new ApiError(409, code, message);
  }

  /**
   * Fonctionnalité relevant de la phase IA : le module est volontairement
   * absent du backend classique, l'endpoint répond explicitement plutôt que
   * de renvoyer une erreur générique.
   */
  static notImplemented(feature: string) {
    return new ApiError(
      501,
      "not_implemented",
      `La fonctionnalité « ${feature} » n'est pas encore disponible : elle dépend du module IA, traité séparément.`,
      { feature, requiresAi: true }
    );
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
