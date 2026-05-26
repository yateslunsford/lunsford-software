'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   CursorGlow — subtle 400px radial gradient that trails the
   mouse with spring smoothing. Desktop pointer-fine only.
   Appears once the user first moves the cursor, so it never
   pops up at a stale position on page load.
═══════════════════════════════════════════════════════════ */
export default function CursorGlow() {
  const reduceMotion = useReducedMotion() ?? false;
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 90, damping: 20, mass: 0.45 });
  const sy = useSpring(y, { stiffness: 90, damping: 20, mass: 0.45 });

  useEffect(() => {
    if (reduceMotion) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;

    const onMove = (e: PointerEvent) => {
      setEnabled(true);
      x.set(e.clientX - 200);
      y.set(e.clientY - 200);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduceMotion, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[997]"
      style={{
        x: sx,
        y: sy,
        width: 400,
        height: 400,
        mixBlendMode: 'difference',
        background:
          'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 35%, transparent 65%)',
      }}
    />
  );
}
