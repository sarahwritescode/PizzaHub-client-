"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the entrance starts. */
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  /** Set to false for above-the-fold imagery so it paints immediately. */
  fade?: boolean;
};

/**
 * One-shot entrance used by the home hero. Renders a plain element when the
 * visitor prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  x = 0,
  y = 0,
  scale = 1,
  rotate = 0,
  fade = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: fade ? 0 : 1, x, y, scale, rotate }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
