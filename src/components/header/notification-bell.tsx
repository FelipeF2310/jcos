"use client";

import { useRef, useState, useEffect } from "react";
import { Bell, CheckCheck, AlertTriangle, MessageSquare, ClipboardList, CalendarCheck } from "lucide-react";
import { markAllNotificationsRead } from "@/server/notification-actions";

interface Notification {
  id: string;
  type: "escalation" | "comment" | "action-assigned" | "review-scheduled";
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: Date;
}

interface Props {
  notifications: Notification[];
  unreadCount: number;
}

const typeConfig = {
  escalation:        { icon: AlertTriangle,  color: "#dc2626", bg: "#fef2f2" },
  comment:           { icon: MessageSquare,  color: "#1d4ed8", bg: "#eff6ff" },
  "action-assigned": { icon: ClipboardList,  color: "#16a34a", bg: "#f0fdf4" },
  "review-scheduled":{ icon: CalendarCheck,  color: "#7c3aed", bg: "#f5f3ff" },
};

function timeAgo(date: Date) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell({ notifications, unreadCount }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
        style={{
          backgroundColor: open ? "#f1f5f9" : "transparent",
          color: "#64748b",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f1f5f9"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-white font-bold rounded-full"
            style={{
              backgroundColor: "#dc2626",
              fontSize: "10px",
              minWidth: "18px",
              height: "18px",
              padding: "0 4px",
              lineHeight: 1,
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 bg-white rounded-xl overflow-hidden z-50"
          style={{
            width: "360px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
            top: "calc(100% + 4px)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#f1f5f9" }}
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900">Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "#eff6ff", color: "#1d4ed8" }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="flex items-center gap-1 text-xs font-medium transition-colors"
                  style={{ color: "#64748b" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#1d4ed8"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              </form>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "400px" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell className="h-8 w-8 mb-3" style={{ color: "#cbd5e1" }} />
                <p className="text-sm font-medium text-slate-500">All caught up</p>
                <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const cfg = typeConfig[n.type] ?? typeConfig.comment;
                  const Icon = cfg.icon;
                  return (
                    <li key={n.id}>
                      <a
                        href={n.href}
                        onClick={() => setOpen(false)}
                        className="flex items-start gap-3 px-4 py-3.5 transition-colors block"
                        style={{
                          backgroundColor: n.read ? "transparent" : "#fafbff",
                          borderLeft: n.read ? "none" : "3px solid #1d4ed8",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#f8fafc"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = n.read ? "transparent" : "#fafbff"; }}
                      >
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 mt-0.5"
                          style={{ backgroundColor: cfg.bg }}
                        >
                          <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 leading-tight truncate">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{n.body}</p>
                          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{timeAgo(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <div
                            className="w-2 h-2 rounded-full shrink-0 mt-2"
                            style={{ backgroundColor: "#1d4ed8" }}
                          />
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
