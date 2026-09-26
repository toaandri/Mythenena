import { describe, expect, it } from "vitest";
import { authHeaders, authRequest, createTestContext, startSession } from "./helpers/testApp";

async function publish(
  ctx: ReturnType<typeof createTestContext>,
  token: string,
  content: string,
  categoryId = "cat-stress"
) {
  const response = await ctx.app.request(
    "/api/forum/posts",
    authRequest(token, "POST", { content, categoryId })
  );
  expect(response.status).toBe(201);
  return (await response.json()).post;
}

const reactionCount = (post: { reactions: { type: string; count: number }[] }, type: string) =>
  post.reactions.find((entry) => entry.type === type)?.count ?? 0;

const isReactionActive = (post: { reactions: { type: string; active: boolean }[] }, type: string) =>
  post.reactions.find((entry) => entry.type === type)?.active ?? false;

describe("GET /api/forum/categories", () => {
  it("est accessible sans session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/categories");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.categories).toHaveLength(2);
    expect(body.categories[0]).toHaveProperty("slug");
  });
});

describe("GET /api/forum/posts", () => {
  it("est accessible sans session et n'expose aucune réaction active", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await publish(ctx, author.token, "Un premier témoignage");

    await ctx.app.request(
      `/api/forum/posts/${post.id}/react`,
      authRequest(author.token, "POST", { type: "support" })
    );

    const response = await ctx.app.request("/api/forum/posts");
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.items).toHaveLength(1);
    expect(reactionCount(body.items[0], "support")).toBe(1);
    // Un visiteur anonyme n'a aucune réaction « active » : le compteur reste public.
    expect(isReactionActive(body.items[0], "support")).toBe(false);
  });

  it("liste toujours les quatre réactions, même à zéro", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    await publish(ctx, author.token, "Sans réaction");

    const body = await (await ctx.app.request("/api/forum/posts")).json();
    expect(body.items[0].reactions).toHaveLength(4);
    expect(body.items[0].reactions.every((entry: { count: number }) => entry.count === 0)).toBe(true);
  });

  it("ne publie jamais l'identifiant de session d'un auteur", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    await publish(ctx, author.token, "Témoignage");

    const body = await (
      await ctx.app.request("/api/forum/posts", { headers: authHeaders(author.token) })
    ).json();

    expect(JSON.stringify(body)).not.toContain(author.sessionId);
    expect(body.items[0].pseudonym).toBe(author.pseudonym);
  });

  it("filtre par catégorie", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    await publish(ctx, author.token, "Sur le stress", "cat-stress");
    await publish(ctx, author.token, "Sur la solitude", "cat-isolation");

    const body = await (await ctx.app.request("/api/forum/posts?category=cat-isolation")).json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].content).toBe("Sur la solitude");
  });

  it("filtre aussi par slug de catégorie", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    await publish(ctx, author.token, "Sur le stress", "cat-stress");

    const body = await (await ctx.app.request("/api/forum/posts?category=stress")).json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].content).toBe("Sur le stress");
  });

  it("refuse une catégorie inconnue", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/posts?category=inexistante");
    expect(response.status).toBe(400);
  });

  it("trie par nombre de réponses", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const other = await startSession(ctx);
    const peu = await publish(ctx, author.token, "Peu de réponses");
    await publish(ctx, author.token, "Beaucoup de réponses");
    await ctx.app.request(
      `/api/forum/posts/${peu.id}/reply`,
      authRequest(other.token, "POST", { content: "Une réponse" })
    );
    await ctx.app.request(
      `/api/forum/posts/${peu.id}/reply`,
      authRequest(other.token, "POST", { content: "Une deuxième réponse" })
    );

    const body = await (await ctx.app.request("/api/forum/posts?sort=discussed")).json();
    expect(body.items[0].content).toBe("Peu de réponses");
    expect(body.items[0].repliesCount).toBe(2);
  });

  it("respecte la pagination", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    for (let index = 0; index < 5; index += 1) {
      await publish(ctx, author.token, `Message ${index}`);
    }

    const first = await (await ctx.app.request("/api/forum/posts?limit=2&page=1")).json();
    expect(first.items).toHaveLength(2);
    expect(first.total).toBe(5);
    expect(first.limit).toBe(2);
    expect(first.totalPages).toBe(3);
    expect(first.hasMore).toBe(true);

    const last = await (await ctx.app.request("/api/forum/posts?limit=2&page=3")).json();
    expect(last.items).toHaveLength(1);
    expect(last.hasMore).toBe(false);
  });

  it("refuse une limite supérieure au maximum", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/posts?limit=500");
    expect(response.status).toBe(400);
  });

  it("masque les publications des membres bloqués", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx, { pseudonym: "Auteur Bloque" });
    const reader = await startSession(ctx, { pseudonym: "Lecteur Test" });
    await publish(ctx, author.token, "Contenu à masquer");

    const before = await (await ctx.app.request("/api/forum/posts")).json();
    expect(before.items).toHaveLength(1);

    await ctx.app.request(
      "/api/forum/blocks",
      authRequest(reader.token, "POST", { blockedSessionId: author.sessionId })
    );

    const after = await (
      await ctx.app.request("/api/forum/posts", { headers: authHeaders(reader.token) })
    ).json();
    expect(after.items).toHaveLength(0);
  });

  it("marque `isMine` uniquement pour le lecteur concerné", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const other = await startSession(ctx);
    await publish(ctx, author.token, "Ma publication");

    const mine = await (
      await ctx.app.request("/api/forum/posts", { headers: authHeaders(author.token) })
    ).json();
    expect(mine.items[0].isMine).toBe(true);

    const theirs = await (
      await ctx.app.request("/api/forum/posts", { headers: authHeaders(other.token) })
    ).json();
    expect(theirs.items[0].isMine).toBe(false);
  });
});

describe("POST /api/forum/posts", () => {
  it("exige une session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request(
      "/api/forum/posts",
      authRequest("jeton-inexistant", "POST", { content: "Hello", categoryId: "cat-stress" })
    );
    expect(response.status).toBe(401);
  });

  it("refuse un contenu vide ou trop long", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);

    const empty = await ctx.app.request(
      "/api/forum/posts",
      authRequest(author.token, "POST", { content: "", categoryId: "cat-stress" })
    );
    expect(empty.status).toBe(400);

    const tooLong = await ctx.app.request(
      "/api/forum/posts",
      authRequest(author.token, "POST", { content: "x".repeat(5000), categoryId: "cat-stress" })
    );
    expect(tooLong.status).toBe(400);
    expect(ctx.data.posts).toHaveLength(0);
  });

  it("refuse une catégorie inexistante", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const response = await ctx.app.request(
      "/api/forum/posts",
      authRequest(author.token, "POST", { content: "Hello", categoryId: "cat-inventee" })
    );
    expect(response.status).toBe(400);
    expect(ctx.data.posts).toHaveLength(0);
  });
});

describe("DELETE /api/forum/posts/:id", () => {
  it("laisse un auteur supprimer sa publication sans réponse", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await publish(ctx, author.token, "À supprimer");

    const response = await ctx.app.request(`/api/forum/posts/${post.id}`, {
      method: "DELETE",
      headers: authHeaders(author.token),
    });
    expect(response.status).toBe(200);
    expect(ctx.data.posts).toHaveLength(0);
  });

  it("empêche un tiers de supprimer la publication d'autrui", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx, { pseudonym: "Auteur Test" });
    const other = await startSession(ctx, { pseudonym: "Intrus Test" });
    const post = await publish(ctx, author.token, "Ma publication");

    const response = await ctx.app.request(`/api/forum/posts/${post.id}`, {
      method: "DELETE",
      headers: authHeaders(other.token),
    });
    expect(response.status).toBe(403);
    expect(ctx.data.posts).toHaveLength(1);
  });

  it("refuse la suppression d'une publication qui a reçu des réponses", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const other = await startSession(ctx);
    const post = await publish(ctx, author.token, "Fil vivant");
    await ctx.app.request(
      `/api/forum/posts/${post.id}/reply`,
      authRequest(other.token, "POST", { content: "Je réponds" })
    );

    const response = await ctx.app.request(`/api/forum/posts/${post.id}`, {
      method: "DELETE",
      headers: authHeaders(author.token),
    });
    expect(response.status).toBe(409);
    expect(ctx.data.posts).toHaveLength(1);
  });

  it("renvoie 404 pour une publication inconnue", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const response = await ctx.app.request("/api/forum/posts/inconnue", {
      method: "DELETE",
      headers: authHeaders(author.token),
    });
    expect(response.status).toBe(404);
  });
});

describe("réponses", () => {
  it("ajoute une réponse et renvoie le fil complet", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const other = await startSession(ctx, { pseudonym: "Repondant Test" });
    const post = await publish(ctx, author.token, "Question ouverte");

    const response = await ctx.app.request(
      `/api/forum/posts/${post.id}/reply`,
      authRequest(other.token, "POST", { content: "Mon experience" })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.replies).toHaveLength(1);
    expect(body.replies[0].pseudonym).toBe("Repondant Test");
    expect(body.post.id).toBe(post.id);
    expect(body.post.repliesCount).toBe(1);
  });

  it("refuse de répondre à une publication inexistante", async () => {
    const ctx = createTestContext();
    const user = await startSession(ctx);
    const response = await ctx.app.request(
      "/api/forum/posts/inconnue/reply",
      authRequest(user.token, "POST", { content: "Coucou" })
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("post_not_found");
  });

  it("exige une session", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await publish(ctx, author.token, "Question ouverte");

    const response = await ctx.app.request(`/api/forum/posts/${post.id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: "Anonyme" }),
    });
    expect(response.status).toBe(401);
  });

  it("masque les réponses d'un membre bloqué", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const noisy = await startSession(ctx, { pseudonym: "Bruyant Test" });
    const reader = await startSession(ctx, { pseudonym: "Lecteur Test" });
    const post = await publish(ctx, author.token, "Question ouverte");

    await ctx.app.request(
      `/api/forum/posts/${post.id}/reply`,
      authRequest(noisy.token, "POST", { content: "Réponseremoved" })
    );
    await ctx.app.request(
      "/api/forum/blocks",
      authRequest(reader.token, "POST", { blockedSessionId: noisy.sessionId })
    );

    const body = await (
      await ctx.app.request(`/api/forum/posts/${post.id}`, { headers: authHeaders(reader.token) })
    ).json();
    expect(body.replies).toHaveLength(0);
  });
});

describe("réactions", () => {
  it("ajoute puis retire une réaction", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const other = await startSession(ctx);
    const post = await publish(ctx, author.token, "Soutien");

    const first = await ctx.app.request(
      `/api/forum/posts/${post.id}/react`,
      authRequest(other.token, "POST", { type: "support" })
    );
    expect((await first.json()).reaction).toEqual({ type: "support", active: true, count: 1 });

    const second = await ctx.app.request(
      `/api/forum/posts/${post.id}/react`,
      authRequest(other.token, "POST", { type: "support" })
    );
    expect((await second.json()).reaction).toEqual({ type: "support", active: false, count: 0 });
  });

  it("refuse un type de réaction inconnu", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const post = await publish(ctx, author.token, "Soutien");

    const response = await ctx.app.request(
      `/api/forum/posts/${post.id}/react`,
      authRequest(author.token, "POST", { type: "riposte-violente" })
    );
    expect(response.status).toBe(400);
    expect(ctx.data.reactions).toHaveLength(0);
  });

  it("refuse une réaction sur une publication inexistante", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const response = await ctx.app.request(
      "/api/forum/posts/inconnue/react",
      authRequest(author.token, "POST", { type: "support" })
    );
    expect(response.status).toBe(404);
  });

  it("marque la réaction comme active pour son auteur uniquement", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const supporter = await startSession(ctx, { pseudonym: "Soutien Test" });
    const other = await startSession(ctx, { pseudonym: "Autre Test" });
    const post = await publish(ctx, author.token, "Soutien");

    await ctx.app.request(
      `/api/forum/posts/${post.id}/react`,
      authRequest(supporter.token, "POST", { type: "support" })
    );

    const mine = await (
      await ctx.app.request("/api/forum/posts", { headers: authHeaders(supporter.token) })
    ).json();
    expect(isReactionActive(mine.items[0], "support")).toBe(true);

    const theirs = await (
      await ctx.app.request("/api/forum/posts", { headers: authHeaders(other.token) })
    ).json();
    expect(isReactionActive(theirs.items[0], "support")).toBe(false);
    expect(reactionCount(theirs.items[0], "support")).toBe(1);
  });
});

describe("signalements", () => {
  it("enregistre un signalement et rappelle qu'exprimer une souffrance n'est pas une faute", async () => {
    const ctx = createTestContext();
    const author = await startSession(ctx);
    const reader = await startSession(ctx);
    const post = await publish(ctx, author.token, "Contenu signalé");

    const response = await ctx.app.request(
      "/api/forum/report",
      authRequest(reader.token, "POST", {
        targetId: post.id,
        targetType: "post",
        reason: "harassment",
      })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.report.status).toBe("pending");
    expect(body.message).toMatch(/jamais trait/);
  });

  it("refuse un signalement d'une cible inexistante", async () => {
    const ctx = createTestContext();
    const reader = await startSession(ctx);
    const response = await ctx.app.request(
      "/api/forum/report",
      authRequest(reader.token, "POST", {
        targetId: "cible-inventee",
        targetType: "post",
        reason: "spam",
      })
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error.code).toBe("report_target_not_found");
  });

  it("refuse un motif inconnu", async () => {
    const ctx = createTestContext();
    const reader = await startSession(ctx);
    const response = await ctx.app.request(
      "/api/forum/report",
      authRequest(reader.token, "POST", {
        targetId: "une-id",
        targetType: "post",
        reason: "je-n-aime-pas-cela",
      })
    );
    expect(response.status).toBe(400);
    expect(ctx.data.reports).toHaveLength(0);
  });

  it("exige une session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: "x", targetType: "post", reason: "spam" }),
    });
    expect(response.status).toBe(401);
  });
});

describe("blocage de membres", () => {
  it("bloque puis débloque un membre sans révéler son pseudonyme", async () => {
    const ctx = createTestContext();
    const reader = await startSession(ctx, { pseudonym: "Lecteur Test" });
    const target = await startSession(ctx, { pseudonym: "Cible Test" });

    const created = await ctx.app.request(
      "/api/forum/blocks",
      authRequest(reader.token, "POST", { blockedSessionId: target.sessionId })
    );
    expect(created.status).toBe(201);

    const body = await (
      await ctx.app.request("/api/forum/blocks", { headers: authHeaders(reader.token) })
    ).json();
    expect(body.blocks).toHaveLength(1);
    expect(JSON.stringify(body)).not.toContain("Cible Test");

    const removed = await ctx.app.request(`/api/forum/blocks/${target.sessionId}`, {
      method: "DELETE",
      headers: authHeaders(reader.token),
    });
    expect(removed.status).toBe(200);

    const after = await (
      await ctx.app.request("/api/forum/blocks", { headers: authHeaders(reader.token) })
    ).json();
    expect(after.blocks).toHaveLength(0);
  });

  it("exige une session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/blocks");
    expect(response.status).toBe(401);
  });
});

describe("GET /api/forum/me/posts", () => {
  it("liste uniquement les publications du lecteur", async () => {
    const ctx = createTestContext();
    const alice = await startSession(ctx, { pseudonym: "Alice Test" });
    const bob = await startSession(ctx, { pseudonym: "Bob Test" });
    await publish(ctx, alice.token, "Publication de Alice");
    await publish(ctx, bob.token, "Publication de Bob");

    const body = await (
      await ctx.app.request("/api/forum/me/posts", { headers: authHeaders(alice.token) })
    ).json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].content).toBe("Publication de Alice");
  });

  it("exige une session", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/me/posts");
    expect(response.status).toBe(401);
  });
});
