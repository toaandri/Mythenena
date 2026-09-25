import { eq, desc } from "drizzle-orm";
import {
  lifeEvents,
  identityDomains,
  valuesMap,
  behaviorPatterns,
  hypotheses,
  contradictions,
  learningPreferences,
} from "../db/schema";
import type {
  LifeEventRow,
  IdentityDomainRow,
  ValuesMapRow,
  BehaviorPatternRow,
  HypothesisRow,
  ContradictionRow,
  LearningPreferencesRow,
} from "../db/schema";
import type { DB } from "../db/types";

export interface ProfileRepo {
  // Life events
  addLifeEvent(event: {
    id: string;
    userId: string;
    period?: string;
    event: string;
    emotion?: string;
    meaningGiven?: string;
    decision?: string;
    consequence?: string;
    evidenceIds?: string[];
  }): Promise<LifeEventRow>;
  listLifeEvents(userId: string): Promise<LifeEventRow[]>;

  // Identity domains (upsert per userId+domain)
  upsertIdentityDomain(data: {
    id: string;
    userId: string;
    domain: string;
    content: Record<string, unknown>;
    evidenceIds?: string[];
    confidence?: string;
  }): Promise<IdentityDomainRow>;
  listIdentityDomains(userId: string): Promise<IdentityDomainRow[]>;

  // Values map (upsert per userId+valueName)
  upsertValue(data: {
    id: string;
    userId: string;
    valueName: string;
    claimedImportance?: string;
    behaviorExamples?: unknown[];
    conflicts?: unknown[];
    confidence?: string;
  }): Promise<ValuesMapRow>;
  listValues(userId: string): Promise<ValuesMapRow[]>;

  // Behavior patterns
  addBehaviorPattern(data: {
    id: string;
    userId: string;
    trigger: string;
    interpretation?: string;
    emotion?: string;
    action?: string;
    shortTermResult?: string;
    longTermResult?: string;
    evidenceFor?: string[];
    evidenceAgainst?: string[];
    confidence?: string;
  }): Promise<BehaviorPatternRow>;
  listBehaviorPatterns(userId: string): Promise<BehaviorPatternRow[]>;

  // Hypotheses
  addHypothesis(data: {
    id: string;
    userId: string;
    text: string;
    evidenceFor?: string[];
    evidenceAgainst?: string[];
    confidence?: string;
    status?: string;
  }): Promise<HypothesisRow>;
  updateHypothesis(id: string, patch: Partial<Pick<HypothesisRow, "status" | "userCorrection" | "evidenceFor" | "evidenceAgainst" | "confidence">>): Promise<HypothesisRow | undefined>;
  listHypotheses(userId: string): Promise<HypothesisRow[]>;

  // Contradictions
  addContradiction(data: {
    id: string;
    userId: string;
    statementA: string;
    statementB: string;
    contextDifference?: string;
    status?: string;
  }): Promise<ContradictionRow>;
  listContradictions(userId: string): Promise<ContradictionRow[]>;

  // Learning preferences (upsert — one row per userId)
  upsertLearningPreferences(data: {
    id: string;
    userId: string;
    domain?: string;
    actionScore?: number;
    observationScore?: number;
    conceptualizationScore?: number;
    applicationScore?: number;
    evidenceIds?: string[];
  }): Promise<LearningPreferencesRow>;
  getLearningPreferences(userId: string): Promise<LearningPreferencesRow | undefined>;
}

export function createProfileRepo(db: DB): ProfileRepo {
  return {
    async addLifeEvent(event) {
      const [row] = await db.insert(lifeEvents).values({
        ...event,
        createdAt: new Date(),
      }).returning();
      return row as LifeEventRow;
    },

    async listLifeEvents(userId) {
      return db.select().from(lifeEvents).where(eq(lifeEvents.userId, userId)).orderBy(lifeEvents.createdAt);
    },

    async upsertIdentityDomain(data) {
      const [row] = await db
        .insert(identityDomains)
        .values({ ...data, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [identityDomains.userId, identityDomains.domain],
          set: {
            content: data.content,
            evidenceIds: data.evidenceIds ?? null,
            confidence: data.confidence ?? "low",
            updatedAt: new Date(),
          },
        })
        .returning();
      return row as IdentityDomainRow;
    },

    async listIdentityDomains(userId) {
      return db.select().from(identityDomains).where(eq(identityDomains.userId, userId));
    },

    async upsertValue(data) {
      const [row] = await db
        .insert(valuesMap)
        .values({
          ...data,
          claimedImportance: data.claimedImportance ?? "medium",
          behaviorExamples: data.behaviorExamples ?? [],
          conflicts: data.conflicts ?? [],
          confidence: data.confidence ?? "low",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [valuesMap.userId, valuesMap.valueName],
          set: {
            claimedImportance: data.claimedImportance ?? "medium",
            behaviorExamples: data.behaviorExamples ?? [],
            conflicts: data.conflicts ?? [],
            confidence: data.confidence ?? "low",
            updatedAt: new Date(),
          },
        })
        .returning();
      return row as ValuesMapRow;
    },

    async listValues(userId) {
      return db.select().from(valuesMap).where(eq(valuesMap.userId, userId));
    },

    async addBehaviorPattern(data) {
      const [row] = await db.insert(behaviorPatterns).values({
        ...data,
        confidence: data.confidence ?? "low",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return row as BehaviorPatternRow;
    },

    async listBehaviorPatterns(userId) {
      return db.select().from(behaviorPatterns).where(eq(behaviorPatterns.userId, userId));
    },

    async addHypothesis(data) {
      const [row] = await db.insert(hypotheses).values({
        ...data,
        confidence: data.confidence ?? "low",
        status: data.status ?? "exploring",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      return row as HypothesisRow;
    },

    async updateHypothesis(id, patch) {
      const [row] = await db
        .update(hypotheses)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(hypotheses.id, id))
        .returning();
      return row;
    },

    async listHypotheses(userId) {
      return db.select().from(hypotheses).where(eq(hypotheses.userId, userId));
    },

    async addContradiction(data) {
      const [row] = await db.insert(contradictions).values({
        ...data,
        status: data.status ?? "open",
        createdAt: new Date(),
      }).returning();
      return row as ContradictionRow;
    },

    async listContradictions(userId) {
      return db.select().from(contradictions).where(eq(contradictions.userId, userId));
    },

    async upsertLearningPreferences(data) {
      const [row] = await db
        .insert(learningPreferences)
        .values({
          ...data,
          actionScore: data.actionScore ?? 0,
          observationScore: data.observationScore ?? 0,
          conceptualizationScore: data.conceptualizationScore ?? 0,
          applicationScore: data.applicationScore ?? 0,
          lastUpdated: new Date(),
        })
        .onConflictDoUpdate({
          target: [learningPreferences.userId],
          set: {
            domain: data.domain ?? null,
            actionScore: data.actionScore ?? 0,
            observationScore: data.observationScore ?? 0,
            conceptualizationScore: data.conceptualizationScore ?? 0,
            applicationScore: data.applicationScore ?? 0,
            evidenceIds: data.evidenceIds ?? null,
            lastUpdated: new Date(),
          },
        })
        .returning();
      return row as LearningPreferencesRow;
    },

    async getLearningPreferences(userId) {
      const [row] = await db
        .select()
        .from(learningPreferences)
        .where(eq(learningPreferences.userId, userId))
        .limit(1);
      return row;
    },
  };
}
