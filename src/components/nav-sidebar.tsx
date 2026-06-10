"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, AlertCircle, CheckSquare, BarChart3,
  Building2, Users, ChevronRight, Activity, CalendarCheck,
  Newspaper, AlertOctagon,
} from "lucide-react";

const sections = [
  {
    label: "Executive",
    items: [
      { href: "/brief", label: "Weekly Brief", icon: Newspaper },
      { href: "/exceptions", label: "Executive Exceptions", icon: AlertOctagon },
      { href: "/executive", label: "Executive Scorecard", icon: LayoutDashboard },
      { href: "/resident-intelligence", label: "Resident Intelligence", icon: Activity },
    ],
  },
  {
    label: "Departments",
    items: [
      { href: "/departments/public-works", label: "Public Works", icon: Building2 },
      { href: "/departments/resident-response", label: "Resident Response", icon: Users },
      { href: "/departments/engineering-permitting", label: "Engineering & Permitting", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/issues", label: "Issues", icon: AlertCircle },
      { href: "/actions", label: "Actions", icon: CheckSquare },
      { href: "/reviews", label: "Performance Reviews", icon: CalendarCheck },
    ],
  },
];

export function NavSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 min-h-screen flex flex-col shrink-0"
      style={{ backgroundColor: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: "#1d4ed8" }}
          >
            JC
          </div>
          <span className="text-sm font-semibold text-white leading-tight">
            Jersey City OS
          </span>
        </div>
        <p className="text-xs mt-1.5 pl-9" style={{ color: "#64748b" }}>
          CitiStat Platform
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label}>
            <p
              className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "#475569" }}
            >
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className="flex items-center gap-2.5 px-2 py-2 rounded text-sm transition-colors"
                      style={{
                        backgroundColor: active ? "var(--sidebar-active-bg)" : "transparent",
                        color: active ? "var(--sidebar-active-fg)" : "var(--sidebar-fg)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sidebar-hover-bg)";
                          (e.currentTarget as HTMLElement).style.color = "#f8fafc";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "var(--sidebar-fg)";
                        }
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      <span className="truncate">{label}</span>
                      {active && <ChevronRight className="h-3 w-3 ml-auto opacity-50 shrink-0" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-xs" style={{ color: "#475569" }}>FY 2026 · Q2</p>
      </div>
    </aside>
  );
}
