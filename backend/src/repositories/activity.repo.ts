import { eq, and, desc } from "drizzle-orm";
import { activityLibrary, activitySessions } from "../db/schema";
import type { ActivityLibraryRow, ActivitySessionRow } from "../db/schema";
import type { DB } from "../db/types";

export interface ActivityRepo {
  findBySlug(slug: string): Promise<ActivityLibraryRow | undefined>;
  listAll(): Promise<ActivityLibraryRow[]>;
  listActive(): Promise<ActivityLibraryRow[]>;

  createSession(data: {
    id: string;
    userId: string;
    activitySlug: string;
    stateAxes: Record<string, unknown>;
  }): Promise<ActivitySessionRow>;

  completeSession(id: string, feedback?: string, feedbackNote?: string): Promise<ActivitySessionRow | undefined>;
  abandonSession(id: string): Promise<void>;

  listUserSessions(userId: string, limit?: number): Promise<ActivitySessionRow[]>;
}

export function createActivityRepo(db: DB): ActivityRepo {
  return {
    async findBySlug(slug) {
      const [row] = await db
        .select()
        .from(activityLibrary)
        .where(eq(activityLibrary.slug, slug))
        .limit(1);
      return row;
    },

    async listAll() {
      return db.select().from(activityLibrary).orderBy(activityLibrary.category);
    },

    async listActive() {
      return db
        .select()
        .from(activityLibrary)
        .where(eq(activityLibrary.isActive, true))
        .orderBy(activityLibrary.category);
    },

    async createSession(data) {
      const [row] = await db
        .insert(activitySessions)
        .values({
          ...data,
          startedAt: new Date(),
          wasAbandoned: false,
        })
        .returning();
      return row as ActivitySessionRow;
    },

    async completeSession(id, feedback, feedbackNote) {
      const [row] = await db
        .update(activitySessions)
        .set({
          completedAt: new Date(),
          feedback: feedback ?? null,
          feedbackNote: feedbackNote ?? null,
        })
        .where(eq(activitySessions.id, id))
        .returning();
      return row;
    },

    async abandonSession(id) {
      await db
        .update(activitySessions)
        .set({ wasAbandoned: true, completedAt: new Date() })
        .where(eq(activitySessions.id, id));
    },

    async listUserSessions(userId, limit = 20) {
      return db
        .select()
        .from(activitySessions)
        .where(eq(activitySessions.userId, userId))
        .orderBy(desc(activitySessions.startedAt))
        .limit(limit);
    },
  };
}
