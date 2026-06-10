import Link from "next/link";
import { ArrowLeft, ListFilter } from "lucide-react";
import { exceptions } from "@/lib/citistat/derive";
import { ExceptionCard } from "@/components/citistat/exception-card";

export default function ExceptionsPage() {
  const items = exceptions();
  const redCount = items.filter((e) => e.metric.status === "off-target").length;

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <Link href="/brief" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-2">
          <ArrowLeft className="h-3 w-3" />
          Weekly Brief
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">CitiStat · June 2026</p>
            <h1 className="text-2xl font-bold text-slate-900">Executive Exceptions</h1>
            <p className="text-sm text-slate-500 mt-1">
              Only the metrics that need leadership attention — not every number. Each carries the
              question to put on the CitiStat agenda.
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
              <ListFilter className="h-3 w-3" />
              {items.length} exceptions
            </p>
            <p className="text-sm font-medium text-red-700 mt-0.5">{redCount} off target</p>
          </div>
        </div>
      </div>

      {/* Cards */}
      {items.length === 0 ? (
        <div className="bg-white rounded-lg border p-10 text-center" style={{ borderColor: "var(--border)" }}>
          <p className="text-sm text-slate-400">No exceptions this period — every metric is on target.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((e) => (
            <ExceptionCard key={e.metric.id} exception={e} />
          ))}
        </div>
      )}
    </div>
  );
}
