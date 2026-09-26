import { and, asc, count, desc, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import {
  forumBlocks,
  forumCategories,
  forumPosts,
  forumReplies,
  forumReports,
  reactions,
} from "../db/schema";
import type {
  ForumBlockRow,
  ForumCategoryRow,
  ForumPostRow,
  ForumReplyRow,
  ForumReportRow,
} from "../db/schema";
import type { DB } from "../db/types";
import { newId } from "../utils/id";
import type { ReactionType, ReportTargetType, ReportStatus, PostSort } from "../types/forum";

export type { PostSort };

export interface PostListParams {
  categoryId?: string;
  /** Sessions bloquées par le lecteur : leurs publications lui sont masquées. */
  hiddenAuthorSessionIds?: string[];
  sort?: PostSort;
  limit: number;
  offset: number;
}

/** Publication accompagnée de ses métadonnées de listage. */
export interface PostWithMeta {
  post: ForumPostRow;
  repliesCount: number;
}

export type NewForumPost = {
  id: string;
  authorSessionId: string | null;
  pseudonym: string;
  avatarSeed: string;
  content: string;
  categoryId: string;
};

export type NewForumReply = {
  id: string;
  postId: string;
  authorSessionId: string | null;
  pseudonym: string;
  avatarSeed: string;
  content: string;
};

export type ModerationPatch = {
  moderationStatus?: "visible" | "pending" | "hidden";
  isFlagged?: boolean;
};

export interface ForumRepo {
  listCategories(): Promise<ForumCategoryRow[]>;
  findCategory(id: string): Promise<ForumCategoryRow | undefined>;

  createPost(data: NewForumPost): Promise<ForumPostRow>;
  findPost(id: string): Promise<ForumPostRow | undefined>;
  updatePost(id: string, patch: ModerationPatch): Promise<ForumPostRow | undefined>;
  updateReply(id: string, patch: ModerationPatch): Promise<ForumReplyRow | undefined>;
  deletePost(id: string): Promise<boolean>;
  listPosts(params: PostListParams): Promise<{ items: PostWithMeta[]; total: number }>;
  listPostsByAuthor(sessionId: string, limit: number, offset: number): Promise<ForumPostRow[]>;

  createReply(data: NewForumReply): Promise<ForumReplyRow>;
  findReply(id: string): Promise<ForumReplyRow | undefined>;
  listReplies(postId: string): Promise<ForumReplyRow[]>;

  /** Agrégat des réactions pour un ensemble de cibles. */
  countReactions(
    targetType: ReportTargetType,
    targetIds: string[]
  ): Promise<Map<string, Record<string, number>>>;
  /** Réactions posées par un lecteur, pour afficher l'état actif. */
  listReactionKeys(
    sessionId: string,
    targetType: ReportTargetType,
    targetIds: string[]
  ): Promise<Set<string>>;
  toggleReaction(params: {
    sessionId: string;
    targetType: ReportTargetType;
    targetId: string;
    type: ReactionType;
  }): Promise<{ active: boolean; count: number }>;

  listBlockedSessionIds(sessionId: string): Promise<string[]>;
  createBlock(blockerSessionId: string, blockedSessionId: string): Promise<ForumBlockRow | undefined>;
  deleteBlock(blockerSessionId: string, blockedSessionId: string): Promise<boolean>;
  listBlocks(sessionId: string): Promise<ForumBlockRow[]>;

  createReport(data: {
    id: string;
    targetId: string;
    targetType: ReportTargetType;
    reason: string;
    details: string | null;
    reporterSessionId: string | null;
  }): Promise<ForumReportRow>;
  findReport(id: string): Promise<ForumReportRow | undefined>;
  listReports(
    status: ReportStatus | "all",
    limit: number,
    offset: number
  ): Promise<{ items: ForumReportRow[]; total: number }>;
  resolveReport(id: string, status: ReportStatus, reviewedAt: Date): Promise<ForumReportRow | undefined>;
}

export function createForumRepo(db: DB): ForumRepo {
  return {
    async listCategories() {
      return db
        .select()
        .from(forumCategories)
        .where(eq(forumCategories.isActive, true))
        .orderBy(asc(forumCategories.position));
    },

    async findCategory(id) {
      const [row] = await db.select().from(forumCategories).where(eq(forumCategories.id, id)).limit(1);
      return row;
    },

    async createPost(data) {
      const [row] = await db.insert(forumPosts).values(data).returning();
      return row as ForumPostRow;
    },

    async findPost(id) {
      const [row] = await db.select().from(forumPosts).where(eq(forumPosts.id, id)).limit(1);
      return row;
    },

    async updatePost(id, patch) {
      const [row] = await db
        .update(forumPosts)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(forumPosts.id, id))
        .returning();
      return row;
    },

    async updateReply(id, patch) {
      const [row] = await db
        .update(forumReplies)
        .set(patch)
        .where(eq(forumReplies.id, id))
        .returning();
      return row;
    },

    async deletePost(id) {
      const deleted = await db
        .delete(forumPosts)
        .where(eq(forumPosts.id, id))
        .returning({ id: forumPosts.id });
      return deleted.length > 0;
    },

    async listPosts(params) {
      const conditions = [eq(forumPosts.moderationStatus, "visible")];

      if (params.categoryId) {
        conditions.push(eq(forumPosts.categoryId, params.categoryId));
      }
      if (params.hiddenAuthorSessionIds && params.hiddenAuthorSessionIds.length > 0) {
        // `not in` exclut les NULL : on neutralise donc la colonne avant comparaison.
        conditions.push(
          sql`coalesce(${forumPosts.authorSessionId}, '') not in (${sql.join(
            params.hiddenAuthorSessionIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        );
      }

      const where = and(...conditions);
      const columns = getTableColumns(forumPosts);

      const orderBy =
        params.sort === "oldest"
          ? [asc(forumPosts.createdAt)]
          : params.sort === "discussed"
            ? [desc(sql`count(${forumReplies.id})`), asc(forumPosts.createdAt)]
            : [desc(forumPosts.createdAt)];

      const rows = await db
        .select({ ...columns, repliesCount: sql<number>`count(${forumReplies.id})::int` })
        .from(forumPosts)
        .leftJoin(forumReplies, eq(forumReplies.postId, forumPosts.id))
        .where(where)
        .groupBy(forumPosts.id)
        .orderBy(...orderBy)
        .limit(params.limit)
        .offset(params.offset);

      const [{ value: total } = { value: 0 }] = await db
        .select({ value: count() })
        .from(forumPosts)
        .where(where);

      return {
        items: rows.map(({ repliesCount, ...post }) => ({
          post: post as ForumPostRow,
          repliesCount: Number(repliesCount ?? 0),
        })),
        total: Number(total ?? 0),
      };
    },

    async listPostsByAuthor(sessionId, limit, offset) {
      return db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.authorSessionId, sessionId))
        .orderBy(desc(forumPosts.createdAt))
        .limit(limit)
        .offset(offset);
    },

    async createReply(data) {
      const [row] = await db.insert(forumReplies).values(data).returning();
      return row as ForumReplyRow;
    },

    async findReply(id) {
      const [row] = await db.select().from(forumReplies).where(eq(forumReplies.id, id)).limit(1);
      return row;
    },

    async listReplies(postId) {
      return db
        .select()
        .from(forumReplies)
        .where(eq(forumReplies.postId, postId))
        .orderBy(asc(forumReplies.createdAt));
    },

    async countReactions(targetType, targetIds) {
      const grouped = new Map<string, Record<string, number>>();
      if (targetIds.length === 0) return grouped;

      const rows = await db
        .select({
          targetId: reactions.targetId,
          type: reactions.type,
          value: sql<number>`count(*)::int`,
        })
        .from(reactions)
        .where(and(eq(reactions.targetType, targetType), inArray(reactions.targetId, targetIds)))
        .groupBy(reactions.targetId, reactions.type);

      for (const row of rows) {
        const bucket = grouped.get(row.targetId) ?? {};
        bucket[row.type] = Number(row.value ?? 0);
        grouped.set(row.targetId, bucket);
      }
      return grouped;
    },

    async listReactionKeys(sessionId, targetType, targetIds) {
      if (targetIds.length === 0) return new Set<string>();
      const rows = await db
        .select({ targetId: reactions.targetId, type: reactions.type })
        .from(reactions)
        .where(
          and(
            eq(reactions.sessionId, sessionId),
            eq(reactions.targetType, targetType),
            inArray(reactions.targetId, targetIds)
          )
        );
      return new Set(rows.map((row) => `${row.targetId}:${row.type}`));
    },

    async toggleReaction({ sessionId, targetType, targetId, type }) {
      const removed = await db
        .delete(reactions)
        .where(
          and(
            eq(reactions.sessionId, sessionId),
            eq(reactions.targetType, targetType),
            eq(reactions.targetId, targetId),
            eq(reactions.type, type)
          )
        )
        .returning({ id: reactions.id });

      if (removed.length === 0) {
        await db.insert(reactions).values({ id: newId(), sessionId, targetType, targetId, type });
      }

      const [row] = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(reactions)
        .where(
          and(
            eq(reactions.targetType, targetType),
            eq(reactions.targetId, targetId),
            eq(reactions.type, type)
          )
        );

      return { active: removed.length === 0, count: Number(row?.value ?? 0) };
    },

    async listBlockedSessionIds(sessionId) {
      const rows = await db
        .select({ blockedSessionId: forumBlocks.blockedSessionId })
        .from(forumBlocks)
        .where(eq(forumBlocks.blockerSessionId, sessionId));
      return rows.map((row) => row.blockedSessionId);
    },

    async createBlock(blockerSessionId, blockedSessionId) {
      const [row] = await db
        .insert(forumBlocks)
        .values({ id: newId(), blockerSessionId, blockedSessionId })
        .onConflictDoNothing()
        .returning();
      return row;
    },

    async deleteBlock(blockerSessionId, blockedSessionId) {
      const deleted = await db
        .delete(forumBlocks)
        .where(
          and(
            eq(forumBlocks.blockerSessionId, blockerSessionId),
            eq(forumBlocks.blockedSessionId, blockedSessionId)
          )
        )
        .returning({ id: forumBlocks.id });
      return deleted.length > 0;
    },

    async listBlocks(sessionId) {
      return db.select().from(forumBlocks).where(eq(forumBlocks.blockerSessionId, sessionId));
    },

    async createReport(data) {
      const [row] = await db.insert(forumReports).values(data).returning();
      return row as ForumReportRow;
    },

    async findReport(id) {
      const [row] = await db.select().from(forumReports).where(eq(forumReports.id, id)).limit(1);
      return row;
    },

    async listReports(status, limit, offset) {
      const where = status === "all" ? undefined : eq(forumReports.status, status);

      const items = await db
        .select()
        .from(forumReports)
        .where(where)
        .orderBy(asc(forumReports.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ value: total } = { value: 0 }] = await db
        .select({ value: count() })
        .from(forumReports)
        .where(where);

      return { items, total: Number(total ?? 0) };
    },

    async resolveReport(id, status, reviewedAt) {
      const [row] = await db
        .update(forumReports)
        .set({ status, reviewedAt })
        .where(eq(forumReports.id, id))
        .returning();
      return row;
    },
  };
}
