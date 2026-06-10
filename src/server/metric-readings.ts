import { db } from "@/db";
import { metricReadings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getReadingsForMetric(metricId: string, limit = 12) {
  return db
    .select()
    .from(metricReadings)
    .where(eq(metricReadings.metricId, metricId))
    .orderBy(desc(metricReadings.recordedAt))
    .limit(limit);
}

export async function getLatestReadings(metricIds: string[]) {
  if (metricIds.length === 0) return [];
  const all = await db
    .select()
    .from(metricReadings)
    .orderBy(desc(metricReadings.recordedAt));
  const seen = new Set<string>();
  return all.filter((r) => {
    if (!metricIds.includes(r.metricId) || seen.has(r.metricId)) return false;
    seen.add(r.metricId);
    return true;
  });
}
