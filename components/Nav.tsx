'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import Button from '@/components/ui/Button';
import MobileMenu from '@/components/MobileMenu';

/* ═══════════════════════════════════════════════════════════
   Nav — scroll-aware. Transparent over dark hero, then
   transitions to a frosted light bar once scrolled past.
   Mobile: logo + hamburger only. Full-screen overlay on open.
═══════════════════════════════════════════════════════════ */
export default function Nav() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const t = useMotionValue(0);
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

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const bgAlpha     = useScale(tSpring, 0, 0.78);
  const borderAlpha = useScale(tSpring, 0, 0.06);
  const lightBg     = useMotionTemplate`rgba(250, 250, 250, ${bgAlpha})`;
  const borderCol   = useMotionTemplate`rgba(0, 0, 0, ${borderAlpha})`;

  return (
    <>
      <motion.nav
        className="fixed top-0 inset-x-0 z-50 sm:backdrop-blur-md border-b transition-colors"
        style={{
          background:  lightBg,
          borderColor: borderCol,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Terminal wordmark: lunsford.dev█ */}
          <a
            href="#"
            className="font-mono font-medium whitespace-nowrap inline-flex items-baseline transition-colors"
            style={{
              fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)',
              letterSpacing: '-0.01em',
              textShadow: scrolled ? 'none' : '0 1px 14px rgba(0,0,0,0.45)',
            }}
          >
            <span style={{ color: scrolled ? '#0a0a0a' : '#ffffff' }}>
              lunsford
            </span>
            <span style={{ color: scrolled ? '#9ca3af' : 'rgba(255,255,255,0.48)' }}>
              .dev
            </span>
            <span
              className="term-cursor ml-px"
              aria-hidden="true"
              style={{ color: scrolled ? '#0a0a0a' : '#ffffff' }}
            >
              █
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <NavLink href="#services" scrolled={scrolled}>Services</NavLink>
            <NavLink href="#work"     scrolled={scrolled}>Work</NavLink>
            <NavLink href="#process"  scrolled={scrolled}>Process</NavLink>
            <NavLink href="#about"    scrolled={scrolled}>About</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              {/* Subtle repeating pulse glow on the CTA every 4 s */}
              <motion.div
                className="rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(0,0,0,0)',
                    '0 0 0 6px rgba(0,0,0,0.10)',
                    '0 0 0 0 rgba(0,0,0,0)',
                  ],
                }}
                transition={{ duration: 1.8, delay: 2.4, repeat: Infinity, repeatDelay: 2.2 }}
              >
                <Button href="#contact">Start a project</Button>
              </motion.div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] transition-colors"
              style={{ color: scrolled ? '#0a0a0a' : '#ffffff' }}
            >
              <span
                className="block w-5 h-px bg-current transition-all duration-300"
              />
              <span
                className="block w-4 h-px bg-current transition-all duration-300 self-end"
              />
              <span
                className="block w-5 h-px bg-current transition-all duration-300"
              />
            </button>
          </div>
        </div>
      </motion.nav>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
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

function useScale(mv: MotionValue<number>, from: number, to: number) {
  return useTransform(mv, [0, 1], [from, to]);
}
