import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShoppingCart, Receipt, FileText, Package, Users, Sparkles, Clock, DollarSign } from "lucide-react";
import { apiClient } from "../lib/apiClient";
import { TimelineEvent } from "../types";

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

  useEffect(() => {
    apiClient.getTimeline().then((e) => { setEvents(e); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><div className="h-8 w-32 rounded-lg shimmer" /><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-2xl shimmer" />)}</div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">Business Timeline</h1>
        <p className="text-sm text-neutral-400">A chronological view of everything happening in your business.</p>
      </div>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 h-full w-px bg-neutral-800" />

        <div className="space-y-4">
          {events.map((event, i) => {
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
                <div className="flex-1 rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-semibold text-white">{event.title}</h4>
                    {event.amount !== undefined && (
                      <span className="font-mono text-sm font-semibold text-neutral-300">
                        {event.type === "expense" ? "-" : ""}KSh {event.amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-400">{event.description}</p>
                  <p className="mt-2 text-xs text-neutral-500">by {event.actor}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
