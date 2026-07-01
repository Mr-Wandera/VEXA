import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Receipt, FileText, Package, Users, Sparkles, Clock } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { TimelineEvent } from "../types";
import ErrorState from "../components/ui/ErrorState";
import PageHeader from "../components/ui/PageHeader";
import { useCurrency } from "../lib/useCurrency";

const ICON_MAP = {
  sale: ShoppingCart,
  expense: Receipt,
  invoice: FileText,
  inventory: Package,
  client: Users,
  ai: Sparkles,
  system: Clock,
};

const COLOR_MAP = {
  sale: "bg-success-500/10 text-success-400",
  expense: "bg-error-500/10 text-error-400",
  invoice: "bg-secondary-500/10 text-secondary-400",
  inventory: "bg-accent-500/10 text-accent-400",
  client: "bg-primary-500/10 text-primary-400",
  ai: "bg-primary-500/10 text-primary-400",
  system: "bg-neutral-700 text-neutral-400",
};

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const currency = useCurrency();

  const loadData = () => {
    setLoading(true);
    setError(false);
    apiClient.getTimeline().then((e) => { setEvents(e); setLoading(false); }).catch((err) => { console.error(err); setError(true); setLoading(false); });
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-xl shimmer" /><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}</div></div>;
  if (error) return <ErrorState message="Failed to load timeline." onRetry={loadData} />;

  return (
    <div className="space-y-6">
      <PageHeader title="Business Timeline" subtitle="A chronological view of everything happening in your business." />

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 h-full w-px bg-white/[0.06]" />

        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-3 rounded-2xl bg-white/[0.02] p-4"><Clock className="h-8 w-8 text-neutral-600" /></div>
              <p className="text-sm text-neutral-400">No activity yet.</p>
            </div>
          ) : (
          events.map((event, i) => {
            const Icon = ICON_MAP[event.type] || Clock;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex gap-4 pl-0"
              >
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${COLOR_MAP[event.type]}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-semibold text-white">{event.title}</h4>
                    {event.amount !== undefined && (
                      <span className="font-mono text-sm font-semibold text-neutral-300">
                        {event.type === "expense" ? "-" : ""}{currency} {event.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">{event.description}</p>
                  <p className="mt-2 text-xs text-neutral-500">by {event.actor}</p>
                </div>
              </motion.div>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
