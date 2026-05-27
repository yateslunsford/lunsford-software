'use client';

import { motion, useReducedMotion } from 'framer-motion';

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.88'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

export default function FilmGrain() {
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[998]"
      style={{
        backgroundImage: NOISE_SVG,
        mixBlendMode: 'overlay',
        opacity: 0.022,
      }}
      animate={reduceMotion ? undefined : {
        opacity: [0.018, 0.028, 0.022, 0.030, 0.018],
      }}
      transition={reduceMotion ? undefined : {
        duration: 3.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}
