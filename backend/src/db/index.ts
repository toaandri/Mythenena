import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { loadEnv } from "../config/env";
import type { DB } from "./types";

let cached: DB | null = null;

/**
 * Connexion à Supabase via la connection string PostgreSQL.
 * La lecture de l'environnement est différée à la première connexion afin que
 * les tests puissent charger le schéma sans exiger de base de données.
 */
export function getDb(): DB {
  if (cached) return cached;
  const { DATABASE_URL } = loadEnv();
  const client = postgres(DATABASE_URL, { max: 10, prepare: false });
  cached = drizzle(client, { schema });
  return cached;
}

export async function closeDb(): Promise<void> {
  // La connexion est gc-friendly : postgres-js se ferme avec le processus.
  cached = null;
}

export { schema };
