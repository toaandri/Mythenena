import "dotenv/config";
import { z } from "zod";
import type { AppConfig } from "./config";

/**
 * Les clés IA (Gemini, Groq) sont optionnelles au démarrage.
 * Le backend non-IA démarre sans elles ; leur absence est détectée
 * à l'exécution par chaque service IA.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis (Supabase > Database > Connection string)"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET doit contenir au moins 32 caractères"),
  JWT_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30),
  WEB_URL: z.string().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().optional(),
  MODERATOR_TOKENS: z.string().default(""),
  // --- IA : Gemini ---
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_TEXT_MODEL: z.string().default("gemini-1.5-flash"),
  GEMINI_TTS_MODEL: z.string().default("gemini-2.5-flash-preview-tts"),
  GEMINI_TTS_LANGUAGE: z.string().default("mg-MG"),
  // --- IA : Groq Whisper ---
  GROQ_API_KEY: z.string().optional(),
  GROQ_STT_MODEL: z.string().default("whisper-large-v3-turbo"),
});

export type Env = z.infer<typeof envSchema>;

/** Parse et valide les variables d'environnement. Appelé au démarrage uniquement. */
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(racine)"} : ${issue.message}`)
      .join("\n");
    throw new Error(`Configuration d'environnement invalide :\n${details}`);
  }
  return parsed.data;
}

function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function buildConfig(env: Env): AppConfig {
  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    jwtSecret: env.JWT_SECRET,
    jwtTtlSeconds: env.JWT_TTL_DAYS * 24 * 60 * 60,
    corsOrigins:
      env.CORS_ORIGINS !== undefined
        ? splitList(env.CORS_ORIGINS)
        : [env.WEB_URL, "http://localhost:8081", "http://localhost:19006"],
    moderatorTokens: splitList(env.MODERATOR_TOKENS),
    apiBaseUrl: `http://localhost:${env.PORT}`,
    geminiApiKey: env.GEMINI_API_KEY,
    geminiTextModel: env.GEMINI_TEXT_MODEL,
    geminiTtsModel: env.GEMINI_TTS_MODEL,
    geminiTtsLanguage: env.GEMINI_TTS_LANGUAGE,
    groqApiKey: env.GROQ_API_KEY,
    groqSttModel: env.GROQ_STT_MODEL,
  };
}

/** Raccourci de démarrage : valide l'environnement puis construit la configuration. */
export function loadConfig(): AppConfig {
  return buildConfig(loadEnv());
}
