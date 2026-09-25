import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { paginationQuery, offsetOf, paginate } from "../utils/pagination";
import { getEmergencyResources, toResourceDto, toResourceSummaryDto } from "../services/resourceService";
import { RESOURCE_TYPES } from "../types/resource";
import { ApiError } from "../utils/errors";

const listQuery = paginationQuery.extend({
  type: z.enum(RESOURCE_TYPES).optional(),
  tag: z.string().min(1).max(40).optional(),
  q: z.string().min(1).max(120).optional(),
  /** Contenus consultables sans connexion internet stable. */
  offlineOnly: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false"),
});

export function createResourceRoutes(deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * Ressources d'urgence — disponibles même lorsque le reste de l'application
   * nécessite une connexion. Ces coordonnées proviennent des constantes
   * partagées et doivent être vérifiées avant mise en production.
   */
  app.get("/urgence", (c) => c.json(getEmergencyResources()));

  app.get("/tags", async (c) => c.json({ tags: await deps.repos.resources.listTags() }));

  app.get("/offline", async (c) => {
    const items = await deps.repos.resources.listOffline();
    return c.json({
      items: items.map(toResourceSummaryDto),
      notice:
        "Ces contenus sont conservés sur l'appareil. Les fonctions qui nécessitent l'IA ne sont pas " +
        "disponibles hors connexion et ne sont pas simulées.",
    });
  });

  app.get("/", zValidator("query", listQuery), async (c) => {
    const query = c.req.valid("query");
    const { items, total } = await deps.repos.resources.list({
      ...(query.type ? { type: query.type } : {}),
      ...(query.tag ? { tag: query.tag } : {}),
      ...(query.q ? { query: query.q } : {}),
      offlineOnly: query.offlineOnly,
      limit: query.limit,
      offset: offsetOf(query),
    });
    return c.json(paginate(items.map(toResourceSummaryDto), total, query));
  });

  app.get("/:slug", async (c) => {
    const row = await deps.repos.resources.findBySlug(c.req.param("slug"));
    if (!row) {
      throw ApiError.notFound("Ressource introuvable", "resource_not_found");
    }
    return c.json({ resource: toResourceDto(row) });
  });

  return app;
}
