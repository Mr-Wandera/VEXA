import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  action?: { label: string; icon?: LucideIcon; onClick: () => void };
}

export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/15 transition hover:bg-primary-500 btn-press"
        >
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
