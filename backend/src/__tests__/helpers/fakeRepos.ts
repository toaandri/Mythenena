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
  };
}

export type { ReactionType };
