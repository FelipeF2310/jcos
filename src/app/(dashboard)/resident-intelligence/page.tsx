import { getIssues } from "@/server/issues";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueStatusBadge } from "@/components/issues/status-badge";
import Link from "next/link";
import { MapPin, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

const DEPARTMENTS = [
  { id: "public-works", name: "Public Works" },
  { id: "resident-response", name: "Resident Response" },
  { id: "engineering-permitting", name: "Engineering & Permitting" },
];

export default async function ResidentIntelligencePage() {
  const allIssues = await getIssues();

  const byDepartment = DEPARTMENTS.map((dept) => ({
    ...dept,
    total: allIssues.filter((i) => i.departmentId === dept.id).length,
    open: allIssues.filter((i) => i.departmentId === dept.id && i.status !== "resolved").length,
  }));

  const recentIssues = [...allIssues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const totalOpen = allIssues.filter((i) => i.status !== "resolved").length;
  const totalResolved = allIssues.filter((i) => i.status === "resolved").length;
  const resolutionRate = allIssues.length > 0
    ? Math.round((totalResolved / allIssues.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Resident Intelligence</h1>
        <p className="text-muted-foreground text-sm mt-1">Consolidated view of resident concerns and service demand</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Issues</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-blue-500" />
            <p className="text-3xl font-bold">{allIssues.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-yellow-500" />
            <p className="text-3xl font-bold text-yellow-600">{totalOpen}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-3">
            <RefreshCw className="h-6 w-6 text-green-500" />
            <p className="text-3xl font-bold text-green-600">{totalResolved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Resolution Rate</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{resolutionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Service Demand by Department
          </h2>
          <div className="space-y-3">
            {byDepartment.map((dept) => (
              <Link key={dept.id} href={`/departments/${dept.id}`}>
                <div className="rounded-lg border p-4 hover:border-primary transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{dept.name}</p>
                    <span className="text-sm text-muted-foreground">{dept.total} total</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: allIssues.length > 0 ? `${(dept.total / allIssues.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{dept.open} open</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Recent Issues</h2>
          {recentIssues.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 border rounded-lg text-center">No issues recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {recentIssues.map((issue) => (
                <div key={issue.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Link href={`/issues/${issue.id}`} className="text-sm font-medium hover:underline">{issue.title}</Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {issue.departmentId} · {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <IssueStatusBadge status={issue.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
