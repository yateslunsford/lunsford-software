'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   ScrollProgress — thin top bar that fills as user scrolls.
   Uses mix-blend-difference so it stays visible on both
   light and dark sections without needing per-section tweaks.
═══════════════════════════════════════════════════════════ */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 240,
    damping: 38,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 origin-left pointer-events-none z-[999]"
      style={{
        height: 2,
        scaleX,
        background: '#ffffff',
        mixBlendMode: 'difference',
      }}
    />
  );
}
