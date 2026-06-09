import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const actionStatusEnum = pgEnum("action_status", [
  "not-started",
  "in-progress",
  "complete",
]);

export const actions = pgTable("actions", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  issueId: text("issue_id").notNull(),
  ownerId: text("owner_id").notNull(),
  status: actionStatusEnum("status").notNull().default("not-started"),
  progressNotes: text("progress_notes"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
