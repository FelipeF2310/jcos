import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type Status = "on-target" | "at-risk" | "off-target";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  target?: string | number;
  status: Status;
  period?: string;
}

const statusConfig = {
  "on-target": {
    bar: "#16a34a",
    badge: "text-green-700 bg-green-50 border-green-200",
    label: "On Target",
    icon: TrendingUp,
  },
  "at-risk": {
    bar: "#ca8a04",
    badge: "text-yellow-700 bg-yellow-50 border-yellow-200",
    label: "At Risk",
    icon: Minus,
  },
  "off-target": {
    bar: "#dc2626",
    badge: "text-red-700 bg-red-50 border-red-200",
    label: "Off Target",
    icon: TrendingDown,
  },
};

export function KpiCard({ label, value, unit, target, status }: KpiCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className="bg-white rounded-lg border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="h-1" style={{ backgroundColor: config.bar }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-medium text-slate-600 leading-tight">{label}</p>
          <span
            className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${config.badge}`}
          >
            <Icon className="h-3 w-3" />
            {config.label}
          </span>
        </div>
        <p className="text-3xl font-bold text-slate-900 leading-none">
          {value}
          {unit && <span className="text-lg font-normal text-slate-500 ml-1">{unit}</span>}
        </p>
        {target !== undefined && (
          <p className="text-xs text-slate-400 mt-2">Target: {target}{unit ? ` ${unit}` : ""}</p>
        )}
      </div>
    </div>
  );
}
