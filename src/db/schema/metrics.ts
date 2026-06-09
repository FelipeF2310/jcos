import { pgTable, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const metricStatusEnum = pgEnum("metric_status", [
  "on-target",
  "at-risk",
  "off-target",
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
  period: text("period").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
