import { motion, useMotionValue, useTransform } from "motion/react";
import { useRef, type MouseEvent } from "react";
import type { LucideIcon } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { cardEntrance, hoverLift } from "../../lib/motion";

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
  live?: boolean;
}

const ACCENT_COLORS: Record<string, { text: string; bg: string; glow: string; border: string; dot: string }> = {
  primary: { text: "text-primary-400", bg: "bg-primary-500/10", glow: "rgba(16, 185, 129, 0.12)", border: "border-primary-500/20", dot: "bg-primary-400" },
  secondary: { text: "text-secondary-400", bg: "bg-secondary-500/10", glow: "rgba(14, 165, 233, 0.12)", border: "border-secondary-500/20", dot: "bg-secondary-400" },
  accent: { text: "text-accent-400", bg: "bg-accent-500/10", glow: "rgba(245, 158, 11, 0.12)", border: "border-accent-500/20", dot: "bg-accent-400" },
  error: { text: "text-error-400", bg: "bg-error-500/10", glow: "rgba(244, 63, 94, 0.12)", border: "border-error-500/20", dot: "bg-error-400" },
  warning: { text: "text-warning-400", bg: "bg-warning-500/10", glow: "rgba(249, 115, 22, 0.12)", border: "border-warning-500/20", dot: "bg-warning-400" },
  success: { text: "text-success-400", bg: "bg-success-500/10", glow: "rgba(34, 197, 94, 0.12)", border: "border-success-500/20", dot: "bg-success-400" },
};

export default function StatCard({ title, value, prefix, suffix, decimals = 0, subtext, icon: Icon, accent, trend, delay = 0, live }: StatCardProps) {
  const colors = ACCENT_COLORS[accent];
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardEntrance}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      {...hoverLift}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 backdrop-blur-xl card-hover"
    >
      {/* Cursor-following glow */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      >
        <div className="h-full w-full rounded-full" style={{ backgroundColor: colors.glow }} />
      </motion.div>

      {/* Static glow blob — always present, intensifies on hover */}
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-80"
        style={{ backgroundColor: colors.glow }}
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-neutral-400">{title}</p>
          {live && (
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${colors.dot} soft-glow-pulse`} />
              <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">live</span>
            </span>
          )}
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors.bg} ${colors.text} transition-transform duration-300 group-hover:scale-110`}>
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
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trend.type === "up" ? "text-success-400" : "text-error-400"}`}
          >
            {trend.type === "up" ? "↑" : "↓"} {trend.value}
          </motion.span>
        )}
        {subtext && <span className="text-xs text-neutral-500">{subtext}</span>}
      </div>
    </motion.div>
  );
}
