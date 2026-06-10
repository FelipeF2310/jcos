import { notFound } from "next/navigation";
import { getMetrics } from "@/server/metrics";
import { getIssues } from "@/server/issues";
import { getReadingsForMetric } from "@/server/metric-readings";
import { KpiCard } from "@/components/scorecard/kpi-card";
import Link from "next/link";
import { ArrowRight, Plus, AlertCircle, ClipboardList } from "lucide-react";

const DEPARTMENTS: Record<string, { name: string; description: string }> = {
  "public-works":           { name: "Public Works",                description: "Street maintenance, waste removal, and public infrastructure" },
  "resident-response":      { name: "Resident Response Center",    description: "311 requests, constituent services, and complaint resolution" },
  "engineering-permitting": { name: "Engineering & Permitting",    description: "Building permits, inspections, and development approvals" },
};

const statusLabel: Record<string, string> = { open: "Open", "in-progress": "In Progress", resolved: "Resolved", escalated: "Escalated" };
const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  open:          { bg: "#eff6ff", text: "#1d4ed8", dot: "#1d4ed8" },
  "in-progress": { bg: "#fefce8", text: "#a16207", dot: "#ca8a04" },
  resolved:      { bg: "#f0fdf4", text: "#15803d", dot: "#16a34a" },
  escalated:     { bg: "#fef2f2", text: "#b91c1c", dot: "#dc2626" },
};
const priorityStyle: Record<string, string> = {
  low: "text-slate-500", medium: "text-blue-600", high: "text-orange-600", critical: "text-red-600",
};

export default async function DepartmentScorecardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dept = DEPARTMENTS[slug];
  if (!dept) notFound();

  const [deptMetrics, deptIssues] = await Promise.all([getMetrics(slug), getIssues(slug)]);

  const metricsWithReadings = await Promise.all(
    deptMetrics.map(async (m) => {
      const readings = await getReadingsForMetric(m.id, 8);
      return {
        ...m,
        readings: readings.map((r) => ({ value: parseFloat(r.value), period: r.period })),
      };
    })
  );

  const openIssues = deptIssues.filter((i) => i.status !== "resolved");
  const offTarget = deptMetrics.filter((m) => m.status === "off-target").length;
  const atRisk = deptMetrics.filter((m) => m.status === "at-risk").length;

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/executive" className="text-xs text-slate-400 hover:text-slate-600 mb-2 block">← Executive Scorecard</Link>
          <h1 className="text-2xl font-bold text-slate-900">{dept.name}</h1>
          <p className="text-sm text-slate-500 mt-1">{dept.description}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/departments/${slug}/record`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ClipboardList className="h-4 w-4" /> Record Metrics
          </Link>
          <Link
            href="/issues/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <Plus className="h-4 w-4" /> New Issue
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Metrics", value: deptMetrics.length, color: "#1d4ed8" },
          { label: "Off Target", value: offTarget, color: offTarget > 0 ? "#dc2626" : "#16a34a" },
          { label: "At Risk", value: atRisk, color: atRisk > 0 ? "#ca8a04" : "#16a34a" },
          { label: "Open Issues", value: openIssues.length, color: openIssues.length > 0 ? "#ca8a04" : "#16a34a" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm text-slate-500 mb-2">{label}</p>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* KPI grid with sparklines */}
      {metricsWithReadings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Performance Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            {metricsWithReadings.map((metric) => (
              <KpiCard
                key={metric.id}
                label={metric.name}
                value={metric.value ?? "—"}
                unit={metric.unit ?? undefined}
                target={metric.target ?? undefined}
                status={metric.status}
                readings={metric.readings}
              />
            ))}
          </div>
        </div>
      )}

      {/* Open issues */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Open Issues</h2>
          <Link href="/issues" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {openIssues.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center" style={{ borderColor: "var(--border)" }}>
            <p className="text-sm text-slate-400">No open issues.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {openIssues.map((issue) => {
              const s = statusStyle[issue.status] ?? statusStyle.open;
              return (
                <Link key={issue.id} href={`/issues/${issue.id}`}>
                  <div className="bg-white rounded-lg border p-4 flex items-center gap-4 hover:border-blue-200 hover:shadow-sm transition-all" style={{ borderColor: "var(--border)" }}>
                    <AlertCircle className="h-4 w-4 shrink-0 text-slate-300" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{issue.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Opened {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${priorityStyle[issue.priority]}`}>{issue.priority}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: s.bg, color: s.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                      {statusLabel[issue.status]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
