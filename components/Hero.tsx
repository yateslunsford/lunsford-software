'use client';

import { useRef, Suspense } from 'react';
import type { MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion, cubicBezier } from 'framer-motion';
import MagneticCTA from '@/components/MagneticCTA';

const HeroScene = dynamic(
  () => import('@/components/HeroScene'),
  { ssr: false },
) as React.ComponentType<{ scrollRef: MutableRefObject<number> }>;

/* ─── Copy ─── */
const HEADLINE_WORDS = ['LUNSFORD', 'SOFTWARE', 'DEVELOPMENT'] as const;
const SUBLINE        = 'EST. 2026  ·  CUSTOM CODE  ·  SHIPS EVERYWHERE';

/* Sharp ease — snappy slam-in (no slow drift) */
const SLAM = cubicBezier(0.16, 1.04, 0.30, 1.0);

/* ═══════════════════════════════════════════════════════════
   StarsFallback — CSS-painted starfield used until R3F mounts.
   Keeps the hero from showing a flat black frame on first paint.
═══════════════════════════════════════════════════════════ */
function StarsFallback() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
      style={{
        background: `
          radial-gradient(1.5px 1.5px at 12% 18%, rgba(255,255,255,0.9), transparent 60%),
          radial-gradient(1.5px 1.5px at 78% 22%, rgba(255,255,255,0.8), transparent 60%),
          radial-gradient(1px 1px at 34% 42%, rgba(255,255,255,0.7), transparent 60%),
          radial-gradient(1.5px 1.5px at 62% 70%, rgba(255,255,255,0.85), transparent 60%),
          radial-gradient(1px 1px at 88% 58%, rgba(255,255,255,0.6), transparent 60%),
          radial-gradient(1.5px 1.5px at 18% 78%, rgba(255,255,255,0.7), transparent 60%),
          radial-gradient(1px 1px at 52% 12%, rgba(255,255,255,0.55), transparent 60%),
          radial-gradient(1.5px 1.5px at 92% 88%, rgba(255,255,255,0.75), transparent 60%),
          radial-gradient(1px 1px at 8% 52%, rgba(255,255,255,0.5), transparent 60%),
          radial-gradient(1.5px 1.5px at 44% 84%, rgba(255,255,255,0.8), transparent 60%),
          radial-gradient(2px 2px at 70% 38%, rgba(255,255,255,0.95), transparent 60%),
          radial-gradient(1px 1px at 26% 64%, rgba(255,255,255,0.65), transparent 60%),
          radial-gradient(ellipse 70% 55% at 50% 62%, rgba(255,255,255,0.06), transparent 60%),
          #000003
        `,
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
   Hero — single 100vh stage. No sticky, no scroll multiplier.
   Hands directly off to the next section with zero dead space.
═══════════════════════════════════════════════════════════ */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef  = useRef<number>(0);
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden"
      style={{
        background:
          'linear-gradient(to bottom, #000000 0%, #000003 70%, #050508 95%, #08080c 100%)',
      }}
    >
      {/* ── R3F canvas — pointer-events-none so the page still scrolls on touch ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <Suspense fallback={<StarsFallback />}>
          <HeroScene scrollRef={scrollRef} />
        </Suspense>
      </div>

      {/* ── Cool white atmospheric bloom (no orange) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 62%, rgba(255,255,255,0.06), transparent 60%)',
        }}
      />

      {/* ── Subtle top vignette so nav blends ── */}
      <div
        className="absolute inset-x-0 top-0 h-32 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.72), transparent)' }}
      />

      {/* ── Film vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 100% 90% at 50% 50%, transparent 38%, rgba(0,0,0,0.78) 100%)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pointer-events-none">

        {/* Studio label */}
        <motion.p
          className="font-mono text-[11px] tracking-[0.55em] text-white/60 mb-9 uppercase"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.45, ease: SLAM, delay: 0.05 }}
        >
          Studio · Newnan, GA
        </motion.p>

        {/* Slam-in headline — 3 stacked words, visible almost instantly */}
        <h1
          className="select-none"
          style={{
            fontFamily:    'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
            fontSize:      'clamp(2.6rem, 9.2vw, 9rem)',
            fontWeight:    400,
            lineHeight:    0.92,
            letterSpacing: '-0.025em',
            color:         '#ffffff',
            margin:        0,
            textShadow:    '0 6px 60px rgba(0,0,0,0.55)',
          }}
        >
          {HEADLINE_WORDS.map((word, i) => (
            <span
              key={word}
              className="block overflow-hidden"
              style={{ paddingBottom: '0.05em' }}
            >
              <motion.span
                className="block will-change-transform"
                initial={reduceMotion ? false : { y: '105%', opacity: 0 }}
                animate={reduceMotion ? undefined : { y: '0%',   opacity: 1 }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: 0.55,
                        ease: SLAM,
                        delay: 0.1 + i * 0.07,
                      }
                }
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* Subline */}
        <motion.div
          className="mt-8 select-none"
          style={{
            fontFamily:    'var(--font-geist-mono, ui-monospace), monospace',
            fontSize:      'clamp(0.62rem, 1.4vw, 0.92rem)',
            letterSpacing: '0.32em',
            color:         'rgba(255,255,255,0.55)',
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.55, ease: SLAM, delay: 0.42 }}
        >
          {SUBLINE}
        </motion.div>

        {/* CTA stack — pointer events re-enabled here */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-3 pointer-events-auto"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.5, ease: SLAM, delay: 0.55 }}
        >
          <MagneticCTA label="Start a project" href="#contact" reduceMotion={reduceMotion} />
          <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-white/45">
            15-min call  ·  no pitch deck
          </p>
        </motion.div>

      </div>

      {/* ── Scroll hint ── */}
      <motion.div
        className="absolute bottom-7 inset-x-0 flex flex-col items-center gap-2 pointer-events-none"
        aria-hidden="true"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1 }}
        transition={reduceMotion ? undefined : { duration: 0.8, delay: 0.95 }}
      >
        <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <span className="font-mono text-[9px] tracking-[0.55em] uppercase text-white/45">
          scroll
        </span>
      </motion.div>
    </section>
  );
}
