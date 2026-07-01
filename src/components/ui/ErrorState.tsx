import { motion } from "motion/react";
import { TriangleAlert as AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-4 rounded-2xl bg-error-500/10 p-4">
        <AlertTriangle className="h-8 w-8 text-error-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">Something went wrong</h3>
      <p className="mt-1.5 max-w-sm text-sm text-neutral-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.06] btn-press"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </motion.div>
  );
}
