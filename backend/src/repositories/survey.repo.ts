import { and, asc, eq, inArray } from "drizzle-orm";
import { surveyAnswers, surveyQuestions } from "../db/schema";
import type { SurveyAnswerRow, SurveyQuestionRow } from "../db/schema";
import type { DB } from "../db/types";

export type NewSurveyAnswer = {
  id: string;
  sessionId: string;
  surveyType: string;
  questionId: string;
  questionText: string;
  choicesSnapshot: unknown;
  choiceIds: string[] | null;
  textAnswer: string | null;
  skipped: boolean;
  domain: string;
  answeredAt: Date;
};

export interface SurveyRepo {
  /** Questions actives d'un sondage, dans l'ordre d'affichage. */
  listQuestions(surveyType: string): Promise<SurveyQuestionRow[]>;
  findQuestion(surveyType: string, questionId: string): Promise<SurveyQuestionRow | undefined>;
  listAnswers(sessionId: string, surveyType?: string): Promise<SurveyAnswerRow[]>;
  /** Une seule réponse courante par question : l'utilisateur peut la modifier. */
  upsertAnswer(data: NewSurveyAnswer): Promise<SurveyAnswerRow>;
  deleteAnswers(sessionId: string, surveyType?: string): Promise<number>;
}

export function createSurveyRepo(db: DB): SurveyRepo {
  const withType = (sessionId: string, surveyType?: string) =>
    surveyType
      ? and(eq(surveyAnswers.sessionId, sessionId), eq(surveyAnswers.surveyType, surveyType))
      : eq(surveyAnswers.sessionId, sessionId);

  return {
    async listQuestions(surveyType) {
      return db
        .select()
        .from(surveyQuestions)
        .where(and(eq(surveyQuestions.surveyType, surveyType), eq(surveyQuestions.isActive, true)))
        .orderBy(asc(surveyQuestions.position));
    },

    async findQuestion(surveyType, questionId) {
      const [row] = await db
        .select()
        .from(surveyQuestions)
        .where(
          and(
            eq(surveyQuestions.surveyType, surveyType),
            eq(surveyQuestions.id, questionId),
            eq(surveyQuestions.isActive, true)
          )
        )
        .limit(1);
      return row;
    },

    async listAnswers(sessionId, surveyType) {
      return db
        .select()
        .from(surveyAnswers)
        .where(withType(sessionId, surveyType))
        .orderBy(asc(surveyAnswers.answeredAt));
    },

    async upsertAnswer(data) {
      const [row] = await db
        .insert(surveyAnswers)
        .values(data)
        .onConflictDoUpdate({
          target: [surveyAnswers.sessionId, surveyAnswers.surveyType, surveyAnswers.questionId],
          set: {
            questionText: data.questionText,
            choicesSnapshot: data.choicesSnapshot,
            choiceIds: data.choiceIds,
            textAnswer: data.textAnswer,
            skipped: data.skipped,
            domain: data.domain,
            answeredAt: data.answeredAt,
          },
        })
        .returning();
      return row as SurveyAnswerRow;
    },

    async deleteAnswers(sessionId, surveyType) {
      const deleted = await db
        .delete(surveyAnswers)
        .where(withType(sessionId, surveyType))
        .returning({ id: surveyAnswers.id });
      return deleted.length;
    },
  };
}

/** Supprime toutes les réponses d'une liste de sessions (suppression d'historique). */
export async function deleteAnswersForSessions(
  db: DB,
  sessionIds: string[]
): Promise<number> {
  if (sessionIds.length === 0) return 0;
  const deleted = await db
    .delete(surveyAnswers)
    .where(inArray(surveyAnswers.sessionId, sessionIds))
    .returning({ id: surveyAnswers.id });
  return deleted.length;
}
