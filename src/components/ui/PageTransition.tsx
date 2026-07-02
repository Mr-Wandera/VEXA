import { motion } from "motion/react";
import { ReactNode } from "react";
import { pageTransition } from "../../lib/motion";

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
