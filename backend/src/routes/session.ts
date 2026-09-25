import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppConfig } from "../config/config";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { DISCLAIMER_FR, type SessionDto } from "../types/api";
import { createAuthMiddleware } from "../middleware/auth";
import { signSessionToken } from "../services/authService";
import * as sessionService from "../services/sessionService";
import { postHasReplies, deletePost } from "../services/forumService";
import type { SessionPatch } from "../repositories/session.repo";

const languageSchema = z.enum(["fr", "mg"]);

const startBody = z.object({
  language: languageSchema.default("fr"),
  /** Par défaut l'historique n'est PAS conservé : le choix revient à la personne. */
  retainHistory: z.boolean().default(false),
  /** Pseudonyme choisi par l'utilisateur ; sinon généré par le serveur. */
  pseudonym: z.string().min(3).max(32).optional(),
});

const preferencesBody = z.object({
  language: languageSchema.optional(),
  retainHistory: z.boolean().optional(),
  pseudonym: z.string().min(3).max(32).optional(),
});

const clearHistoryBody = z.object({
  /** "all" = questionnaires + conversation. Les publications du forum ne sont jamais touchées ici. */
  scope: z.enum(["all", "surveys", "chat"]).default("all"),
});

const deleteSessionBody = z.object({
  /**
   * Par défaut les publications du forum sont CONSERVÉES : elles font partie
   * d'une conversation partagée avec d'autres membres.
   */
  deleteForumPosts: z.boolean().default(false),
});

/** Pagination de l'inventaire des publications d'un membre, bornée. */
const MAX_OWN_POSTS_ON_DELETION = 200;

function toSessionDto(row: {
  id: string;
  pseudonym: string;
  pseudonymSource: string;
  avatarSeed: string;
  language: string;
  retainHistory: boolean;
  createdAt: Date;
}): SessionDto {
  return {
    id: row.id,
    pseudonym: row.pseudonym,
    pseudonymSource: row.pseudonymSource as SessionDto["pseudonymSource"],
    avatarSeed: row.avatarSeed,
    language: row.language as SessionDto["language"],
    retainHistory: row.retainHistory,
    createdAt: row.createdAt.toISOString(),
  };
}

export function createSessionRoutes(deps: { repos: Repos; config: AppConfig }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  const auth = createAuthMiddleware({ repos: deps.repos, secret: deps.config.jwtSecret });

  app.post("/start", zValidator("json", startBody), async (c) => {
    const body = c.req.valid("json");
    const session = await sessionService.createSession(deps.repos, {
      language: body.language,
      retainHistory: body.retainHistory,
      ...(body.pseudonym ? { pseudonym: body.pseudonym } : {}),
    });
    const token = await signSessionToken(session.id, deps.config);
    await deps.repos.sessions.touch(session.id);

    return c.json({ token, session: toSessionDto(session), disclaimer: DISCLAIMER_FR }, 201);
  });

  app.get("/me", auth, async (c) => {
    const session = c.get("session");
    await deps.repos.sessions.touch(session.id);
    return c.json({ session: toSessionDto(session) });
  });

  app.patch("/preferences", auth, zValidator("json", preferencesBody), async (c) => {
    const body = c.req.valid("json");
    const sessionId = c.get("sessionId");

    if (body.pseudonym !== undefined) {
      await sessionService.updatePseudonym(deps.repos, sessionId, body.pseudonym);
    }

    const patch: SessionPatch = {
      ...(body.language !== undefined ? { language: body.language } : {}),
      ...(body.retainHistory !== undefined ? { retainHistory: body.retainHistory } : {}),
      ...(body.pseudonym !== undefined ? { pseudonym: normalize(body.pseudonym), pseudonymSource: "custom" } : {}),
    };

    const updated = Object.keys(patch).length > 0
      ? ((await deps.repos.sessions.update(sessionId, patch)) ?? (await sessionService.findOrThrow(deps.repos, sessionId)))
      : c.get("session");

    return c.json({ session: toSessionDto(updated) });
  });

  app.delete("/history", auth, zValidator("json", clearHistoryBody), async (c) => {
    const { scope } = c.req.valid("json");
    const sessionId = c.get("sessionId");
    await sessionService.findOrThrow(deps.repos, sessionId);

    const counts = await sessionService.clearPrivateHistory(deps.repos, sessionId, scope);

    return c.json({
      scope,
      deleted: counts,
      message:
        "Les réponses enregistrées pour cette session ont été supprimées. " +
        "Les questions passées restent des informations inconnues : elles n'ont jamais été interprétées.",
    });
  });

  app.delete("/", auth, zValidator("json", deleteSessionBody), async (c) => {
    const { deleteForumPosts } = c.req.valid("json");
    const sessionId = c.get("sessionId");
    await sessionService.findOrThrow(deps.repos, sessionId);

    const counts = await sessionService.clearPrivateHistory(deps.repos, sessionId, "all");
    let forumPosts = 0;
    let forumPostsSkipped = 0;

    if (deleteForumPosts) {
      const posts = await deps.repos.forum.listPostsByAuthor(
        sessionId,
        MAX_OWN_POSTS_ON_DELETION,
        0
      );
      for (const post of posts) {
        if (await postHasReplies(deps.repos, post.id)) {
          // Supprimer la publication effacerait aussi les réponses d'autres membres.
          forumPostsSkipped += 1;
          continue;
        }
        await deletePost(deps.repos, post.id);
        forumPosts += 1;
      }
    }

    // Réponses, messages, réactions et blocages partent en cascade (ON DELETE CASCADE).
    await deps.repos.sessions.delete(sessionId);

    return c.json({
      deleted: { ...counts, forumPosts, forumPostsSkipped },
      message:
        forumPostsSkipped > 0
          ? "Session supprimée. Certaines publications ont été conservées car elles recevaient des réponses d'autres membres."
          : "Session et données associées supprimées.",
    });
  });

  return app;
}

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
