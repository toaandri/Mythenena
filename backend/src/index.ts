import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { createRepos } from "./repositories";
import { getDb, closeDb } from "./db";

const config = loadConfig();
const db = getDb();
const app = createApp({ repos: createRepos(db), config });

const server = serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`🌿 Mythenena backend démarré sur http://localhost:${config.port}`);
  console.log(`   Environnement : ${config.nodeEnv}`);
  if (!config.geminiApiKey) {
    console.log("   ⚠ GEMINI_API_KEY absent — chat, questionnaire adaptatif et synthèse indisponibles.");
  }
  if (!config.groqApiKey) {
    console.log("   ⚠ GROQ_API_KEY absent — transcription vocale indisponible.");
  }
});

async function shutdown(signal: string) {
  console.log(`\n${signal} reçu — arrêt propre...`);
  await closeDb();
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default app;
