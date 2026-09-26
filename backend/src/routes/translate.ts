import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppConfig } from "../config/config";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";
import * as aiService from "../services/aiService";

const LANGUAGE_CODES = ["auto", "fr", "mg", "en", "es", "de", "it", "pt", "ar", "zh-Hans", "ja", "ko"] as const;

const translationBody = z.object({
  text: z.string().trim().min(1).max(5000),
  source: z.enum(LANGUAGE_CODES).default("auto"),
  target: z.enum(LANGUAGE_CODES).refine((language) => language !== "auto", "Une langue cible est requise."),
});

export function createTranslationRoutes(deps: { config: AppConfig }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  app.post("/", zValidator("json", translationBody), async (c) => {
    if (!deps.config.geminiApiKey) {
      throw new ApiError(503, "service_unavailable", "La traduction IA n'est pas configurée.");
    }

    const { text, source, target } = c.req.valid("json");
    try {
      const translated = await aiService.translateText(text, source, target);
      return c.json({ translated, ...(source === "auto" ? {} : { detectedLang: source }) });
    } catch (error) {
      if (error instanceof aiService.ServiceUnavailableError) {
        throw new ApiError(503, "service_unavailable", error.message);
      }
      throw new ApiError(502, "translation_failed", "Le service de traduction est indisponible.");
    }
  });

  return app;
}