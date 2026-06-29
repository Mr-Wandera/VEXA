import { Video as LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext?: string;
  icon: LucideIcon;
  trend?: { value: string; type: "up" | "down" | "neutral" };
  accent?: "primary" | "secondary" | "accent" | "error" | "warning";
  delay?: number;
}

const ACCENT_COLORS = {
  primary: { glow: "rgba(16, 185, 129, 0.12)", text: "text-primary-400", bg: "bg-primary-500/10" },
  secondary: { glow: "rgba(14, 165, 233, 0.12)", text: "text-secondary-400", bg: "bg-secondary-500/10" },
  accent: { glow: "rgba(245, 158, 11, 0.12)", text: "text-accent-400", bg: "bg-accent-500/10" },
  error: { glow: "rgba(244, 63, 94, 0.12)", text: "text-error-400", bg: "bg-error-500/10" },
  warning: { glow: "rgba(249, 115, 22, 0.12)", text: "text-warning-400", bg: "bg-warning-500/10" },
};

export default function StatCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  subtext,
  icon: Icon,
  trend,
  accent = "primary",
  delay = 0,
}: StatCardProps) {
  const colors = ACCENT_COLORS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-5 backdrop-blur-xl"
    >
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: colors.glow }}
      />
      <div className="relative flex items-center justify-between">
        <span className="font-display text-sm font-medium text-neutral-400">{title}</span>
        <div className={`rounded-lg border border-neutral-800 bg-neutral-950 p-2 ${colors.text}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="relative mt-3 flex items-baseline gap-2">
        <AnimatedCounter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          className="font-mono text-2xl font-semibold tracking-tight text-white"
        />
        {trend && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium font-mono ${
              trend.type === "up"
                ? "bg-success-500/10 text-success-400"
                : trend.type === "down"
                  ? "bg-error-500/10 text-error-400"
                  : "bg-neutral-500/10 text-neutral-400"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtext && <p className="relative mt-1 text-xs text-neutral-500">{subtext}</p>}
    </motion.div>
  );
}
