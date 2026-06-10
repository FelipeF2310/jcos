import { db } from "@/db";
import { issueComments } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function getComments(issueId: string) {
  return db
    .select()
    .from(issueComments)
    .where(eq(issueComments.issueId, issueId))
    .orderBy(asc(issueComments.createdAt));
}
