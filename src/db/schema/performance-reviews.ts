import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const reviewTypeEnum = pgEnum("review_type", ["weekly", "monthly"]);
export const reviewStatusEnum = pgEnum("review_status", ["scheduled", "completed"]);

export const performanceReviews = pgTable("performance_reviews", {
  id: text("id").primaryKey(),
  type: reviewTypeEnum("type").notNull(),
  departmentId: text("department_id"),
  reviewDate: timestamp("review_date").notNull(),
  attendees: text("attendees"),
  summary: text("summary"),
  status: reviewStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewIssues = pgTable("review_issues", {
  id: text("id").primaryKey(),
  reviewId: text("review_id").notNull(),
  issueId: text("issue_id").notNull(),
  notes: text("notes"),
});
