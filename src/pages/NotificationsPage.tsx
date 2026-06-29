import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Info, Sparkles, Check } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Notification } from "../types";
import PageHeader from "../components/ui/PageHeader";
import ErrorState from "../components/ui/ErrorState";
import { useToast } from "../components/ui/Toast";

export default function NotificationsPage() {
  const { show } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setError(false);
    try { setNotifications(await apiClient.getNotifications()); }
    catch (err) { console.error(err); setError(true); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
      show("Failed to mark notification as read.", "error");
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      try { await apiClient.markNotificationRead(n.id); } catch (err) { console.error(err); }
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    show("All notifications marked as read", "success");
  };

  const filtered = notifications.filter((n) => filter === "all" || !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert": return AlertCircle;
      case "success": return CheckCircle;
      case "ai": return Sparkles;
      default: return Info;
    }
  };

  const getColor = (type: Notification["type"]) => {
    switch (type) {
      case "alert": return "bg-error-500/10 text-error-400";
      case "success": return "bg-success-500/10 text-success-400";
      case "ai": return "bg-primary-500/10 text-primary-400";
      default: return "bg-secondary-500/10 text-secondary-400";
    }
  };

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}</div></div>;
  if (error) return <ErrorState message="Failed to load notifications." onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="mt-1 text-sm text-neutral-400">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-2 text-xs font-semibold text-neutral-300 transition hover:text-white">
              Mark all read
            </button>
          )}
          <div className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
            {(["all", "unread"] as const).map((opt) => (
              <button key={opt} onClick={() => setFilter(opt)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${filter === opt ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-white"}`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-3 rounded-2xl bg-neutral-900/50 p-4">
              <Bell className="h-8 w-8 text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-400">You're all caught up. No unread notifications.</p>
          </div>
        ) : (
          filtered.map((notif, i) => {
            const Icon = getIcon(notif.type);
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group flex items-start gap-4 rounded-2xl border p-5 backdrop-blur-xl transition ${
                  notif.read ? "border-neutral-800/40 bg-neutral-900/20" : "border-neutral-800/60 bg-neutral-900/40"
                }`}
              >
                <div className={`rounded-xl p-2.5 ${getColor(notif.type)}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-sm font-semibold text-white">{notif.title}</h4>
                    {!notif.read && <span className="h-2 w-2 rounded-full bg-primary-400 animate-pulse" />}
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">{notif.description}</p>
                  {notif.actionText && (
                    <button className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 transition">
                      {notif.actionText} →
                    </button>
                  )}
                </div>
                {!notif.read && (
                  <button onClick={() => handleMarkRead(notif.id)} aria-label="Mark as read" className="rounded-lg p-2 text-neutral-500 opacity-0 transition hover:text-white group-hover:opacity-100">
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
