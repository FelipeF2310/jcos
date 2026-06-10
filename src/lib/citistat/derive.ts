// Pure derivations over the canonical dataset. No I/O, no hand-typed counts.
// Pages call these; the numbers they show are computed from `data.ts`.

import {
  metrics,
  departments,
  lensMeta,
  type Metric,
  type MetricStatus,
  type Lens,
} from "./data";

const FLAT_THRESHOLD = 0.01; // <1% change reads as "steady"

export type ChangeDirection = "improving" | "declining" | "steady";

export interface MetricChange {
  pct: number; // signed raw change vs prior, e.g. +0.219
  abs: number; // |pct|
  direction: ChangeDirection; // good/bad/flat, already accounting for metric polarity
  good: boolean;
}

/** Change vs prior period, polarity-aware (lower-better metrics invert). */
export function changeOf(m: Metric): MetricChange {
  const raw = (m.value - m.prior) / Math.abs(m.prior);
  const abs = Math.abs(raw);
  if (abs < FLAT_THRESHOLD) {
    return { pct: raw, abs, direction: "steady", good: false };
  }
  const movedUp = raw > 0;
  const good = m.direction === "higher-better" ? movedUp : !movedUp;
  return { pct: raw, abs, direction: good ? "improving" : "declining", good };
}

/** How far off target, polarity-aware. Positive = worse than target. */
export function targetGap(m: Metric): number {
  const raw = (m.value - m.target) / Math.abs(m.target);
  return m.direction === "higher-better" ? -raw : raw;
}

export const fmt = {
  value: (m: Metric) => `${trim(m.value)}${unitSuffix(m.unit)}`,
  target: (m: Metric) => `${trim(m.target)}${unitSuffix(m.unit)}`,
  pct: (n: number) => `${n > 0 ? "+" : ""}${Math.round(n * 100)}%`,
};

function unitSuffix(unit: string) {
  if (unit === "%") return "%";
  return ` ${unit}`;
}
function trim(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function deptName(id: string) {
  return departments.find((d) => d.id === id)?.name ?? id;
}

// ── Weekly Brief ────────────────────────────────────────────────────────────

export type DeptTier = "meeting" | "watch" | "intervention";

export interface DeptRollup {
  id: string;
  name: string;
  director: string;
  tier: DeptTier;
  red: number;
  yellow: number;
  green: number;
  reason: string;
}

function tierOf(red: number, yellow: number, escalated: boolean): DeptTier {
  if (red >= 2 || (red >= 1 && escalated)) return "intervention";
  if (red >= 1 || yellow >= 1) return "watch";
  return "meeting";
}

export function departmentRollups(): DeptRollup[] {
  return departments.map((d) => {
    const own = metrics.filter((m) => m.departmentId === d.id);
    const red = own.filter((m) => m.status === "off-target").length;
    const yellow = own.filter((m) => m.status === "at-risk").length;
    const green = own.filter((m) => m.status === "on-target").length;
    const escalated = own.some((m) => m.escalated);
    const tier = tierOf(red, yellow, escalated);
    const reason =
      tier === "meeting"
        ? "All metrics on target"
        : tier === "intervention"
          ? escalated && red < 2
            ? "Escalated issue plus an off-target metric"
            : `${red} metrics off target`
          : red > 0
            ? `${red} metric${red > 1 ? "s" : ""} off target`
            : `${yellow} metric${yellow > 1 ? "s" : ""} at risk`;
    return { id: d.id, name: d.name, director: d.director, tier, red, yellow, green, reason };
  });
}

export interface WeeklyBrief {
  improving: number;
  declining: number;
  steady: number;
  deptsMeeting: number;
  deptsWatch: number;
  deptsIntervention: number;
  topImprovements: Metric[];
  areasNeedingAttention: Metric[];
}

export function weeklyBrief(): WeeklyBrief {
  const changes = metrics.map((m) => ({ m, c: changeOf(m) }));
  const improving = changes.filter((x) => x.c.direction === "improving");
  const declining = changes.filter((x) => x.c.direction === "declining");
  const steady = changes.filter((x) => x.c.direction === "steady");

  const rollups = departmentRollups();

  const topImprovements = [...improving]
    .sort((a, b) => b.c.abs - a.c.abs)
    .slice(0, 4)
    .map((x) => x.m);

  // Worst offenders by how far off target, polarity-aware.
  const areasNeedingAttention = metrics
    .filter((m) => m.status !== "on-target")
    .sort((a, b) => targetGap(b) - targetGap(a))
    .slice(0, 4);

  return {
    improving: improving.length,
    declining: declining.length,
    steady: steady.length,
    deptsMeeting: rollups.filter((r) => r.tier === "meeting").length,
    deptsWatch: rollups.filter((r) => r.tier === "watch").length,
    deptsIntervention: rollups.filter((r) => r.tier === "intervention").length,
    topImprovements,
    areasNeedingAttention,
  };
}

// ── City Health Overview ────────────────────────────────────────────────────

export interface LensSummary {
  lens: Lens;
  label: string;
  blurb: string;
  status: MetricStatus; // worst metric in the lens
  red: number;
  yellow: number;
  green: number;
  net: number; // improving minus declining within the lens
}

export interface CityHealth {
  green: number;
  yellow: number;
  red: number;
  total: number;
  net: number; // improving minus declining, citywide
  lenses: LensSummary[];
}

const STATUS_RANK: Record<MetricStatus, number> = {
  "off-target": 2,
  "at-risk": 1,
  "on-target": 0,
};

export function cityHealth(): CityHealth {
  const green = metrics.filter((m) => m.status === "on-target").length;
  const yellow = metrics.filter((m) => m.status === "at-risk").length;
  const red = metrics.filter((m) => m.status === "off-target").length;

  const net =
    metrics.filter((m) => changeOf(m).direction === "improving").length -
    metrics.filter((m) => changeOf(m).direction === "declining").length;

  const lenses = (Object.keys(lensMeta) as Lens[]).map((lens): LensSummary => {
    const own = metrics.filter((m) => m.lens === lens);
    const worst = own.reduce<MetricStatus>(
      (acc, m) => (STATUS_RANK[m.status] > STATUS_RANK[acc] ? m.status : acc),
      "on-target",
    );
    return {
      lens,
      label: lensMeta[lens].label,
      blurb: lensMeta[lens].blurb,
      status: worst,
      red: own.filter((m) => m.status === "off-target").length,
      yellow: own.filter((m) => m.status === "at-risk").length,
      green: own.filter((m) => m.status === "on-target").length,
      net:
        own.filter((m) => changeOf(m).direction === "improving").length -
        own.filter((m) => changeOf(m).direction === "declining").length,
    };
  });

  return { green, yellow, red, total: metrics.length, net, lenses };
}

// ── Executive Exceptions ────────────────────────────────────────────────────

export interface Exception {
  metric: Metric;
  change: MetricChange;
  gap: number;
}

/** Off-target metrics, plus anything at-risk that is also worsening. */
export function exceptions(): Exception[] {
  return metrics
    .map((m) => ({ metric: m, change: changeOf(m), gap: targetGap(m) }))
    .filter(
      (e) =>
        e.metric.status === "off-target" ||
        (e.metric.status === "at-risk" && e.change.direction === "declining"),
    )
    .sort((a, b) => {
      // Reds first, then by how far off target.
      const rank = (s: MetricStatus) => STATUS_RANK[s];
      if (rank(b.metric.status) !== rank(a.metric.status)) {
        return rank(b.metric.status) - rank(a.metric.status);
      }
      return b.gap - a.gap;
    });
}
