import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import type { OpportunityStatus } from "@/lib/validations/opportunity";
import type { ExtractionState } from "@/lib/validations/resume";
import type { RequirementCategory } from "@/lib/validations/requirement";
import type { EvidenceType } from "@/lib/validations/evidence";

/** Better Auth records use public-schema tables but are server-only and Data API restricted. */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export const opportunities = pgTable(
  "opportunities",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    role: text("role").notNull(),
    jobDescription: text("job_description").notNull(),
    sourceUrl: text("source_url"),
    status: text("status").$type<OpportunityStatus>().notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("opportunities_user_id_idx").on(table.userId),
    index("opportunities_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export type Opportunity = typeof opportunities.$inferSelect;
export type NewOpportunity = typeof opportunities.$inferInsert;

export const resumes = pgTable(
  "resumes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    opportunityId: text("opportunity_id")
      .notNull()
      .unique()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size").notNull(),
    fileType: text("file_type").notNull(),
    storagePath: text("storage_path").notNull(),
    extractionState: text("extraction_state")
      .$type<ExtractionState>()
      .notNull()
      .default("pending"),
    extractedText: text("extracted_text"),
    reviewedText: text("reviewed_text"),
    aiOptIn: boolean("ai_opt_in").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("resumes_opportunity_id_idx").on(table.opportunityId),
    index("resumes_user_id_idx").on(table.userId),
  ],
);

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;

export const requirements = pgTable(
  "requirements",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: text("category").$type<RequirementCategory>().notNull(),
    jobDescriptionExcerpt: text("job_description_excerpt").notNull(),
    coverageState: text("coverage_state"),
    orderIndex: integer("order_index").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("requirements_opportunity_id_idx").on(table.opportunityId),
    index("requirements_user_id_idx").on(table.userId),
    index("requirements_opp_order_idx").on(table.opportunityId, table.orderIndex),
  ],
);

export type Requirement = typeof requirements.$inferSelect;
export type NewRequirement = typeof requirements.$inferInsert;

export const userDailyUsage = pgTable(
  "user_daily_usage",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    date: text("date").notNull(),
    count: integer("count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("user_daily_usage_user_id_idx").on(table.userId),
    uniqueIndex("user_daily_usage_user_action_date_idx").on(table.userId, table.action, table.date),
  ],
);

export type UserDailyUsage = typeof userDailyUsage.$inferSelect;
export type NewUserDailyUsage = typeof userDailyUsage.$inferInsert;

export const evidenceItems = pgTable(
  "evidence_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: text("type").$type<EvidenceType>().notNull(),
    sourceUrl: text("source_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("evidence_items_user_id_idx").on(table.userId),
    index("evidence_items_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export type EvidenceItem = typeof evidenceItems.$inferSelect;
export type NewEvidenceItem = typeof evidenceItems.$inferInsert;

export const opportunityEvidence = pgTable(
  "opportunity_evidence",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    evidenceItemId: text("evidence_item_id")
      .notNull()
      .references(() => evidenceItems.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("opportunity_evidence_opp_evidence_idx").on(
      table.opportunityId,
      table.evidenceItemId,
    ),
    index("opportunity_evidence_opportunity_id_idx").on(table.opportunityId),
    index("opportunity_evidence_evidence_item_id_idx").on(table.evidenceItemId),
    index("opportunity_evidence_user_id_idx").on(table.userId),
  ],
);

export type OpportunityEvidence = typeof opportunityEvidence.$inferSelect;
export type NewOpportunityEvidence = typeof opportunityEvidence.$inferInsert;

export const schema = {
  user,
  session,
  account,
  verification,
  opportunities,
  resumes,
  requirements,
  userDailyUsage,
  evidenceItems,
  opportunityEvidence,
};

