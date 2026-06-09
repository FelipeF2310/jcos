import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getActions(issueId?: string) {
  if (issueId) {
    return db.select().from(actions).where(eq(actions.issueId, issueId));
  }
  return db.select().from(actions);
}

export async function getAction(id: string) {
  const rows = await db.select().from(actions).where(eq(actions.id, id));
  return rows[0] ?? null;
}
