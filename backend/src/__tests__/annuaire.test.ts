import { beforeEach, describe, expect, it } from "vitest";
import type { AssociationRow, ProfessionalRow, ResourceRow } from "../db/schema";
import { authHeaders, authRequest, createTestContext, startSession } from "./helpers/testApp";
import type { TestContext } from "./helpers/testApp";

const timestamp = new Date("2026-01-15T10:00:00.000Z");

function realProfessional(overrides: Partial<ProfessionalRow> = {}): ProfessionalRow {
  return {
    id: "pro-real",
    name: "Dr. Rakoto",
    title: "Psychologue clinicienne",
    city: "Antananarivo",
    region: "Analamanga",
    languages: ["fr", "mg"],
    specialties: ["gestion du stress", "sommeil"],
    modalities: ["in-person"],
    phone: "0340000000",
    email: "contact@example.mg",
    address: "Analakely",
    lat: null,
    lng: null,
    bio: "Accompagnement.",
    fee: null,
    schedule: null,
    lastVerified: timestamp,
    isFictional: false,
    acceptsNewPatients: true,
    isActive: true,
    ...overrides,
  } as ProfessionalRow;
}

function fictionalProfessional(overrides: Partial<ProfessionalRow> = {}): ProfessionalRow {
  return realProfessional({
    id: "pro-demo",
    name: "Dr. Fictif",
    specialties: ["gestion du stress", "humeur"],
    isFictional: true,
    ...overrides,
  });
}

function association(overrides: Partial<AssociationRow> = {}): AssociationRow {
  return {
    id: "assoc-1",
    name: "Association Sosotra",
    description: "Écoute et soutien",
    descriptionMg: "Fanarahana",
    city: "Antananarivo",
    region: "Analamanga",
    phone: "0320000000",
    email: "contact@assoc.mg",
    website: null,
    lastVerified: timestamp,
    isFictional: false,
    isActive: true,
    ...overrides,
  } as AssociationRow;
}

function resource(overrides: Partial<ResourceRow> = {}): ResourceRow {
  return {
    id: "res-1",
    slug: "respiration",
    type: "exercise",
    title: "Respiration guidée",
    titleMg: "Fifanampiana",
    summary: "Un exercice court.",
    summaryMg: "Fandraisana fohy.",
    body: "Inspire lentement.",
    bodyMg: "Mifoka mora.",
    url: null,
    tags: ["stress"],
    isOfflineAvailable: true,
    readingMinutes: 3,
    isPublished: true,
    publishedAt: timestamp,
    author: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  } as ResourceRow;
}

describe("annuaire", () => {
  beforeEach(() => {
    // rien : chaque test construit son propre contexte
  });

  const withDirectory = (): TestContext => {
    const ctx = createTestContext();
    ctx.data.professionals = [
      realProfessional(),
      fictionalProfessional(),
      realProfessional({
        id: "pro-toamasina",
        name: "Dr. Rasoanaivo",
        city: "Toamasina",
        region: "Atsinanana",
        languages: ["fr"],
        specialties: ["burn out"],
        modalities: ["online"],
        acceptsNewPatients: false,
      }),
    ];
    ctx.data.associations = [association(), association({ id: "assoc-2", name: "Autre", city: "Toamasina" })];
    return ctx;
  };

  it("exclut les fiches de démonstration par défaut", async () => {
    const ctx = withDirectory();
    const body = await (await ctx.app.request("/api/annuaire/professionals")).json();

    expect(body.items).toHaveLength(2);
    expect(body.items.every((entry: { isFictional: boolean }) => entry.isFictional === false)).toBe(true);
  });

  it("inclut les fiches de démonstration seulement sur demande explicite", async () => {
    const ctx = withDirectory();
    const body = await (await ctx.app.request("/api/annuaire/professionals?includeFictional=true")).json();

    expect(body.items).toHaveLength(3);
    const demo = body.items.find((entry: { id: string }) => entry.id === "pro-demo");
    expect(demo.isFictional).toBe(true);
    // Garde-fou : le contact est advertised comme désactivé, pas seulement masqué.
    expect(demo.contactEnabled).toBe(false);
  });

  it("est consultable sans session", async () => {
    const ctx = withDirectory();
    const response = await ctx.app.request("/api/annuaire/professionals");
    expect(response.status).toBe(200);
  });

  it("filtre par ville, langue, modalité et nouveau patient", async () => {
    const ctx = withDirectory();

    const city = await (await ctx.app.request("/api/annuaire/professionals?city=Toamasina")).json();
    expect(city.items).toHaveLength(1);
    expect(city.items[0].id).toBe("pro-toamasina");

    const online = await (await ctx.app.request("/api/annuaire/professionals?modality=online")).json();
    expect(online.items).toHaveLength(1);

    const available = await (
      await ctx.app.request("/api/annuaire/professionals?acceptsNewPatients=true")
    ).json();
    expect(available.items).toHaveLength(1);
    expect(available.items[0].id).toBe("pro-real");
  });

  it("filtre par spécialité", async () => {
    const ctx = withDirectory();
    const body = await (await ctx.app.request("/api/annuaire/professionals?specialty=sommeil")).json();
    expect(body.items).toHaveLength(1);
  });

  it("expose les valeurs de filtre disponibles", async () => {
    const ctx = withDirectory();
    const body = await (await ctx.app.request("/api/annuaire/filters")).json();
    expect(body.cities).toContain("Antananarivo");
    expect(body.cities).toContain("Toamasina");
    expect(body.modalities).toContain("online");
  });

  it("liste les associations et filtre par ville", async () => {
    const ctx = withDirectory();
    const all = await (await ctx.app.request("/api/annuaire/associations")).json();
    expect(all.associations).toHaveLength(2);

    const city = await (await ctx.app.request("/api/annuaire/associations?city=Toamasina")).json();
    expect(city.associations).toHaveLength(1);
  });

  it("renvoie 404 pour une fiche inconnue", async () => {
    const ctx = withDirectory();
    const response = await ctx.app.request("/api/annuaire/professionals/inconnue");
    expect(response.status).toBe(404);
  });

  it("suggère des professionnels selon les domaines déclarés, sans diagnostic", async () => {
    const ctx = withDirectory();
    const response = await ctx.app.request("/api/annuaire/suggestions?domains=stress,sleep");
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.items.length).toBeGreaterThan(0);
    expect(body.items[0].matchedDomains.length).toBeGreaterThan(0);
    expect(body.notice).toMatch(/ni un diagnostic/i);
  });

  it("refuse un domaine inconnu dans les suggestions", async () => {
    const ctx = withDirectory();
    const response = await ctx.app.request("/api/annuaire/suggestions?domains=amour");
    expect(response.status).toBe(400);
  });
});

describe("prise de contact avec un professionnel", () => {
  const withDirectory = (): TestContext => {
    const ctx = createTestContext();
    ctx.data.professionals = [realProfessional(), fictionalProfessional()];
    return ctx;
  };

  it("exige une session", async () => {
    const ctx = withDirectory();
    const response = await ctx.app.request("/api/annuaire/professionals/pro-real/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(401);
  });

  it("enregistre une demande et promet l'absence de partage de données de santé", async () => {
    const ctx = withDirectory();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/annuaire/professionals/pro-real/contact",
      authRequest(session.token, "POST", { message: "Bonjour, je cherche de l'aide." })
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.request.status).toBe("pending");
    expect(body.notice).toMatch(/rien n'est partagé/i);
  });

  it("n'envoie que le message libre : aucune donnée de santé n'est jointe", async () => {
    const ctx = withDirectory();
    const session = await startSession(ctx);
    await ctx.app.request(
      "/api/survey/mini/answer",
      authRequest(session.token, "POST", { questionId: "mini-mood", choiceIds: ["mood-low"] })
    );

    await ctx.app.request(
      "/api/annuaire/professionals/pro-real/contact",
      authRequest(session.token, "POST", { message: "Bonjour." })
    );

    expect(ctx.data.contactRequests).toHaveLength(1);
    const stored = ctx.data.contactRequests[0] as unknown as Record<string, unknown>;
    expect(Object.keys(stored).sort()).toEqual(
      ["createdAt", "id", "message", "professionalId", "sessionId", "status"].sort()
    );
    expect(stored.message).toBe("Bonjour.");
  });

  it("refuse le contact vers une fiche de démonstration", async () => {
    const ctx = withDirectory();
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/annuaire/professionals/pro-demo/contact",
      authRequest(session.token, "POST", { message: "Bonjour." })
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error.code).toBe("fictional_profile");
    expect(ctx.data.contactRequests).toHaveLength(0);
  });

  it("refuse le contact si le professionnel n'accepte pas de nouveaux patients", async () => {
    const ctx = createTestContext();
    ctx.data.professionals = [realProfessional({ acceptsNewPatients: false })];
    const session = await startSession(ctx);

    const response = await ctx.app.request(
      "/api/annuaire/professionals/pro-real/contact",
      authRequest(session.token, "POST", { message: "Bonjour." })
    );

    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error.code).toBe("not_accepting_new_patients");
  });
});

describe("ressources", () => {
  const withResources = (): TestContext => {
    const ctx = createTestContext();
    ctx.data.resources = [
      resource(),
      resource({
        id: "res-2",
        slug: "sommeil",
        type: "article",
        title: "Comprendre son sommeil",
        tags: ["sommeil"],
        isOfflineAvailable: false,
        readingMinutes: null,
      }),
      resource({ id: "res-3", slug: "brouillon", isPublished: false }),
    ];
    return ctx;
  };

  it("liste uniquement les ressources publiées", async () => {
    const ctx = withResources();
    const body = await (await ctx.app.request("/api/ressources")).json();

    expect(body.items).toHaveLength(2);
    expect(body.items.map((entry: { slug: string }) => entry.slug)).not.toContain("brouillon");
  });

  it("est consultable sans session", async () => {
    const ctx = withResources();
    const response = await ctx.app.request("/api/ressources");
    expect(response.status).toBe(200);
  });

  it("filtre par type, tag et recherche", async () => {
    const ctx = withResources();

    const byType = await (await ctx.app.request("/api/ressources?type=article")).json();
    expect(byType.items).toHaveLength(1);

    const byTag = await (await ctx.app.request("/api/ressources?tag=sommeil")).json();
    expect(byTag.items).toHaveLength(1);

    const bySearch = await (await ctx.app.request("/api/ressources?q=respiration")).json();
    expect(bySearch.items).toHaveLength(1);
  });

  it("liste les ressources consultables hors connexion", async () => {
    const ctx = withResources();
    const body = await (await ctx.app.request("/api/ressources/offline")).json();

    expect(body.items).toHaveLength(1);
    expect(body.items[0].slug).toBe("respiration");
    expect(body.notice).toMatch(/ne sont pas simulées/i);
  });

  it("expose les ressources d'urgence sans authentification", async () => {
    const ctx = withResources();
    const response = await ctx.app.request("/api/ressources/urgence");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body.resources ?? body.items)).toBe(true);
  });

  it("expose les tags disponibles", async () => {
    const ctx = withResources();
    const body = await (await ctx.app.request("/api/ressources/tags")).json();
    expect(body.tags).toEqual(["sommeil", "stress"]);
  });

  it("détaille une ressource et refuse une ressource inconnue", async () => {
    const ctx = withResources();
    const detail = await ctx.app.request("/api/ressources/respiration");
    expect(detail.status).toBe(200);
    expect((await detail.json()).resource.slug).toBe("respiration");

    const missing = await ctx.app.request("/api/ressources/inconnue");
    expect(missing.status).toBe(404);
  });

  it("ne renvoie pas une ressource non publiée", async () => {
    const ctx = withResources();
    const response = await ctx.app.request("/api/ressources/brouillon");
    expect(response.status).toBe(404);
  });

  it("refuse une page hors bornes", async () => {
    const ctx = withResources();
    const response = await ctx.app.request("/api/ressources?page=0");
    expect(response.status).toBe(400);
  });
});

describe("espace de lecture anonyme", () => {
  it("laisse lire l'annuaire, les ressources et le forum sans jeton", async () => {
    const ctx = createTestContext();
    const anonymous = await Promise.all([
      ctx.app.request("/api/annuaire/professionals"),
      ctx.app.request("/api/ressources"),
      ctx.app.request("/api/ressources/urgence"),
      ctx.app.request("/api/forum/posts"),
      ctx.app.request("/api/forum/categories"),
      ctx.app.request("/health"),
    ]);

    for (const response of anonymous) {
      expect(response.status).toBe(200);
    }
  });

  it("refuse l'écriture et le parcours personnel sans jeton", async () => {
    const ctx = createTestContext();
    const responses = await Promise.all([
      ctx.app.request("/api/forum/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }),
      ctx.app.request("/api/survey/mini"),
      ctx.app.request("/api/session/me"),
      ctx.app.request("/api/chat/messages"),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(401);
    }
  });
});

describe("CORS", () => {
  it("autorise l'origine configurée", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/health", {
      headers: { Origin: "http://localhost:3000" },
    });
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
  });
});

describe("erreurs", () => {
  it("renvoie une structure d'erreur uniforme, sans détail interne", async () => {
    const ctx = createTestContext();
    const response = await ctx.app.request("/api/forum/posts/inconnue/react", {
      method: "POST",
      headers: authHeaders(await startSession(ctx).then((session) => session.token)),
      body: JSON.stringify({ type: "support" }),
    });

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toHaveProperty("code");
    expect(body.error).toHaveProperty("message");
    expect(body.error).not.toHaveProperty("stack");
  });
});
