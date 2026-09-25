import { describe, expect, it } from "vitest";
import { authHeaders, createTestContext, jsonRequest, startSession } from "./helpers/testApp";

describe("POST /api/session/start", () => {
  it("crée une session anonyme avec pseudonyme généré et pseudonyme non vide", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/session/start",
      jsonRequest("POST", { language: "fr" })
    );

    expect(response.status).toBe(201);
    const body = await response.json();

    expect(body.token).toBeTypeOf("string");
    expect(body.session.pseudonym).toBeTypeOf("string");
    expect(body.session.pseudonym.length).toBeGreaterThan(0);
    expect(body.session.avatarSeed).toBeTypeOf("string");
    expect(body.session.language).toBe("fr");
  });

  it("ne conserve pas l'historique par défaut", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/session/start", jsonRequest("POST", {}));
    const body = await response.json();

    expect(body.session.retainHistory).toBe(false);
  });

  it("accepte un pseudonyme choisi par l'utilisateur", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/session/start",
      jsonRequest("POST", { pseudonym: "Horizon Tranquille" })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.session.pseudonym).toBe("Horizon Tranquille");
    expect(body.session.pseudonymSource).toBe("custom");
  });

  it("refuse un pseudonyme contenant une adresse e-mail", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/session/start",
      jsonRequest("POST", { pseudonym: "contact maila@mail.com" })
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error.code).toBe("validation_error");
  });

  it("refuse un pseudonyme contenant un numéro de téléphone", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/session/start",
      jsonRequest("POST", { pseudonym: "Appelle moi 0341123456" })
    );

    expect(response.status).toBe(400);
  });

  it("refuse un pseudonyme déjà pris", async () => {
    const ctx = createTestContext();
    await startSession(ctx, { pseudonym: "Pierre Passage" });

    const response = await ctx.app.request(
      "/api/session/start",
      jsonRequest("POST", { pseudonym: "pierre passage" })
    );

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("pseudonym_taken");
  });

  it("retourne le disclaimer médical", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/session/start", jsonRequest("POST", {}));
    const body = await response.json();

    expect(body.disclaimer).toMatch(/pas un service médical/i);
  });
});

describe("GET /api/session/me", () => {
  it("refuse un accès sans jeton", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/session/me");

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("missing_token");
  });

  it("refuse un jeton falsifié", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/session/me", {
      headers: authHeaders("eyJhbGciOiJIUzI1NiJ9.effet.invalide"),
    });

    expect(response.status).toBe(401);
  });

  it("refuse un jeton signé avec un autre secret", async () => {
    const ctx = createTestContext();
    const other = createTestContext({ jwtSecret: "un_autre_secret_de_test_tres_long_pour_hs256" });
    const session = await startSession(other);

    const response = await ctx.app.request("/api/session/me", {
      headers: authHeaders(session.token),
    });

    expect(response.status).toBe(401);
  });

  it("retourne la session courante", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request("/api/session/me", {
      headers: authHeaders(session.token),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.session.id).toBe(session.sessionId);
    expect(body.session.pseudonym).toBe(session.pseudonym);
  });

  it("rejette un jeton dont la session a été supprimée", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    ctx.data.sessions = ctx.data.sessions.filter((row) => row.id !== session.sessionId);

    const response = await ctx.app.request("/api/session/me", {
      headers: authHeaders(session.token),
    });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("session_not_found");
  });
});

describe("PATCH /api/session/preferences", () => {
  it("met à jour la langue et le choix de conservation", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/session/preferences",
      {
        method: "PATCH",
        headers: authHeaders(session.token),
        body: JSON.stringify({ language: "mg", retainHistory: true }),
      }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.session.language).toBe("mg");
    expect(body.session.retainHistory).toBe(true);
  });

  it("refuse une langue inconnue", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/session/preferences",
      {
        method: "PATCH",
        headers: authHeaders(session.token),
        body: JSON.stringify({ language: "en" }),
      }
    );

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/session/history", () => {
  it("supprime les réponses enregistrées et ne touche pas au forum", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);
    await ctx.app.request(
      "/api/survey/mini/answer",
      {
        method: "POST",
        headers: authHeaders(session.token),
        body: JSON.stringify({ questionId: "mini-mood", choiceIds: ["mood-low"] }),
      }
    );
    expect(ctx.data.answers).toHaveLength(1);

    const response = await ctx.app.request(
      "/api/session/history",
      { method: "DELETE", headers: authHeaders(session.token), body: JSON.stringify({ scope: "all" }) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.deleted.surveyAnswers).toBe(1);
    expect(ctx.data.answers).toHaveLength(0);
    // La session elle-même est conservée : l'utilisateur garde son pseudonyme.
    expect(ctx.data.sessions).toHaveLength(1);
  });

  it("exige une session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/session/history",
      { method: "DELETE", body: JSON.stringify({}) }
    );
    expect(response.status).toBe(401);
  });
});

describe("DELETE /api/session", () => {
  it("conserve les publications du forum par défaut", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    await ctx.app.request(
      "/api/forum/posts",
      {
        method: "POST",
        headers: authHeaders(session.token),
        body: JSON.stringify({ content: "Un témoignage", categoryId: "cat-stress" }),
      }
    );
    expect(ctx.data.posts).toHaveLength(1);

    const response = await ctx.app.request(
      "/api/session",
      { method: "DELETE", headers: authHeaders(session.token), body: JSON.stringify({}) }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.deleted.forumPosts).toBe(0);
    expect(ctx.data.posts).toHaveLength(1);
    expect(ctx.data.sessions).toHaveLength(0);
  });

  it("ne supprime pas une publication qui a reçu des réponses", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx, { pseudonym: "Auteur Test" });
    const other = await startSession(ctx, { pseudonym: "Autre Test" });

    const created = await ctx.app.request(
      "/api/forum/posts",
      {
        method: "POST",
        headers: authHeaders(author.token),
        body: JSON.stringify({ content: "Fil de discussion", categoryId: "cat-stress" }),
      }
    );
    const postId = (await created.json()).post.id;

    await ctx.app.request(
      `/api/forum/posts/${postId}/reply`,
      {
        method: "POST",
        headers: authHeaders(other.token),
        body: JSON.stringify({ content: "Je réponds" }),
      }
    );

    const response = await ctx.app.request(
      "/api/session",
      {
        method: "DELETE",
        headers: authHeaders(author.token),
        body: JSON.stringify({ deleteForumPosts: true }),
      }
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.deleted.forumPosts).toBe(0);
    expect(body.deleted.forumPostsSkipped).toBe(1);
    expect(ctx.data.posts).toHaveLength(1);
  });
});
