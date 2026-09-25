/**
 * Repositories en mémoire pour les tests.
 *
 * Ils implémentent les mêmes interfaces que les repositories Drizzle : les
 * routes et les services sont donc exercés tels qu'ils le seront en
 * production, sans base de données.
 */

import type {
  AssociationRow,
  ContactRequestRow,
  ForumBlockRow,
  ForumCategoryRow,
  ForumPostRow,
  ForumReplyRow,
  ForumReportRow,
  ProfessionalRow,
  ResourceRow,
  SessionRow,
  SurveyAnswerRow,
  SurveyQuestionRow,
  SynthesisCorrectionRow,
  SynthesisRow,
  // Interview & Profile module
  InterviewSessionRow,
  InterviewTurnRow,
  EvidenceItemRow,
  ProfileSnapshotRow,
  LifeEventRow,
  IdentityDomainRow,
  ValuesMapRow,
  BehaviorPatternRow,
  HypothesisRow,
  ContradictionRow,
  LearningPreferencesRow,
  // Activities module
  ActivityLibraryRow,
  ActivitySessionRow,
} from "../../db/schema";
import type { Repos } from "../../repositories";
import type { NewSurveyAnswer } from "../../repositories/survey.repo";
import type { NewSession, SessionPatch } from "../../repositories/session.repo";
import type { NewForumPost, NewForumReply, PostListParams, PostWithMeta } from "../../repositories/forum.repo";
import type { ProfessionalListParams, NewContactRequest } from "../../repositories/annuaire.repo";
import type { ResourceListParams } from "../../repositories/resource.repo";
import type { ReactionType, ReportStatus, ReportTargetType } from "../../types/forum";
import { foldForSearch } from "../../utils/text";

type ChatMessageRow = { id: string; sessionId: string; role: string; content: string; flagged: boolean; createdAt: Date };

const now = () => new Date();

function sessionRow(data: NewSession): SessionRow {
  const timestamp = now();
  return {
    id: data.id,
    pseudonym: data.pseudonym,
    pseudonymSource: data.pseudonymSource,
    avatarSeed: data.avatarSeed,
    language: data.language,
    retainHistory: data.retainHistory,
    consentAt: timestamp,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastSeenAt: timestamp,
  };
}

function answerRow(data: NewSurveyAnswer): SurveyAnswerRow {
  return {
    id: data.id,
    sessionId: data.sessionId,
    surveyType: data.surveyType,
    questionId: data.questionId,
    questionText: data.questionText,
    choicesSnapshot: data.choicesSnapshot,
    choiceIds: data.choiceIds,
    textAnswer: data.textAnswer,
    skipped: data.skipped,
    domain: data.domain,
    answeredAt: data.answeredAt,
  };
}

function postRow(data: NewForumPost): ForumPostRow {
  const timestamp = now();
  return {
    id: data.id,
    authorSessionId: data.authorSessionId,
    pseudonym: data.pseudonym,
    avatarSeed: data.avatarSeed,
    content: data.content,
    categoryId: data.categoryId,
    moderationStatus: "visible",
    isFlagged: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function replyRow(data: NewForumReply): ForumReplyRow {
  return {
    id: data.id,
    postId: data.postId,
    authorSessionId: data.authorSessionId,
    pseudonym: data.pseudonym,
    avatarSeed: data.avatarSeed,
    content: data.content,
    moderationStatus: "visible",
    isFlagged: false,
    createdAt: now(),
  };
}

export interface FakeData {
  sessions: SessionRow[];
  questions: SurveyQuestionRow[];
  answers: SurveyAnswerRow[];
  categories: ForumCategoryRow[];
  posts: ForumPostRow[];
  replies: ForumReplyRow[];
  reactions: { id: string; sessionId: string; targetId: string; targetType: string; type: string; createdAt: Date }[];
  blocks: ForumBlockRow[];
  reports: ForumReportRow[];
  professionals: ProfessionalRow[];
  associations: AssociationRow[];
  contactRequests: ContactRequestRow[];
  resources: ResourceRow[];
  syntheses: SynthesisRow[];
  corrections: SynthesisCorrectionRow[];
  chatMessages: ChatMessageRow[];
  // Interview & Profile
  interviewSessions: InterviewSessionRow[];
  interviewTurns: InterviewTurnRow[];
  evidenceItems: EvidenceItemRow[];
  profileSnapshots: ProfileSnapshotRow[];
  lifeEvents: LifeEventRow[];
  identityDomains: IdentityDomainRow[];
  valuesMap: ValuesMapRow[];
  behaviorPatterns: BehaviorPatternRow[];
  hypotheses: HypothesisRow[];
  contradictions: ContradictionRow[];
  learningPreferences: LearningPreferencesRow[];
  // Activities
  activityLibrary: ActivityLibraryRow[];
  activitySessions: ActivitySessionRow[];
}

export function createFakeData(): FakeData {
  return {
    sessions: [],
    questions: [],
    answers: [],
    categories: [],
    posts: [],
    replies: [],
    reactions: [],
    blocks: [],
    reports: [],
    professionals: [],
    associations: [],
    contactRequests: [],
    resources: [],
    syntheses: [],
    corrections: [],
    chatMessages: [],
    // Interview & Profile
    interviewSessions: [],
    interviewTurns: [],
    evidenceItems: [],
    profileSnapshots: [],
    lifeEvents: [],
    identityDomains: [],
    valuesMap: [],
    behaviorPatterns: [],
    hypotheses: [],
    contradictions: [],
    learningPreferences: [],
    // Activities
    activityLibrary: [],
    activitySessions: [],
  };
}

export function createFakeRepos(data: FakeData): Repos {
  let sequence = 0;
  const nextId = (prefix: string) => `${prefix}-fake-${(sequence += 1)}`;

  return {
    sessions: {
      async create(input) {
        const row = sessionRow(input);
        data.sessions.push(row);
        return row;
      },
      async findById(id) {
        return data.sessions.find((row) => row.id === id);
      },
      async findByPseudonym(pseudonym) {
        const target = foldForSearch(pseudonym);
        return data.sessions.find((row) => foldForSearch(row.pseudonym) === target);
      },
      async update(id, patch: SessionPatch) {
        const row = data.sessions.find((entry) => entry.id === id);
        if (!row) return undefined;
        Object.assign(row, patch, { updatedAt: now() });
        return row;
      },
      async touch(id) {
        const row = data.sessions.find((entry) => entry.id === id);
        if (row) row.lastSeenAt = now();
      },
      async delete(id) {
        data.sessions = data.sessions.filter((row) => row.id !== id);
      },
    },

    surveys: {
      async listQuestions(surveyType) {
        return data.questions
          .filter((row) => row.surveyType === surveyType && row.isActive)
          .sort((a, b) => a.position - b.position);
      },
      async findQuestion(surveyType, questionId) {
        return data.questions.find(
          (row) => row.surveyType === surveyType && row.id === questionId && row.isActive
        );
      },
      async listAnswers(sessionId, surveyType) {
        return data.answers
          .filter(
            (row) => row.sessionId === sessionId && (!surveyType || row.surveyType === surveyType)
          )
          .sort((a, b) => a.answeredAt.getTime() - b.answeredAt.getTime());
      },
      async upsertAnswer(input) {
        const existing = data.answers.find(
          (row) =>
            row.sessionId === input.sessionId &&
            row.surveyType === input.surveyType &&
            row.questionId === input.questionId
        );
        if (existing) {
          Object.assign(existing, answerRow(input), { id: existing.id });
          return existing;
        }
        const row = answerRow(input);
        data.answers.push(row);
        return row;
      },
      async deleteAnswers(sessionId, surveyType) {
        const before = data.answers.length;
        data.answers = data.answers.filter(
          (row) =>
            !(row.sessionId === sessionId && (!surveyType || row.surveyType === surveyType))
        );
        return before - data.answers.length;
      },
    },

    forum: {
      async listCategories() {
        return data.categories
          .filter((row) => row.isActive)
          .sort((a, b) => a.position - b.position);
      },
      async findCategory(id) {
        return data.categories.find(
          (row) => row.id === id || row.slug === id
        );
      },
      async createPost(input) {
        const row = postRow(input);
        data.posts.push(row);
        return row;
      },
      async findPost(id) {
        return data.posts.find((row) => row.id === id);
      },
      async updatePost(id, patch) {
        const row = data.posts.find((entry) => entry.id === id);
        if (!row) return undefined;
        Object.assign(row, patch, { updatedAt: now() });
        return row;
      },
      async deletePost(id) {
        const before = data.posts.length;
        data.posts = data.posts.filter((row) => row.id !== id);
        data.replies = data.replies.filter((row) => row.postId !== id);
        return data.posts.length !== before;
      },
      async listPosts(params: PostListParams) {
        const hidden = new Set(params.hiddenAuthorSessionIds ?? []);
        const filtered = data.posts.filter(
          (row) =>
            row.moderationStatus === "visible" &&
            (!params.categoryId || row.categoryId === params.categoryId) &&
            !hidden.has(row.authorSessionId ?? "")
        );

        const withMeta: PostWithMeta[] = filtered.map((post) => ({
          post,
          repliesCount: data.replies.filter((reply) => reply.postId === post.id).length,
        }));

        const sorted = [...withMeta];
        if (params.sort === "oldest") {
          sorted.sort((a, b) => a.post.createdAt.getTime() - b.post.createdAt.getTime());
        } else if (params.sort === "discussed") {
          sorted.sort(
            (a, b) => b.repliesCount - a.repliesCount || a.post.createdAt.getTime() - b.post.createdAt.getTime()
          );
        } else {
          sorted.sort((a, b) => b.post.createdAt.getTime() - a.post.createdAt.getTime());
        }

        return {
          items: sorted.slice(params.offset, params.offset + params.limit),
          total: sorted.length,
        };
      },
      async listPostsByAuthor(sessionId, limit, offset) {
        return data.posts
          .filter((row) => row.authorSessionId === sessionId)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(offset, offset + limit);
      },
      async createReply(input) {
        const row = replyRow(input);
        data.replies.push(row);
        return row;
      },
      async findReply(id) {
        return data.replies.find((row) => row.id === id);
      },
      async listReplies(postId) {
        return data.replies
          .filter((row) => row.postId === postId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      },
      async countReactions(targetType: ReportTargetType, targetIds: string[]) {
        const grouped = new Map<string, Record<string, number>>();
        for (const row of data.reactions) {
          if (row.targetType !== targetType || !targetIds.includes(row.targetId)) continue;
          const bucket = grouped.get(row.targetId) ?? {};
          bucket[row.type] = (bucket[row.type] ?? 0) + 1;
          grouped.set(row.targetId, bucket);
        }
        return grouped;
      },
      async listReactionKeys(sessionId, targetType, targetIds) {
        return new Set(
          data.reactions
            .filter(
              (row) =>
                row.sessionId === sessionId &&
                row.targetType === targetType &&
                targetIds.includes(row.targetId)
            )
            .map((row) => `${row.targetId}:${row.type}`)
        );
      },
      async toggleReaction({ sessionId, targetType, targetId, type }) {
        const index = data.reactions.findIndex(
          (row) =>
            row.sessionId === sessionId &&
            row.targetType === targetType &&
            row.targetId === targetId &&
            row.type === type
        );
        if (index >= 0) {
          data.reactions.splice(index, 1);
        } else {
          data.reactions.push({
            id: nextId("react"),
            sessionId,
            targetType,
            targetId,
            type,
            createdAt: now(),
          });
        }
        const count = data.reactions.filter(
          (row) => row.targetType === targetType && row.targetId === targetId && row.type === type
        ).length;
        return { active: index < 0, count };
      },
      async listBlockedSessionIds(sessionId) {
        return data.blocks
          .filter((row) => row.blockerSessionId === sessionId)
          .map((row) => row.blockedSessionId);
      },
      async createBlock(blockerSessionId, blockedSessionId) {
        const existing = data.blocks.find(
          (row) => row.blockerSessionId === blockerSessionId && row.blockedSessionId === blockedSessionId
        );
        if (existing) return undefined;
        const row: ForumBlockRow = {
          id: nextId("block"),
          blockerSessionId,
          blockedSessionId,
          createdAt: now(),
        };
        data.blocks.push(row);
        return row;
      },
      async deleteBlock(blockerSessionId, blockedSessionId) {
        const before = data.blocks.length;
        data.blocks = data.blocks.filter(
          (row) => !(row.blockerSessionId === blockerSessionId && row.blockedSessionId === blockedSessionId)
        );
        return data.blocks.length !== before;
      },
      async listBlocks(sessionId) {
        return data.blocks.filter((row) => row.blockerSessionId === sessionId);
      },
      async createReport(input) {
        const row: ForumReportRow = {
          id: input.id,
          targetId: input.targetId,
          targetType: input.targetType,
          reason: input.reason,
          details: input.details,
          status: "pending",
          reporterSessionId: input.reporterSessionId,
          reviewedAt: null,
          createdAt: now(),
        };
        data.reports.push(row);
        return row;
      },
      async findReport(id) {
        return data.reports.find((row) => row.id === id);
      },
      async listReports(status, limit, offset) {
        const filtered =
          status === "all" ? data.reports : data.reports.filter((row) => row.status === status);
        const sorted = [...filtered].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        return { items: sorted.slice(offset, offset + limit), total: sorted.length };
      },
      async resolveReport(id, status: ReportStatus, reviewedAt) {
        const row = data.reports.find((entry) => entry.id === id);
        if (!row) return undefined;
        row.status = status;
        row.reviewedAt = reviewedAt;
        return row;
      },
    },

    annuaire: {
      async listProfessionals(params: ProfessionalListParams) {
        const filtered = data.professionals.filter((row) => {
          if (!row.isActive) return false;
          if (!params.includeFictional && row.isFictional) return false;
          if (params.city && foldForSearch(row.city) !== foldForSearch(params.city)) return false;
          if (params.language && !row.languages.includes(params.language)) return false;
          if (params.modality && !row.modalities.includes(params.modality)) return false;
          if (params.specialty && !row.specialties.includes(params.specialty)) return false;
          if (params.acceptsNewPatients !== undefined && row.acceptsNewPatients !== params.acceptsNewPatients) {
            return false;
          }
          return true;
        });
        const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        return {
          items: sorted.slice(params.offset, params.offset + params.limit),
          total: sorted.length,
        };
      },
      async findProfessional(id) {
        return data.professionals.find((row) => row.id === id && row.isActive);
      },
      async listFilterValues() {
        const uniq = (values: string[]) => [...new Set(values)].sort();
        return {
          cities: uniq(data.professionals.map((row) => row.city)),
          regions: uniq(data.professionals.map((row) => row.region)),
          languages: uniq(data.professionals.flatMap((row) => row.languages)),
          specialties: uniq(data.professionals.flatMap((row) => row.specialties)),
          modalities: uniq(data.professionals.flatMap((row) => row.modalities)),
        };
      },
      async listAssociations(city) {
        return data.associations
          .filter((row) => row.isActive && (!city || foldForSearch(row.city) === foldForSearch(city)))
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      async findAssociation(id) {
        return data.associations.find((row) => row.id === id && row.isActive);
      },
      async createContactRequest(input: NewContactRequest) {
        const row: ContactRequestRow = {
          id: input.id,
          professionalId: input.professionalId,
          sessionId: input.sessionId,
          message: input.message,
          status: "pending",
          createdAt: now(),
        };
        data.contactRequests.push(row);
        return row;
      },
    },

    resources: {
      async list(params: ResourceListParams) {
        const query = params.query ? foldForSearch(params.query) : null;
        const filtered = data.resources.filter((row) => {
          if (!row.isPublished) return false;
          if (params.type && row.type !== params.type) return false;
          if (params.tag && !row.tags.includes(params.tag)) return false;
          if (params.offlineOnly && !row.isOfflineAvailable) return false;
          if (query) {
            const haystack = foldForSearch(`${row.title} ${row.summary} ${row.titleMg ?? ""}`);
            if (!haystack.includes(query)) return false;
          }
          return true;
        });
        const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        return {
          items: sorted.slice(params.offset, params.offset + params.limit),
          total: sorted.length,
        };
      },
      async findBySlug(slug) {
        return data.resources.find((row) => row.slug === slug && row.isPublished);
      },
      async listOffline() {
        return data.resources
          .filter((row) => row.isPublished && row.isOfflineAvailable)
          .sort((a, b) => a.title.localeCompare(b.title));
      },
      async listTags() {
        return [...new Set(data.resources.flatMap((row) => row.tags))].sort();
      },
    },

    history: {
      async listChatMessages(sessionId, limit) {
        return data.chatMessages
          .filter((row) => row.sessionId === sessionId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
          .slice(0, limit);
      },
      async deleteChatMessages(sessionId) {
        const before = data.chatMessages.length;
        data.chatMessages = data.chatMessages.filter((row) => row.sessionId !== sessionId);
        return before - data.chatMessages.length;
      },
      async listSynthesisCorrections(sessionId) {
        return data.corrections
          .filter((row) => row.sessionId === sessionId)
          .sort((a, b) => a.correctedAt.getTime() - b.correctedAt.getTime());
      },
      async addSynthesisCorrection(input) {
        const row: SynthesisCorrectionRow = {
          id: input.id,
          sessionId: input.sessionId,
          domainId: input.domainId,
          userNote: input.userNote,
          correctedAt: now(),
        };
        data.corrections.push(row);
        return row;
      },
      async listSyntheses(sessionId) {
        return data.syntheses
          .filter((row) => row.sessionId === sessionId)
          .sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
      },
    },

    interview: {
      async createSession(input) {
        const row: InterviewSessionRow = {
          ...input,
          currentPhase: 0,
          status: "active",
          kolbProfile: {},
          createdAt: now(),
          updatedAt: now(),
        };
        data.interviewSessions.push(row);
        return row;
      },
      async findSessionById(id) {
        return data.interviewSessions.find((s) => s.id === id);
      },
      async findActiveSessionByUser(userId) {
        return data.interviewSessions
          .filter((s) => s.userId === userId && s.status === "active")
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
      },
      async updateSession(id, patch) {
        const row = data.interviewSessions.find((s) => s.id === id);
        if (!row) return undefined;
        Object.assign(row, patch, { updatedAt: now() });
        return row;
      },
      async addTurn(turn) {
        const row: InterviewTurnRow = {
          ...turn,
          methodUsed: turn.methodUsed ?? null,
          questionGoal: turn.questionGoal ?? null,
          createdAt: now(),
        };
        data.interviewTurns.push(row);
        return row;
      },
      async listTurns(interviewSessionId) {
        return data.interviewTurns
          .filter((t) => t.interviewSessionId === interviewSessionId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      },
      async addEvidence(item) {
        const row: EvidenceItemRow = {
          ...item,
          turnId: item.turnId ?? null,
          period: item.period ?? null,
          confidence: item.confidence ?? "low",
          createdAt: now(),
        };
        data.evidenceItems.push(row);
        return row;
      },
      async saveProfileDelta(snap) {
        const row: ProfileSnapshotRow = { ...snap, turnId: snap.turnId ?? null, createdAt: now() };
        data.profileSnapshots.push(row);
        return row;
      },
      async listProfileDeltas(userId) {
        return data.profileSnapshots
          .filter((s) => s.userId === userId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      },
    },

    profile: {
      async addLifeEvent(event) {
        const row: LifeEventRow = {
          ...event,
          period: event.period ?? null,
          emotion: event.emotion ?? null,
          meaningGiven: event.meaningGiven ?? null,
          decision: event.decision ?? null,
          consequence: event.consequence ?? null,
          evidenceIds: event.evidenceIds ?? null,
          createdAt: now(),
        };
        data.lifeEvents.push(row);
        return row;
      },
      async listLifeEvents(userId) {
        return data.lifeEvents
          .filter((e) => e.userId === userId)
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      },
      async upsertIdentityDomain(input) {
        const existing = data.identityDomains.find(
          (d) => d.userId === input.userId && d.domain === input.domain
        );
        if (existing) {
          Object.assign(existing, { content: input.content, evidenceIds: input.evidenceIds ?? null, confidence: input.confidence ?? "low", updatedAt: now() });
          return existing;
        }
        const row: IdentityDomainRow = { ...input, confidence: input.confidence ?? "low", evidenceIds: input.evidenceIds ?? null, updatedAt: now() };
        data.identityDomains.push(row);
        return row;
      },
      async listIdentityDomains(userId) {
        return data.identityDomains.filter((d) => d.userId === userId);
      },
      async upsertValue(input) {
        const existing = data.valuesMap.find(
          (v) => v.userId === input.userId && v.valueName === input.valueName
        );
        if (existing) {
          Object.assign(existing, {
            claimedImportance: input.claimedImportance ?? "medium",
            behaviorExamples: input.behaviorExamples ?? [],
            conflicts: input.conflicts ?? [],
            confidence: input.confidence ?? "low",
            updatedAt: now(),
          });
          return existing;
        }
        const row: ValuesMapRow = {
          ...input,
          claimedImportance: input.claimedImportance ?? "medium",
          behaviorExamples: input.behaviorExamples ?? [],
          conflicts: input.conflicts ?? [],
          confidence: input.confidence ?? "low",
          updatedAt: now(),
        };
        data.valuesMap.push(row);
        return row;
      },
      async listValues(userId) {
        return data.valuesMap.filter((v) => v.userId === userId);
      },
      async addBehaviorPattern(input) {
        const row: BehaviorPatternRow = {
          ...input,
          interpretation: input.interpretation ?? null,
          emotion: input.emotion ?? null,
          action: input.action ?? null,
          shortTermResult: input.shortTermResult ?? null,
          longTermResult: input.longTermResult ?? null,
          evidenceFor: input.evidenceFor ?? null,
          evidenceAgainst: input.evidenceAgainst ?? null,
          confidence: input.confidence ?? "low",
          createdAt: now(),
          updatedAt: now(),
        };
        data.behaviorPatterns.push(row);
        return row;
      },
      async listBehaviorPatterns(userId) {
        return data.behaviorPatterns.filter((p) => p.userId === userId);
      },
      async addHypothesis(input) {
        const row: HypothesisRow = {
          ...input,
          evidenceFor: input.evidenceFor ?? null,
          evidenceAgainst: input.evidenceAgainst ?? null,
          confidence: input.confidence ?? "low",
          status: input.status ?? "exploring",
          userCorrection: null,
          createdAt: now(),
          updatedAt: now(),
        };
        data.hypotheses.push(row);
        return row;
      },
      async updateHypothesis(id, patch) {
        const row = data.hypotheses.find((h) => h.id === id);
        if (!row) return undefined;
        Object.assign(row, patch, { updatedAt: now() });
        return row;
      },
      async listHypotheses(userId) {
        return data.hypotheses.filter((h) => h.userId === userId);
      },
      async addContradiction(input) {
        const row: ContradictionRow = {
          ...input,
          contextDifference: input.contextDifference ?? null,
          status: input.status ?? "open",
          createdAt: now(),
        };
        data.contradictions.push(row);
        return row;
      },
      async listContradictions(userId) {
        return data.contradictions.filter((c) => c.userId === userId);
      },
      async upsertLearningPreferences(input) {
        const existing = data.learningPreferences.find((l) => l.userId === input.userId);
        if (existing) {
          Object.assign(existing, {
            domain: input.domain ?? null,
            actionScore: input.actionScore ?? 0,
            observationScore: input.observationScore ?? 0,
            conceptualizationScore: input.conceptualizationScore ?? 0,
            applicationScore: input.applicationScore ?? 0,
            evidenceIds: input.evidenceIds ?? null,
            lastUpdated: now(),
          });
          return existing;
        }
        const row: LearningPreferencesRow = {
          ...input,
          domain: input.domain ?? null,
          evidenceIds: input.evidenceIds ?? null,
          actionScore: input.actionScore ?? 0,
          observationScore: input.observationScore ?? 0,
          conceptualizationScore: input.conceptualizationScore ?? 0,
          applicationScore: input.applicationScore ?? 0,
          lastUpdated: now(),
        };
        data.learningPreferences.push(row);
        return row;
      },
      async getLearningPreferences(userId) {
        return data.learningPreferences.find((l) => l.userId === userId);
      },
    },

    activities: {
      async findBySlug(slug) {
        return data.activityLibrary.find((a) => a.slug === slug);
      },
      async listAll() {
        return [...data.activityLibrary].sort((a, b) => a.category.localeCompare(b.category));
      },
      async listActive() {
        return data.activityLibrary
          .filter((a) => a.isActive)
          .sort((a, b) => a.category.localeCompare(b.category));
      },
      async createSession(input) {
        const row: ActivitySessionRow = {
          ...input,
          startedAt: now(),
          completedAt: null,
          feedback: null,
          feedbackNote: null,
          wasAbandoned: false,
        };
        data.activitySessions.push(row);
        return row;
      },
      async completeSession(id, feedback, feedbackNote) {
        const row = data.activitySessions.find((s) => s.id === id);
        if (!row) return undefined;
        row.completedAt = now();
        row.feedback = feedback ?? null;
        row.feedbackNote = feedbackNote ?? null;
        return row;
      },
      async abandonSession(id) {
        const row = data.activitySessions.find((s) => s.id === id);
        if (row) {
          row.wasAbandoned = true;
          row.completedAt = now();
        }
      },
      async listUserSessions(userId, limit = 20) {
        return data.activitySessions
          .filter((s) => s.userId === userId)
          .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
          .slice(0, limit);
      },
    },
  };
}

export type { ReactionType };
