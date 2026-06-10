import { CheckCircle2, AlertTriangle, XOctagon } from "lucide-react";
import type { MetricStatus } from "@/lib/citistat/data";

// Status is carried by icon + label + color together — never color alone,
// so it reads for colorblind users and in grayscale print.
const config: Record<
  MetricStatus,
  { label: string; fg: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  "on-target": { label: "On Target", fg: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: CheckCircle2 },
  "at-risk": { label: "At Risk", fg: "#a16207", bg: "#fefce8", border: "#fef08a", icon: AlertTriangle },
  "off-target": { label: "Off Target", fg: "#b91c1c", bg: "#fef2f2", border: "#fecaca", icon: XOctagon },
};

export function StatusBadge({ status, size = "sm" }: { status: MetricStatus; size?: "sm" | "xs" }) {
  const c = config[status];
  const Icon = c.icon;
  const pad = size === "xs" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium shrink-0 ${pad}`}
      style={{ color: c.fg, backgroundColor: c.bg, borderColor: c.border }}
    >
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
}

export const statusColor = {
  "on-target": "#16a34a",
  "at-risk": "#ca8a04",
  "off-target": "#dc2626",
} satisfies Record<MetricStatus, string>;
