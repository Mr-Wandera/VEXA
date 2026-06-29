import { motion } from "motion/react";
import { Video as LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtext: string;
  trend?: {
    value: string;
    type: "up" | "down" | "neutral";
  };
  icon: LucideIcon;
  glowColor?: string;
}

export default function MetricCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  glowColor = "rgba(16, 185, 129, 0.12)"
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-xl"
      style={{
        boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 4px 30px rgba(0, 0, 0, 0.2)`
      }}
    >
      {/* Glow Effect */}
      <div 
        className="absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: glowColor, opacity: 0.6 }}
      />

      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-medium tracking-wide text-neutral-400">
          {title}
        </span>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-neutral-300">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2.5">
        <span className="font-mono text-3xl font-semibold tracking-tight text-white">
          {value}
        </span>
        {trend && (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium font-mono ${
            trend.type === "up" 
              ? "bg-emerald-500/10 text-emerald-400" 
              : trend.type === "down" 
                ? "bg-rose-500/10 text-rose-400" 
                : "bg-neutral-500/10 text-neutral-400"
          }`}>
            {trend.value}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-xs text-neutral-500 font-sans">
        {subtext}
      </p>
    </motion.div>
  );
}
