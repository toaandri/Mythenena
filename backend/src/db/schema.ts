import { pgTable, text, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

// Schéma Supabase / PostgreSQL via Drizzle ORM

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // UUID
  pseudonym: text("pseudonym").notNull(),
  avatarSeed: text("avatar_seed").notNull(),
  language: text("language").notNull().default("fr"), // "fr" | "mg"
  retainHistory: boolean("retain_history").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const surveyAnswers = pgTable("survey_answers", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  surveyType: text("survey_type").notNull(), // "mini" | "adaptive"
  questionId: text("question_id").notNull(),
  questionText: text("question_text").notNull(), // version exacte affichée
  choiceIds: jsonb("choice_ids"), // null si skipped
  textAnswer: text("text_answer"),
  skipped: boolean("skipped").notNull().default(false),
  domain: text("domain").notNull(),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  flagged: boolean("flagged").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forumPosts = pgTable("forum_posts", {
  id: text("id").primaryKey(),
  pseudonym: text("pseudonym").notNull(),
  avatarSeed: text("avatar_seed").notNull(),
  content: text("content").notNull(),
  categoryId: text("category_id").notNull(),
  isFlagged: boolean("is_flagged").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const forumReplies = pgTable("forum_replies", {
  id: text("id").primaryKey(),
  postId: text("post_id").notNull().references(() => forumPosts.id),
  pseudonym: text("pseudonym").notNull(),
  avatarSeed: text("avatar_seed").notNull(),
  content: text("content").notNull(),
  isFlagged: boolean("is_flagged").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reactions = pgTable("reactions", {
  id: text("id").primaryKey(),
  targetId: text("target_id").notNull(), // postId ou replyId
  targetType: text("target_type").notNull(), // "post" | "reply"
  type: text("type").notNull(), // "support" | "strength" | "notAlone" | "heart"
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionals = pgTable("professionals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  city: text("city").notNull(),
  region: text("region").notNull(),
  languages: jsonb("languages").notNull(), // string[]
  specialties: jsonb("specialties").notNull(), // string[]
  modalities: jsonb("modalities").notNull(), // string[]
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  lat: text("lat"),
  lng: text("lng"),
  fee: text("fee"),
  schedule: text("schedule"),
  lastVerified: text("last_verified").notNull(),
  isFictional: boolean("is_fictional").notNull().default(false),
  acceptsNewPatients: boolean("accepts_new_patients").notNull().default(true),
});

export const syntheses = pgTable("syntheses", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id),
  summary: text("summary").notNull(),
  summaryMg: text("summary_mg"),
  domainsData: jsonb("domains_data").notNull(), // DomainObservation[]
  suggestedActions: jsonb("suggested_actions").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});
