"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type InViewProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait once the element scrolls into view. */
  delay?: number;
  y?: number;
};

/**
 * Fades and lifts its children in once, the first time they scroll into view.
 * Renders a plain element when the visitor prefers reduced motion.
 */
export function InView({ children, className, delay = 0, y = 20 }: InViewProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
