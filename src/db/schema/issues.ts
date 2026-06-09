import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const issueStatusEnum = pgEnum("issue_status", [
  "open",
  "in-progress",
  "resolved",
  "escalated",
]);

export const issuePriorityEnum = pgEnum("issue_priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const issues = pgTable("issues", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  departmentId: text("department_id").notNull(),
  ownerId: text("owner_id"),
  status: issueStatusEnum("status").notNull().default("open"),
  priority: issuePriorityEnum("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});
