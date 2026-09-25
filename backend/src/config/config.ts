/** Configuration applicative injectée dans l'app — jamais lue globalement ailleurs. */
export interface AppConfig {
  nodeEnv: "development" | "test" | "production";
  port: number;
  jwtSecret: string;
  /** Durée de validité du jeton de session, en secondes. */
  jwtTtlSeconds: number;
  corsOrigins: string[];
  /** Jetons statiques des modérateurs du forum (séparés par des virgules). */
  moderatorTokens: string[];
  /** Adresse publique de l'API, utilisée dans les messages de repli. */
  apiBaseUrl: string;
  // --- IA : Gemini ---
  geminiApiKey?: string;
  geminiTextModel: string;
  geminiTtsModel: string;
  geminiTtsLanguage: string;
  // --- IA : Groq Whisper ---
  groqApiKey?: string;
  groqSttModel: string;
}
