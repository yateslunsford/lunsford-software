'use client';

import { useRef, useEffect, Suspense } from 'react';
import type { MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MagneticCTA from '@/components/MagneticCTA';

gsap.registerPlugin(ScrollTrigger);

const HeroScene = dynamic(
  () => import('@/components/HeroScene'),
  { ssr: false },
) as React.ComponentType<{ scrollRef: MutableRefObject<number> }>;

/* ─── Char-split text renderer ──────────────────────────────── */
interface SplitLineProps {
  text: string;
  style?: React.CSSProperties;
}

function SplitLine({ text, style }: SplitLineProps) {
  return (
    <span style={style} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="char inline-block will-change-transform"
          aria-hidden="true"
        >
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
}

/* ─── Headline config ──────────────────────────────────────── */
const HEADLINE_LINES = [
  { text: 'WE BUILD',  accent: false },
  { text: 'WEBSITES',  accent: false },
  { text: 'THAT CLOSE.', accent: true  },
] as const;

const SUBLINE = 'BUILT IN GA · SHIPPED EVERYWHERE';

/* ═══════════════════════════════════════════════════════════
   Hero — 200vh sticky section with starfield + GSAP reveal
═══════════════════════════════════════════════════════════ */
export default function Hero() {
  const sectionRef  = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const sublineRef  = useRef<HTMLDivElement>(null);
  const labelRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const scrollRef   = useRef<number>(0);

  /* ── Feed scroll progress to the R3F scene ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable > 0) {
        scrollRef.current = Math.max(0, Math.min(1, -section.getBoundingClientRect().top / scrollable));
      }
    };

    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  /* ── GSAP scroll-scrubbed char reveal ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const hChars = headlineRef.current?.querySelectorAll<HTMLElement>('.char') ?? [];
      const sChars = sublineRef.current?.querySelectorAll<HTMLElement>('.char')  ?? [];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start:   'top top',
          end:     '+=900',
          scrub:   1.3,
        },
      });

      /* Label glides up */
      tl.from(labelRef.current, {
        y: 30, opacity: 0,
        ease: 'power2.out', duration: 0.5,
      });

      /* Headline chars — each one leaps up from below with a slight back-bounce */
      tl.from(hChars, {
        y: 115, opacity: 0, scale: 0.80,
        ease: 'back.out(1.3)',
        stagger: { amount: 0.9 },
        duration: 1.25,
      }, '-=0.3');

      /* Subline letters follow */
      tl.from(sChars, {
        y: 44, opacity: 0,
        ease: 'power2.out',
        stagger: { amount: 0.55 },
        duration: 0.85,
      }, '-=0.55');

      /* CTA rises last */
      tl.from(ctaRef.current, {
        y: 32, opacity: 0,
        ease: 'power2.out', duration: 0.5,
      }, '-=0.35');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        height: '200vh',
        /* Deep space → warm orange ember → light page */
        background:
          'linear-gradient(to bottom, #020406 0%, #020406 50%, #060810 62%, #280e00 73%, #7a2e00 83%, #d0d0d0 93%, #fafafa 100%)',
      }}
    >
      {/* ── Sticky viewport stage ── */}
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* ── R3F starfield + gem (lazy, no SSR) ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <Suspense fallback={<div className="absolute inset-0 bg-[#020406]" />}>
            <HeroScene scrollRef={scrollRef} />
          </Suspense>
        </div>

        {/* ── Orange atmospheric glow ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 68% 55% at 50% 60%, rgba(255,100,20,0.11), transparent 56%)',
          }}
        />

        {/* ── Indigo nebula counter-glow ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 65% 55% at 18% 20%, rgba(60,80,255,0.06), transparent 58%)',
          }}
        />

        {/* ── Film vignette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 100% 90% at 50% 50%, transparent 40%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* ── Content ── */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">

          <p
            ref={labelRef}
            className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-10 uppercase"
          >
            Lunsford Software Development
          </p>

          <div
            ref={headlineRef}
            className="select-none"
            style={{
              fontFamily: 'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
              fontSize:   'clamp(3rem, 11vw, 10.5rem)',
              fontWeight: 400,
              lineHeight: 0.88,
              letterSpacing: '-0.02em',
            }}
          >
            {HEADLINE_LINES.map(({ text, accent }, i) => (
              <div key={i} className="block overflow-hidden pb-[0.08em]">
                <SplitLine
                  text={text}
                  style={{
                    color: accent ? 'rgba(255,140,60,0.96)' : 'rgba(255,255,255,0.92)',
                  }}
                />
              </div>
            ))}
          </div>

          <div
            ref={sublineRef}
            className="mt-6 select-none"
            style={{
              fontFamily:    'var(--font-geist-mono, ui-monospace), monospace',
              fontSize:      'clamp(0.65rem, 1.8vw, 1.1rem)',
              letterSpacing: '0.12em',
              color:         'rgba(255,255,255,0.30)',
            }}
          >
            <SplitLine text={SUBLINE} />
          </div>

          <div ref={ctaRef} className="mt-12 flex flex-col items-center gap-3">
            <MagneticCTA label="Start a project" href="#contact" reduceMotion={false} />
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-gray-600">
              15-min call · no pitch deck
            </p>
          </div>

        </div>

        {/* ── Scroll hint ── */}
        <div
          className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-2 pointer-events-none"
          aria-hidden="true"
        >
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          <span className="font-mono text-[9px] tracking-[0.5em] uppercase text-white/20">
            scroll
          </span>
        </div>

      </div>
    </section>
  );
}
