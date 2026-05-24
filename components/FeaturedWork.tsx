'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  cubicBezier,
  type MotionValue,
} from 'framer-motion';
import { projects, type Project } from '@/lib/projects';

/* ─── Cinematic ease for the card hand-offs ─── */
const EASE = cubicBezier(0.22, 1, 0.36, 1);

/* ─── Visibility windows per project. Overlap by ~0.05 so cards
       crossfade/swap instead of snapping. ─── */
type Window = { in: [number, number]; out: [number, number] };
const WINDOWS: Window[] = [
  { in: [0.0, 0.02], out: [0.35, 0.4] }, // project 0 — already on stage
  { in: [0.35, 0.4], out: [0.65, 0.7] }, // project 1
  { in: [0.65, 0.7], out: [1.0, 1.0] },  // project 2 — stays through end
];

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

/* ─── Build an rgba string from a #rrggbb hex and an alpha. ─── */
function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ═══════════════════════════════════════════════════════════
   FEATURED WORK — sticky 3-card scroll tour
═══════════════════════════════════════════════════════════ */
export default function FeaturedWork() {
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });

  // Section background lerps through each project's color across the scroll.
  const bgColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    projects.map((p) => p.color),
  );

  // "See all work" CTA fades + rises into view during the last project.
  const ctaOpacity = useTransform(scrollYProgress, [0.82, 0.96], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.82, 0.96], [20, 0]);

  return (
    <section
      id="work"
      className="relative"
      style={{
        // Solid dark for the section body, fading to the next section's
        // background (#fafafa from FactsRibbon) in the last 15% of height.
        background:
          'linear-gradient(to bottom, #060606 0%, #060606 88%, #fafafa 100%)',
      }}
    >
      {/* ── 180vh driver — sticky inside paints the cards ── */}
      <div ref={stageRef} className="relative" style={{ height: '180vh' }}>
        <motion.div
          className="sticky top-0 h-screen overflow-hidden"
          style={{ background: bgColor, paddingBottom: '80px' }}
        >
          {/* Noise grain — same recipe as the hero */}
          <NoiseGrain reduceMotion={reduceMotion} />

          {/* Ghost project titles, one per project, drifting up */}
          {projects.map((p, i) => (
            <GhostTitle
              key={p.slug}
              project={p}
              w={WINDOWS[i]}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}

          {/* Section label — top-left in the gutter */}
          <div className="absolute top-8 left-8 z-10 pointer-events-none">
            <p className="font-mono text-[11px] tracking-[0.4em] text-white/45 uppercase">
              Featured Work
            </p>
          </div>

          {/* Right-edge scroll indicator */}
          <ScrollDots progress={scrollYProgress} />

          {/* Card stage — all three cards stacked, only the active is opaque.
              paddingBottom mirrors the sticky's so flex centering lifts the
              card off the bottom edge, leaving room for the CTA + fade. */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ paddingBottom: '80px' }}
          >
            {projects.map((p, i) => (
              <ProjectCard
                key={p.slug}
                project={p}
                w={WINDOWS[i]}
                progress={scrollYProgress}
                reduceMotion={reduceMotion}
                isFirst={i === 0}
                isLast={i === projects.length - 1}
              />
            ))}
          </div>

          {/* ── Bottom fade overlay — masks any card overflow + softens the
                seam between the card stage and the CTA button ── */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '140px',
              background:
                'linear-gradient(to bottom, rgba(6,6,6,0) 0%, rgba(6,6,6,0.4) 40%, rgba(6,6,6,0.95) 100%)',
              pointerEvents: 'none',
              zIndex: 15,
            }}
            aria-hidden="true"
          />

          {/* ── "See all work" CTA pinned at the bottom of the sticky
                stage, fading + rising in during the last project ── */}
          <motion.div
            style={{
              position: 'absolute',
              bottom: '12vh',
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              zIndex: 20,
              opacity: ctaOpacity,
              y: ctaY,
            }}
          >
            <a
              href="/work"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 36px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                fontFamily: 'var(--font-geist-mono, monospace)',
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
              }}
            >
              See all work{' '}
              <span style={{ color: 'rgba(255,140,60,0.9)' }}>→</span>
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Trailing bridge — empty space lets the section's gradient
            background fade into the next section's #fafafa floor ── */}
      <div style={{ height: '25vh' }} aria-hidden="true" />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROJECT CARD — slides in from right, parks center, slides out left
═══════════════════════════════════════════════════════════ */
function ProjectCard({
  project,
  w,
  progress,
  reduceMotion,
  isFirst,
  isLast,
}: {
  project: Project;
  w: Window;
  progress: MotionValue<number>;
  reduceMotion: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  // Build per-project input/output keyframes. First card has no entry slide,
  // last card has no exit slide — they're already / still on stage.
  const inputRange: number[] = isFirst
    ? [w.in[1], w.out[0], w.out[1]]
    : isLast
      ? [w.in[0], w.in[1], w.out[0]]
      : [w.in[0], w.in[1], w.out[0], w.out[1]];

  const xRange: number[] = isFirst
    ? reduceMotion ? [0, 0, 0] : [0, 0, -120]
    : isLast
      ? reduceMotion ? [0, 0, 0] : [120, 0, 0]
      : reduceMotion ? [0, 0, 0, 0] : [120, 0, 0, -120];

  const opacityRange: number[] = isFirst
    ? [1, 1, 0]
    : isLast
      ? [0, 1, 1]
      : [0, 1, 1, 0];

  const xVw = useTransform(progress, inputRange, xRange, { ease: EASE });
  const x = useTransform(xVw, (v) => `${v}vw`);
  const opacity = useTransform(progress, inputRange, opacityRange);

  const isExternal = project.url.startsWith('http');

  return (
    <motion.div
      className="absolute"
      style={{
        x,
        opacity,
        width: '70vw',
        height: 'clamp(380px, 55vh, 480px)',
        marginBottom: '100px',
        background: project.color,
        borderRadius: '20px',
        border: `1px solid ${hexToRgba(project.accentColor, 0.15)}`,
        boxShadow:
          '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)',
        overflow: 'hidden',
        willChange: 'transform, opacity',
      }}
    >
      {/* Card-local noise */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: NOISE_SVG,
          mixBlendMode: 'overlay',
          opacity: 0.06,
        }}
        aria-hidden="true"
      />

      {/* Accent corner glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 pointer-events-none rounded-full"
        style={{
          background: `radial-gradient(circle, ${project.accentColor}22, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h3
              className="text-white leading-none"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 6rem)',
                letterSpacing: '-0.03em',
                fontFamily: 'var(--font-anton), system-ui',
                fontWeight: 400,
              }}
            >
              {project.title}
            </h3>
            <p
              className="font-mono text-xs md:text-sm mt-3 tracking-wide"
              style={{ color: project.accentColor }}
            >
              {project.client}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 flex-shrink-0">
            <span className="font-mono text-[10px] tracking-[0.3em] text-white/45">
              {project.year}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Middle: tags, right-aligned */}
        <div
          className="flex flex-wrap justify-end max-w-[60%] ml-auto"
          style={{ gap: 8 }}
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-widest uppercase rounded-full text-white/70"
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '4px 10px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between gap-6">
          <p
            className="text-sm md:text-base max-w-xl leading-relaxed"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {project.description}
          </p>
          {project.status === 'in-progress' ? (
            <span
              className="font-mono text-[10px] tracking-[0.25em] uppercase px-4 py-2 rounded-full whitespace-nowrap"
              style={{
                border: `1px solid ${project.accentColor}`,
                color: project.accentColor,
              }}
            >
              In Progress
            </span>
          ) : (
            <a
              href={project.url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="font-mono text-xs tracking-widest uppercase whitespace-nowrap text-white/90 hover:text-white transition-colors inline-flex items-center gap-2 group"
            >
              View Project
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATUS BADGE
═══════════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: Project['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
        <span className="relative w-1.5 h-1.5 rounded-full bg-green-400">
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-70" />
        </span>
        Live
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        Building
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/60">
      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
      Concept
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   GHOST TITLE — huge translucent project name drifting up
═══════════════════════════════════════════════════════════ */
function GhostTitle({
  project,
  w,
  progress,
  reduceMotion,
}: {
  project: Project;
  w: Window;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const opacityRange = useTransform(
    progress,
    [w.in[0], w.in[1], w.out[0], w.out[1]],
    [0, 1, 1, 0],
  );
  const y = useTransform(
    progress,
    [w.in[0], w.out[1]],
    reduceMotion ? [0, 0] : [60, -120],
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ opacity: opacityRange, y }}
      aria-hidden="true"
    >
      <p
        className="leading-none select-none whitespace-nowrap"
        style={{
          fontSize: 'clamp(6rem, 15vw, 18rem)',
          opacity: 0.07,
          color: project.accentColor,
          fontFamily:
            'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.02em',
          fontWeight: 400,
          transform: 'translateX(-6%)',
        }}
      >
        {project.title.toUpperCase()}
      </p>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SCROLL DOTS — right-edge progress indicator
═══════════════════════════════════════════════════════════ */
function ScrollDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
      {/* Connecting line behind the dots */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-px bg-white/15"
        style={{ top: 4, bottom: 4 }}
        aria-hidden="true"
      />
      {projects.map((p, i) => (
        <ScrollDot key={p.slug} project={p} w={WINDOWS[i]} progress={progress} />
      ))}
    </div>
  );
}

function ScrollDot({
  project,
  w,
  progress,
}: {
  project: Project;
  w: Window;
  progress: MotionValue<number>;
}) {
  const fillOpacity = useTransform(
    progress,
    [w.in[0], w.in[1], w.out[0], w.out[1]],
    [0.15, 1, 1, 0.25],
  );
  const scale = useTransform(
    progress,
    [w.in[0], w.in[1], w.out[0], w.out[1]],
    [0.85, 1.15, 1.15, 0.85],
  );

  return (
    <motion.div
      className="relative w-2 h-2 rounded-full"
      style={{
        border: '1px solid rgba(255,255,255,0.35)',
        scale,
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: project.accentColor, opacity: fillOpacity }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOISE GRAIN — shared with the hero's atmospheric layer
═══════════════════════════════════════════════════════════ */
function NoiseGrain({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: NOISE_SVG,
        mixBlendMode: 'overlay',
        opacity: 0.04,
      }}
      animate={
        reduceMotion ? undefined : { opacity: [0.03, 0.055, 0.035, 0.05, 0.03] }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
      }
      aria-hidden="true"
    />
  );
}
