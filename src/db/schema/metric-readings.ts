import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const metricReadings = pgTable("metric_readings", {
  id: text("id").primaryKey(),
  metricId: text("metric_id").notNull(),
  value: numeric("value").notNull(),
  period: text("period").notNull(),
  notes: text("notes"),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
