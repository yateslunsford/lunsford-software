'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import {
  useScroll,
  useTransform,
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useMotionValueEvent,
  animate,
} from 'framer-motion';

/* ─── Text scramble hook ─── */
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

/* ─── CSS 3D Business Card ─── */
function BusinessCard({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'] }) {
  const rotateY = useMotionValue(0);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const cardScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.85]);
  const scrollTilt = useTransform(scrollYProgress, [0, 0.5], [0, 12]);

  useEffect(() => {
    const controls = animate(rotateY, 360, {
      duration: 9,
      ease: 'linear',
      repeat: Infinity,
    });
    return controls.stop;
  }, [rotateY]);

  const cardStyle: React.CSSProperties = {
    width: 'clamp(280px, 38vw, 500px)',
    aspectRatio: '1.75',
    position: 'relative',
    transformStyle: 'preserve-3d',
  };

  const faceBase: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '16px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <motion.div
      style={{
        y: cardY,
        scale: cardScale,
        rotateX: scrollTilt,
        perspective: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <motion.div style={{ ...cardStyle, rotateY }}>

        {/* Front Face */}
        <div
          style={{
            ...faceBase,
            background: '#f8f8f6',
            boxShadow: '0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08)',
            padding: 'clamp(18px, 3vw, 32px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Top row */}
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
                marginTop: '4px',
                margin: '4px 0 0 0',
              }}>SOFTWARE DEVELOPMENT</p>
            </div>
            {/* LS monogram */}
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

          {/* Center accent line */}
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, #e0e0e0, transparent)',
            margin: '0',
          }} />

          {/* Bottom row */}
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

        {/* Back Face */}
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
    </motion.div>
  );
}

/* ─── Hero section ─── */
export default function CardHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  /* CTA reveal */
  const textOpacity       = useTransform(scrollYProgress, [0.88, 0.98], [0, 1]);
  const textY             = useTransform(scrollYProgress, [0.88, 0.98], [20, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  /* Ghost "BUILT RIGHT" text */
  const ghostY       = useTransform(scrollYProgress, [0, 0.9], [0, -60]);
  const ghostOpacity = useTransform(scrollYProgress, [0.05, 0.22, 0.72, 0.86], [0, 1, 1, 0]);

  /* Cursor-following glow */
  const rawX   = useMotionValue(0.5);
  const rawY   = useMotionValue(0.4);
  const springX = useSpring(rawX, { stiffness: 55, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 55, damping: 22 });
  const pctX   = useTransform(springX, [0, 1], ['0%', '100%']);
  const pctY   = useTransform(springY, [0, 1], ['0%', '100%']);
  const cursorGlow = useMotionTemplate`radial-gradient(circle at ${pctX} ${pctY}, rgba(255,140,60,0.18), transparent 38%)`;

  /* Tagline scramble */
  const [scrambleActive, setScrambleActive] = useState(false);
  const TAGLINE = "Custom websites that don't look like everyone else's.";
  const scrambled = useScramble(TAGLINE, scrambleActive);

  useMotionValueEvent(textOpacity, 'change', (v) => {
    if (v > 0.08 && !scrambleActive) setScrambleActive(true);
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(e.clientX / rect.width);
      rawY.set(e.clientY / rect.height);
    },
    [rawX, rawY],
  );

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        height: '250vh',
        background: 'linear-gradient(to bottom, #080808 0%, #080808 55%, #2a2a2a 75%, #b8b8b8 90%, #fafafa 100%)',
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Static ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,140,60,0.15), transparent 55%)' }}
        />

        {/* Cursor-following reactive glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: cursorGlow }}
        />

        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Ghost "BUILT RIGHT" ambient text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ y: ghostY, opacity: ghostOpacity }}
          aria-hidden="true"
        >
          <p
            className="font-black tracking-tight text-white leading-none select-none whitespace-nowrap"
            style={{ fontSize: 'clamp(5rem, 18vw, 20rem)', opacity: 0.028 }}
          >
            BUILT RIGHT
          </p>
        </motion.div>

        {/* CSS 3D Business Card */}
        <BusinessCard scrollYProgress={scrollYProgress} />

        {/* CTA text — scrambles into existence on scroll reveal */}
        <motion.div
          className="absolute inset-x-0 text-center px-6 z-10"
          style={{ bottom: '6vh', opacity: textOpacity, y: textY }}
        >
          <p className="text-gray-700 text-base md:text-xl font-normal max-w-xl mx-auto mb-4 leading-relaxed font-mono tracking-tight">
            {scrambled}
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Start a project →
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-3 inset-x-0 text-center"
          style={{ opacity: scrollHintOpacity }}
        >
          <p className="text-white/30 text-[10px] font-mono tracking-[0.4em] uppercase">Scroll</p>
        </motion.div>

      </div>
    </section>
  );
}