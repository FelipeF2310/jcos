import { getIssues } from "@/server/issues";
import { getOffTargetMetrics } from "@/server/metrics";
import { KpiCard } from "@/components/scorecard/kpi-card";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, TrendingDown, ArrowRight } from "lucide-react";

const HEALTH_AREAS = [
  { label: "Public Safety", status: "on-target" as const, note: "No escalated issues" },
  { label: "Housing", status: "on-target" as const, note: "No escalated issues" },
  { label: "Infrastructure", status: "off-target" as const, note: "4 metrics off target", href: "/departments/public-works" },
  { label: "Constituent Services", status: "off-target" as const, note: "8 metrics off target", href: "/departments/resident-response" },
  { label: "Economic Development", status: "at-risk" as const, note: "Permit delays impacting growth" },
];

const healthStyle = {
  "on-target": { bg: "#f0fdf4", border: "#86efac", dot: "#16a34a", text: "#15803d" },
  "at-risk":   { bg: "#fefce8", border: "#fde047", dot: "#ca8a04", text: "#a16207" },
  "off-target":{ bg: "#fef2f2", border: "#fca5a5", dot: "#dc2626", text: "#b91c1c" },
};

export default async function ExecutiveScorecardPage() {
  const [allIssues, offTarget] = await Promise.all([getIssues(), getOffTargetMetrics()]);

  const escalated = allIssues.filter((i) => i.status === "escalated");
  const openIssues = allIssues.filter((i) => i.status !== "resolved");
  const resolved = allIssues.filter((i) => i.status === "resolved");

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">CitiStat · June 2026</p>
          <h1 className="text-2xl font-bold text-slate-900">Executive Scorecard</h1>
          <p className="text-sm text-slate-500 mt-1">Citywide performance summary for the Mayor and Business Administrator</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Last updated</p>
          <p className="text-sm font-medium text-slate-700">June 9, 2026</p>
        </div>
      </div>

      {/* Escalated alert */}
      {escalated.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-800 text-sm">
              {escalated.length} issue{escalated.length > 1 ? "s" : ""} require executive attention
            </p>
            <div className="mt-2 space-y-1">
              {escalated.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/issues/${issue.id}`}
                  className="flex items-center gap-2 text-sm text-red-700 hover:text-red-900"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {issue.title}
                  <ArrowRight className="h-3 w-3 ml-auto shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Open Issues", value: openIssues.length, color: "#1d4ed8", bg: "#eff6ff", icon: Clock },
          { label: "Escalated", value: escalated.length, color: "#dc2626", bg: "#fef2f2", icon: AlertTriangle },
          { label: "Resolved (30d)", value: resolved.length, color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
          { label: "Metrics Off Target", value: offTarget.length, color: "#ca8a04", bg: "#fefce8", icon: TrendingDown },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-white rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 font-medium">{label}</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* City Health */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">City Health Indicators</h2>
        <div className="grid grid-cols-5 gap-3">
          {HEALTH_AREAS.map((area) => {
            const s = healthStyle[area.status];
            return (
              <div
                key={area.label}
                className="rounded-lg border p-4"
                style={{ backgroundColor: s.bg, borderColor: s.border }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
                  <p className="text-sm font-semibold" style={{ color: s.text }}>{area.label}</p>
                </div>
                <p className="text-xs text-slate-500">{area.note}</p>
                {area.href && (
                  <Link href={area.href} className="text-xs font-medium mt-2 block" style={{ color: s.text }}>
                    View scorecard →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Off-target metrics */}
      {offTarget.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Off-Target Metrics</h2>
          <div className="grid grid-cols-3 gap-4">
            {offTarget.slice(0, 6).map((metric) => (
              <KpiCard
                key={metric.id}
                label={metric.name}
                value={metric.value ?? "—"}
                unit={metric.unit ?? undefined}
                target={metric.target ?? undefined}
                status={metric.status}
              />
            ))}
          </div>
        </div>
      )}

      {/* Department links */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Department Scorecards</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { slug: "public-works", name: "Public Works", issues: allIssues.filter(i => i.departmentId === "public-works" && i.status !== "resolved").length },
            { slug: "resident-response", name: "Resident Response Center", issues: allIssues.filter(i => i.departmentId === "resident-response" && i.status !== "resolved").length },
            { slug: "engineering-permitting", name: "Engineering & Permitting", issues: allIssues.filter(i => i.departmentId === "engineering-permitting" && i.status !== "resolved").length },
          ].map((dept) => (
            <Link key={dept.slug} href={`/departments/${dept.slug}`}>
              <div className="bg-white rounded-lg border p-5 hover:border-blue-300 hover:shadow-sm transition-all group" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-slate-800">{dept.name}</p>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {dept.issues} open issue{dept.issues !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
