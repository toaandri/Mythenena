import { eq, sql } from "drizzle-orm";
import { sessions } from "../db/schema";
import type { SessionRow } from "../db/schema";
import type { DB } from "../db/types";
import type { Language } from "../../../shared/types/survey";

export type NewSession = {
  id: string;
  pseudonym: string;
  pseudonymSource: "generated" | "custom";
  avatarSeed: string;
  language: Language;
  retainHistory: boolean;
};

export type SessionPatch = Partial<
  Pick<NewSession, "pseudonym" | "pseudonymSource" | "avatarSeed" | "language" | "retainHistory">
>;

export interface SessionRepo {
  create(data: NewSession): Promise<SessionRow>;
  findById(id: string): Promise<SessionRow | undefined>;
  /** Recherche de collision lors de la génération d'un pseudonyme. */
  findByPseudonym(pseudonym: string): Promise<SessionRow | undefined>;
  update(id: string, patch: SessionPatch): Promise<SessionRow | undefined>;
  touch(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export function createSessionRepo(db: DB): SessionRepo {
  return {
    async create(data) {
      const [row] = await db.insert(sessions).values(data).returning();
      return row as SessionRow;
    },

    async findById(id) {
      const [row] = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
      return row;
    },

    async findByPseudonym(pseudonym) {
      const [row] = await db
        .select()
        .from(sessions)
        .where(sql`lower(${sessions.pseudonym}) = lower(${pseudonym})`)
        .limit(1);
      return row;
    },

    async update(id, patch) {
      const [row] = await db
        .update(sessions)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(sessions.id, id))
        .returning();
      return row;
    },

    async touch(id) {
      await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, id));
    },

    async delete(id) {
      await db.delete(sessions).where(eq(sessions.id, id));
    },
  };
}
