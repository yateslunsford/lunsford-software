'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Stat shape & data ─── */
type Stat = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  format?: 'plain' | 'comma';
};

const STATS: readonly Stat[] = [
  { label: 'Projects',            value: 3,     suffix: '+' },
  { label: 'Value delivered',     value: 3000,  prefix: '$', format: 'comma' },
  { label: 'Lines of code',       value: 50000, suffix: '+', format: 'comma' },
  { label: 'Client satisfaction', value: 100,   suffix: '%' },
];

const COMMA_FMT = new Intl.NumberFormat('en-US');

function formatCount(value: number, format: Stat['format']): string {
  if (format === 'comma') return COMMA_FMT.format(value);
  return value.toString();
}

/* ═══════════════════════════════════════════════════════════
   StatsBand — parallax strip on top, four GSAP counters below.
═══════════════════════════════════════════════════════════ */
export default function StatsBand() {
  return (
    <section
      aria-label="By the numbers"
      className="relative bg-[#fafafa] border-t border-black/[0.08] border-b border-black/[0.08] overflow-hidden"
    >
      <ParallaxStrip />
      <StatsBlock />
    </section>
  );
}

function ParallaxStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? ['0%', '0%'] : ['12%', '-42%'],
  );

  return (
    <div
      ref={ref}
      className="relative py-6 md:py-8 border-b border-black/[0.06]"
      aria-hidden="true"
    >
      <motion.div
        className="flex whitespace-nowrap will-change-transform"
        style={{ x }}
      >
        {Array.from({ length: 4 }, (_, i) => (
          <span
            key={i}
            className="leading-none px-6 md:px-10 select-none"
            style={{
              fontFamily:
                'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 'clamp(3.5rem, 11vw, 11rem)',
              letterSpacing: '-0.03em',
              color: 'rgba(10,10,10,0.08)',
            }}
          >
            CRAFT · CODE · CLOSE ·
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   StatsBlock — 4 equal columns with vertical
   dividers. Each column = ONE number ONE label.
─────────────────────────────────────────────── */
function StatsBlock() {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [counts, setCounts] = useState<number[]>(() => STATS.map(() => 0));

  useLayoutEffect(() => {
    if (!gridRef.current) return;

    if (reduceMotion) {
      const id = window.setTimeout(
        () => setCounts(STATS.map((s) => s.value)),
        0,
      );
      return () => window.clearTimeout(id);
    }

    const drivers = STATS.map(() => ({ value: 0 }));

    const ctx = gsap.context(() => {
      drivers.forEach((d, i) => {
        gsap.to(d, {
          value: STATS[i].value,
          duration: 2.1,
          ease: 'expo.out',
          delay: i * 0.18,
          onUpdate: () => {
            setCounts((prev) => {
              const next = prev.slice();
              next[i] = Math.round(d.value);
              return next;
            });
          },
          scrollTrigger: {
            trigger: gridRef.current!,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });
    }, gridRef);

    return () => ctx.revert();
  }, [reduceMotion]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 md:py-16">
      <motion.p
        className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.5em] text-gray-500 uppercase text-center mb-8 sm:mb-12"
        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={reduceMotion ? undefined : { duration: 0.5 }}
      >
        Receipts  ·  Real, not rounded
      </motion.p>

      <div
        ref={gridRef}
        className="grid grid-cols-2 md:grid-cols-4 gap-y-8 sm:gap-y-10"
        style={{ columnGap: 0 }}
      >
        {STATS.map((stat, i) => (
          <StatItem
            key={stat.label}
            stat={stat}
            count={counts[i]}
            index={i}
            total={STATS.length}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}

function StatItem({
  stat,
  count,
  index,
  total,
  reduceMotion,
}: {
  stat: Stat;
  count: number;
  index: number;
  total: number;
  reduceMotion: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduceMotion || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: 'power3.out',
        delay: index * 0.12,
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 85%',
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [reduceMotion, index]);

  // Vertical divider between every column except the last.
  // On mobile (2-col) only divide between cols 0|1 and 2|3.
  const isLast = index === total - 1;
  const mobileBorder = index % 2 === 0 ? 'border-r border-black/10' : '';
  const desktopBorder = isLast ? '' : 'md:border-r border-black/10';

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center justify-center text-center px-2 sm:px-4 md:px-8 ${mobileBorder} ${desktopBorder}`}
    >
      <div
        className="leading-none text-black tabular-nums whitespace-nowrap block"
        style={{
          fontFamily:
            'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
          fontWeight: 400,
          fontSize: 'clamp(1.6rem, 5.6vw, 5rem)',
          letterSpacing: '0.02em',
          marginBottom: '1rem',
        }}
      >
        {stat.prefix ?? ''}
        {formatCount(count, stat.format)}
        {stat.suffix ?? ''}
      </div>
      <p
        className="font-mono uppercase text-gray-500 block text-[9px] sm:text-[10px]"
        style={{
          letterSpacing: '0.3em',
          lineHeight: 1.4,
        }}
      >
        {stat.label}
      </p>
    </div>
  );
}
