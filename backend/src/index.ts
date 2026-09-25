import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

import sessionRoutes from "./routes/session";
import surveyRoutes from "./routes/survey";
import chatRoutes from "./routes/chat";
import forumRoutes from "./routes/forum";
import annuaireRoutes from "./routes/annuaire";
import syntheseRoutes from "./routes/synthese";

const app = new Hono();

// Middlewares globaux
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: [
      process.env.WEB_URL ?? "http://localhost:3000",
      "http://localhost:8081", // Expo dev
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.route("/api/session", sessionRoutes);
app.route("/api/survey", surveyRoutes);
app.route("/api/chat", chatRoutes);
app.route("/api/forum", forumRoutes);
app.route("/api/annuaire", annuaireRoutes);
app.route("/api/synthese", syntheseRoutes);

// Health check
app.get("/health", (c) => c.json({ status: "ok", app: "Mythenena API" }));

const PORT = Number(process.env.PORT ?? 4000);
serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`🌿 Mythenena backend démarré sur http://localhost:${PORT}`);
});

export default app;
