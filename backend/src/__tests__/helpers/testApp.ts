import type { AppConfig } from "../../config/config";
import { createApp } from "../../app";
import { createFakeData, createFakeRepos, type FakeData } from "./fakeRepos";
import type { Hono } from "hono";
import type { AppBindings } from "../../types/context";
import type { SurveyQuestionRow } from "../../db/schema";

export const TEST_JWT_SECRET = "secret_de_test_sufficientement_long_pour_hs256";

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    nodeEnv: "test",
    port: 4000,
    jwtSecret: TEST_JWT_SECRET,
    jwtTtlSeconds: 3600,
    corsOrigins: ["http://localhost:3000"],
    moderatorTokens: ["jeton-moderateur-de-test"],
    apiBaseUrl: "http://localhost:4000",
    ...overrides,
  };
}

export interface TestContext {
  app: Hono<AppBindings>;
  data: FakeData;
}

/** Les 5 questions du mini-sondage, alignées sur ce que produit le seed. */
export function miniQuestions(): SurveyQuestionRow[] {
  const base = {
    surveyType: "mini",
    type: "single",
    allowSkip: true,
    scaleMin: null,
    scaleMax: null,
    isActive: true,
  };
  return [
    {
      ...base,
      id: "mini-mood",
      domain: "mood",
      text: "Comment décrirais-tu ton humeur ?",
      textMg: "Ahoana ny toe-tsainao?",
      choices: [
        { id: "mood-good", label: "Plutôt bien" },
        { id: "mood-low", label: "Souvent bas" },
      ],
      position: 1,
    },
    {
      ...base,
      id: "mini-sleep",
      domain: "sleep",
      text: "Comment s'est passé ton sommeil ?",
      textMg: "Ahoana ny torimasonao?",
      choices: [
        { id: "sleep-good", label: "J'ai dormi normalement" },
        { id: "sleep-hard", label: "Difficulté à m'endormir" },
      ],
      position: 2,
    },
    {
      ...base,
      id: "mini-stress",
      domain: "stress",
      text: "Face aux pressions, tu te sens…",
      textMg: "Ny ziogan-tra…",
      choices: [
        { id: "stress-calm", label: "Je gère" },
        { id: "stress-overwhelmed", label: "Je ne sais plus" },
      ],
      position: 3,
    },
    {
      ...base,
      id: "mini-relationships",
      domain: "relationships",
      text: "Dans tes relations proches…",
      textMg: "Ao amin'ny fifandraisanao…",
      choices: [
        { id: "rel-supported", label: "Je me sens soutenu(e)" },
        { id: "rel-alone", label: "Souvent seul(e)" },
      ],
      position: 4,
    },
    {
      ...base,
      id: "mini-motivation",
      domain: "motivation",
      text: "Pour les choses simples du quotidien…",
      textMg: "Ho an'ny zavatra tsotra…",
      choices: [
        { id: "motivation-ok", label: "J'ai encore envie" },
        { id: "motivation-very-low", label: "Plus envie de rien" },
      ],
      position: 5,
    },
  ];
}

export function createTestContext(overrides: Partial<AppConfig> = {}): TestContext {
  const data = createFakeData();
  data.questions = miniQuestions();
  data.categories = [
    {
      id: "cat-stress",
      slug: "stress",
      labelFr: "Stress",
      labelMg: "Stress",
      description: "Partager le quotidien",
      icon: "wind",
      position: 1,
      isActive: true,
    },
    {
      id: "cat-isolation",
      slug: "isolement",
      labelFr: "Se sentir seul(e)",
      labelMg: "Mihevy fa irery",
      description: "Parole libre",
      icon: "users",
      position: 2,
      isActive: true,
    },
  ];
  return {
    app: createApp({ repos: createFakeRepos(data), config: testConfig(overrides) }),
    data,
  };
}

/** Démarre une session et renvoie son jeton d'authentification. */
export async function startSession(
  ctx: TestContext,
  body: Record<string, unknown> = {}
): Promise<{ token: string; sessionId: string; pseudonym: string }> {
  const response = await ctx.app.request("/api/session/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  return {
    token: payload.token,
    sessionId: payload.session.id,
    pseudonym: payload.session.pseudonym,
  };
}

export function authHeaders(token: string): Record<string, string> {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function jsonRequest(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

/**
 * Requête JSON authentifiée. L'en-tête d'autorisation est fusionné APRÈS le
 * corps de la requête : il ne doit jamais pouvoir être écrasé.
 */
export function authRequest(token: string, method: string, body: unknown): RequestInit {
  return {
    method,
    headers: authHeaders(token),
    body: JSON.stringify(body),
  };
}
