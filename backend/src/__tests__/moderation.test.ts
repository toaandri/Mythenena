import { describe, expect, it } from "vitest";
import { authRequest, createTestContext, startSession } from "./helpers/testApp";

const MODERATOR_SECRET = "jeton-moderateur-de-test";

async function reportPost(
  ctx: ReturnType<typeof createTestContext>,
  targetId: string,
  targetType: "post" | "reply" = "post"
) {
  const reporter = await startSession(ctx);
  const response = await ctx.app.request(
    "/api/forum/report",
    authRequest(reporter.token, "POST", { targetId, targetType, reason: "harassment" })
  );
  expect(response.status).toBe(201);
  return (await response.json()).report.id as string;
}

async function loginAsModerator(ctx: ReturnType<typeof createTestContext>) {
  const response = await ctx.app.request(
    "/api/moderation/login",
    authRequest("", "POST", { token: MODERATOR_SECRET })
  );
  expect(response.status).toBe(200);
  const { token } = await response.json();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

describe("connexion de modération", () => {
  it("refuse un jeton de modération invalide", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/moderation/login",
      authRequest("", "POST", { token: "mauvais-jeton" })
    );
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error.code).toBe("invalid_moderator_token");
  });

  it("délivre un jeton au modérateur légitime", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/moderation/login",
      authRequest("", "POST", { token: MODERATOR_SECRET })
    );
    expect(response.status).toBe(200);
    expect((await response.json()).token).toBeTypeOf("string");
  });
});

describe("file de modération humaine", () => {
  it("refuse l'accès sans jeton de modérateur", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/moderation/reports");
    expect(response.status).toBe(401);
  });

  it("refuse un jeton de session utilisateur comme jeton de modérateur", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);
    const response = await ctx.app.request("/api/moderation/reports", {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    // Jeton valide mais rôle insuffisant : 403, pas 401.
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("not_a_moderator");
  });

  it("liste les signalements en attente avec un aperçu du contenu", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await (
      await ctx.app.request(
        "/api/forum/posts",
        authRequest(author.token, "POST", {
          content: "Contenu signalé par un membre",
          categoryId: "cat-stress",
        })
      )
    ).json();

    await reportPost(ctx, post.post.id);
    const headers = await loginAsModerator(ctx);

    const response = await ctx.app.request("/api/moderation/reports", { headers });
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].status).toBe("pending");
    expect(body.items[0].targetPreview).toContain("Contenu signalé");
  });

  it("filtre par statut", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await (
      await ctx.app.request(
        "/api/forum/posts",
        authRequest(author.token, "POST", { content: "Autre contenu", categoryId: "cat-stress" })
      )
    ).json();

    const reportId = await reportPost(ctx, post.post.id);
    const headers = await loginAsModerator(ctx);

    await ctx.app.request(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "dismissed" }),
    });

    const pending = await (await ctx.app.request("/api/moderation/reports", { headers })).json();
    expect(pending.items).toHaveLength(0);

    const dismissed = await (
      await ctx.app.request("/api/moderation/reports?status=dismissed", { headers })
    ).json();
    expect(dismissed.items).toHaveLength(1);

    const all = await (await ctx.app.request("/api/moderation/reports?status=all", { headers })).json();
    expect(all.items).toHaveLength(1);
  });

  it("clôt un signalement sans masquer le contenu", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await (
      await ctx.app.request(
        "/api/forum/posts",
        authRequest(author.token, "POST", { content: "Témoignage", categoryId: "cat-stress" })
      )
    ).json();
    const reportId = await reportPost(ctx, post.post.id);
    const headers = await loginAsModerator(ctx);

    const response = await ctx.app.request(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "reviewed" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.report.status).toBe("reviewed");
    expect(body.notice).toMatch(/ne punit pas l'expression/i);
    expect(ctx.data.posts[0].moderationStatus).toBe("visible");
  });

  it("masque le contenu signalé quand le modérateur le demande", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await (
      await ctx.app.request(
        "/api/forum/posts",
        authRequest(author.token, "POST", { content: "Contenu dangereux", categoryId: "cat-stress" })
      )
    ).json();
    const reportId = await reportPost(ctx, post.post.id);
    const headers = await loginAsModerator(ctx);

    await ctx.app.request(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "reviewed", hideTarget: true }),
    });

    expect(ctx.data.posts[0].moderationStatus).toBe("hidden");
    // Le contenu masqué disparaît des lectures publiques.
    const list = await (await ctx.app.request("/api/forum/posts")).json();
    expect(list.items).toHaveLength(0);
  });

  it("refuse de traiter deux fois le même signalement", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await (
      await ctx.app.request(
        "/api/forum/posts",
        authRequest(author.token, "POST", { content: "Contenu", categoryId: "cat-stress" })
      )
    ).json();
    const reportId = await reportPost(ctx, post.post.id);
    const headers = await loginAsModerator(ctx);

    const first = await ctx.app.request(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "reviewed" }),
    });
    expect(first.status).toBe(200);

    const second = await ctx.app.request(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "reviewed" }),
    });
    expect(second.status).toBe(409);
  });

  it("refuse un statut de clôture inconnu", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await (
      await ctx.app.request(
        "/api/forum/posts",
        authRequest(author.token, "POST", { content: "Contenu", categoryId: "cat-stress" })
      )
    ).json();
    const reportId = await reportPost(ctx, post.post.id);
    const headers = await loginAsModerator(ctx);

    const response = await ctx.app.request(`/api/moderation/reports/${reportId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "puni" }),
    });
    expect(response.status).toBe(400);
  });

  it("renvoie 404 pour un signalement inconnu", async () => {
    const ctx = createTestContext();
    const headers = await loginAsModerator(ctx);
    const response = await ctx.app.request("/api/moderation/reports/inconnu", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "reviewed" }),
    });
    expect(response.status).toBe(404);
  });
});

describe("modules IA", () => {
  it("protège les routes IA par authentification", async () => {
    const ctx = createTestContext();
    // Sans token → 401
    const response = await ctx.app.request("/api/chat/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    expect(response.status).toBe(401);
  });

  it("les routes IA sont accessibles avec une session (retournent 503 sans clé Gemini)", async () => {
    const ctx = createTestContext();
    const session = await startSession(ctx);

    // Sans GEMINI_API_KEY, le service retourne 503 (clé absente) ou 400 (body invalide)
    // mais jamais 501 (plus de stub) ni 404
    const chatResponse = await ctx.app.request("/api/chat/message", {
      method: "POST",
      headers: authRequest(session.token, "POST", {}).headers,
      body: JSON.stringify({ message: "Bonjour", language: "fr" }),
    });
    expect(chatResponse.status, "POST /api/chat/message sans clé Gemini").toBe(503);
  });

  it("annonce les modules IA comme requires_ai sur /health sans clé Gemini", async () => {
    const ctx = createTestContext();
    const body = await (await ctx.app.request("/health")).json();

    expect(body.modules.chat).toBe("requires_ai");
    expect(body.modules.surveyAdaptive).toBe("requires_ai");
    expect(body.modules.synthese).toBe("requires_ai");
    expect(body.modules.forum).toBe("available");
    expect(body.modules.annuaire).toBe("available");
  });
});
