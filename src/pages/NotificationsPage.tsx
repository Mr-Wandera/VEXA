import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Bell, CircleAlert as AlertCircle, CircleCheck as CheckCircle, Info, Sparkles, Check, Trash2 } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { Notification } from "../types";
import ErrorState from "../components/ui/ErrorState";
import Modal from "../components/ui/Modal";
import PageHeader from "../components/ui/PageHeader";
import { useToast } from "../components/ui/Toast";
import { useRouter } from "../lib/router";

const ACTION_ROUTES: Record<string, string> = {
  remind_overdue_inv_104: "/app/invoices",
  "remind_overdue_inv-104": "/app/invoices",
  reorder_p4: "/app/inventory",
  analyze_marketing: "/app/reports",
};

export default function NotificationsPage() {
  const { show } = useToast();
  const { navigate } = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [confirmDelete, setConfirmDelete] = useState<Notification | null>(null);

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
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      show("All notifications marked as read", "success");
    } catch (err) {
      console.error(err);
      show("Failed to mark all as read.", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await apiClient.deleteNotification(confirmDelete.id);
      setNotifications((prev) => prev.filter((n) => n.id !== confirmDelete.id));
      show("Notification deleted", "success");
    } catch (err) {
      console.error(err);
      show("Failed to delete notification.", "error");
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleActionClick = (notif: Notification) => {
    if (!notif.read) handleMarkRead(notif.id);
    const route = notif.actionCode ? ACTION_ROUTES[notif.actionCode] : undefined;
    if (route) {
      navigate(route);
    } else {
      navigate("/app/dashboard");
    }
  };

  const filtered = notifications.filter((n) => filter === "all" || !n.read);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const totalCount = notifications.length;

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

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl shimmer" />)}</div></div>;
  if (error) return <ErrorState message="Failed to load notifications." onRetry={loadData} />;

  const emptyMessage = filter === "unread"
    ? "You're all caught up! No unread notifications."
    : "No notifications yet. Activity from your business will appear here.";

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="btn-press rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-semibold text-neutral-300 transition hover:text-white">
              Mark all read
            </button>
          )}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
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
            <div className="mb-3 rounded-2xl bg-white/[0.02] p-4">
              <Bell className="h-8 w-8 text-neutral-600" />
            </div>
            <p className="text-sm text-neutral-400">{emptyMessage}</p>
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
                  notif.read ? "border-white/[0.04] bg-white/[0.015]" : "border-white/[0.06] bg-white/[0.03]"
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
                    <button
                      onClick={() => handleActionClick(notif)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300 transition"
                    >
                      {notif.actionText} →
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      aria-label="Mark as read"
                      className="rounded-lg p-2 text-neutral-500 transition hover:text-white md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmDelete(notif)}
                    aria-label="Delete notification"
                    className="rounded-lg p-2 text-neutral-500 transition hover:text-error-400 md:opacity-0 md:group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <Modal isOpen={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Notification" maxWidth="max-w-md">
        <p className="text-sm text-neutral-300">
          Are you sure you want to delete this notification?
          This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-neutral-400 hover:text-white transition">Cancel</button>
          <button type="button" onClick={handleDelete} className="btn-press rounded-xl bg-error-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-error-500 transition">Delete</button>
        </div>
      </Modal>
    </div>
  );
}
