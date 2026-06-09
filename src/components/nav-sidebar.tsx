import Link from "next/link";
import { LayoutDashboard, AlertCircle, CheckSquare, BarChart3, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/executive", label: "Executive Scorecard", icon: LayoutDashboard },
  { href: "/departments/public-works", label: "Public Works", icon: Building2 },
  { href: "/departments/resident-response", label: "Resident Response", icon: Users },
  { href: "/departments/engineering-permitting", label: "Engineering & Permitting", icon: BarChart3 },
  { href: "/issues", label: "Issues", icon: AlertCircle },
  { href: "/actions", label: "Actions", icon: CheckSquare },
  { href: "/resident-intelligence", label: "Resident Intelligence", icon: Users },
];

export function NavSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="w-64 border-r bg-sidebar min-h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg leading-tight">Jersey City<br />Operating System</h1>
        <p className="text-xs text-muted-foreground mt-1">CitiStat Platform</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === href
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
