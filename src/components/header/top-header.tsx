import { auth, signOut } from "@/auth";
import { getNotifications, getUnreadCount } from "@/server/notifications";
import { NotificationBell } from "./notification-bell";
import { UserMenu } from "./user-menu";

export async function TopHeader() {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const [notifs, unreadCount] = await Promise.all([
    getNotifications(userId, 20),
    getUnreadCount(userId),
  ]);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <header
      className="flex items-center justify-end gap-2 px-6 py-3 shrink-0"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #f1f5f9",
        height: "56px",
      }}
    >
      <NotificationBell notifications={notifs} unreadCount={unreadCount} />
      <div className="w-px h-5 mx-1" style={{ backgroundColor: "#e2e8f0" }} />
      <UserMenu
        name={session.user.name}
        email={session.user.email}
        image={session.user.image}
        role={session.user.role}
        signOutAction={handleSignOut}
      />
    </header>
  );
}
