import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "motion/react";
import type { LucideIcon } from "lucide-react";

export interface SwipeActionDef {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  onClick: () => void;
}

interface SwipeActionProps {
  children: React.ReactNode;
  actions: SwipeActionDef[];
  /** Maximum drag distance in px before actions trigger on release */
  threshold?: number;
  disabled?: boolean;
}

/**
 * Wraps a list item to enable swipe-to-reveal contextual actions.
 * Swipe left to reveal action buttons on the right side.
 * On desktop, actions are always visible on hover (fallback for discoverability).
 */
export default function SwipeAction({ children, actions, threshold = 80, disabled }: SwipeActionProps) {
  const x = useMotionValue(0);
  const [released, setReleased] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const actionWidth = 48 * actions.length + 8 * (actions.length - 1) + 16;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setReleased(true);
    if (info.offset.x < -threshold) {
      // Snap to reveal actions
      x.set(-actionWidth);
    } else {
      x.set(0);
    }
  };

  if (disabled || actions.length === 0) {
    return <div className="relative">{children}</div>;
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Action buttons revealed on swipe */}
      <div className="absolute right-0 top-0 flex h-full items-center gap-2 pr-2">
        {actions.map((action, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => {
              action.onClick();
              x.set(0);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.bgColor} ${action.color} transition hover:scale-110 active:scale-95`}
            aria-label="Swipe action"
          >
            <action.icon className="h-4 w-4" />
          </motion.button>
        ))}
      </div>

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -actionWidth, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => setReleased(false)}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
        className="relative z-10 bg-inherit"
      >
        {children}
      </motion.div>
    </div>
  );
}
