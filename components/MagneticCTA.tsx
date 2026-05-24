'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   MagneticCTA — the button itself. Translates toward the cursor
   with a spring, carries a slow conic glow loop, and slides its
   arrow on hover. Reusable across hero, work tour, /work CTA.
═══════════════════════════════════════════════════════════ */
export default function MagneticCTA({
  label = 'Start a project',
  href,
  reduceMotion,
}: {
  label?: string;
  href: string;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 200, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 200, damping: 18, mass: 0.4 });
  const [hovering, setHovering] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (reduceMotion) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    mx.set((e.clientX - cx) * 0.35);
    my.set((e.clientY - cy) * 0.45);
  };

  const handleLeave = () => {
    setHovering(false);
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleLeave}
      style={{ x, y }}
      className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full bg-black text-white text-sm font-semibold tracking-wide overflow-hidden"
    >
      {/* Glow ring — animated infinite loop */}
      <motion.span
        aria-hidden="true"
        className="absolute -inset-px rounded-full pointer-events-none"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(255,140,60,0) 0%, rgba(255,140,60,0.85) 25%, rgba(255,140,60,0) 50%, rgba(255,140,60,0.85) 75%, rgba(255,140,60,0) 100%)',
          filter: 'blur(8px)',
          opacity: hovering ? 0.9 : 0.55,
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 6, ease: 'linear', repeat: Infinity }
        }
      />
      {/* Inner mask so the glow rims the button instead of filling it */}
      <span
        aria-hidden="true"
        className="absolute inset-[2px] rounded-full bg-black"
      />
      {/* Hover sweep highlight */}
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          background:
            'linear-gradient(110deg, transparent 30%, rgba(255,140,60,0.18) 50%, transparent 70%)',
          opacity: hovering ? 1 : 0,
        }}
      />

      <span className="relative z-10">{label}</span>

      {/* Arrow — slides on hover, settles back */}
      <span className="relative z-10 overflow-hidden inline-block w-5 h-4">
        <span className="absolute inset-0 flex items-center transition-transform duration-300 ease-out group-hover:translate-x-6">
          →
        </span>
        <span className="absolute inset-0 flex items-center -translate-x-6 transition-transform duration-300 ease-out group-hover:translate-x-0">
          →
        </span>
      </span>
    </motion.a>
  );
}
