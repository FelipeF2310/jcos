import { pgTable, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["executive", "director", "staff"]);

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("staff"),
  departmentId: text("department_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
