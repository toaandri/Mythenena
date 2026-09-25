import { describe, expect, it } from "vitest";
import { authHeaders, authRequest, createTestContext, startSession } from "./helpers/testApp";

describe("GET /api/survey/mini", () => {
  it("exige une session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/survey/mini");
    expect(response.status).toBe(401);
  });

  it("renvoie les 5 questions avec leurs choix et la progression", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request("/api/survey/mini", {
      headers: authHeaders(session.token),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.questions).toHaveLength(5);
    expect(body.questions[0]).toMatchObject({ id: "mini-mood", allowSkip: true, domain: "mood" });
    expect(body.questions[0].choices.length).toBeGreaterThan(0);
    expect(body.progress.total).toBe(5);
    expect(body.progress.completed).toBe(false);
  });
});

describe("POST /api/survey/mini/answer", () => {
  it("enregistre une réponse choisie", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", { questionId: "mini-mood", choiceIds: ["mood-low"] })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.answer.skipped).toBe(false);
    expect(body.answer.choiceIds).toEqual(["mood-low"]);
    expect(body.progress.answered).toBe(1);
  });

  it("enregistre une question passée sans choix, et ne la compte pas comme une réponse", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", { questionId: "mini-mood", skipped: true })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.answer.skipped).toBe(true);
    expect(body.answer.choiceIds).toBeNull();

    // Garde-fou central : une non-réponse n'est jamais comptée comme une réponse.
    expect(body.progress.answered).toBe(0);
    expect(body.progress.skipped).toBe(1);
    expect(body.progress.remaining).toBe(4);
  });

  it("refuse un identifiant de question inconnu", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", { questionId: "question-inventee", choiceIds: [] })
    );

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("question_not_found");
  });

  it("refuse un choix qui n'appartient pas à la question et n'enregistre rien", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", { questionId: "mini-mood", choiceIds: ["choix-invente"] })
    );

    expect(response.status).toBe(400);
    expect(ctx.data.answers).toHaveLength(0);
  });

  it("refuse plusieurs choix pour une question à choix unique", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", {
        questionId: "mini-mood",
        choiceIds: ["mood-good", "mood-low"],
      })
    );

    expect(response.status).toBe(400);
    expect(ctx.data.answers).toHaveLength(0);
  });

  it("refuse une réponse vide sans passer", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", { questionId: "mini-mood", choiceIds: [] })
    );

    expect(response.status).toBe(400);
    expect(ctx.data.answers).toHaveLength(0);
  });
});

describe("POST /api/survey/mini/answers", () => {
  it("accepte un lot de réponses et n'isole que la session courante", async () => {
    const ctx = createTestContext();
    const alice = await startSession(ctx, { pseudonym: "Alice Test" });
    const bob = await startSession(ctx, { pseudonym: "Bob Test" });

    await ctx.app.request(
      "/api/survey/mini/answers",
      authRequest(alice.token, "POST", {
        answers: [
          { questionId: "mini-mood", choiceIds: ["mood-good"] },
          { questionId: "mini-sleep", skipped: true },
        ],
      })
    );
    await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(bob.token, "POST", { questionId: "mini-stress", choiceIds: ["stress-calm"] })
    );

    const view = await ctx.app.request("/api/survey/mini", {
      headers: authHeaders(alice.token),
    });
    const body = await view.json();

    expect(body.progress.answers).toHaveLength(2);
    expect(body.progress.answered).toBe(1);
    expect(body.progress.skipped).toBe(1);
    expect(ctx.data.answers).toHaveLength(3);
  });

  it("refuse le lot entier si une question est inconnue", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/survey/mini/answers",
      authRequest(session.token, "POST", {
        answers: [
          { questionId: "mini-mood", choiceIds: ["mood-good"] },
          { questionId: "question-inventee", choiceIds: [] },
        ],
      })
    );

    expect(response.status).toBe(404);
    expect(ctx.data.answers).toHaveLength(0);
  });
});

describe("GET /api/survey/mini/progress", () => {
  it("progresse question par question", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const initial = await (
      await ctx.app.request("/api/survey/mini/progress", { headers: authHeaders(session.token) })
    ).json();
    expect(initial).toMatchObject({ total: 5, answered: 0, skipped: 0, remaining: 5, completed: false });

    for (const questionId of ["mini-mood", "mini-sleep", "mini-stress"]) {
      await ctx.app.request(
        "/api/survey/mini/answer",
        authRequest(session.token, "POST", { questionId, skipped: true })
      );
    }

    const after = await (
      await ctx.app.request("/api/survey/mini/progress", { headers: authHeaders(session.token) })
    ).json();
    expect(after).toMatchObject({ total: 5, answered: 0, skipped: 3, remaining: 2, completed: false });
  });

  it("marque le questionnaire terminé quand les 5 questions sont passées", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    for (const questionId of [
      "mini-mood",
      "mini-sleep",
      "mini-stress",
      "mini-relationships",
      "mini-motivation",
    ]) {
      await ctx.app.request(
        "/api/survey/mini/answer",
        authRequest(session.token, "POST", { questionId, skipped: true })
      );
    }

    const body = await (
      await ctx.app.request("/api/survey/mini/progress", { headers: authHeaders(session.token) })
    ).json();

    expect(body.completed).toBe(true);
    // Un questionnaire entièrement passé ne produit aucune information exploitable.
    expect(body.answered).toBe(0);
    expect(body.skipped).toBe(5);
  });

  it("remplace une réponse si la question est rejouée", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    for (const choiceIds of [["mood-good"], ["mood-low"]]) {
      await ctx.app.request(
        "/api/survey/mini/answer",
        authRequest(session.token, "POST", { questionId: "mini-mood", choiceIds })
      );
    }

    expect(ctx.data.answers).toHaveLength(1);
    expect(ctx.data.answers[0].choiceIds).toEqual(["mood-low"]);
  });

  it("ne considère pas les réponses d'un autre type de questionnaire", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    ctx.data.answers.push({
      id: "adaptive-1",
      sessionId: session.sessionId,
      surveyType: "adaptive",
      questionId: "q-adaptive",
      questionText: "Question adaptative",
      choicesSnapshot: [],
      choiceIds: ["x"],
      textAnswer: null,
      skipped: false,
      domain: "mood",
      answeredAt: new Date(),
    });

    const body = await (
      await ctx.app.request("/api/survey/mini/progress", { headers: authHeaders(session.token) })
    ).json();

    expect(body.answered).toBe(0);
  });
});
