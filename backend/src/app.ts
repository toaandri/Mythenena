import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { sql } from "drizzle-orm";
import type { AppConfig } from "./config/config";
import type { Repos } from "./repositories";
import type { AppBindings } from "./types/context";
import { registerErrorHandlers } from "./middleware/error";
import { createAuthMiddleware } from "./middleware/auth";
import { createSessionRoutes } from "./routes/session";
import { createSurveyRoutes } from "./routes/survey";
import { createChatRoutes } from "./routes/chat";
import { createForumRoutes } from "./routes/forum";
import { createAnnuaireRoutes } from "./routes/annuaire";
import { createSyntheseRoutes } from "./routes/synthese";
import { createResourceRoutes } from "./routes/ressources";
import { createModerationRoutes } from "./routes/moderation";
import { createTranscriptionRoutes } from "./routes/transcription";
import { createInterviewRoutes } from "./routes/interview";
import { createProfileRoutes } from "./routes/profile";
import { createActivitiesRoutes } from "./routes/activities";
import { createTranslationRoutes } from "./routes/translate";
import { getDb } from "./db";

/**
 * Fabrique de l'application. Elle ne dépend que de `repos` et `config` :
 * les tests l'instancient avec des repositories en mémoire et une
 * configuration de test, sans base de données ni port d'écoute.
 */
export function createApp(deps: { repos: Repos; config: AppConfig }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  const auth = createAuthMiddleware({ repos: deps.repos, secret: deps.config.jwtSecret });

  if (deps.config.nodeEnv !== "test") {
    app.use("*", logger());
  }

  app.use(
    "*",
    cors({
      origin: deps.config.corsOrigins,
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
    })
  );

  registerErrorHandlers(app);

  app.get("/health", async (c) => {
    const hasGemini = Boolean(deps.config.geminiApiKey);
    const hasGroq = Boolean(deps.config.groqApiKey);
    const isTest = deps.config.nodeEnv === "test";

    // Vérification réelle de la base : SELECT 1 avec timeout 2s.
    // Désactivée en mode test (pas de vraie base).
    let dbStatus: "ok" | "error" = isTest ? "ok" : "ok";
    if (!isTest) {
      try {
        await Promise.race([
          getDb().execute(sql`SELECT 1`),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("db timeout")), 5000)
          ),
        ]);
      } catch {
        dbStatus = "error";
      }
    }

    const chatStatus = hasGemini ? "available" : "requires_ai";
    const status = dbStatus === "ok" ? "ok" : "degraded";
    const httpStatus = dbStatus === "ok" ? 200 : 503;

    return c.json(
      {
        status,
        app: "Mythenena API",
        db: dbStatus,
        modules: {
          session: "available",
          surveyMini: "available",
          forum: "available",
          annuaire: "available",
          ressources: "available",
          moderation: "available",
          chat: chatStatus,
          surveyAdaptive: chatStatus,
          synthese: chatStatus,
          transcription: hasGroq ? "available" : "requires_groq_key",
        },
      },
      httpStatus
    );
  });

  // --- Espaces accessibles sans compte ---------------------------------------
  // Ni le forum, ni l'annuaire, ni les ressources n'exigent d'avoir terminé
  // une évaluation : chercher de l'aide doit rester possible à tout moment.
  app.route("/api/annuaire", createAnnuaireRoutes(deps));
  app.route("/api/ressources", createResourceRoutes(deps));
  app.route("/api/transcription", createTranscriptionRoutes(deps));
  app.route("/api/translate", createTranslationRoutes({ config: deps.config }));

  // --- Espaces communautaires : lecture publique, écriture authentifiée ------
  // L'authentification est appliquée endpoint par endpoint dans chaque
  // routeur : `POST /api/session/start` et les lectures du forum doivent rester
  // accessibles sans jeton, ce qu'un middleware global sur `/api/session/*`
  // ou `/api/forum/posts` interdirait.
  app.route("/api/session", createSessionRoutes(deps));
  app.route("/api/moderation", createModerationRoutes(deps));
  app.route("/api/forum", createForumRoutes(deps));

  // --- Parcours individuel : session obligatoire -----------------------------
  app.use("/api/survey/*", auth);
  app.route("/api/survey", createSurveyRoutes({ repos: deps.repos, config: deps.config }));
  app.use("/api/chat/*", auth);
  app.route("/api/chat", createChatRoutes({ repos: deps.repos, config: deps.config }));
  app.use("/api/synthese/*", auth);
  app.route("/api/synthese", createSyntheseRoutes({ repos: deps.repos, config: deps.config }));

  // --- Module Entretien Analytique : session obligatoire -------------------
  app.use("/api/interview/*", auth);
  app.route("/api/interview", createInterviewRoutes({ repos: deps.repos, config: deps.config }));

  // --- Module Profil évolutif : session obligatoire ------------------------
  app.use("/api/profile/*", auth);
  app.route("/api/profile", createProfileRoutes(deps));

  // --- Module Activités Interactives : session obligatoire -----------------
  app.use("/api/activities/*", auth);
  app.route("/api/activities", createActivitiesRoutes(deps));

  return app;
}
