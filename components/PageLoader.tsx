'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   PageLoader — one-shot intro on first paint.
   Black panel with the wordmark, then peels away upward.
   Skips entirely for reduced-motion preference.
═══════════════════════════════════════════════════════════ */
export default function PageLoader() {
  const reduceMotion = useReducedMotion() ?? false;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const delay = reduceMotion ? 0 : 520;
    const id = window.setTimeout(() => setVisible(false), delay);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          className="fixed inset-0 z-[1000] bg-black flex items-center justify-center pointer-events-none"
          initial={{ y: 0 }}
          exit={{ y: '-100%', transition: { duration: 0.75, ease: [0.83, 0, 0.17, 1] } }}
        >
          <motion.div
            className="flex items-center gap-3 font-mono text-[10px] tracking-[0.55em] uppercase text-white/65"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full" />
            Lunsford / Software
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
