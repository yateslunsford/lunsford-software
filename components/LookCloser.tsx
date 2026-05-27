'use client';

import { useRef, useLayoutEffect, Suspense } from 'react';
import type { MutableRefObject } from 'react';
import dynamic from 'next/dynamic';
import {
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const LookCloserScene = dynamic(
  () => import('@/components/LookCloserScene'),
  { ssr: false },
) as React.ComponentType<{
  scrollRef: MutableRefObject<number>;
  dragRef:   MutableRefObject<number>;
}>;

const WorkStarsScene = dynamic(
  () => import('@/components/WorkStarsScene'),
  { ssr: false, loading: () => null },
);

/* ─── Statement slam-ins (progress 0..1) ─── */
const STATEMENTS = [
  { text: 'EVERY PIXEL.',         range: [0.06, 0.18, 0.28, 0.36] as const },
  { text: 'EVERY LINE.',          range: [0.30, 0.42, 0.50, 0.58] as const },
  { text: 'EVERY DETAIL.',        range: [0.54, 0.64, 0.70, 0.76] as const },
  { text: 'BUILT FROM SCRATCH.',  range: [0.74, 0.84, 0.94, 1.00] as const },
] as const;

/* ═══════════════════════════════════════════════════════════
   LookCloser — h-screen section pinned for +=3000px.
   Assembly animation must fully complete before user scrolls past.
═══════════════════════════════════════════════════════════ */
export default function LookCloser() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef  = useRef<number>(0);
  const dragRef    = useRef<number>(0);
  const progress   = useMotionValue(0);
  const reduceMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    if (!sectionRef.current) return;

    const driver = { value: 0 };

    const mm = gsap.matchMedia();
    mm.add({
      isMobile:  '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
    }, (ctx) => {
      const { isMobile } = ctx.conditions as Record<string, boolean>;

      gsap.fromTo(
        driver,
        { value: 0 },
        {
          value: 1,
          ease: 'none',
          onUpdate: () => {
            scrollRef.current = driver.value;
            progress.set(driver.value);
          },
          scrollTrigger: {
            trigger: sectionRef.current!,
            start:   'top top',
            end:     isMobile ? '+=2000' : '+=3000',
            pin:     true,
            scrub:   isMobile ? 1.0 : 1.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        },
      );
    });

    return () => mm.revert();
  }, [progress]);

  /* ── Overlay motion values ── */
  const labelOpacity    = useTransform(progress, [0, 0.04, 0.94, 1], [1, 0.7, 0.7, 0]);
  const dragHintOpacity = useTransform(progress, [0, 0.05, 0.10], [0.7, 0.7, 0]);

  /* ── Bottom-fade overlay so the dark scene melts into the light
        StatsBand instead of a hard cut at the pin release. ── */
  const handoffOpacity = useTransform(progress, [0.86, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen"
      style={{ background: '#000000', overflow: 'visible' }}
    >
      {/* ── Star layer — same star implementation as hero, 40 % opacity ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.4 }}
        aria-hidden="true"
      >
        <WorkStarsScene />
      </div>

      {/* ── R3F canvas — alpha:true so stars show through fogged regions ── */}
      <div
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        <Suspense
          fallback={
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 60% 50% at 50% 55%, #15151a, #000000 60%)',
              }}
            />
          }
        >
          <LookCloserScene scrollRef={scrollRef} dragRef={dragRef} />
        </Suspense>
      </div>

      {/* ── Vignette ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 110% 90% at 50% 50%, transparent 48%, rgba(0,0,0,0.72) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Top-left section label ── */}
      <motion.div
        className="absolute top-20 sm:top-8 left-4 sm:left-8 z-10 pointer-events-none"
        style={{ opacity: labelOpacity }}
      >
        <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.45em] uppercase text-white/65">
          Look Closer
        </p>
        <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/35 mt-1">
          01  ·  The Craft
        </p>
      </motion.div>

      {/* ── Drag hint — hidden on mobile (no mouse) ── */}
      <motion.div
        className="hidden sm:block absolute top-8 right-8 z-10 pointer-events-none"
        style={{ opacity: dragHintOpacity }}
        aria-hidden="true"
      >
        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-white/55 flex items-center gap-2">
          <span
            className="inline-block w-5 h-5 rounded-full border border-white/45 relative"
            aria-hidden="true"
          >
            <span className="absolute inset-[5px] rounded-full bg-white/60" />
          </span>
          Drag to rotate
        </p>
      </motion.div>

      {/* ── Statements ── */}
      {STATEMENTS.map((s) => (
        <Statement
          key={s.text}
          text={s.text}
          range={s.range}
          progress={progress}
          reduceMotion={reduceMotion}
        />
      ))}

      {/* ── Progress meter ── */}
      <ProgressMeter progress={progress} />

      {/* ── Pin-release handoff: bottom fade that blooms over the
            canvas in the last 14% so the cut into StatsBand is soft. ── */}
      <motion.div
        className="absolute inset-x-0 bottom-0 pointer-events-none z-20"
        style={{
          height: '38vh',
          background:
            'linear-gradient(to bottom, transparent 0%, rgba(250,250,250,0.55) 55%, #fafafa 100%)',
          opacity: handoffOpacity,
        }}
        aria-hidden="true"
      />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   Statement — large fragmentary text that slams in dramatically
═══════════════════════════════════════════════════════════ */
function Statement({
  text,
  range,
  progress,
  reduceMotion,
}: {
  text: string;
  range: readonly [number, number, number, number];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const [a, b, c, d] = range;
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const y       = useTransform(progress, [a, b, c, d], reduceMotion ? [0, 0, 0, 0] : [70, 0, 0, -70]);
  const blur    = useTransform(progress, [a, b, c, d], [14, 0, 0, 14]);
  const filter  = useTransform(blur, (v) => `blur(${v}px)`);
  const scale   = useTransform(progress, [a, b, c, d], reduceMotion ? [1, 1, 1, 1] : [0.92, 1, 1, 1.04]);

  return (
    <motion.div
      className="absolute inset-0 z-10 flex items-end justify-center pointer-events-none px-4 sm:px-6"
      style={{ opacity, y, filter, scale, paddingBottom: '12vh' }}
      aria-hidden="true"
    >
      <p
        className="text-white select-none text-center"
        style={{
          fontFamily: 'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(2rem, 8.5vw, 8.4rem)',
          letterSpacing: '-0.03em',
          lineHeight: 0.95,
          textShadow:
            '0 4px 40px rgba(0,0,0,0.85), 0 0 80px rgba(255,255,255,0.08)',
          maxWidth: '94vw',
        }}
      >
        {text}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ProgressMeter — horizontal bar at bottom
═══════════════════════════════════════════════════════════ */
function ProgressMeter({ progress }: { progress: MotionValue<number> }) {
  const width   = useTransform(progress, [0, 1], ['0%', '100%']);
  const opacity = useTransform(progress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <motion.div
      className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center gap-2"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="relative w-44 h-px bg-white/15 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-white"
          style={{ width }}
        />
      </div>
      <span className="font-mono text-[9px] tracking-[0.45em] uppercase text-white/40">
        Assembly
      </span>
    </motion.div>
  );
}
