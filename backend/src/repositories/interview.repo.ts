import { eq, desc, and } from "drizzle-orm";
import {
  interviewSessions,
  interviewTurns,
  evidenceItems,
  lifeEvents,
  identityDomains,
  valuesMap,
  behaviorPatterns,
  hypotheses,
  contradictions,
  profileSnapshots,
  learningPreferences,
} from "../db/schema";
import type {
  InterviewSessionRow,
  InterviewTurnRow,
  EvidenceItemRow,
  ProfileSnapshotRow,
} from "../db/schema";
import type { DB } from "../db/types";

export interface NewInterviewSession {
  id: string;
  userId: string;
  objective: string;
}

export interface InterviewRepo {
  createSession(data: NewInterviewSession): Promise<InterviewSessionRow>;
  findSessionById(id: string): Promise<InterviewSessionRow | undefined>;
  findActiveSessionByUser(userId: string): Promise<InterviewSessionRow | undefined>;
  updateSession(id: string, patch: Partial<Pick<InterviewSessionRow, "currentPhase" | "status" | "kolbProfile" | "updatedAt">>): Promise<InterviewSessionRow | undefined>;

  addTurn(turn: {
    id: string;
    interviewSessionId: string;
    role: "user" | "assistant";
    content: string;
    methodUsed?: string;
    questionGoal?: string;
  }): Promise<InterviewTurnRow>;
  listTurns(interviewSessionId: string): Promise<InterviewTurnRow[]>;

  addEvidence(item: {
    id: string;
    userId: string;
    turnId?: string;
    type: string;
    content: string;
    period?: string;
    confidence?: string;
  }): Promise<EvidenceItemRow>;

  saveProfileDelta(snap: {
    id: string;
    userId: string;
    delta: Record<string, unknown>;
    turnId?: string;
  }): Promise<ProfileSnapshotRow>;
  listProfileDeltas(userId: string): Promise<ProfileSnapshotRow[]>;
}

export function createInterviewRepo(db: DB): InterviewRepo {
  return {
    async createSession(data) {
      const [row] = await db.insert(interviewSessions).values({
        ...data,
        currentPhase: 0,
        status: "active",
        kolbProfile: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return row as InterviewSessionRow;
    },

    async findSessionById(id) {
      const [row] = await db.select().from(interviewSessions).where(eq(interviewSessions.id, id)).limit(1);
      return row;
    },

    async findActiveSessionByUser(userId) {
      const [row] = await db
        .select()
        .from(interviewSessions)
        .where(and(eq(interviewSessions.userId, userId), eq(interviewSessions.status, "active")))
        .orderBy(desc(interviewSessions.createdAt))
        .limit(1);
      return row;
    },

    async updateSession(id, patch) {
      const [row] = await db
        .update(interviewSessions)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(interviewSessions.id, id))
        .returning();
      return row;
    },

    async addTurn(turn) {
      const [row] = await db.insert(interviewTurns).values({
        ...turn,
        createdAt: new Date(),
      }).returning();
      return row as InterviewTurnRow;
    },

    async listTurns(interviewSessionId) {
      return db
        .select()
        .from(interviewTurns)
        .where(eq(interviewTurns.interviewSessionId, interviewSessionId))
        .orderBy(interviewTurns.createdAt);
    },

    async addEvidence(item) {
      const [row] = await db.insert(evidenceItems).values({
        ...item,
        confidence: item.confidence ?? "low",
        createdAt: new Date(),
      }).returning();
      return row as EvidenceItemRow;
    },

    async saveProfileDelta(snap) {
      const [row] = await db.insert(profileSnapshots).values({
        ...snap,
        createdAt: new Date(),
      }).returning();
      return row as ProfileSnapshotRow;
    },

    async listProfileDeltas(userId) {
      return db
        .select()
        .from(profileSnapshots)
        .where(eq(profileSnapshots.userId, userId))
        .orderBy(profileSnapshots.createdAt);
    },
  };
}
