'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';

/* ═══════════════════════════════════════════════════════════
   Nav — scroll-aware. Transparent + white text over the dark
   hero, then transitions to a frosted light bar once the page
   scrolls onto the body content.
═══════════════════════════════════════════════════════════ */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const t = useMotionValue(0); // 0 = top, 1 = past hero
  const tSpring = useSpring(t, { stiffness: 110, damping: 22 });

  useEffect(() => {
    const update = () => {
      const max = window.innerHeight * 0.55;
      const p = Math.max(0, Math.min(1, window.scrollY / max));
      t.set(p);
      setScrolled(p > 0.6);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [t]);

  const bgAlpha     = useScale(tSpring, 0, 0.78);
  const borderAlpha = useScale(tSpring, 0, 0.06);
  const lightBg     = useMotionTemplate`rgba(250, 250, 250, ${bgAlpha})`;
  const borderCol   = useMotionTemplate`rgba(0, 0, 0, ${borderAlpha})`;

  return (
    <motion.nav
      className="fixed top-0 inset-x-0 z-50 backdrop-blur-md border-b transition-colors"
      style={{
        background:  lightBg,
        borderColor: borderCol,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a
          href="#"
          className="font-mono text-sm tracking-tight font-semibold transition-colors"
          style={{
            color: scrolled ? '#0a0a0a' : '#ffffff',
            textShadow: scrolled ? 'none' : '0 1px 14px rgba(0,0,0,0.45)',
          }}
        >
          LUNSFORD
          <span
            className="transition-colors"
            style={{
              color: scrolled ? '#9ca3af' : 'rgba(255,255,255,0.78)',
            }}
          >
            /SOFTWARE
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <NavLink href="#services" scrolled={scrolled}>Services</NavLink>
          <NavLink href="#work"     scrolled={scrolled}>Work</NavLink>
          <NavLink href="#process"  scrolled={scrolled}>Process</NavLink>
          <NavLink href="#about"    scrolled={scrolled}>About</NavLink>
        </div>

        <a
          href="#contact"
          className="group relative text-sm px-4 py-2 rounded-full font-semibold overflow-hidden transition-transform duration-300 hover:scale-[1.045]"
          style={{
            color:      scrolled ? '#ffffff' : '#0a0a0a',
            background: scrolled ? '#0a0a0a' : '#ffffff',
            boxShadow:  scrolled
              ? '0 2px 14px rgba(0,0,0,0.18)'
              : '0 2px 18px rgba(255,255,255,0.22)',
          }}
        >
          <span className="relative z-10">Start a project</span>
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
            }}
          />
        </a>
      </div>
    </motion.nav>
  );
}

function NavLink({
  href,
  scrolled,
  children,
}: {
  href: string;
  scrolled: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="relative group transition-colors hover:opacity-100"
      style={{ color: scrolled ? '#4b5563' : 'rgba(255,255,255,0.85)' }}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute -bottom-1 left-0 w-full h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
        style={{ background: scrolled ? '#0a0a0a' : '#ffffff' }}
      />
    </a>
  );
}

/* ─── lerp helper ─── */
function useScale(mv: MotionValue<number>, from: number, to: number) {
  return useTransform(mv, [0, 1], [from, to]);
}
