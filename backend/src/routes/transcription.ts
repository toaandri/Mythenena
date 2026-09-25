/**
 * Transcription vocale (étape 3 — entrée vocale).
 *
 * POST /api/transcription
 * Reçoit un fichier audio multipart, appelle Groq Whisper, retourne le texte.
 * Limite : 25 Mo (limite Free Tier Groq).
 */

import { Hono } from "hono";
import type { Repos } from "../repositories";
import type { AppBindings } from "../types/context";
import { ApiError } from "../utils/errors";
import * as transcriptionService from "../services/transcriptionService";
import { ServiceUnavailableError } from "../services/aiService";

const MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25 Mo
const ALLOWED_MIMETYPES = new Set([
  "audio/wav",
  "audio/wave",
  "audio/webm",
  "audio/mp4",
  "audio/m4a",
  "audio/mpeg",
  "audio/ogg",
  "audio/flac",
]);

export function createTranscriptionRoutes(_deps: { repos: Repos }): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  /**
   * POST /api/transcription
   * Body: multipart/form-data
   *   - audio: File (WAV, WEBM, M4A, MP3, OGG, FLAC — max 25 Mo)
   *   - language: "fr" | "mg" (optionnel, améliore la précision)
   */
  app.post("/", async (c) => {
    let formData: FormData;
    try {
      formData = await c.req.formData();
    } catch {
      throw ApiError.badRequest(
        "Le corps de la requête doit être de type multipart/form-data.",
        { field: "audio" }
      );
    }

    const audioFile = formData.get("audio");
    if (!(audioFile instanceof File)) {
      throw ApiError.badRequest(
        "Un fichier audio est requis dans le champ 'audio'.",
        { field: "audio" }
      );
    }

    // Validation taille
    if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
      throw ApiError.badRequest(
        `Le fichier audio dépasse la limite de 25 Mo (reçu : ${(audioFile.size / 1024 / 1024).toFixed(1)} Mo).`,
        { field: "audio", maxSizeMb: 25 }
      );
    }

    // Validation type MIME (souple — certains clients envoient audio/octet-stream)
    const mimeType = audioFile.type.toLowerCase().split(";")[0]?.trim() ?? "";
    if (mimeType && !ALLOWED_MIMETYPES.has(mimeType) && mimeType !== "application/octet-stream") {
      throw ApiError.badRequest(
        `Type de fichier non supporté : ${mimeType}. Formats acceptés : WAV, WEBM, M4A, MP3, OGG, FLAC.`,
        { field: "audio", received: mimeType }
      );
    }

    const languageHint = formData.get("language");
    const hint: "fr" | "mg" | undefined =
      languageHint === "mg" ? "mg" : languageHint === "fr" ? "fr" : undefined;

    const audioBuffer = await audioFile.arrayBuffer();

    let result: Awaited<ReturnType<typeof transcriptionService.transcribe>>;
    try {
      result = await transcriptionService.transcribe(audioBuffer, audioFile.name || "audio.webm", hint);
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        throw new ApiError(503, "service_unavailable", err.message);
      }
      throw err;
    }

    return c.json({
      text: result.text,
      language_detected: result.language,
    });
  });

  return app;
}
