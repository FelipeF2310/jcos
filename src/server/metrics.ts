import { db } from "@/db";
import { metrics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getMetrics(departmentId?: string) {
  if (departmentId) {
    return db
      .select()
      .from(metrics)
      .where(eq(metrics.departmentId, departmentId));
  }
  return db.select().from(metrics);
}

export async function getOffTargetMetrics() {
  return db
    .select()
    .from(metrics)
    .where(eq(metrics.status, "off-target"));
}
