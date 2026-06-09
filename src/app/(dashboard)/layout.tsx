export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <nav>{/* Sidebar nav */}</nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
