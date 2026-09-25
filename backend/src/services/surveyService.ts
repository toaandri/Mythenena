/**
 * Mini-sondage (étape 1 du parcours) — logique métier pure.
 *
 * Règle fondatrice : une question passée est une information INCONNUE.
 * Aucun indicateur de risque, aucune alerte et aucune interprétation ne peut
 * être calculé à partir d'une non-réponse. Ce module ne produit donc aucun
 * score : il ne fait que conserver ce que la personne a explicitement déclaré.
 */

import type { QuestionType, SurveyDomain } from "../../../shared/types/survey";
import type { SurveyAnswerRow, SurveyQuestionRow } from "../db/schema";
import type { Repos } from "../repositories";
import type {
  MiniSurveyProgress,
  SurveyAnswerDto,
  SurveyChoiceDto,
  SurveyQuestionDto,
} from "../types/api";
import { ApiError } from "../utils/errors";
import { newId } from "../utils/id";
import { normalizeMultiline, normalizeText } from "../utils/text";

export const MINI_SURVEY_TYPE = "mini";
export const MAX_TEXT_ANSWER_LENGTH = 2000;

function toChoiceDto(raw: unknown): SurveyChoiceDto[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) return [];
    const candidate = entry as { id?: unknown; label?: unknown; labelMg?: unknown };
    if (typeof candidate.id !== "string" || typeof candidate.label !== "string") return [];
    return [
      {
        id: candidate.id,
        label: candidate.label,
        ...(typeof candidate.labelMg === "string" ? { labelMg: candidate.labelMg } : {}),
      },
    ];
  });
}

export function toQuestionDto(row: SurveyQuestionRow): SurveyQuestionDto {
  return {
    id: row.id,
    domain: row.domain as SurveyDomain,
    type: row.type as QuestionType,
    text: row.text,
    ...(row.textMg ? { textMg: row.textMg } : {}),
    choices: toChoiceDto(row.choices),
    ...(row.scaleMin !== null ? { scaleMin: row.scaleMin } : {}),
    ...(row.scaleMax !== null ? { scaleMax: row.scaleMax } : {}),
    allowSkip: row.allowSkip,
    position: row.position,
  };
}

export function toAnswerDto(row: SurveyAnswerRow): SurveyAnswerDto {
  return {
    questionId: row.questionId,
    choiceIds: row.choiceIds,
    textAnswer: row.textAnswer,
    skipped: row.skipped,
    answeredAt: row.answeredAt.toISOString(),
  };
}

export interface SubmitAnswerInput {
  questionId: string;
  choiceIds?: string[] | null;
  textAnswer?: string | null;
  /** true = l'utilisateur a cliqué sur « Passer ». */
  skipped: boolean;
}

/** Résultat de la validation sémantique d'une réponse face à sa question. */
export interface ValidatedAnswer {
  questionText: string;
  choicesSnapshot: SurveyChoiceDto[];
  choiceIds: string[] | null;
  textAnswer: string | null;
  skipped: boolean;
  domain: string;
}

export function validateAnswer(
  question: SurveyQuestionRow,
  input: SubmitAnswerInput
): ValidatedAnswer {
  const choices = toChoiceDto(question.choices);

  if (input.skipped) {
    // Une non-réponse ne porte AUCUNE information : elle est stockée comme telle.
    return {
      questionText: question.text,
      choicesSnapshot: choices,
      choiceIds: null,
      textAnswer: null,
      skipped: true,
      domain: question.domain,
    };
  }

  if (question.type === "text") {
    const text = input.textAnswer ? normalizeText(input.textAnswer, MAX_TEXT_ANSWER_LENGTH) : "";
    if (text.length === 0) {
      throw ApiError.validation(
        "Cette question attend un texte. Tu peux aussi choisir « Passer ».",
        { field: "textAnswer" }
      );
    }
    return {
      questionText: question.text,
      choicesSnapshot: choices,
      choiceIds: null,
      textAnswer: text,
      skipped: false,
      domain: question.domain,
    };
  }

  if (choices.length > 0) {
    const requested = (input.choiceIds ?? []).map((id) => normalizeText(id, 64));
    const known = new Set(choices.map((choice) => choice.id));

    const unknown = requested.filter((id) => !known.has(id));
    if (unknown.length > 0) {
      throw ApiError.validation("Une ou plusieurs réponses ne correspondent pas à cette question.", {
        field: "choiceIds",
        unknown,
      });
    }

    const unique = [...new Set(requested)];
    if (unique.length === 0) {
      throw ApiError.validation(
        "Choisis au moins une réponse, ou utilise « Passer » si tu ne veux pas répondre.",
        { field: "choiceIds" }
      );
    }
    if (question.type === "single" && unique.length > 1) {
      throw ApiError.validation("Cette question n'accepte qu'une seule réponse.", {
        field: "choiceIds",
      });
    }

    return {
      questionText: question.text,
      choicesSnapshot: choices,
      choiceIds: unique,
      textAnswer: null,
      skipped: false,
      domain: question.domain,
    };
  }

  // Question à échelle : la valeur est stockée comme un choix.
  if (input.choiceIds && input.choiceIds.length > 0) {
    const value = normalizeText(input.choiceIds[0] as string, 16);
    return {
      questionText: question.text,
      choicesSnapshot: choices,
      choiceIds: [value],
      textAnswer: null,
      skipped: false,
      domain: question.domain,
    };
  }

  const text = input.textAnswer ? normalizeMultiline(input.textAnswer, MAX_TEXT_ANSWER_LENGTH) : "";
  if (text.length === 0) {
    throw ApiError.validation(
      "Choisis une réponse, ou utilise « Passer » si tu ne veux pas répondre.",
      { field: "choiceIds" }
    );
  }

  return {
    questionText: question.text,
    choicesSnapshot: choices,
    choiceIds: null,
    textAnswer: text,
    skipped: false,
    domain: question.domain,
  };
}

export async function saveAnswer(
  repos: Repos,
  sessionId: string,
  question: SurveyQuestionRow,
  input: SubmitAnswerInput
): Promise<SurveyAnswerRow> {
  const validated = validateAnswer(question, input);
  return repos.surveys.upsertAnswer({
    id: newId(),
    sessionId,
    surveyType: question.surveyType,
    questionId: question.id,
    questionText: validated.questionText,
    choicesSnapshot: validated.choicesSnapshot,
    choiceIds: validated.choiceIds,
    textAnswer: validated.textAnswer,
    skipped: validated.skipped,
    domain: validated.domain,
    answeredAt: new Date(),
  });
}

export async function getMiniProgress(
  repos: Repos,
  sessionId: string
): Promise<MiniSurveyProgress> {
  const [questions, answers] = await Promise.all([
    repos.surveys.listQuestions(MINI_SURVEY_TYPE),
    repos.surveys.listAnswers(sessionId, MINI_SURVEY_TYPE),
  ]);

  const skipped = answers.filter((answer) => answer.skipped).length;
  const answered = answers.length - skipped;
  const total = questions.length;

  return {
    total,
    answered,
    skipped,
    remaining: Math.max(total - answers.length, 0),
    completed: total > 0 && answers.length >= total,
    answers: answers.map(toAnswerDto),
  };
}

export interface MiniSurveyView {
  questions: SurveyQuestionDto[];
  progress: MiniSurveyProgress;
}

export async function getMiniSurvey(repos: Repos, sessionId: string): Promise<MiniSurveyView> {
  const [questions, progress] = await Promise.all([
    repos.surveys.listQuestions(MINI_SURVEY_TYPE),
    getMiniProgress(repos, sessionId),
  ]);
  return { questions: questions.map(toQuestionDto), progress };
}
