import type { Variants, Transition } from "motion/react";

// ─── Easing curves ──────────────────────────────────────────────────────────
// Each curve communicates a different intent:
//   spring     — playful, physical interactions (hover, press, drag)
//   smooth     — standard UI transitions (fade, slide)
//   decisive   — snappy, confident state changes (active tab, selection)
//   gentle     — soft appearances (skeletons, ambient elements)
export const EASE = {
  spring: [0.22, 1, 0.36, 1] as const,
  smooth: [0.4, 0, 0.2, 1] as const,
  decisive: [0.16, 1, 0.3, 1] as const,
  gentle: [0.25, 0.1, 0.25, 1] as const,
};

// ─── Duration tokens ──────────────────────────────────────────────────────────
export const DURATION = {
  instant: 0.12,
  fast: 0.18,
  normal: 0.28,
  slow: 0.45,
  deliberate: 0.6,
};

// ─── Spring presets ───────────────────────────────────────────────────────────
export const SPRING = {
  soft: { type: "spring", stiffness: 260, damping: 26, mass: 0.8 } as const,
  snappy: { type: "spring", stiffness: 400, damping: 30, mass: 0.6 } as const,
  bouncy: { type: "spring", stiffness: 320, damping: 18, mass: 0.7 } as const,
  gentle: { type: "spring", stiffness: 180, damping: 22, mass: 1.0 } as const,
};

// ─── Stagger configuration ────────────────────────────────────────────────────
// Used for list entrances — items appear in sequence so the eye can follow.
export const stagger = (perItem = 0.04, initial = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: perItem, delayChildren: initial } },
});

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.normal, ease: EASE.spring },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: DURATION.fast, ease: EASE.smooth },
  },
};

// ─── Card entrance ────────────────────────────────────────────────────────────
// Cards fade in, rise slightly, and settle — communicates "content arriving"
export const cardEntrance: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE.spring },
  },
};

// ─── Page transition ──────────────────────────────────────────────────────────
// Directional: incoming content rises and fades in, outgoing sinks and fades out
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: DURATION.slow, ease: EASE.spring },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    transition: { duration: DURATION.fast, ease: EASE.smooth },
  },
};

// ─── Modal / overlay ──────────────────────────────────────────────────────────
export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: SPRING.soft,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 16,
    transition: { duration: DURATION.fast, ease: EASE.smooth },
  },
};

// ─── Drawer / panel ────────────────────────────────────────────────────────────
export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 32, mass: 0.8 },
  },
  exit: {
    x: "100%",
    transition: { duration: DURATION.normal, ease: EASE.smooth },
  },
};

// ─── Success morph ─────────────────────────────────────────────────────────────
// Button morphs into a checkmark — communicates "action completed successfully"
export const successMorph: Variants = {
  idle: { scale: 1 },
  loading: { scale: 0.96, opacity: 0.8 },
  success: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.5, ease: EASE.spring },
  },
};

// ─── Counter pulse ─────────────────────────────────────────────────────────────
// When a value changes, the number briefly scales up — communicates "this just updated"
export const valuePulse: Variants = {
  idle: { scale: 1, color: "rgb(255,255,255)" },
  pulse: {
    scale: [1, 1.06, 1],
    transition: { duration: 0.4, ease: EASE.spring },
  },
};

// ─── Notification entrance ─────────────────────────────────────────────────────
// Slides in from the right with a slight scale — communicates "new information arrived"
export const notificationEntrance: Variants = {
  hidden: { opacity: 0, x: 40, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: SPRING.snappy,
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.9,
    transition: { duration: DURATION.fast, ease: EASE.smooth },
  },
};

// ─── Tab indicator ─────────────────────────────────────────────────────────────
// The active pill smoothly slides between tabs — communicates "you moved here"
export const tabIndicator: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 32,
  mass: 0.6,
};

// ─── Hover lift ────────────────────────────────────────────────────────────────
// Cards lift on hover — communicates "this is interactive, you can engage"
export const hoverLift = {
  whileHover: { y: -4, transition: SPRING.soft },
  whileTap: { y: 0, scale: 0.99, transition: { duration: DURATION.instant } },
};

// ─── Press feedback ────────────────────────────────────────────────────────────
export const pressFeedback = {
  whileTap: { scale: 0.96, transition: { duration: DURATION.instant } },
};

// ─── Reduced motion ─────────────────────────────────────────────────────────────
// Respects prefers-reduced-motion: strips all movement, keeps opacity-only fades
export const reducedMotion = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast } },
  exit: { opacity: 0, transition: { duration: DURATION.instant } },
};

// Helper: check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
