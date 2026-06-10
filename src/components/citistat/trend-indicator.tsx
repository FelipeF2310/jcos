import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { fmt, type MetricChange } from "@/lib/citistat/derive";

// Shows the period-over-period change, colored by whether it is GOOD news for
// this metric (not by whether the number went up). A rising backlog is red even
// though the arrow points up; a falling response time is green.
export function TrendIndicator({ change, label }: { change: MetricChange; label?: string }) {
  const good = change.direction === "improving";
  const steady = change.direction === "steady";
  const color = steady ? "#64748b" : good ? "#15803d" : "#b91c1c";
  const Arrow = steady ? Minus : change.pct > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color }}>
      <Arrow className="h-3.5 w-3.5" />
      {fmt.pct(change.pct)}
      {label && <span className="text-xs font-normal text-slate-400 ml-0.5">{label}</span>}
    </span>
  );
}
