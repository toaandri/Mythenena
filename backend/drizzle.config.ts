import { defineConfig } from "drizzle-kit";
import "dotenv/config";

/**
 * drizzle-kit 0.22 utilise `dialect` + `dbCredentials.url` pour `push`.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
