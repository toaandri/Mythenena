/**
 * Contrats de l'API — les formes renvoyées au client.
 *
 * Règle transverse : aucun DTO n'expose `authorSessionId` ni `reporterSessionId`.
 * Le pseudonyme est la seule identité visible dans l'espace communautaire.
 */

import type { Language, QuestionType, SurveyDomain } from "../../../shared/types/survey";
import type { EmergencyResource } from "../../../shared/types/chat";
import type { ReactionType, ReportReason, ReportStatus, ReportTargetType } from "./forum";
import type { ResourceType } from "./resource";

export const DISCLAIMER_FR =
  "Mythenena est un outil d'écoute, de pré-dépistage et de soutien entre pairs. " +
  "Ce n'est pas un service médical et ne remplace pas une consultation.";

export const DISCLAIMER_MG =
  "Ny Mythenena dia fitaovana hanampy amin'ny fandrenesana, fanadihadiana ary fiainana miaraka. " +
  "Tsy serivisy ara-pitsaboana izy ary tsy solo-soloin'ny fan visitsika mpitsaboana.";

// --- Session -----------------------------------------------------------------

export interface SessionDto {
  id: string;
  pseudonym: string;
  pseudonymSource: "generated" | "custom";
  avatarSeed: string;
  language: Language;
  retainHistory: boolean;
  createdAt: string;
}

export interface StartSessionResponse {
  token: string;
  session: SessionDto;
  disclaimer: string;
}

// --- Mini-sondage ------------------------------------------------------------

export interface SurveyChoiceDto {
  id: string;
  label: string;
  labelMg?: string;
}

export interface SurveyQuestionDto {
  id: string;
  domain: SurveyDomain;
  type: QuestionType;
  text: string;
  textMg?: string;
  choices: SurveyChoiceDto[];
  scaleMin?: number;
  scaleMax?: number;
  /** Le bouton « Passer » est toujours disponible sur le mini-sondage. */
  allowSkip: boolean;
  position: number;
}

export interface SurveyAnswerDto {
  questionId: string;
  choiceIds: string[] | null;
  textAnswer: string | null;
  skipped: boolean;
  answeredAt: string;
}

export interface MiniSurveyProgress {
  total: number;
  answered: number;
  /** Questions passées : elles restent des informations INCONNUES. */
  skipped: number;
  remaining: number;
  completed: boolean;
  answers: SurveyAnswerDto[];
}

// --- Forum -------------------------------------------------------------------

export interface ReactionSummaryDto {
  type: ReactionType;
  count: number;
  /** true si le lecteur courant a déjà posé cette réaction. */
  active: boolean;
}

export interface ForumPostDto {
  id: string;
  pseudonym: string;
  avatarSeed: string;
  content: string;
  categoryId: string;
  categorySlug?: string;
  categoryLabel?: string;
  repliesCount: number;
  reactions: ReactionSummaryDto[];
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
  isFlagged: boolean;
}

export interface ForumReplyDto {
  id: string;
  postId: string;
  pseudonym: string;
  avatarSeed: string;
  content: string;
  reactions: ReactionSummaryDto[];
  createdAt: string;
  isMine: boolean;
  isFlagged: boolean;
}

export interface ForumPostDetailDto {
  post: ForumPostDto;
  replies: ForumReplyDto[];
}

export interface ForumReportDto {
  id: string;
  targetId: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  /** Aperçu du contenu signalé, pour éviter au modérateur d'ouvrir chaque cible. */
  targetPreview: string | null;
  targetExists: boolean;
}

// --- Annuaire ----------------------------------------------------------------

export interface ProfessionalDto {
  id: string;
  name: string;
  title: string;
  city: string;
  region: string;
  languages: string[];
  specialties: string[];
  modalities: string[];
  phone: string | null;
  email: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  bio: string | null;
  fee: string | null;
  schedule: string | null;
  lastVerified: string;
  /** Les fiches de démonstration sont signalées et ne permettent aucun contact. */
  isFictional: boolean;
  acceptsNewPatients: boolean;
  contactEnabled: boolean;
}

export interface AssociationDto {
  id: string;
  name: string;
  description: string;
  descriptionMg: string | null;
  city: string;
  region: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  lastVerified: string;
  isFictional: boolean;
}

export interface AnnuaireFiltersDto {
  cities: string[];
  regions: string[];
  languages: string[];
  specialties: string[];
  modalities: string[];
}

// --- Ressources --------------------------------------------------------------

export interface ResourceSummaryDto {
  id: string;
  slug: string;
  type: ResourceType;
  title: string;
  titleMg: string | null;
  summary: string;
  summaryMg: string | null;
  tags: string[];
  readingMinutes: number | null;
  isOfflineAvailable: boolean;
  publishedAt: string | null;
}

export interface ResourceDto extends ResourceSummaryDto {
  body: string;
  bodyMg: string | null;
  author: string | null;
}

export interface EmergencyResourcesDto {
  resources: EmergencyResource[];
  disclaimer: string;
  /** La détection automatique ne garantit pas l'absence de risque. */
  limitations: string;
}
