import type { Language } from "../../../shared/types/survey";
import type { SessionRow } from "../db/schema";
import type { Repos } from "../repositories";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import { normalizeText } from "../utils/text";
import {
  buildAvatarSeed,
  buildPseudonym,
  type RandomSource,
} from "./pseudonymService";

export const PSEUDONYM_MIN_LENGTH = 3;
export const PSEUDONYM_MAX_LENGTH = 32;
const PSEUDONYM_ATTEMPTS = 8;

const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_PATTERN = /(\+?\d[\d\s().-]{6,}\d)/;

export interface CreateSessionInput {
  language: Language;
  retainHistory: boolean;
  pseudonym?: string;
  random?: RandomSource;
}

/**
 * Un pseudonyme ne doit pas devenir un canal de diffusion d'informations
 * personnelles : on refuse les adresses e-mail et les numéros de téléphone.
 */
export function assertUsablePseudonym(value: string): string {
  const pseudonym = normalizeText(value, PSEUDONYM_MAX_LENGTH + 1);
  if (pseudonym.length < PSEUDONYM_MIN_LENGTH) {
    throw ApiError.validation(
      `Le pseudonyme doit contenir entre ${PSEUDONYM_MIN_LENGTH} et ${PSEUDONYM_MAX_LENGTH} caractères.`
    );
  }
  if (pseudonym.length > PSEUDONYM_MAX_LENGTH) {
    throw ApiError.validation(
      `Le pseudonyme doit contenir entre ${PSEUDONYM_MIN_LENGTH} et ${PSEUDONYM_MAX_LENGTH} caractères.`
    );
  }
  if (EMAIL_PATTERN.test(pseudonym)) {
    throw ApiError.validation(
      "Le pseudonyme ne peut pas contenir d'adresse e-mail : l'anonymat passe avant tout."
    );
  }
  if (PHONE_PATTERN.test(pseudonym)) {
    throw ApiError.validation(
      "Le pseudonyme ne peut pas contenir de numéro de téléphone : l'anonymat passe avant tout."
    );
  }
  return pseudonym;
}

export async function createSession(
  repos: Repos,
  input: CreateSessionInput
): Promise<SessionRow> {
  const random = input.random ?? Math.random;

  if (input.pseudonym) {
    const requested = assertUsablePseudonym(input.pseudonym);
    const taken = await repos.sessions.findByPseudonym(requested);
    if (taken) {
      throw ApiError.conflict("Ce pseudonyme est déjà utilisé. Choisis-en un autre.", "pseudonym_taken");
    }
    return repos.sessions.create({
      id: newId(),
      pseudonym: requested,
      pseudonymSource: "custom",
      avatarSeed: buildAvatarSeed(random),
      language: input.language,
      retainHistory: input.retainHistory,
    });
  }

  for (let attempt = 0; attempt < PSEUDONYM_ATTEMPTS; attempt += 1) {
    const candidate = buildPseudonym(input.language, random);
    const taken = await repos.sessions.findByPseudonym(candidate);
    if (taken) continue;
    return repos.sessions.create({
      id: newId(),
      pseudonym: candidate,
      pseudonymSource: "generated",
      avatarSeed: buildAvatarSeed(random),
      language: input.language,
      retainHistory: input.retainHistory,
    });
  }

  throw new ApiError(
    503,
    "pseudonym_unavailable",
    "Impossible de générer un pseudonyme unique pour le moment. Réessaie dans un instant."
  );
}

export async function updatePseudonym(
  repos: Repos,
  sessionId: string,
  requested: string
): Promise<SessionRow> {
  const pseudonym = assertUsablePseudonym(requested);
  if (pseudonym.toLowerCase() !== (await findOrThrow(repos, sessionId)).pseudonym.toLowerCase()) {
    const taken = await repos.sessions.findByPseudonym(pseudonym);
    if (taken && taken.id !== sessionId) {
      throw ApiError.conflict("Ce pseudonyme est déjà utilisé. Choisis-en un autre.", "pseudonym_taken");
    }
  }
  const updated = await repos.sessions.update(sessionId, {
    pseudonym,
    pseudonymSource: "custom",
  });
  if (!updated) {
    throw ApiError.notFound("Session introuvable", "session_not_found");
  }
  return updated;
}

export async function findOrThrow(repos: Repos, sessionId: string): Promise<SessionRow> {
  const session = await repos.sessions.findById(sessionId);
  if (!session) {
    throw ApiError.unauthorized("Session introuvable ou supprimée", "session_not_found");
  }
  return session;
}

export interface DeleteScopeCounts {
  surveyAnswers: number;
  chatMessages: number;
  forumPosts: number;
  forumPostsSkipped: number;
}

export const EMPTY_DELETE_COUNTS: DeleteScopeCounts = {
  surveyAnswers: 0,
  chatMessages: 0,
  forumPosts: 0,
  forumPostsSkipped: 0,
};

/** Le journal intime et la conversation sont des données strictement privées. */
export async function clearPrivateHistory(
  repos: Repos,
  sessionId: string,
  scope: "all" | "surveys" | "chat"
): Promise<DeleteScopeCounts> {
  const counts: DeleteScopeCounts = { ...EMPTY_DELETE_COUNTS };
  const withSurveys = scope === "all" || scope === "surveys";
  const withChat = scope === "all" || scope === "chat";

  if (withSurveys) counts.surveyAnswers = await repos.surveys.deleteAnswers(sessionId);
  if (withChat) counts.chatMessages = await repos.history.deleteChatMessages(sessionId);

  return counts;
}
