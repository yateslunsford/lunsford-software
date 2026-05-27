'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   CursorGlow — radial gradient that trails the mouse with
   spring smoothing. Grows and shifts on interactive targets.
   Desktop pointer-fine only.
═══════════════════════════════════════════════════════════ */
export default function CursorGlow() {
  const reduceMotion  = useReducedMotion() ?? false;
  const [enabled, setEnabled]     = useState(false);
  const [hovering, setHovering]   = useState(false);
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

    const onOver = (e: MouseEvent) => {
      const el = e.target as Element;
      const isInteractive = !!el.closest('a, button, [role="button"], input, textarea, select, label');
      setHovering(isInteractive);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
    };
  }, [reduceMotion, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 pointer-events-none z-[997]"
      animate={{
        width:   hovering ? 520 : 400,
        height:  hovering ? 520 : 400,
        opacity: hovering ? 1 : 0.8,
      }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        x: sx,
        y: sy,
        mixBlendMode: 'difference',
        background:
          'radial-gradient(circle, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 35%, transparent 65%)',
      }}
    />
  );
}
