"use client";

import { useRef, useState, useEffect } from "react";
import { LogOut, ChevronDown, User } from "lucide-react";

interface Props {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
  role: string;
  signOutAction: () => Promise<void>;
}

const roleLabel: Record<string, string> = {
  executive: "Executive",
  director: "Director",
  staff: "Staff",
};

export function UserMenu({ name, email, image, role, signOutAction }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const initials = (name ?? email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors"
        style={{ backgroundColor: open ? "#f1f5f9" : "transparent" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f1f5f9"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={name ?? "User"}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            {initials}
          </div>
        )}
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-slate-800 leading-tight">{name ?? email}</p>
          <p className="text-xs leading-tight" style={{ color: "#94a3b8" }}>{roleLabel[role] ?? role}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white rounded-xl overflow-hidden z-50"
          style={{
            width: "220px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            top: "calc(100% + 4px)",
          }}
        >
          {/* User info */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "#f1f5f9" }}>
            <p className="text-sm font-semibold text-slate-900 truncate">{name ?? "User"}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2"
              style={{
                backgroundColor: role === "executive" ? "#eff6ff" : role === "director" ? "#f0fdf4" : "#f8fafc",
                color: role === "executive" ? "#1d4ed8" : role === "director" ? "#15803d" : "#64748b",
              }}
            >
              {roleLabel[role] ?? role}
            </span>
          </div>

          {/* Sign out */}
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-slate-600 transition-colors"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#fef2f2";
                (e.currentTarget as HTMLElement).style.color = "#dc2626";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                (e.currentTarget as HTMLElement).style.color = "#475569";
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
