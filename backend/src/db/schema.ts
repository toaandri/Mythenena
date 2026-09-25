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

// ---------------------------------------------------------------------------
// Module Entretien Analytique — profil évolutif et entretien structuré
// ---------------------------------------------------------------------------

/**
 * Sessions d'entretien analytique.
 * Une session = un objectif de conversation, suivie sur plusieurs visites.
 * userId est le sessionId anonyme de la table sessions.
 */
export const interviewSessions = pgTable(
  "interview_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    objective: text("objective").notNull(),
    /** Phase actuelle du protocole (0 = intention, 1 = récit libre ... 9 = mise à jour profil) */
    currentPhase: integer("current_phase").notNull().default(0),
    status: text("status").notNull().default("active"), // "active" | "completed" | "paused"
    /** Préférences Kolb observées au fil des turns (jsonb) */
    kolbProfile: jsonb("kolb_profile").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("interview_sessions_user_idx").on(t.userId, t.createdAt),
    statusIdx: index("interview_sessions_status_idx").on(t.status),
  })
);

/** Un tour de parole dans une session d'entretien. */
export const interviewTurns = pgTable(
  "interview_turns",
  {
    id: text("id").primaryKey(),
    interviewSessionId: text("interview_session_id")
      .notNull()
      .references(() => interviewSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    /** Méthode appliquée par l'IA pour ce tour */
    methodUsed: text("method_used"), // "narrative" | "oars" | "socratic" | "values" | "kolb" | "identity" | "synthesis"
    /** Objectif de la question posée */
    questionGoal: text("question_goal"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    sessionIdx: index("interview_turns_session_idx").on(t.interviewSessionId, t.createdAt),
  })
);

/**
 * Éléments structurés extraits des tours de parole.
 * Chaque élément est rattaché à son turn source pour traçabilité.
 */
export const evidenceItems = pgTable(
  "evidence_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    turnId: text("turn_id"),
    /** Type d'élément extrait */
    type: text("type").notNull(), // "event" | "emotion" | "belief" | "value" | "goal" | "action" | "contradiction" | "unknown"
    content: text("content").notNull(),
    period: text("period"),
    confidence: text("confidence").notNull().default("low"), // "low" | "medium" | "high"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("evidence_items_user_idx").on(t.userId, t.createdAt),
    typeIdx: index("evidence_items_type_idx").on(t.userId, t.type),
  })
);

/** Événements de vie placés sur la chronologie personnelle. */
export const lifeEvents = pgTable(
  "life_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    period: text("period"),
    event: text("event").notNull(),
    emotion: text("emotion"),
    meaningGiven: text("meaning_given"),
    decision: text("decision"),
    consequence: text("consequence"),
    /** IDs des turns source */
    evidenceIds: text("evidence_ids").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("life_events_user_idx").on(t.userId, t.createdAt),
  })
);

/**
 * Dimensions d'identité personnelle (carte d'identité évolutive).
 * Une ligne par (userId, domain) — upsert à chaque mise à jour.
 */
export const identityDomains = pgTable(
  "identity_domains",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    /** personal | family | social | cultural | school_work | digital | projected | history */
    domain: text("domain").notNull(),
    content: jsonb("content").notNull().default({}),
    evidenceIds: text("evidence_ids").array(),
    confidence: text("confidence").notNull().default("low"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userDomainUq: uniqueIndex("identity_domains_user_domain_uq").on(t.userId, t.domain),
  })
);

/** Carte des valeurs : ce que la personne déclare important vs. ce qu'elle fait. */
export const valuesMap = pgTable(
  "values_map",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    valueName: text("value_name").notNull(),
    claimedImportance: text("claimed_importance").notNull().default("medium"), // "high" | "medium" | "low"
    behaviorExamples: jsonb("behavior_examples").notNull().default([]),
    conflicts: jsonb("conflicts").notNull().default([]),
    confidence: text("confidence").notNull().default("low"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userValueUq: uniqueIndex("values_map_user_value_uq").on(t.userId, t.valueName),
    userIdx: index("values_map_user_idx").on(t.userId),
  })
);

/**
 * Schémas comportementaux récurrents identifiés sur au moins 2 exemples.
 * trigger → interprétation → émotion → action → résultat court terme → résultat long terme
 */
export const behaviorPatterns = pgTable(
  "behavior_patterns",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    trigger: text("trigger").notNull(),
    interpretation: text("interpretation"),
    emotion: text("emotion"),
    action: text("action"),
    shortTermResult: text("short_term_result"),
    longTermResult: text("long_term_result"),
    evidenceFor: text("evidence_for").array(),
    evidenceAgainst: text("evidence_against").array(),
    confidence: text("confidence").notNull().default("low"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("behavior_patterns_user_idx").on(t.userId),
  })
);

/**
 * Hypothèses provisoires de l'IA sur la personne.
 * Toujours formulées comme hypothèses vérifiables, jamais comme vérités.
 */
export const hypotheses = pgTable(
  "hypotheses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    evidenceFor: text("evidence_for").array(),
    evidenceAgainst: text("evidence_against").array(),
    confidence: text("confidence").notNull().default("low"),
    /** exploring | plausible | confirmed | corrected | rejected */
    status: text("status").notNull().default("exploring"),
    /** Correction libre de l'utilisateur */
    userCorrection: text("user_correction"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userStatusIdx: index("hypotheses_user_status_idx").on(t.userId, t.status),
  })
);

/** Contradictions détectées entre deux affirmations de l'utilisateur. */
export const contradictions = pgTable(
  "contradictions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    statementA: text("statement_a").notNull(),
    statementB: text("statement_b").notNull(),
    contextDifference: text("context_difference"),
    /** open | explained | resolved */
    status: text("status").notNull().default("open"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("contradictions_user_idx").on(t.userId, t.status),
  })
);

/**
 * Préférences d'apprentissage Kolb observées.
 * Une seule ligne par userId — upsert à chaque observation.
 * Scores de 0.0 à 1.0 normalisés sur l'ensemble des interactions.
 */
export const learningPreferences = pgTable(
  "learning_preferences",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    domain: text("domain"),
    actionScore: doublePrecision("action_score").notNull().default(0),
    observationScore: doublePrecision("observation_score").notNull().default(0),
    conceptualizationScore: doublePrecision("conceptualization_score").notNull().default(0),
    applicationScore: doublePrecision("application_score").notNull().default(0),
    evidenceIds: text("evidence_ids").array(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  },
  (t) => ({
    userUq: uniqueIndex("learning_preferences_user_uq").on(t.userId),
  })
);

/**
 * Deltas de profil — seuls les changements du turn sont sauvegardés.
 * Le profil complet est reconstruit en agrégeant les deltas dans l'ordre.
 */
export const profileSnapshots = pgTable(
  "profile_snapshots",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    /** Contient uniquement les changements : { newEvents, updatedHypotheses, newPatterns, ... } */
    delta: jsonb("delta").notNull().default({}),
    /** Turn source de ce delta */
    turnId: text("turn_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("profile_snapshots_user_idx").on(t.userId, t.createdAt),
  })
);

// ---------------------------------------------------------------------------
// Module Activités Interactives — bibliothèque et sessions
// ---------------------------------------------------------------------------

/**
 * Bibliothèque des activités interactives validées.
 * Le moteur choisit UNIQUEMENT dans cette bibliothèque — jamais librement.
 */
export const activityLibrary = pgTable(
  "activity_library",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    /** breathing | grounding | emotion | cognitive | behavioral | values | relational */
    category: text("category").notNull(),
    durationMinSeconds: integer("duration_min_seconds").notNull().default(30),
    durationMaxSeconds: integer("duration_max_seconds").notNull().default(180),
    /** Modes Kolb compatibles : accommodating, diverging, assimilating, converging */
    kolbModes: text("kolb_modes").array(),
    /** États cibles : tension, tristesse, rumination, fatigue, agitation, colère, solitude */
    stateTargets: text("state_targets").array(),
    /** Niveaux d'énergie compatibles : very_low | low | medium | high */
    energyLevels: text("energy_levels").array(),
    /** Contextes où cette activité est contre-indiquée */
    contraindications: text("contraindications").array(),
    descriptionFr: text("description_fr").notNull(),
    descriptionMg: text("description_mg"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (t) => ({
    slugUq: uniqueIndex("activity_library_slug_uq").on(t.slug),
    categoryIdx: index("activity_library_category_idx").on(t.category, t.isActive),
  })
);

/** Une session d'activité interactive menée par un utilisateur. */
export const activitySessions = pgTable(
  "activity_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    activitySlug: text("activity_slug").notNull(),
    /** Les 6 axes envoyés lors de la sélection (jsonb) */
    stateAxes: jsonb("state_axes").notNull().default({}),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    /** Retour de l'utilisateur : better | same | worse */
    feedback: text("feedback"),
    feedbackNote: text("feedback_note"),
    wasAbandoned: boolean("was_abandoned").notNull().default(false),
  },
  (t) => ({
    userIdx: index("activity_sessions_user_idx").on(t.userId, t.startedAt),
    slugIdx: index("activity_sessions_slug_idx").on(t.activitySlug),
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
// Interview & Profile module types
export type InterviewSessionRow = typeof interviewSessions.$inferSelect;
export type InterviewTurnRow = typeof interviewTurns.$inferSelect;
export type EvidenceItemRow = typeof evidenceItems.$inferSelect;
export type LifeEventRow = typeof lifeEvents.$inferSelect;
export type IdentityDomainRow = typeof identityDomains.$inferSelect;
export type ValuesMapRow = typeof valuesMap.$inferSelect;
export type BehaviorPatternRow = typeof behaviorPatterns.$inferSelect;
export type HypothesisRow = typeof hypotheses.$inferSelect;
export type ContradictionRow = typeof contradictions.$inferSelect;
export type LearningPreferencesRow = typeof learningPreferences.$inferSelect;
export type ProfileSnapshotRow = typeof profileSnapshots.$inferSelect;
// Activity module types
export type ActivityLibraryRow = typeof activityLibrary.$inferSelect;
export type ActivitySessionRow = typeof activitySessions.$inferSelect;
