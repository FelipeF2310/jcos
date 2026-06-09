import { db } from "@/db";
import { issues } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getIssues(departmentId?: string) {
  if (departmentId) {
    return db.select().from(issues).where(eq(issues.departmentId, departmentId));
  }
  return db.select().from(issues);
}

export async function getIssue(id: string) {
  const rows = await db.select().from(issues).where(eq(issues.id, id));
  return rows[0] ?? null;
}
