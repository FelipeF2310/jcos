import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white rounded-lg border border-slate-200 p-10 text-center max-w-md">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Jersey City OS</p>
        <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          This page doesn&apos;t exist or may have moved.
        </p>
        <Link
          href="/brief"
          className="inline-block mt-5 text-sm font-medium text-white px-3.5 py-2 rounded-md"
          style={{ backgroundColor: "#1d4ed8" }}
        >
          Go to Weekly Brief
        </Link>
      </div>
    </div>
  );
}
