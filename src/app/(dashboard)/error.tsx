"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

// Renders inside the dashboard layout, so the sidebar stays up even when a
// page (e.g. a DB-backed one) throws — no raw Next.js error screen mid-demo.
export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg border p-10 text-center" style={{ borderColor: "var(--border)" }}>
        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Something went wrong loading this page</h2>
        <p className="text-sm text-slate-500 mt-1.5">
          The rest of JCOS is unaffected. Try again, or head back to the Weekly Brief.
        </p>
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white px-3.5 py-2 rounded-md"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <a href="/brief" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3.5 py-2">
            Go to Weekly Brief
          </a>
        </div>
      </div>
    </div>
  );
}
