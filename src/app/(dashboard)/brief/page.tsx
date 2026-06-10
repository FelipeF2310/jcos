import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  ArrowRight,
} from "lucide-react";
import { weeklyBrief, cityHealth, changeOf, fmt, deptName } from "@/lib/citistat/derive";
import { upcomingRisks } from "@/lib/citistat/data";
import { StatusBadge } from "@/components/citistat/status-badge";
import { TrendIndicator } from "@/components/citistat/trend-indicator";

export default function WeeklyBriefPage() {
  const brief = weeklyBrief();
  const health = cityHealth();

  return (
    <div className="max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            Weekly Brief · Week of June 9, 2026
          </p>
          <h1 className="text-2xl font-bold text-slate-900">What leadership should know this week</h1>
          <p className="text-sm text-slate-500 mt-1">
            A plain-language read on what improved, what declined, and where attention is needed —
            for the Mayor, Business Administrator, and department directors.
          </p>
        </div>
        <Link
          href="/exceptions"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-white px-3.5 py-2 rounded-md"
          style={{ backgroundColor: "#1d4ed8" }}
        >
          Review exceptions
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Headline counts */}
      <div className="grid grid-cols-4 gap-4">
        <CountCard
          label="Metrics improving"
          value={brief.improving}
          icon={ArrowUpRight}
          color="#15803d"
          bg="#f0fdf4"
        />
        <CountCard
          label="Metrics declining"
          value={brief.declining}
          icon={ArrowDownRight}
          color="#b91c1c"
          bg="#fef2f2"
        />
        <CountCard
          label="Departments on target"
          value={brief.deptsMeeting}
          icon={CheckCircle2}
          color="#15803d"
          bg="#f0fdf4"
        />
        <CountCard
          label="Require intervention"
          value={brief.deptsIntervention}
          icon={AlertTriangle}
          color="#b91c1c"
          bg="#fef2f2"
        />
      </div>

      {/* City Health Overview */}
      <section>
        <SectionTitle>City Health Overview</SectionTitle>
        <div className="bg-white rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-5">
              <Tally count={health.green} label="On target" color="#16a34a" />
              <Tally count={health.yellow} label="At risk" color="#ca8a04" />
              <Tally count={health.red} label="Off target" color="#dc2626" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Month over month:</span>
              <span
                className="inline-flex items-center gap-1 font-semibold"
                style={{ color: health.net >= 0 ? "#15803d" : "#b91c1c" }}
              >
                {health.net >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                Net {health.net >= 0 ? "+" : ""}
                {health.net} metrics
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {health.lenses.map((lens) => (
              <div
                key={lens.lens}
                className="rounded-lg border p-4"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-semibold text-slate-800">{lens.label}</p>
                  <StatusBadge status={lens.status} size="xs" />
                </div>
                <p className="text-xs text-slate-500 leading-snug mb-3">{lens.blurb}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span><b className="text-slate-700">{lens.green}</b> green</span>
                  <span><b className="text-slate-700">{lens.yellow}</b> yellow</span>
                  <span><b className="text-slate-700">{lens.red}</b> red</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two columns: improvements vs attention */}
      <div className="grid grid-cols-2 gap-8">
        <section>
          <SectionTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
            Top improvements
          </SectionTitle>
          <div className="space-y-2">
            {brief.topImprovements.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-lg border p-3.5 flex items-center justify-between gap-3"
                style={{ borderColor: "var(--border)" }}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {deptName(m.departmentId)} · now {fmt.value(m)}
                  </p>
                </div>
                <TrendIndicator change={changeOf(m)} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Areas requiring attention
          </SectionTitle>
          <div className="space-y-2">
            {brief.areasNeedingAttention.map((m) => (
              <Link key={m.id} href="/exceptions" className="block">
                <div
                  className="bg-white rounded-lg border p-3.5 flex items-center justify-between gap-3 hover:border-red-200 transition-colors"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{m.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {deptName(m.departmentId)} · {fmt.value(m)} vs {fmt.target(m)} target
                    </p>
                  </div>
                  <TrendIndicator change={changeOf(m)} />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Upcoming risks */}
      <section>
        <SectionTitle>
          <CalendarClock className="h-4 w-4 text-slate-500" />
          Upcoming risks
        </SectionTitle>
        <div className="space-y-2">
          {upcomingRisks.map((risk) => (
            <div
              key={risk.title}
              className="bg-white rounded-lg border p-4 flex items-start gap-3"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1 mt-0.5">
                {risk.horizon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800">{risk.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  <span className="text-slate-400">{risk.department} —</span> {risk.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">
      {children}
    </h2>
  );
}

function CountCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: typeof ArrowUpRight;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-5" style={{ borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

function Tally({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-2xl font-bold text-slate-900">{count}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}
