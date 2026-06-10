import Link from "next/link";
import { MessageCircleQuestion, ArrowUpRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { TrendIndicator } from "./trend-indicator";
import { fmt, deptName, type Exception } from "@/lib/citistat/derive";

// Departments that exist in the DB-backed issue tracker; only these can be
// preselected on the new-issue form.
const TRACKED_DEPARTMENTS = new Set(["public-works", "resident-response", "engineering-permitting"]);

function raiseIssueHref({ metric }: Exception): string {
  const params = new URLSearchParams({
    title: `${metric.name} off target (${fmt.value(metric)} vs ${fmt.target(metric)})`,
    description: `${metric.whyItMatters}\n\nCitiStat follow-up: ${metric.followUp}`,
    priority: metric.status === "off-target" ? "high" : "medium",
  });
  if (TRACKED_DEPARTMENTS.has(metric.departmentId)) {
    params.set("departmentId", metric.departmentId);
  }
  return `/issues/new?${params.toString()}`;
}

// The CitiStat exception. Not "here is a metric" — "here is something that needs
// attention, why it matters, and the question to ask in the meeting."
export function ExceptionCard({ exception }: { exception: Exception }) {
  const { metric, change } = exception;
  return (
    <div
      className="bg-white rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="h-1" style={{ backgroundColor: metric.status === "off-target" ? "#dc2626" : "#ca8a04" }} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 leading-tight">{metric.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{deptName(metric.departmentId)}</p>
          </div>
          <StatusBadge status={metric.status} />
        </div>

        {/* Numbers */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Stat label="Current" value={fmt.value(metric)} strong />
          <Stat label="Target" value={fmt.target(metric)} />
          <div>
            <p className="text-xs text-slate-400 mb-0.5">vs last period</p>
            <TrendIndicator change={change} />
          </div>
        </div>

        {/* Why it matters */}
        <div className="mb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Why it matters</p>
          <p className="text-sm text-slate-600 leading-snug">{metric.whyItMatters}</p>
        </div>

        {/* Suggested follow-up */}
        <div className="rounded-md bg-blue-50 border border-blue-100 p-3 flex gap-2.5">
          <MessageCircleQuestion className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 mb-0.5">
              CitiStat follow-up
            </p>
            <p className="text-sm text-blue-900 leading-snug">{metric.followUp}</p>
          </div>
        </div>

        {/* Close the loop: exception → tracked issue */}
        <div className="mt-3 flex justify-end">
          <Link
            href={raiseIssueHref(exception)}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900"
          >
            Raise as issue
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className={`${strong ? "text-lg font-bold text-slate-900" : "text-lg font-medium text-slate-600"} leading-none`}>
        {value}
      </p>
    </div>
  );
}
