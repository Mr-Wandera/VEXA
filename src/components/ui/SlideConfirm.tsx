import { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "motion/react";
import { ArrowRight, Check, Loader as Loader2 } from "lucide-react";

interface SlideConfirmProps {
  onConfirm: () => Promise<void>;
  label?: string;
  confirmingLabel?: string;
  doneLabel?: string;
  disabled?: boolean;
}

/**
 * Slide-to-confirm interaction for critical actions.
 * The user must drag the handle to the right edge to trigger the action.
 * This prevents accidental destructive actions.
 */
export default function SlideConfirm({
  onConfirm,
  label = "Slide to confirm",
  confirmingLabel = "Processing...",
  doneLabel = "Done",
  disabled = false,
}: SlideConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "confirming" | "done">("idle");
  const x = useMotionValue(0);
  const trackWidth = useRef(0);

  const checkOpacity = useTransform(x, (val) => {
    if (!trackRef.current) return 0;
    const max = trackRef.current.offsetWidth - 52;
    return Math.min(1, val / max);
  });

  const handleLabelOpacity = useTransform(x, (val) => {
    if (!trackRef.current) return 1;
    const max = trackRef.current.offsetWidth - 52;
    return Math.max(0, 1 - val / (max * 0.5));
  });

  const handleDragEnd = useCallback(async (_: any, info: PanInfo) => {
    if (!trackRef.current) return;
    const max = trackRef.current.offsetWidth - 52;
    if (info.offset.x >= max * 0.85) {
      x.set(max);
      setState("confirming");
      try {
        await onConfirm();
        setState("done");
        setTimeout(() => {
          x.set(0);
          setState("idle");
        }, 1000);
      } catch {
        x.set(0);
        setState("idle");
      }
    } else {
      x.set(0);
    }
  }, [onConfirm, x]);

  return (
    <div
      ref={trackRef}
      className="relative h-12 w-full select-none overflow-hidden rounded-xl border border-error-500/20 bg-error-500/[0.04]"
    >
      {/* Shimmer track background */}
      {state === "idle" && (
        <div className="track-shimmer absolute inset-0 rounded-xl" />
      )}

      {/* Label */}
      <motion.div
        style={{ opacity: state === "idle" ? handleLabelOpacity : 0 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="text-xs font-semibold text-error-400">{label}</span>
      </motion.div>

      {/* Confirming label */}
      {state === "confirming" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {confirmingLabel}
          </span>
        </div>
      )}

      {/* Done label */}
      {state === "done" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-success-400"
          >
            <Check className="h-3.5 w-3.5" />
            {doneLabel}
          </motion.span>
        </div>
      )}

      {/* Progress fill */}
      <motion.div
        style={{ opacity: checkOpacity }}
        className="absolute inset-0 rounded-xl bg-error-500/10"
      />

      {/* Draggable handle */}
      {state === "idle" && (
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: trackRef.current ? trackRef.current.offsetWidth - 52 : 200 }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          style={{ x }}
          whileTap={{ scale: 0.95 }}
          className="absolute left-0 top-0 z-10 flex h-12 w-[52px] cursor-grab items-center justify-center rounded-xl bg-error-600 shadow-lg shadow-error-600/30 active:cursor-grabbing"
        >
          <ArrowRight className="h-4 w-4 text-white" />
        </motion.div>
      )}
    </div>
  );
}
