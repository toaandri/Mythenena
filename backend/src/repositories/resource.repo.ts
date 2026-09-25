import { and, asc, eq, ilike, or, sql } from "drizzle-orm";
import { chatMessages, resources, syntheses, synthesisCorrections } from "../db/schema";
import type { ResourceRow, SynthesisCorrectionRow, SynthesisRow } from "../db/schema";
import type { DB } from "../db/types";
import type { ResourceType } from "../types/resource";

export interface ResourceListParams {
  type?: ResourceType;
  tag?: string;
  query?: string;
  offlineOnly?: boolean;
  limit: number;
  offset: number;
}

export interface ResourceRepo {
  list(params: ResourceListParams): Promise<{ items: ResourceRow[]; total: number }>;
  findBySlug(slug: string): Promise<ResourceRow | undefined>;
  listOffline(): Promise<ResourceRow[]>;
  listTags(): Promise<string[]>;
}

export interface HistoryRepo {
  listChatMessages(sessionId: string, limit: number): Promise<typeof chatMessages.$inferSelect[]>;
  deleteChatMessages(sessionId: string): Promise<number>;
  listSynthesisCorrections(sessionId: string): Promise<SynthesisCorrectionRow[]>;
  addSynthesisCorrection(data: {
    id: string;
    sessionId: string;
    domainId: string;
    userNote: string;
  }): Promise<SynthesisCorrectionRow>;
  listSyntheses(sessionId: string): Promise<SynthesisRow[]>;
}

export function createResourceRepo(db: DB): ResourceRepo {
  return {
    async list(params) {
      const conditions = [eq(resources.isPublished, true)];

      if (params.type) conditions.push(eq(resources.type, params.type));
      if (params.tag) conditions.push(sql`${resources.tags} @> ARRAY[${params.tag}]::text[]`);
      if (params.offlineOnly) conditions.push(eq(resources.isOfflineAvailable, true));
      if (params.query) {
        const pattern = `%${params.query}%`;
        const search = or(
          ilike(resources.title, pattern),
          ilike(resources.summary, pattern),
          sql`${resources.titleMg} ilike ${pattern}`
        );
        if (search) conditions.push(search);
      }

      const where = and(...conditions);
      const items = await db
        .select()
        .from(resources)
        .where(where)
        .orderBy(asc(resources.title))
        .limit(params.limit)
        .offset(params.offset);

      const [{ value: total } = { value: 0 }] = await db
        .select({ value: sql<number>`count(*)::int` })
        .from(resources)
        .where(where);

      return { items, total: Number(total ?? 0) };
    },

    async findBySlug(slug) {
      const [row] = await db
        .select()
        .from(resources)
        .where(and(eq(resources.slug, slug), eq(resources.isPublished, true)))
        .limit(1);
      return row;
    },

    async listOffline() {
      return db
        .select()
        .from(resources)
        .where(
          and(eq(resources.isPublished, true), eq(resources.isOfflineAvailable, true))
        )
        .orderBy(asc(resources.title));
    },

    async listTags() {
      const rows = await db
        .selectDistinct({ value: sql<string>`unnest(${resources.tags})` })
        .from(resources)
        .where(eq(resources.isPublished, true));
      return rows.map((row) => row.value).sort();
    },
  };
}

export function createHistoryRepo(db: DB): HistoryRepo {
  return {
    async listChatMessages(sessionId, limit) {
      return db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(asc(chatMessages.createdAt))
        .limit(limit);
    },

    async deleteChatMessages(sessionId) {
      const deleted = await db
        .delete(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .returning({ id: chatMessages.id });
      return deleted.length;
    },

    async listSynthesisCorrections(sessionId) {
      return db
        .select()
        .from(synthesisCorrections)
        .where(eq(synthesisCorrections.sessionId, sessionId))
        .orderBy(asc(synthesisCorrections.correctedAt));
    },

    async addSynthesisCorrection(data) {
      const [row] = await db.insert(synthesisCorrections).values(data).returning();
      return row as SynthesisCorrectionRow;
    },

    async listSyntheses(sessionId) {
      return db
        .select()
        .from(syntheses)
        .where(eq(syntheses.sessionId, sessionId))
        .orderBy(asc(syntheses.generatedAt));
    },
  };
}
