'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
} from 'react';
import {
  useScroll,
  useTransform,
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import MagneticCTA from '@/components/MagneticCTA';

/* ═══════════════════════════════════════════════════════════════════════
   ACT TIMING — every number is a scrollYProgress checkpoint (0 → 1).
   Read these like a stage cue sheet. Anything that animates on scroll
   pulls from this table so the three acts stay in lock-step.
   ═══════════════════════════════════════════════════════════════════════ */

const T = {
  // Act I — Arrival (drop already happened on mount; this is the headline)
  headlineAStart: 0.0,
  headlineAEnd: 0.28,
  headlineAFadeOut: [0.32, 0.42] as [number, number],

  // Act II — Card Tour
  rotateInStart: 0.30,
  rotateMid: 0.45,
  rotateLand: 0.60,
  headlineBIn: [0.42, 0.54] as [number, number],
  headlineBOut: [0.66, 0.75] as [number, number],

  // Act III — Fly-through + CTA
  flyStart: 0.72,
  flyPeak: 1.0,
  ctaIn: [0.84, 0.94] as [number, number],
} as const;

const HEADLINE_A = 'WE BUILD WEBSITES THAT CLOSE.';
const HEADLINE_B = 'BUILT IN GA. SHIPPED EVERYWHERE.';
const TAGLINE   = "Custom websites that don't look like everyone else's.";

/* ═══════════════════════════════════════════════════════════════════════
   Scramble hook — used on the Act III tagline.
   ═══════════════════════════════════════════════════════════════════════ */

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—!@#';

function useScramble(target: string, active: boolean): string {
  const [text, setText] = useState(target);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let progress = 0;
    let rafId: number;

    const tick = () => {
      setText(
        target
          .split('')
          .map((char, i) => {
            if (char === ' ' || char === "'" || char === '.') return char;
            if (i < progress) return target[i];
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(''),
      );
      if (frame % 2 === 0) progress += 0.7;
      frame++;
      if (progress < target.length) {
        rafId = requestAnimationFrame(tick);
      } else {
        setText(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, target]);

  return text;
}

/* ═══════════════════════════════════════════════════════════════════════
   ScrollLetter — one letter that fades + lifts into place as scroll
   crosses its assigned slice. Many of these compose a slamming headline.
   ═══════════════════════════════════════════════════════════════════════ */

function ScrollLetter({
  char,
  range,
  progress,
}: {
  char: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y       = useTransform(progress, range, [54, 0]);
  const blur    = useTransform(progress, range, [10, 0]);
  const filter  = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.span
      style={{
        opacity,
        y,
        filter,
        display: 'inline-block',
        whiteSpace: 'pre',
      }}
    >
      {char === ' ' ? ' ' : char}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   EditorialHeadline — the giant Anton headline behind the card. Each
   character gets its own ScrollLetter; the whole block then fades out as
   a unit when the next act takes over.
   ═══════════════════════════════════════════════════════════════════════ */

function EditorialHeadline({
  text,
  inRange,
  outRange,
  progress,
  className,
  style,
}: {
  text: string;
  inRange: [number, number];
  outRange: [number, number];
  progress: MotionValue<number>;
  className?: string;
  style?: CSSProperties;
}) {
  const slices = useMemo(() => {
    const len = text.length;
    const [start, end] = inRange;
    const total = end - start;
    return text.split('').map((char, i) => {
      // Each letter reveals over a small window; windows overlap heavily
      // so the headline reads as a wave, not a typewriter.
      const letterStart = start + (i / len) * (total * 0.7);
      const letterEnd   = letterStart + total * 0.18;
      return { char, range: [letterStart, Math.min(letterEnd, end)] as [number, number] };
    });
  }, [text, inRange]);

  const blockOpacity = useTransform(progress, outRange, [1, 0]);

  return (
    <motion.div
      className={className}
      style={{ ...style, opacity: blockOpacity }}
      aria-hidden="true"
    >
      {slices.map((s, i) => (
        <ScrollLetter key={i} char={s.char} range={s.range} progress={progress} />
      ))}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   BusinessCard — drops in on mount, then hands its transform over to
   scroll. Outer wrapper owns the drop entrance; inner wrapper owns the
   scroll-driven scale / rotateX / Y; innermost wrapper owns rotateY
   (the face flip).
   ═══════════════════════════════════════════════════════════════════════ */

function BusinessCard({
  scrollYProgress,
  reduceMotion,
}: {
  scrollYProgress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  // Scroll-driven transforms — every one keyframed across three acts.
  const cardY = useTransform(
    scrollYProgress,
    [0, T.rotateInStart, 0.65, T.flyPeak],
    reduceMotion ? [0, 0, 0, 0] : [0, 0, -10, -40],
  );
  const cardScale = useTransform(
    scrollYProgress,
    [0, 0.65, T.flyStart, T.flyPeak],
    reduceMotion ? [1, 1, 1, 1] : [1, 1, 1.18, 14],
  );
  const cardRotateX = useTransform(
    scrollYProgress,
    [0, T.rotateInStart, T.rotateMid, T.rotateLand, T.flyStart],
    reduceMotion ? [0, 0, 0, 0, 0] : [0, 0, -11, 5, 0],
  );
  const cardRotateY = useTransform(
    scrollYProgress,
    [0, T.rotateInStart, T.rotateMid, T.rotateLand, T.flyPeak],
    reduceMotion ? [0, 0, 0, 0, 0] : [0, 0, 180, 360, 360],
  );

  // Smooth out the scroll feed so face flips feel like physics, not steps.
  const smoothRotateY = useSpring(cardRotateY, { stiffness: 160, damping: 14 });
  const smoothRotateX = useSpring(cardRotateX, { stiffness: 160, damping: 14 });

  const faceBase: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '16px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <motion.div
      // Drop entrance — one-shot on mount. Spring with bounce.
      initial={reduceMotion ? false : { y: '-120vh', rotate: 14, opacity: 0 }}
      animate={reduceMotion ? undefined : { y: 0, rotate: 0, opacity: 1 }}
      transition={
        reduceMotion
          ? undefined
          : { type: 'spring', stiffness: 130, damping: 13, mass: 1.15, delay: 0.05 }
      }
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    >
      {/* Dedicated perspective parent — no competing transforms here.
          This is the *direct* parent of the rotateY element. */}
      <div
        style={{
          perspective: 1400,
          perspectiveOrigin: '50% 50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          // The card itself — owns every transform that needs the
          // perspective context (scale, rotateX, rotateY, Y) and carries
          // transformStyle as a direct motion style prop so Framer
          // Motion processes it before composing the transform string.
          style={{
            y: cardY,
            scale: cardScale,
            rotateX: smoothRotateX,
            rotateY: smoothRotateY,
            transformStyle: 'preserve-3d',
            width: 'clamp(280px, 38vw, 500px)',
            aspectRatio: '1.75',
            position: 'relative',
            willChange: 'transform',
          }}
        >

          {/* ─── Front Face ─── */}
          <div
            style={{
              ...faceBase,
              background: '#fafafa',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
              padding: 'clamp(18px, 3vw, 32px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-geist-sans, system-ui), sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(1rem, 2.2vw, 1.5rem)',
                  color: '#0a0a0a',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  margin: 0,
                }}>LUNSFORD</p>
                <p style={{
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  fontWeight: 400,
                  fontSize: 'clamp(0.38rem, 0.75vw, 0.55rem)',
                  color: '#888',
                  letterSpacing: '0.28em',
                  margin: '4px 0 0 0',
                }}>SOFTWARE DEVELOPMENT</p>
              </div>
              <div style={{
                width: 'clamp(28px, 3.5vw, 42px)',
                height: 'clamp(28px, 3.5vw, 42px)',
                borderRadius: '50%',
                border: '1.5px solid #ccc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontFamily: 'var(--font-geist-sans, system-ui)',
                  fontWeight: 700,
                  fontSize: 'clamp(0.5rem, 1vw, 0.7rem)',
                  color: '#555',
                  letterSpacing: '-0.02em',
                }}>LS</span>
              </div>
            </div>

            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, #e0e0e0, transparent)',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <p style={{
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontSize: 'clamp(0.35rem, 0.65vw, 0.5rem)',
                color: '#aaa',
                letterSpacing: '0.12em',
                margin: 0,
              }}>EST. 2026 · NEWNAN, GA</p>
              <p style={{
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontSize: 'clamp(0.35rem, 0.65vw, 0.5rem)',
                color: '#aaa',
                letterSpacing: '0.05em',
                margin: 0,
              }}>ylunsford1@gmail.com</p>
            </div>
          </div>

          {/* ─── Back Face ─── */}
          <div
            style={{
              ...faceBase,
              background: '#0a0a0a',
              boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontSize: 'clamp(0.38rem, 0.75vw, 0.55rem)',
              color: '#555',
              letterSpacing: '0.35em',
              margin: 0,
            }}>CUSTOM WEBSITES</p>
            <p style={{
              fontFamily: 'var(--font-geist-sans, system-ui)',
              fontWeight: 800,
              fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
              color: '#f8f8f6',
              letterSpacing: '-0.03em',
              margin: 0,
              lineHeight: 1,
            }}>Built right.</p>
            <div style={{
              width: '32px',
              height: '1px',
              background: 'rgba(255,140,60,0.6)',
              marginTop: '4px',
            }} />
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   CardHero — three-act cinematic. 250vh container, sticky stage.
   ═══════════════════════════════════════════════════════════════════════ */

export default function CardHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  /* ─── Cursor-following glow (existing, preserved) ─── */
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.4);
  const springX = useSpring(rawX, { stiffness: 55, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 55, damping: 22 });
  const pctX = useTransform(springX, [0, 1], ['0%', '100%']);
  const pctY = useTransform(springY, [0, 1], ['0%', '100%']);

  // Cursor glow intensity pulses with the acts.
  const cursorIntensity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.4, 0.7, 1],
    reduceMotion ? [0.18, 0.18, 0.18, 0.18, 0.18] : [0.22, 0.30, 0.14, 0.18, 0.32],
  );
  const cursorGlow = useMotionTemplate`radial-gradient(circle at ${pctX} ${pctY}, rgba(255,140,60,${cursorIntensity}), transparent 38%)`;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(e.clientX / rect.width);
      rawY.set(e.clientY / rect.height);
    },
    [rawX, rawY],
  );

  /* ─── Orange ambient glow — pulses bright on card-drop impact ─── */
  const [impacted, setImpacted] = useState(false);
  useEffect(() => {
    if (reduceMotion) {
      setImpacted(true);
      return;
    }
    // ~spring settle time. Pulse fires when the card hits center.
    const id = window.setTimeout(() => setImpacted(true), 950);
    return () => window.clearTimeout(id);
  }, [reduceMotion]);

  // Atmospheric orange — dims through Act II so eye relaxes, returns
  // for Act III as the CTA arrives.
  const orangeOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.45, 0.75, 1],
    reduceMotion ? [1, 1, 1, 1, 1] : [1, 0.85, 0.45, 0.8, 1.1],
  );
  const orangeScale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1, 1.4]);

  /* ─── Cool counter-glow (icy blue, low intensity) ─── */
  const blueOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.7, 1],
    reduceMotion ? [0.5, 0.5, 0.5, 0.5] : [0.35, 0.8, 0.55, 0.15],
  );

  /* ─── Ghost "BUILT RIGHT" — now scales and drifts dramatically ─── */
  const ghostY      = useTransform(scrollYProgress, [0, 0.9], reduceMotion ? [0, 0] : [0, -120]);
  const ghostScale  = useTransform(scrollYProgress, [0, 0.85], reduceMotion ? [1, 1] : [0.95, 1.6]);
  const ghostOpacity = useTransform(
    scrollYProgress,
    [0.05, 0.22, 0.55, 0.78],
    reduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );

  /* ─── Act III CTA reveal ─── */
  const ctaOpacity = useTransform(scrollYProgress, T.ctaIn, [0, 1]);
  const ctaY       = useTransform(scrollYProgress, T.ctaIn, reduceMotion ? [0, 0] : [60, 0]);

  /* ─── Tagline scramble ─── */
  const [scrambleActive, setScrambleActive] = useState(reduceMotion);
  const scrambled = useScramble(TAGLINE, scrambleActive);

  useMotionValueEvent(ctaOpacity, 'change', (v) => {
    if (v > 0.08 && !scrambleActive) setScrambleActive(true);
  });

  /* ─── Scroll hint (tiny) ─── */
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.04], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        height: '250vh',
        background:
          'linear-gradient(to bottom, #060606 0%, #060606 45%, #1a1a1a 62%, #6b6b6b 78%, #d4d4d4 88%, #fafafa 100%)',
      }}
      onMouseMove={handleMouseMove}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ contain: 'paint' }}
      >

        {/* ── Cool counter-glow (icy white, upper-left) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 18% 22%, rgba(180,210,255,0.10), transparent 60%)',
            opacity: blueOpacity,
          }}
          aria-hidden="true"
        />

        {/* ── Orange ambient glow (center-low, pulses on impact) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(255,140,60,0.22), transparent 58%)',
            opacity: orangeOpacity,
            scale: orangeScale,
            transformOrigin: '50% 55%',
          }}
          aria-hidden="true"
          animate={
            reduceMotion
              ? undefined
              : {
                  filter: impacted
                    ? ['brightness(2.1)', 'brightness(1)']
                    : 'brightness(1)',
                }
          }
          transition={
            reduceMotion ? undefined : { duration: 1.1, times: [0, 1], ease: 'easeOut' }
          }
        />

        {/* ── Cursor-following reactive glow ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: cursorGlow }}
          aria-hidden="true"
        />

        {/* ── Film vignette ── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
          }}
          aria-hidden="true"
        />

        {/* ── Noise grain (animated flicker) ── */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
            mixBlendMode: 'overlay',
            opacity: 0.04,
          }}
          animate={reduceMotion ? undefined : { opacity: [0.03, 0.055, 0.035, 0.05, 0.03] }}
          transition={
            reduceMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
          }
          aria-hidden="true"
        />

        {/* ── Ghost "BUILT RIGHT" — scales up across the scroll ── */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ y: ghostY, scale: ghostScale, opacity: ghostOpacity }}
          aria-hidden="true"
        >
          <p
            className="font-black tracking-tight text-white leading-none select-none whitespace-nowrap"
            style={{
              fontSize: 'clamp(5rem, 18vw, 22rem)',
              opacity: 0.045,
              fontFamily: 'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            BUILT RIGHT
          </p>
        </motion.div>

        {/* ── Act I headline — slams in letter-by-letter ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
          style={{ zIndex: 2 }}
        >
          <EditorialHeadline
            text={HEADLINE_A}
            inRange={[T.headlineAStart, T.headlineAEnd]}
            outRange={T.headlineAFadeOut}
            progress={scrollYProgress}
            className="text-center text-white/85 leading-[0.92] select-none"
            style={{
              fontFamily: 'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(2.5rem, 9vw, 9rem)',
              letterSpacing: '-0.03em',
              maxWidth: '92vw',
            }}
          />
        </div>

        {/* ── Act II sub-statement — swaps in, mono, tracked out ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none px-6"
          style={{ zIndex: 2 }}
        >
          <EditorialHeadline
            text={HEADLINE_B}
            inRange={T.headlineBIn}
            outRange={T.headlineBOut}
            progress={scrollYProgress}
            className="text-center text-white/70 leading-tight select-none"
            style={{
              fontFamily: 'var(--font-geist-mono, ui-monospace), monospace',
              fontWeight: 500,
              fontSize: 'clamp(1.3rem, 4vw, 3rem)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              maxWidth: '90vw',
            }}
          />
        </div>

        {/* ── The card itself ── */}
        <BusinessCard scrollYProgress={scrollYProgress} reduceMotion={reduceMotion} />

        {/* ── Act III CTA — rises from where the card was ── */}
        <motion.div
          className="absolute inset-x-0 z-20"
          style={{
            bottom: '8vh',
            opacity: ctaOpacity,
            y: ctaY,
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <p className="text-gray-700 text-base md:text-xl font-normal max-w-xl mx-auto leading-relaxed font-mono tracking-tight text-center px-6">
              {scrambled}
            </p>
            <MagneticCTA label="Start a project" href="#contact" reduceMotion={reduceMotion} />
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-gray-500">
              15-min call · no pitch deck
            </p>
          </div>
        </motion.div>

        {/* ── Faint scroll hint (just a tick mark, no "scroll down ↓") ── */}
        <motion.div
          className="absolute bottom-4 inset-x-0 text-center pointer-events-none"
          style={{ opacity: scrollHintOpacity }}
          aria-hidden="true"
        >
          <div className="inline-flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
            <span className="font-mono text-[9px] tracking-[0.5em] uppercase text-white/35">
              250vh
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
