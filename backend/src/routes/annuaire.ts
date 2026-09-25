import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppConfig } from "../config/config";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { createAuthMiddleware } from "../middleware/auth";
import { paginationQuery, offsetOf, paginate } from "../utils/pagination";
import {
  CONTACT_MESSAGE_MAX_LENGTH,
  matchesDomains,
  requestContact,
  toAssociationDto,
  toProfessionalDto,
} from "../services/annuaireService";
import { ApiError } from "../utils/errors";

const SURVEY_DOMAINS = [
  "mood",
  "sleep",
  "stress",
  "relationships",
  "motivation",
  "anxiety",
  "energy",
  "selfEsteem",
  "isolation",
] as const;

const listQuery = paginationQuery.extend({
  city: z.string().min(1).max(80).optional(),
  language: z.enum(["fr", "mg", "en"]).optional(),
  modality: z.enum(["in-person", "online"]).optional(),
  specialty: z.string().min(1).max(80).optional(),
  acceptsNewPatients: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  /** Les fiches de démonstration sont exclues par défaut. */
  includeFictional: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false"),
});

const associationsQuery = z.object({
  city: z.string().min(1).max(80).optional(),
});

/**
 * Suggestions fondées sur les domaines DÉCLARÉS par l'utilisateur.
 * Correspondance déterministe sur les spécialités annoncées : il ne s'agit
 * en aucun cas d'un diagnostic automatique.
 */
const suggestionsQuery = z.object({
  domains: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter((entry): entry is (typeof SURVEY_DOMAINS)[number] =>
          (SURVEY_DOMAINS as readonly string[]).includes(entry)
        )
    )
    .pipe(z.array(z.enum(SURVEY_DOMAINS)).min(1).max(SURVEY_DOMAINS.length)),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

const contactBody = z.object({
  message: z.string().max(CONTACT_MESSAGE_MAX_LENGTH).optional(),
});

export function createAnnuaireRoutes(deps: { repos: Repos; config: AppConfig }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  // Consulter l'annuaire ne demande aucun compte : chercher de l'aide doit rester
  // possible à tout moment. Seule la prise de contact exige une session, car elle
  // rattache la demande à un pseudonyme.
  const auth = createAuthMiddleware({ repos: deps.repos, secret: deps.config.jwtSecret });

  app.get("/filters", async (c) => {
    return c.json(await deps.repos.annuaire.listFilterValues());
  });

  app.get("/professionals", zValidator("query", listQuery), async (c) => {
    const query = c.req.valid("query");
    const { items, total } = await deps.repos.annuaire.listProfessionals({
      ...(query.city ? { city: query.city } : {}),
      ...(query.language ? { language: query.language } : {}),
      ...(query.modality ? { modality: query.modality } : {}),
      ...(query.specialty ? { specialty: query.specialty } : {}),
      ...(query.acceptsNewPatients !== undefined
        ? { acceptsNewPatients: query.acceptsNewPatients }
        : {}),
      includeFictional: query.includeFictional,
      limit: query.limit,
      offset: offsetOf(query),
    });

    return c.json(
      paginate(
        items.map(toProfessionalDto),
        total,
        query
      )
    );
  });

  app.get("/professionals/:id", async (c) => {
    const row = await deps.repos.annuaire.findProfessional(c.req.param("id"));
    if (!row) {
      throw ApiError.notFound("Fiche introuvable", "professional_not_found");
    }
    return c.json({ professional: toProfessionalDto(row) });
  });

  app.get("/associations", zValidator("query", associationsQuery), async (c) => {
    const { city } = c.req.valid("query");
    const rows = await deps.repos.annuaire.listAssociations(city);
    return c.json({ associations: rows.map(toAssociationDto), total: rows.length });
  });

  app.get("/suggestions", zValidator("query", suggestionsQuery), async (c) => {
    const { domains, limit } = c.req.valid("query");

    // Balayage élargi, puis tri par nombre de domaines couverts.
    const { items } = await deps.repos.annuaire.listProfessionals({
      includeFictional: true,
      limit: 100,
      offset: 0,
    });

    const scored = items
      .filter((row) => matchesDomains(row.specialties, domains))
      .map((row) => ({
        professional: toProfessionalDto(row),
        matchedDomains: domains.filter((domain) => matchesDomains(row.specialties, [domain])),
      }))
      .sort((a, b) => b.matchedDomains.length - a.matchedDomains.length)
      .slice(0, limit);

    return c.json({
      items: scored,
      notice:
        "Suggestions établies à partir des thématiques déclarées et des spécialités annoncées par les professionnels. " +
        "Ce n'est ni un diagnostic, ni une recommandation médicale.",
    });
  });

  app.post("/professionals/:id/contact", auth, zValidator("json", contactBody), async (c) => {
    const body = c.req.valid("json");
    const request = await requestContact(deps.repos, {
      professionalId: c.req.param("id"),
      sessionId: c.get("sessionId"),
      ...(body.message !== undefined ? { message: body.message } : {}),
    });

    return c.json(
      {
        request,
        notice:
          "Ta demande est enregistrée. Aucun élément de tes réponses, de tes messages ou d'une synthèse " +
          "n'est transmis : rien n'est partagé sans ton accord explicite.",
      },
      201
    );
  });

  return app;
}
