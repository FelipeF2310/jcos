import { getIssues } from "@/server/issues";
import { getMetrics } from "@/server/metrics";
import { getOffTargetMetrics } from "@/server/metrics";
import { IssueStatusBadge, MetricStatusBadge } from "@/components/issues/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const HEALTH_AREAS = [
  { id: "public-safety", label: "Public Safety", slug: null },
  { id: "housing", label: "Housing", slug: null },
  { id: "infrastructure", label: "Infrastructure", slug: "public-works" },
  { id: "constituent-services", label: "Constituent Services", slug: "resident-response" },
  { id: "economic-development", label: "Economic Development", slug: null },
];

const DEPARTMENTS = [
  { id: "public-works", name: "Public Works" },
  { id: "resident-response", name: "Resident Response" },
  { id: "engineering-permitting", name: "Engineering & Permitting" },
];

export default async function ExecutiveScorecardPage() {
  const [allIssues, offTarget] = await Promise.all([
    getIssues(),
    getOffTargetMetrics(),
  ]);

  const escalated = allIssues.filter((i) => i.status === "escalated");
  const openIssues = allIssues.filter((i) => i.status !== "resolved");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Executive Scorecard</h1>
        <p className="text-muted-foreground text-sm mt-1">Citywide performance overview — Jersey City Operating System</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Issues</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <p className="text-3xl font-bold">{openIssues.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Escalated Issues</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <p className="text-3xl font-bold text-red-600">{escalated.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Metrics Off Target</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <XCircle className="h-8 w-8 text-red-500" />
            <p className="text-3xl font-bold text-red-600">{offTarget.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">City Health Indicators</h2>
        <div className="grid grid-cols-5 gap-3">
          {HEALTH_AREAS.map((area) => (
            <Card key={area.id} className="text-center">
              <CardContent className="pt-6 pb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">{area.label}</p>
                {area.slug && (
                  <Link href={`/departments/${area.slug}`} className="text-xs text-blue-600 hover:underline mt-1 block">
                    View scorecard
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {escalated.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" /> Executive Exceptions — Requires Attention
          </h2>
          <div className="space-y-2">
            {escalated.map((issue) => (
              <div key={issue.id} className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
                <div>
                  <Link href={`/issues/${issue.id}`} className="font-medium text-sm hover:underline">{issue.title}</Link>
                  <p className="text-xs text-muted-foreground mt-0.5">{issue.departmentId}</p>
                </div>
                <IssueStatusBadge status={issue.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {offTarget.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Off-Target Metrics</h2>
          <div className="grid grid-cols-2 gap-3">
            {offTarget.map((metric) => (
              <Card key={metric.id} className="border-red-200">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  <MetricStatusBadge status={metric.status} />
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold">{metric.value ?? "—"}{metric.unit ? ` ${metric.unit}` : ""}</p>
                  {metric.target && <p className="text-xs text-muted-foreground">Target: {metric.target}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="font-semibold text-lg">Department Status</h2>
        <div className="grid grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept) => (
            <Link key={dept.id} href={`/departments/${dept.id}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2"><CardTitle className="text-sm">{dept.name}</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">View scorecard →</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
