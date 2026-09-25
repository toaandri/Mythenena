/**
 * Forum communautaire (étape 7) — logique métier pure.
 *
 * Règles :
 *  - le pseudonyme est la seule identité exposée ; `authorSessionId` ne sort jamais ;
 *  - un utilisateur bloqueur ne voit plus les publications de la session bloquée ;
 *  - un témoignage de détresse est publié tel quel — la modération ne consiste pas
 *    à censurer l'expression de la souffrance, mais à traiter les contenus dangereux.
 */

import type { ForumCategoryRow, ForumPostRow, ForumReplyRow, ForumReportRow } from "../db/schema";
import type { PostWithMeta, Repos } from "../repositories";
import type {
  ForumPostDetailDto,
  ForumPostDto,
  ForumReplyDto,
  ForumReportDto,
  ReactionSummaryDto,
} from "../types/api";
import { REACTION_TYPES, type ReactionType, type ReportStatus, type ReportTargetType } from "../types/forum";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import { normalizeMultiline } from "../utils/text";

export const POST_CONTENT_MAX_LENGTH = 4000;
export const REPORT_DETAILS_MAX_LENGTH = 1000;
export const REPORT_PREVIEW_LENGTH = 240;

export interface AuthorIdentity {
  pseudonym: string;
  avatarSeed: string;
}

export interface CreatePostInput {
  content: string;
  categoryId: string;
}

export async function createPost(
  repos: Repos,
  sessionId: string,
  author: AuthorIdentity,
  input: CreatePostInput
): Promise<ForumPostRow> {
  const content = normalizeMultiline(input.content, POST_CONTENT_MAX_LENGTH);
  if (content.length === 0) {
    throw ApiError.validation("Le message ne peut pas être vide.");
  }

  const category = await repos.forum.findCategory(input.categoryId);
  if (!category) {
    throw ApiError.validation("Cette thématique n'existe pas.", { field: "categoryId" });
  }

  return repos.forum.createPost({
    id: newId(),
    authorSessionId: sessionId,
    pseudonym: author.pseudonym,
    avatarSeed: author.avatarSeed,
    content,
    categoryId: category.id,
  });
}

export async function createReply(
  repos: Repos,
  sessionId: string,
  author: AuthorIdentity,
  postId: string,
  rawContent: string
): Promise<ForumReplyRow> {
  const content = normalizeMultiline(rawContent, POST_CONTENT_MAX_LENGTH);
  if (content.length === 0) {
    throw ApiError.validation("La réponse ne peut pas être vide.");
  }

  const post = await repos.forum.findPost(postId);
  if (!post) {
    throw ApiError.notFound("Publication introuvable", "post_not_found");
  }
  if (post.moderationStatus === "hidden") {
    throw ApiError.notFound("Publication introuvable", "post_not_found");
  }

  return repos.forum.createReply({
    id: newId(),
    postId,
    authorSessionId: sessionId,
    pseudonym: author.pseudonym,
    avatarSeed: author.avatarSeed,
    content,
  });
}

/** Les quatre réactions sont toujours listées, même à zéro, pour stabiliser l'interface. */
export function buildReactionSummary(
  counts: Record<string, number> | undefined,
  activeKeys: Set<string>,
  targetId: string
): ReactionSummaryDto[] {
  return REACTION_TYPES.map((type) => ({
    type,
    count: Number(counts?.[type] ?? 0),
    active: activeKeys.has(`${targetId}:${type}`),
  }));
}

export function toPostDto(
  item: PostWithMeta,
  context: {
    reactionCounts: Map<string, Record<string, number>>;
    activeKeys: Set<string>;
    viewerSessionId?: string;
    category?: ForumCategoryRow;
  }
): ForumPostDto {
  const { post } = item;
  return {
    id: post.id,
    pseudonym: post.pseudonym,
    avatarSeed: post.avatarSeed,
    content: post.content,
    categoryId: post.categoryId,
    ...(context.category
      ? { categorySlug: context.category.slug, categoryLabel: context.category.labelFr }
      : {}),
    repliesCount: item.repliesCount,
    reactions: buildReactionSummary(
      context.reactionCounts.get(post.id),
      context.activeKeys,
      post.id
    ),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    isMine: post.authorSessionId !== null && post.authorSessionId === context.viewerSessionId,
    isFlagged: post.isFlagged,
  };
}

export function toReplyDto(
  reply: ForumReplyRow,
  context: {
    reactionCounts: Map<string, Record<string, number>>;
    activeKeys: Set<string>;
    viewerSessionId?: string;
  }
): ForumReplyDto {
  return {
    id: reply.id,
    postId: reply.postId,
    pseudonym: reply.pseudonym,
    avatarSeed: reply.avatarSeed,
    content: reply.content,
    reactions: buildReactionSummary(
      context.reactionCounts.get(reply.id),
      context.activeKeys,
      reply.id
    ),
    createdAt: reply.createdAt.toISOString(),
    isMine: reply.authorSessionId !== null && reply.authorSessionId === context.viewerSessionId,
    isFlagged: reply.isFlagged,
  };
}

export interface PostDetailContext {
  viewerSessionId?: string;
}

/** Charge un post et ses réponses en appliquant les règles de visibilité. */
export async function getPostDetail(
  repos: Repos,
  postId: string,
  viewerSessionId?: string
): Promise<ForumPostDetailDto> {
  const post = await repos.forum.findPost(postId);
  if (!post || post.moderationStatus === "hidden") {
    throw ApiError.notFound("Publication introuvable", "post_not_found");
  }

  const [replies, blockedIds] = await Promise.all([
    repos.forum.listReplies(postId),
    viewerSessionId ? repos.forum.listBlockedSessionIds(viewerSessionId) : Promise.resolve([]),
  ]);

  const hidden = new Set(blockedIds);
  const visibleReplies = replies.filter(
    (reply) => reply.moderationStatus !== "hidden" && !hidden.has(reply.authorSessionId ?? "")
  );

  const postIds = [postId, ...visibleReplies.map((reply) => reply.id)];
  const [postCounts, replyCounts, activeKeys] = await Promise.all([
    repos.forum.countReactions("post", [postId]),
    repos.forum.countReactions("reply", postIds.slice(1)),
    viewerSessionId
      ? repos.forum.listReactionKeys(viewerSessionId, "post", [postId])
          .then(async (postKeys) => {
            const replyKeys = await repos.forum.listReactionKeys(
              viewerSessionId as string,
              "reply",
              postIds.slice(1)
            );
            return new Set([...postKeys, ...replyKeys]);
          })
      : Promise.resolve(new Set<string>()),
  ]);

  const category = await repos.forum.findCategory(post.categoryId);

  return {
    post: toPostDto(
      { post, repliesCount: visibleReplies.length },
      { reactionCounts: postCounts, activeKeys, viewerSessionId, ...(category ? { category } : {}) }
    ),
    replies: visibleReplies.map((reply) =>
      toReplyDto(reply, { reactionCounts: replyCounts, activeKeys, ...(viewerSessionId ? { viewerSessionId } : {}) })
    ),
  };
}

export interface CreateReportInput {
  targetId: string;
  targetType: ReportTargetType;
  reason: string;
  details?: string | null;
}

export async function createReport(
  repos: Repos,
  input: CreateReportInput,
  reporterSessionId: string | null
): Promise<ForumReportRow> {
  const details = input.details
    ? normalizeMultiline(input.details, REPORT_DETAILS_MAX_LENGTH)
    : null;

  const target =
    input.targetType === "post"
      ? await repos.forum.findPost(input.targetId)
      : await repos.forum.findReply(input.targetId);

  if (!target) {
    throw ApiError.notFound("Le contenu signalé est introuvable", "report_target_not_found");
  }

  return repos.forum.createReport({
    id: newId(),
    targetId: input.targetId,
    targetType: input.targetType,
    reason: input.reason,
    details,
    reporterSessionId,
  });
}

export function toReportDto(
  report: ForumReportRow,
  target: { content: string } | undefined
): ForumReportDto {
  return {
    id: report.id,
    targetId: report.targetId,
    targetType: report.targetType as ForumReportDto["targetType"],
    reason: report.reason as ForumReportDto["reason"],
    details: report.details,
    status: report.status as ReportStatus,
    createdAt: report.createdAt.toISOString(),
    reviewedAt: report.reviewedAt ? report.reviewedAt.toISOString() : null,
    targetPreview: target
      ? target.content.slice(0, REPORT_PREVIEW_LENGTH) + (target.content.length > REPORT_PREVIEW_LENGTH ? "…" : "")
      : null,
    targetExists: target !== undefined,
  };
}

/** Compter les réponses évite de supprimer une publication qui fait vivre un fil. */
export async function postHasReplies(repos: Repos, postId: string): Promise<boolean> {
  const replies = await repos.forum.listReplies(postId);
  return replies.length > 0;
}

export async function assertCanDeletePost(
  repos: Repos,
  post: ForumPostRow,
  sessionId: string
): Promise<void> {
  if (post.authorSessionId !== sessionId) {
    throw ApiError.forbidden("Tu ne peux supprimer que tes propres publications.", "not_post_author");
  }
  if (await postHasReplies(repos, post.id)) {
    throw ApiError.conflict(
      "Cette publication a reçu des réponses : la supprimer effacerait aussi la parole d'autres membres. " +
        "Choisis plutôt de la masquer.",
      "post_has_replies"
    );
  }
}

export async function deletePost(repos: Repos, postId: string): Promise<boolean> {
  const deleted = await repos.forum.deletePost(postId);
  if (!deleted) {
    throw ApiError.notFound("Publication introuvable", "post_not_found");
  }
  return true;
}

export interface BlockResult {
  blocked: boolean;
  blockedSessionId: string;
}

export async function blockMember(
  repos: Repos,
  blockerSessionId: string,
  blockedSessionId: string
): Promise<BlockResult> {
  if (blockerSessionId === blockedSessionId) {
    throw ApiError.validation("Tu ne peux pas te bloquer toi-même.", { field: "blockedSessionId" });
  }
  const target = await repos.sessions.findById(blockedSessionId);
  if (!target) {
    throw ApiError.notFound("Membre introuvable", "member_not_found");
  }
  await repos.forum.createBlock(blockerSessionId, blockedSessionId);
  return { blocked: true, blockedSessionId };
}

export async function unblockMember(
  repos: Repos,
  blockerSessionId: string,
  blockedSessionId: string
): Promise<void> {
  const removed = await repos.forum.deleteBlock(blockerSessionId, blockedSessionId);
  if (!removed) {
    throw ApiError.notFound("Ce membre n'est pas dans ta liste de blocage.", "block_not_found");
  }
}

export async function toggleReaction(
  repos: Repos,
  sessionId: string,
  targetType: ReportTargetType,
  targetId: string,
  type: ReactionType
): Promise<{ type: ReactionType; active: boolean; count: number }> {
  const target =
    targetType === "post" ? await repos.forum.findPost(targetId) : await repos.forum.findReply(targetId);
  if (!target) {
    throw ApiError.notFound("Contenu introuvable", "reaction_target_not_found");
  }

  const result = await repos.forum.toggleReaction({ sessionId, targetType, targetId, type });
  return { type, active: result.active, count: result.count };
}
