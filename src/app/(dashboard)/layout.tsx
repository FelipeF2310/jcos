"use client";

import { usePathname } from "next/navigation";
import { NavSidebar } from "@/components/nav-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <NavSidebar pathname={pathname} />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
