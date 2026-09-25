import type { DB } from "../db/types";
import { createSessionRepo, type SessionRepo } from "./session.repo";
import { createSurveyRepo, type SurveyRepo } from "./survey.repo";
import { createForumRepo, type ForumRepo } from "./forum.repo";
import { createAnnuaireRepo, type AnnuaireRepo } from "./annuaire.repo";
import { createResourceRepo, type ResourceRepo } from "./resource.repo";
import { createHistoryRepo, type HistoryRepo } from "./resource.repo";

export type {
  SessionRepo,
  SurveyRepo,
  ForumRepo,
  AnnuaireRepo,
  ResourceRepo,
  HistoryRepo,
};
export type { PostWithMeta, NewForumPost, NewForumReply } from "./forum.repo";
export type { NewSession, SessionPatch } from "./session.repo";
export type { NewSurveyAnswer } from "./survey.repo";

/**
 * Ensemble des accès aux données. Les routes ne connaissent que cette
 * interface : les tests les exercent avec des implémentations en mémoire,
 * sans base de données.
 */
export interface Repos {
  sessions: SessionRepo;
  surveys: SurveyRepo;
  forum: ForumRepo;
  annuaire: AnnuaireRepo;
  resources: ResourceRepo;
  history: HistoryRepo;
}

export function createRepos(db: DB): Repos {
  return {
    sessions: createSessionRepo(db),
    surveys: createSurveyRepo(db),
    forum: createForumRepo(db),
    annuaire: createAnnuaireRepo(db),
    resources: createResourceRepo(db),
    history: createHistoryRepo(db),
  };
}
