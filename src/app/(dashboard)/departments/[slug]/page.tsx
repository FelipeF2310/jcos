import { notFound } from "next/navigation";
import { getMetrics } from "@/server/metrics";
import { getIssues } from "@/server/issues";
import { MetricStatusBadge, IssueStatusBadge } from "@/components/issues/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const DEPARTMENTS: Record<string, { name: string; description: string }> = {
  "public-works": {
    name: "Public Works",
    description: "Pothole response, illegal dumping, street cleaning, work orders",
  },
  "resident-response": {
    name: "Resident Response Center",
    description: "311 requests, response times, resolution rates",
  },
  "engineering-permitting": {
    name: "Engineering & Permitting",
    description: "Permit review, inspections, approval cycles",
  },
};

export default async function DepartmentScorecardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dept = DEPARTMENTS[slug];
  if (!dept) notFound();

  const [deptMetrics, deptIssues] = await Promise.all([
    getMetrics(slug),
    getIssues(slug),
  ]);

  const openIssues = deptIssues.filter((i) => i.status !== "resolved");
  const escalatedIssues = deptIssues.filter((i) => i.status === "escalated");
  const offTarget = deptMetrics.filter((m) => m.status === "off-target");
  const atRisk = deptMetrics.filter((m) => m.status === "at-risk");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{dept.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{dept.description}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Metrics</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{deptMetrics.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Off Target</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{offTarget.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Issues</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-yellow-600">{openIssues.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Escalated</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-red-600">{escalatedIssues.length}</p></CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Performance Metrics</h2>
        {deptMetrics.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 border rounded-lg text-center">No metrics recorded yet for this department.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {deptMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <MetricStatusBadge status={metric.status} />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {metric.value ?? "—"}{metric.unit ? ` ${metric.unit}` : ""}
                  </p>
                  {metric.target && (
                    <p className="text-xs text-muted-foreground mt-1">Target: {metric.target}{metric.unit ? ` ${metric.unit}` : ""}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Open Issues</h2>
          <Link href={`/issues/new`} className="text-sm text-blue-600 hover:underline">+ New Issue</Link>
        </div>
        {openIssues.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 border rounded-lg text-center">No open issues.</p>
        ) : (
          <div className="space-y-2">
            {openIssues.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between rounded-lg border p-4">
                <Link href={`/issues/${issue.id}`} className="font-medium text-sm hover:underline">{issue.title}</Link>
                <IssueStatusBadge status={issue.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
