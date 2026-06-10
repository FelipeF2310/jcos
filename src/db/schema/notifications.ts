import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const notifTypeEnum = pgEnum("notif_type", [
  "escalation",
  "comment",
  "action-assigned",
  "review-scheduled",
]);

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: notifTypeEnum("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  href: text("href").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
