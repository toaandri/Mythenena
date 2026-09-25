/** Types backend-only — les types partagés restent importés depuis `shared/`. */

export const REACTION_TYPES = ["support", "strength", "notAlone", "heart"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const REPORT_TARGET_TYPES = ["post", "reply"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_STATUSES = ["pending", "reviewed", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

/**
 * Motifs de signalement. Le signalement alimente une file de modération
 * humaine : la modération assistée par IA relève de la phase IA.
 */
export const REPORT_REASONS = [
  "harassment",
  "personal-info",
  "dangerous-content",
  "hate-speech",
  "spam",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const POST_SORTS = ["recent", "oldest", "discussed"] as const;
export type PostSort = (typeof POST_SORTS)[number];

export const MODERATION_STATUSES = ["visible", "pending", "hidden"] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];
