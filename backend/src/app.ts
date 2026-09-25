import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
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

  app.get("/health", (c) =>
    c.json({
      status: "ok",
      app: "Mythenena API",
      // Le module IA n'étant pas livré, les modules correspondants sont annoncés
      // comme indisponibles plutôt que présentés comme fonctionnels.
      modules: {
        session: "available",
        surveyMini: "available",
        forum: "available",
        annuaire: "available",
        ressources: "available",
        moderation: "available",
        chat: "requires_ai",
        surveyAdaptive: "requires_ai",
        synthese: "requires_ai",
      },
    })
  );

  // --- Espaces accessibles sans compte ---------------------------------------
  // Ni le forum, ni l'annuaire, ni les ressources n'exigent d'avoir terminé
  // une évaluation : chercher de l'aide doit rester possible à tout moment.
  app.route("/api/annuaire", createAnnuaireRoutes(deps));
  app.route("/api/ressources", createResourceRoutes(deps));

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
  app.route("/api/survey", createSurveyRoutes(deps));
  app.use("/api/chat/*", auth);
  app.route("/api/chat", createChatRoutes(deps));
  app.use("/api/synthese/*", auth);
  app.route("/api/synthese", createSyntheseRoutes(deps));

  return app;
}
