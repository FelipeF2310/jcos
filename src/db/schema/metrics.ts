import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const metricStatusEnum = pgEnum("metric_status", [
  "on-target",
  "at-risk",
  "off-target",
]);

// Polarity: whether exceeding the target is good or bad. Without this,
// status logic would mark a 98% collection rate against a 95% target as
// off-target.
export const metricDirectionEnum = pgEnum("metric_direction", [
  "lower-better",
  "higher-better",
]);

export const metrics = pgTable("metrics", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: text("department_id").notNull(),
  ownerId: text("owner_id"),
  value: numeric("value"),
  target: numeric("target"),
  unit: text("unit"),
  status: metricStatusEnum("status").notNull().default("on-target"),
  direction: metricDirectionEnum("direction").notNull().default("lower-better"),
  period: text("period").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
