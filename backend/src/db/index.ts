import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connexion à Supabase via la connection string PostgreSQL
// Mettre DATABASE_URL dans .env
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });
