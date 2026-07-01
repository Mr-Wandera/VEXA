import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  subtext?: string;
  icon: LucideIcon;
  accent: "primary" | "secondary" | "accent" | "error" | "warning" | "success";
  trend?: { value: string; type: "up" | "down" };
  delay?: number;
}

const ACCENT_COLORS: Record<string, { text: string; bg: string; glow: string; border: string }> = {
  primary: { text: "text-primary-400", bg: "bg-primary-500/10", glow: "rgba(16, 185, 129, 0.08)", border: "border-primary-500/20" },
  secondary: { text: "text-secondary-400", bg: "bg-secondary-500/10", glow: "rgba(14, 165, 233, 0.08)", border: "border-secondary-500/20" },
  accent: { text: "text-accent-400", bg: "bg-accent-500/10", glow: "rgba(245, 158, 11, 0.08)", border: "border-accent-500/20" },
  error: { text: "text-error-400", bg: "bg-error-500/10", glow: "rgba(244, 63, 94, 0.08)", border: "border-error-500/20" },
  warning: { text: "text-warning-400", bg: "bg-warning-500/10", glow: "rgba(249, 115, 22, 0.08)", border: "border-warning-500/20" },
  success: { text: "text-success-400", bg: "bg-success-500/10", glow: "rgba(34, 197, 94, 0.08)", border: "border-success-500/20" },
};

export default function StatCard({ title, value, prefix, suffix, decimals = 0, subtext, icon: Icon, accent, trend, delay = 0 }: StatCardProps) {
  const colors = ACCENT_COLORS[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 backdrop-blur-xl card-hover"
    >
      {/* Glow blob */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: colors.glow }}
      />

      <div className="relative flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-400">{title}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="relative mt-4 flex items-baseline gap-2">
        {prefix && <span className="font-mono text-sm text-neutral-500">{prefix}</span>}
        <AnimatedCounter value={value} decimals={decimals} className="font-display text-2xl font-bold tracking-tight text-white" />
        {suffix && <span className="font-mono text-sm text-neutral-500">{suffix}</span>}
      </div>

      <div className="relative mt-2 flex items-center gap-2">
        {trend && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trend.type === "up" ? "text-success-400" : "text-error-400"}`}>
            {trend.type === "up" ? "↑" : "↓"} {trend.value}
          </span>
        )}
        {subtext && <span className="text-xs text-neutral-500">{subtext}</span>}
      </div>
    </motion.div>
  );
}
