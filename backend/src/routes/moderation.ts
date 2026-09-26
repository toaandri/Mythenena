/**
 * Espace de modération du forum — traitement HUMAIN des signalements.
 *
 * Le pré-criblage et la modération assistées par IA relèvent de la phase IA et
 * ne sont pas branchés ici. En attendant, chaque signalement est examiné par un
 * humain, et le contenu signalé reste consultable dans son contexte.
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppConfig } from "../config/config";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { createModeratorMiddleware, isValidModeratorToken } from "../middleware/auth";
import { signModeratorToken } from "../services/authService";
import { toReportDto } from "../services/forumService";
import { REPORT_STATUSES } from "../types/forum";
import { paginationQuery, offsetOf, paginate } from "../utils/pagination";
import { ApiError } from "../utils/errors";

const loginBody = z.object({ token: z.string().min(1).max(512) });

const listQuery = paginationQuery.extend({
  status: z.enum([...REPORT_STATUSES, "all"] as const).default("pending"),
});

const resolveBody = z.object({
  status: z.enum(["reviewed", "dismissed"]),
  /** Optionnel : masquer le contenu signalé en plus de clore le signalement. */
  hideTarget: z.boolean().default(false),
});

export function createModerationRoutes(deps: { repos: Repos; config: AppConfig }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  const moderator = createModeratorMiddleware(deps.config);

  app.post("/login", zValidator("json", loginBody), async (c) => {
    const { token } = c.req.valid("json");
    if (!isValidModeratorToken(deps.config, token)) {
      throw ApiError.unauthorized("Jeton de modération invalide.", "invalid_moderator_token");
    }
    return c.json({ token: await signModeratorToken(deps.config) });
  });

  app.get("/reports", moderator, zValidator("query", listQuery), async (c) => {
    const query = c.req.valid("query");
    const { items, total } = await deps.repos.forum.listReports(
      query.status,
      query.limit,
      offsetOf(query)
    );

    const resolved = await Promise.all(
      items.map(async (report) => {
        const target =
          report.targetType === "post"
            ? await deps.repos.forum.findPost(report.targetId)
            : await deps.repos.forum.findReply(report.targetId);
        return toReportDto(report, target ? { content: target.content } : undefined);
      })
    );

    return c.json(paginate(resolved, total, query));
  });

  app.patch("/reports/:id", moderator, zValidator("json", resolveBody), async (c) => {
    const { status, hideTarget } = c.req.valid("json");
    const reportId = c.req.param("id");

    const report = await deps.repos.forum.findReport(reportId);
    if (!report) {
      throw ApiError.notFound("Signalement introuvable", "report_not_found");
    }
    if (report.status !== "pending") {
      throw ApiError.conflict("Ce signalement a déjà été traité.", "report_already_resolved");
    }

    if (hideTarget) {
      const patch = { moderationStatus: "hidden" as const, isFlagged: true };
      if (report.targetType === "post") {
        await deps.repos.forum.updatePost(report.targetId, patch);
      } else {
        // Masquer la réponse elle-même et signaler la publication parente.
        await deps.repos.forum.updateReply(report.targetId, patch);
        const reply = await deps.repos.forum.findReply(report.targetId);
        if (reply) {
          await deps.repos.forum.updatePost(reply.postId, { isFlagged: true });
        }
      }
    }

    const updated = await deps.repos.forum.resolveReport(reportId, status, new Date());

    return c.json({
      report: updated ? toReportDto(updated, undefined) : null,
      notice:
        "Un témoignage de détresse peut être légitime : la modération retire ce qui est dangereux ou " +
        "harcelant, elle ne punit pas l'expression de la souffrance.",
    });
  });

  return app;
}
