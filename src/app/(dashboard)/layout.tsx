import { NavSidebar } from "@/components/nav-sidebar";
import { TopHeader } from "@/components/header/top-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <NavSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
