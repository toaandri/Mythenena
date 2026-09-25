// i18n — configuration multilingue FR / Malagasy
// TODO: initialiser i18next avec expo-localization

export type SupportedLanguage = "fr" | "mg";

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["fr", "mg"];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  fr: "Français",
  mg: "Malagasy",
};
