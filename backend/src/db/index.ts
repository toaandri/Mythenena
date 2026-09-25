import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { loadEnv } from "../config/env";
import type { DB } from "./types";

let cached: DB | null = null;
/** Client postgres conservé pour pouvoir appeler client.end() à l'arrêt. */
let pgClient: ReturnType<typeof postgres> | null = null;

/**
 * Connexion à Supabase via la connection string PostgreSQL.
 * La lecture de l'environnement est différée à la première connexion afin que
 * les tests puissent charger le schéma sans exiger de base de données.
 */
export function getDb(): DB {
  if (cached) return cached;
  const { DATABASE_URL } = loadEnv();
  pgClient = postgres(DATABASE_URL, { max: 10, prepare: false });
  cached = drizzle(pgClient, { schema });
  return cached;
}

/**
 * Ferme proprement le pool de connexions.
 * À câbler sur SIGINT/SIGTERM dans index.ts.
 */
export async function closeDb(): Promise<void> {
  if (pgClient) {
    await pgClient.end();
    pgClient = null;
  }
  cached = null;
}

export { schema };
