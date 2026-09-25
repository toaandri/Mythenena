/**
 * Service de transcription vocale — Groq Whisper
 *
 * Reçoit un fichier audio et retourne le texte transcrit.
 * Modèle : whisper-large-v3-turbo (Free Tier Groq)
 */

import Groq from "groq-sdk";
import { ServiceUnavailableError } from "./aiService";

function getGroqClient(): Groq {
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new ServiceUnavailableError(
      "GROQ_API_KEY non configurée — la transcription vocale est indisponible."
    );
  }
  return new Groq({ apiKey: key });
}

export interface TranscriptionResult {
  text: string;
  language?: string;
}

/**
 * Transcrit un fichier audio en texte.
 * Supporte le malagasy, le français et leur mélange.
 *
 * @param audioBuffer - Contenu binaire du fichier audio
 * @param filename - Nom du fichier avec extension (ex: audio.webm)
 * @param hint - Langue attendue ("fr" | "mg") pour améliorer la précision
 */
export async function transcribe(
  audioBuffer: ArrayBuffer,
  filename: string,
  hint?: "fr" | "mg"
): Promise<TranscriptionResult> {
  const groq = getGroqClient();
  const model = process.env.GROQ_STT_MODEL ?? "whisper-large-v3-turbo";

  // Mapper le hint de langue vers le code ISO attendu par Whisper
  const languageCode = hint === "mg" ? "mg" : hint === "fr" ? "fr" : undefined;

  const blob = new Blob([audioBuffer]);
  const file = new File([blob], filename);

  const transcription = await groq.audio.transcriptions.create({
    file,
    model,
    ...(languageCode ? { language: languageCode } : {}),
    response_format: "verbose_json",
  });

  return {
    text: transcription.text,
    language: (transcription as unknown as Record<string, unknown>).language as string | undefined,
  };
}

export default { transcribe };
