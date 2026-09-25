import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { loadConfig } from "./config/env";
import { createRepos } from "./repositories";
import { getDb } from "./db";

const config = loadConfig();
const db = getDb();
const app = createApp({ repos: createRepos(db), config });

serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`🌿 Mythenena backend démarré sur http://localhost:${config.port}`);
  console.log(`   Environnement : ${config.nodeEnv}`);
  console.log(
    "   Modules IA non livrés (chat, questionnaire adaptatif, synthèse) : ils répondent 501."
  );
});

export default app;
