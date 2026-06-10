import { db } from "@/db";
import { performanceReviews, reviewIssues } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getReviews(departmentId?: string) {
  const all = await db
    .select()
    .from(performanceReviews)
    .orderBy(desc(performanceReviews.reviewDate));
  if (departmentId) return all.filter((r) => r.departmentId === departmentId || r.type === "monthly");
  return all;
}

export async function getReview(id: string) {
  const rows = await db.select().from(performanceReviews).where(eq(performanceReviews.id, id));
  return rows[0] ?? null;
}

export async function getReviewIssues(reviewId: string) {
  return db.select().from(reviewIssues).where(eq(reviewIssues.reviewId, reviewId));
}
