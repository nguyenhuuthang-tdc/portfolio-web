"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: Direction;
  duration?: number;
  once?: boolean;
};

const directionOffset: Record<Direction, { x: number; y: number }> = {
  up:    { x: 0, y: 28 },
  down:  { x: 0, y: -28 },
  left:  { x: 28, y: 0 },
  right: { x: -28, y: 0 },
  none:  { x: 0, y: 0 },
};

export function SectionReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  once = true,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  /*
   * once=true (default): section reveals once and stays visible.
   * This is critical for mobile — avoids re-running expensive animations
   * every time the user scrolls back to a section.
   *
   * Removed filter:blur() — it forces GPU layer promotion for every
   * off-screen element, consuming memory and causing jank on mobile.
   */
  const isInView = useInView(ref, { once, margin: "-60px" });
  const { x, y } = directionOffset[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x, y }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : { opacity: 0, x, y }
      }
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
