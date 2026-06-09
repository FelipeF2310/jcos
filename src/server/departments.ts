import { db } from "@/db";
import { departments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDepartments() {
  return db.select().from(departments);
}

export async function getDepartmentBySlug(slug: string) {
  const rows = await db
    .select()
    .from(departments)
    .where(eq(departments.slug, slug));
  return rows[0] ?? null;
}
