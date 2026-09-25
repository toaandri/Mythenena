import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppConfig } from "../config/config";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { createAuthMiddleware, createOptionalAuthMiddleware } from "../middleware/auth";
import { paginationQuery, offsetOf, paginate } from "../utils/pagination";
import {
  POST_CONTENT_MAX_LENGTH,
  REPORT_DETAILS_MAX_LENGTH,
  assertCanDeletePost,
  blockMember,
  createPost,
  createReply,
  createReport,
  deletePost,
  getPostDetail,
  toggleReaction,
  toPostDto,
  unblockMember,
} from "../services/forumService";
import { POST_SORTS, REACTION_TYPES, REPORT_REASONS, REPORT_TARGET_TYPES } from "../types/forum";
import { ApiError } from "../utils/errors";

const listPostsQuery = paginationQuery.extend({
  category: z.string().min(1).max(64).optional(),
  sort: z.enum(POST_SORTS).default("recent"),
});

const createPostBody = z.object({
  content: z.string().min(1).max(POST_CONTENT_MAX_LENGTH),
  categoryId: z.string().min(1).max(64),
});

const replyBody = z.object({
  content: z.string().min(1).max(POST_CONTENT_MAX_LENGTH),
});

const reactBody = z.object({
  type: z.enum(REACTION_TYPES),
});

const reportBody = z.object({
  targetId: z.string().min(1).max(64),
  targetType: z.enum(REPORT_TARGET_TYPES),
  reason: z.enum(REPORT_REASONS),
  details: z.string().max(REPORT_DETAILS_MAX_LENGTH).nullish(),
});

const blockBody = z.object({
  blockedSessionId: z.string().min(1).max(64),
});

export function createForumRoutes(deps: { repos: Repos; config: AppConfig }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  const auth = createAuthMiddleware({ repos: deps.repos, secret: deps.config.jwtSecret });
  const optionalAuth = createOptionalAuthMiddleware({
    repos: deps.repos,
    secret: deps.config.jwtSecret,
  });

  // --- Lectures publiques (authentification facultative) ---------------------

  app.get("/categories", optionalAuth, async (c) => {
    const categories = await deps.repos.forum.listCategories();
    return c.json({
      categories: categories.map((category) => ({
        id: category.id,
        slug: category.slug,
        labelFr: category.labelFr,
        labelMg: category.labelMg,
        description: category.description,
        icon: category.icon,
        position: category.position,
      })),
    });
  });

  app.get("/posts", optionalAuth, zValidator("query", listPostsQuery), async (c) => {
    const query = c.req.valid("query");
    const viewerSessionId = c.get("sessionId");

    const category = query.category ? await deps.repos.forum.findCategory(query.category) : undefined;
    if (query.category && !category) {
      throw ApiError.validation("Cette thématique n'existe pas.", { field: "category" });
    }

    const hiddenAuthorSessionIds = viewerSessionId
      ? await deps.repos.forum.listBlockedSessionIds(viewerSessionId)
      : [];

    const { items, total } = await deps.repos.forum.listPosts({
      ...(category ? { categoryId: category.id } : {}),
      hiddenAuthorSessionIds,
      sort: query.sort,
      limit: query.limit,
      offset: offsetOf(query),
    });

    const postIds = items.map((item) => item.post.id);
    const [reactionCounts, activeKeys, categories] = await Promise.all([
      deps.repos.forum.countReactions("post", postIds),
      viewerSessionId
        ? deps.repos.forum.listReactionKeys(viewerSessionId, "post", postIds)
        : Promise.resolve(new Set<string>()),
      deps.repos.forum.listCategories(),
    ]);
    const categoryById = new Map(categories.map((entry) => [entry.id, entry]));

    return c.json(
      paginate(
        items.map((item) => {
          const category = categoryById.get(item.post.categoryId);
          return toPostDto(item, {
            reactionCounts,
            activeKeys,
            ...(viewerSessionId ? { viewerSessionId } : {}),
            ...(category ? { category } : {}),
          });
        }),
        total,
        query
      )
    );
  });

  app.get("/posts/:id", optionalAuth, async (c) => {
    return c.json(await getPostDetail(deps.repos, c.req.param("id"), c.get("sessionId")));
  });

  // --- Publications du lecteur ---------------------------------------------

  app.get("/me/posts", auth, zValidator("query", paginationQuery), async (c) => {
    const query = c.req.valid("query");
    const sessionId = c.get("sessionId");
    const posts = await deps.repos.forum.listPostsByAuthor(sessionId, query.limit, offsetOf(query));
    const postIds = posts.map((post) => post.id);

    const [reactionCounts, activeKeys] = await Promise.all([
      deps.repos.forum.countReactions("post", postIds),
      deps.repos.forum.listReactionKeys(sessionId, "post", postIds),
    ]);

    return c.json(
      paginate(
        posts.map((post) =>
          toPostDto(
            { post, repliesCount: 0 },
            { reactionCounts, activeKeys, viewerSessionId: sessionId }
          )
        ),
        posts.length,
        query
      )
    );
  });

  // --- Écritures (session requise, appliquée au niveau du routeur) ---------

  app.post("/posts", auth, zValidator("json", createPostBody), async (c) => {
    const session = c.get("session");
    const post = await createPost(
      deps.repos,
      c.get("sessionId"),
      { pseudonym: session.pseudonym, avatarSeed: session.avatarSeed },
      c.req.valid("json")
    );

    return c.json(
      {
        post: toPostDto(
          { post, repliesCount: 0 },
          {
            reactionCounts: new Map(),
            activeKeys: new Set(),
            viewerSessionId: c.get("sessionId"),
          }
        ),
      },
      201
    );
  });

  app.delete("/posts/:id", auth, async (c) => {
    const postId = c.req.param("id");
    const post = await deps.repos.forum.findPost(postId);
    if (!post) {
      throw ApiError.notFound("Publication introuvable", "post_not_found");
    }
    await assertCanDeletePost(deps.repos, post, c.get("sessionId"));
    await deletePost(deps.repos, postId);
    return c.json({ deleted: true, id: postId });
  });

  app.post("/posts/:id/reply", auth, zValidator("json", replyBody), async (c) => {
    const session = c.get("session");
    const postId = c.req.param("id");
    await createReply(
      deps.repos,
      c.get("sessionId"),
      { pseudonym: session.pseudonym, avatarSeed: session.avatarSeed },
      postId,
      c.req.valid("json").content
    );
    // Renvoyer le fil complet évite un aller-retour supplémentaire côté client.
    return c.json(await getPostDetail(deps.repos, postId, c.get("sessionId")), 201);
  });

  app.post("/posts/:id/react", auth, zValidator("json", reactBody), async (c) => {
    const { type } = c.req.valid("json");
    const reaction = await toggleReaction(
      deps.repos,
      c.get("sessionId"),
      "post",
      c.req.param("id"),
      type
    );
    return c.json({ reaction });
  });

  app.post("/replies/:id/react", auth, zValidator("json", reactBody), async (c) => {
    const { type } = c.req.valid("json");
    const reaction = await toggleReaction(
      deps.repos,
      c.get("sessionId"),
      "reply",
      c.req.param("id"),
      type
    );
    return c.json({ reaction });
  });

  // --- Signalements ---------------------------------------------------------

  app.post("/report", auth, zValidator("json", reportBody), async (c) => {
    const body = c.req.valid("json");
    const report = await createReport(
      deps.repos,
      {
        targetId: body.targetId,
        targetType: body.targetType,
        reason: body.reason,
        ...(body.details !== undefined ? { details: body.details } : {}),
      },
      c.get("sessionId")
    );

    return c.json(
      {
        report: {
          id: report.id,
          targetId: report.targetId,
          targetType: report.targetType,
          reason: report.reason,
          status: report.status,
          createdAt: report.createdAt.toISOString(),
        },
        message:
          "Signalement transmis à un modérateur. Exprimer une souffrance n'est jamais traité comme une faute : " +
          "seuls les contenus dangereux ou les violences sont examinés.",
      },
      201
    );
  });

  // --- Blocage de membres ---------------------------------------------------

  app.get("/blocks", auth, async (c) => {
    const blocks = await deps.repos.forum.listBlocks(c.get("sessionId"));
    return c.json({
      // Seuls des identifiants techniques sont exposés : aucun pseudonyme d'autrui.
      blocks: blocks.map((block) => ({
        blockedSessionId: block.blockedSessionId,
        createdAt: block.createdAt.toISOString(),
      })),
    });
  });

  app.post("/blocks", auth, zValidator("json", blockBody), async (c) => {
    const result = await blockMember(
      deps.repos,
      c.get("sessionId"),
      c.req.valid("json").blockedSessionId
    );
    return c.json(result, 201);
  });

  app.delete("/blocks/:blockedSessionId", auth, async (c) => {
    await unblockMember(deps.repos, c.get("sessionId"), c.req.param("blockedSessionId"));
    return c.json({ unblocked: true, blockedSessionId: c.req.param("blockedSessionId") });
  });

  return app;
}
