import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const departments = pgTable("departments", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  directorId: text("director_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
