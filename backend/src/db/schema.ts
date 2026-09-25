/**
 * Schéma PostgreSQL (Supabase) via Drizzle ORM.
 *
 * Principes du projet :
 *  - Aucune donnée d'identité réelle : les tables communautaires stockent un
 *    pseudonyme + avatarSeed, et référencent l'auteur par un sessionId opaque.
 *  - Les non-réponses sont conservées comme `skipped = true` : une question
 *    passée est une information INCONNUE, jamais un indice de souffrance.
 *  - Les colonnes `isFictional` isolent les fiches de démonstration.
 */
import {
  pgTable,
  text,
  boolean,
  timestamp,
  jsonb,
  integer,
  doublePrecision,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Sessions — accès anonyme, jamais d'identité réelle
// ---------------------------------------------------------------------------

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    pseudonym: text("pseudonym").notNull(),
    /** "generated" = fourni par le serveur, "custom" = choisi par l'utilisateur */
    pseudonymSource: text("pseudonym_source").notNull().default("generated"),
    avatarSeed: text("avatar_seed").notNull(),
    language: text("language").notNull().default("fr"),
    /** Choix de l'utilisateur : conservation de l'historique ou non. */
    retainHistory: boolean("retain_history").notNull().default(false),
    consentAt: timestamp("consent_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  },
  (t) => ({
    lastSeenIdx: index("sessions_last_seen_idx").on(t.lastSeenAt),
  })
);

// ---------------------------------------------------------------------------
// Mini-sondage — questions statiques, réponses, non-réponses
// ---------------------------------------------------------------------------

export const surveyQuestions = pgTable(
  "survey_questions",
  {
    id: text("id").primaryKey(),
    /** "mini" pour le mini-sondage de 5 questions. Réservé pour "adaptive" (phase IA). */
    surveyType: text("survey_type").notNull(),
    domain: text("domain").notNull(),
    type: text("type").notNull(), // "single" | "multiple" | "scale" | "text"
    text: text("text").notNull(),
    textMg: text("text_mg"),
    /** Le bouton « Passer » est toujours proposé sur le mini-sondage. */
    allowSkip: boolean("allow_skip").notNull().default(true),
    choices: jsonb("choices").notNull().default([]), // Choice[]
    scaleMin: integer("scale_min"),
    scaleMax: integer("scale_max"),
    position: integer("position").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    typePositionUq: uniqueIndex("survey_questions_type_position_uq").on(t.surveyType, t.position),
  })
);

export const surveyAnswers = pgTable(
  "survey_answers",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    surveyType: text("survey_type").notNull(), // "mini" | "adaptive"
    questionId: text("question_id").notNull(),
    /** Version exacte de la question affichée — historique interprétable. */
    questionText: text("question_text").notNull(),
    /** Version exacte des choix affichés (exigé par l'étape 2). */
    choicesSnapshot: jsonb("choices_snapshot"),
    /** null quand la question a été passée. */
    choiceIds: text("choice_ids").array(),
    textAnswer: text("text_answer"),
    /** true = question passée = information inconnue. */
    skipped: boolean("skipped").notNull().default(false),
    domain: text("domain").notNull(),
    answeredAt: timestamp("answered_at").defaultNow().notNull(),
  },
  (t) => ({
    // Une seule réponse courante par question : l'utilisateur peut revenir en arrière.
    sessionQuestionUq: uniqueIndex("survey_answers_session_question_uq").on(
      t.sessionId,
      t.surveyType,
      t.questionId
    ),
    sessionIdx: index("survey_answers_session_idx").on(t.sessionId, t.surveyType),
  })
);

// ---------------------------------------------------------------------------
// Discussion IA — table conservée, l'implémentation relève de la phase IA
// ---------------------------------------------------------------------------

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    flagged: boolean("flagged").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    sessionIdx: index("chat_messages_session_idx").on(t.sessionId, t.createdAt),
  })
);

// ---------------------------------------------------------------------------
// Forum communautaire
// ---------------------------------------------------------------------------

export const forumCategories = pgTable(
  "forum_categories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    labelFr: text("label_fr").notNull(),
    labelMg: text("label_mg").notNull(),
    description: text("description"),
    icon: text("icon"),
    position: integer("position").notNull(),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    slugUq: uniqueIndex("forum_categories_slug_uq").on(t.slug),
  })
);

export const forumPosts = pgTable(
  "forum_posts",
  {
    id: text("id").primaryKey(),
    /** Référence technique à l'auteur — jamais exposée dans l'API. */
    authorSessionId: text("author_session_id"),
    pseudonym: text("pseudonym").notNull(),
    avatarSeed: text("avatar_seed").notNull(),
    content: text("content").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => forumCategories.id),
    /** "visible" | "pending" (revue) | "hidden" (modéré) */
    moderationStatus: text("moderation_status").notNull().default("visible"),
    isFlagged: boolean("is_flagged").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    categoryIdx: index("forum_posts_category_idx").on(t.categoryId, t.createdAt),
    authorIdx: index("forum_posts_author_idx").on(t.authorSessionId),
    createdIdx: index("forum_posts_created_idx").on(t.createdAt),
  })
);

export const forumReplies = pgTable(
  "forum_replies",
  {
    id: text("id").primaryKey(),
    postId: text("post_id")
      .notNull()
      .references(() => forumPosts.id, { onDelete: "cascade" }),
    authorSessionId: text("author_session_id"),
    pseudonym: text("pseudonym").notNull(),
    avatarSeed: text("avatar_seed").notNull(),
    content: text("content").notNull(),
    moderationStatus: text("moderation_status").notNull().default("visible"),
    isFlagged: boolean("is_flagged").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    postIdx: index("forum_replies_post_idx").on(t.postId, t.createdAt),
    authorIdx: index("forum_replies_author_idx").on(t.authorSessionId),
  })
);

export const reactions = pgTable(
  "reactions",
  {
    id: text("id").primaryKey(),
    targetId: text("target_id").notNull(),
    targetType: text("target_type").notNull(), // "post" | "reply"
    type: text("type").notNull(), // "support" | "strength" | "notAlone" | "heart"
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueUq: uniqueIndex("reactions_unique_uq").on(t.sessionId, t.targetType, t.targetId, t.type),
    targetIdx: index("reactions_target_idx").on(t.targetType, t.targetId),
  })
);

export const forumBlocks = pgTable(
  "forum_blocks",
  {
    id: text("id").primaryKey(),
    blockerSessionId: text("blocker_session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    blockedSessionId: text("blocked_session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    uniqueUq: uniqueIndex("forum_blocks_unique_uq").on(t.blockerSessionId, t.blockedSessionId),
  })
);

/** File de modération humaine. Le pré-criblage par IA relèvera de la phase IA. */
export const forumReports = pgTable(
  "forum_reports",
  {
    id: text("id").primaryKey(),
    targetId: text("target_id").notNull(),
    targetType: text("target_type").notNull(), // "post" | "reply"
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").notNull().default("pending"), // "pending" | "reviewed" | "dismissed"
    reporterSessionId: text("reporter_session_id"),
    reviewedAt: timestamp("reviewed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("forum_reports_status_idx").on(t.status, t.createdAt),
    targetIdx: index("forum_reports_target_idx").on(t.targetType, t.targetId),
  })
);

// ---------------------------------------------------------------------------
// Annuaire — professionnels et associations
// ---------------------------------------------------------------------------

export const professionals = pgTable(
  "professionals",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    city: text("city").notNull(),
    region: text("region").notNull(),
    languages: text("languages").array().notNull(),
    specialties: text("specialties").array().notNull(),
    modalities: text("modalities").array().notNull(),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    bio: text("bio"),
    /** Publié uniquement lorsque les informations ont été vérifiées avec l'accord de la personne. */
    fee: text("fee"),
    schedule: text("schedule"),
    lastVerified: text("last_verified").notNull(),
    /** true = fiche de démonstration : les actions de contact sont désactivées. */
    isFictional: boolean("is_fictional").notNull().default(false),
    acceptsNewPatients: boolean("accepts_new_patients").notNull().default(true),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    cityIdx: index("professionals_city_idx").on(t.city),
    fictionalIdx: index("professionals_fictional_idx").on(t.isFictional),
  })
);

export const associations = pgTable(
  "associations",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    descriptionMg: text("description_mg"),
    city: text("city").notNull(),
    region: text("region"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    lastVerified: text("last_verified").notNull(),
    isFictional: boolean("is_fictional").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    cityIdx: index("associations_city_idx").on(t.city),
  })
);

/**
 * Demande de prise de contact (étape 6, optionnelle).
 *
 * ⚠️  Par conception, cette table ne contient AUCUNE colonne issue des
 * questionnaires, de la conversation ou de la synthèse. Aucun transfert de
 * données de santé ne peut donc avoir lieu, même par inadvertance.
 */
export const contactRequests = pgTable(
  "contact_requests",
  {
    id: text("id").primaryKey(),
    professionalId: text("professional_id")
      .notNull()
      .references(() => professionals.id, { onDelete: "cascade" }),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    message: text("message"),
    status: text("status").notNull().default("pending"), // "pending" | "sent" | "closed"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    professionalIdx: index("contact_requests_professional_idx").on(t.professionalId),
  })
);

// ---------------------------------------------------------------------------
// Bibliothèque de ressources et psycho-éducation
// ---------------------------------------------------------------------------

export const resources = pgTable(
  "resources",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    type: text("type").notNull(), // "article" | "exercise" | "guide"
    title: text("title").notNull(),
    titleMg: text("title_mg"),
    summary: text("summary").notNull(),
    summaryMg: text("summary_mg"),
    body: text("body").notNull(),
    bodyMg: text("body_mg"),
    tags: text("tags").array().notNull(),
    readingMinutes: integer("reading_minutes"),
    /** Certains contenus doivent rester accessibles hors connexion. */
    isOfflineAvailable: boolean("is_offline_available").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(false),
    publishedAt: timestamp("published_at"),
    author: text("author"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    slugUq: uniqueIndex("resources_slug_uq").on(t.slug),
    typeIdx: index("resources_type_idx").on(t.type, t.isPublished),
  })
);

// ---------------------------------------------------------------------------
// Synthèse — structure conservée, la génération relève de la phase IA
// ---------------------------------------------------------------------------

export const syntheses = pgTable(
  "syntheses",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    summary: text("summary").notNull(),
    summaryMg: text("summary_mg"),
    domainsData: jsonb("domains_data").notNull(), // DomainObservation[]
    suggestedActions: jsonb("suggested_actions").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
  },
  (t) => ({
    sessionIdx: index("syntheses_session_idx").on(t.sessionId, t.generatedAt),
  })
);

/** Correction libre de l'utilisateur sur une observation de la synthèse. */
export const synthesisCorrections = pgTable(
  "synthesis_corrections",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    domainId: text("domain_id").notNull(),
    userNote: text("user_note").notNull(),
    correctedAt: timestamp("corrected_at").defaultNow().notNull(),
  },
  (t) => ({
    sessionIdx: index("synthesis_corrections_session_idx").on(t.sessionId, t.correctedAt),
  })
);

export type SessionRow = typeof sessions.$inferSelect;
export type SurveyQuestionRow = typeof surveyQuestions.$inferSelect;
export type SurveyAnswerRow = typeof surveyAnswers.$inferSelect;
export type ForumCategoryRow = typeof forumCategories.$inferSelect;
export type ForumPostRow = typeof forumPosts.$inferSelect;
export type ForumReplyRow = typeof forumReplies.$inferSelect;
export type ReactionRow = typeof reactions.$inferSelect;
export type ForumBlockRow = typeof forumBlocks.$inferSelect;
export type ForumReportRow = typeof forumReports.$inferSelect;
export type ProfessionalRow = typeof professionals.$inferSelect;
export type AssociationRow = typeof associations.$inferSelect;
export type ContactRequestRow = typeof contactRequests.$inferSelect;
export type ResourceRow = typeof resources.$inferSelect;
export type SynthesisRow = typeof syntheses.$inferSelect;
export type SynthesisCorrectionRow = typeof synthesisCorrections.$inferSelect;
