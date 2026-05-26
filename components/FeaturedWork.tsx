'use client';

import { useRef } from 'react';
import Link from 'next/link';
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

/* ─── Visibility windows per project. Each card owns 1/N of the scroll,
       with ~0.05 overlap so cards crossfade instead of snapping. ─── */
type Window = { in: [number, number]; out: [number, number] };

const N_PROJECTS = projects.length;
const STEP = 1 / N_PROJECTS;
const OVERLAP = 0.05;

const WINDOWS: Window[] = projects.map((_, i) => {
  const isLast   = i === N_PROJECTS - 1;
  const inStart  = i * STEP;
  const outStart = (i + 1) * STEP;
  return {
    in:  [inStart, Math.min(inStart + OVERLAP, 1)] as [number, number],
    out: isLast
      ? ([1, 1] as [number, number])
      : ([outStart, Math.min(outStart + OVERLAP, 1)] as [number, number]),
  };
});

/* ─── Stage scales w/ N. Tighter than before so the sticky releases
       as soon as the last card finishes — no dead space afterward. ─── */
const STAGE_HEIGHT_VH = Math.max(55 * N_PROJECTS, 165);

/* ─── Evenly-spaced progress points for bg color lerp. ─── */
const BG_PROGRESS_STOPS =
  N_PROJECTS === 1
    ? [0, 1]
    : projects.map((_, i) => i / (N_PROJECTS - 1));
const BG_COLORS =
  N_PROJECTS === 1
    ? [projects[0].color, projects[0].color]
    : projects.map((p) => p.color);

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ═══════════════════════════════════════════════════════════
   FEATURED WORK — sticky scroll tour, then a hardcoded
   "See All Work" CTA block before handing off to the next section.
═══════════════════════════════════════════════════════════ */
export default function FeaturedWork() {
  const reduceMotion = useReducedMotion() ?? false;
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end end'],
  });

  const bgColor = useTransform(scrollYProgress, BG_PROGRESS_STOPS, BG_COLORS);

  return (
    <section id="work" className="relative bg-[#060606]">
      {/* ── Soft entry — fades the previous light section into the dark stage. ── */}
      <div
        aria-hidden="true"
        className="h-16"
        style={{
          background:
            'linear-gradient(to bottom, #fafafa 0%, #1a1a1a 60%, #060606 100%)',
        }}
      />

      {/* ── Driver — sticky inside paints the cards. Height = N * 55vh. ── */}
      <div ref={stageRef} className="relative" style={{ height: `${STAGE_HEIGHT_VH}vh` }}>
        <motion.div
          className="sticky top-0 h-screen overflow-hidden"
          style={{ background: bgColor }}
        >
          <NoiseGrain reduceMotion={reduceMotion} />

          {projects.map((p, i) => (
            <GhostTitle
              key={p.slug}
              project={p}
              w={WINDOWS[i]}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}

          {/* Section label — top-left */}
          <div className="absolute top-8 left-8 z-10 pointer-events-none">
            <p className="font-mono text-[11px] tracking-[0.45em] text-white/65 uppercase">
              Featured Work
            </p>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/35 mt-1">
              04  ·  Selected Builds
            </p>
          </div>

          <ScrollDots progress={scrollYProgress} />

          <div className="absolute inset-0 flex items-center justify-center">
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
        </motion.div>
      </div>

      {/* ── Hardcoded "See All Work" block — always visible after the
            sticky stage. This is the last thing before the next section. ── */}
      <SeeAllWorkBlock />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   SEE ALL WORK — full-width button block, hardcoded, always
   rendered. Dark background to bridge the cards into the
   light section that follows.
═══════════════════════════════════════════════════════════ */
function SeeAllWorkBlock() {
  return (
    <div
      className="relative px-6 pt-14 pb-28"
      style={{
        background:
          'linear-gradient(to bottom, #060606 0%, #060606 78%, #fafafa 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <p className="font-mono text-[10px] tracking-[0.45em] text-white/40 uppercase">
          {projects.length} featured  ·  more inside
        </p>
        <Link
          href="/work"
          className="see-all-btn block w-full text-center no-underline"
          style={{
            border: '1px solid #ffffff',
            background: 'transparent',
            color: '#ffffff',
            padding: '20px 40px',
            fontSize: '13px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-geist-mono), monospace',
            transition: 'background-color 0.2s ease, color 0.2s ease',
            cursor: 'pointer',
          }}
        >
          See All Work →
        </Link>
      </div>

      <style>{`
        .see-all-btn:hover {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
      `}</style>
    </div>
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

  const scaleRange: number[] = isFirst
    ? reduceMotion ? [1, 1, 1] : [1, 1, 0.94]
    : isLast
      ? reduceMotion ? [1, 1, 1] : [0.94, 1, 1]
      : reduceMotion ? [1, 1, 1, 1] : [0.94, 1, 1, 0.94];

  const xVw    = useTransform(progress, inputRange, xRange, { ease: EASE });
  const x      = useTransform(xVw, (v) => `${v}vw`);
  const opacity = useTransform(progress, inputRange, opacityRange);
  const scale   = useTransform(progress, inputRange, scaleRange);

  const isExternal = project.url.startsWith('http');

  return (
    <motion.div
      className="absolute group"
      style={{
        x,
        opacity,
        scale,
        width: 'min(74vw, 1100px)',
        height: 'clamp(380px, 56vh, 500px)',
        background: project.color,
        borderRadius: '20px',
        border: `1.5px solid ${hexToRgba(project.accentColor, 0.32)}`,
        boxShadow:
          '0 50px 120px rgba(0,0,0,0.62), 0 0 0 1px rgba(255,255,255,0.06)',
        overflow: 'hidden',
        willChange: 'transform, opacity',
      }}
      whileHover={
        reduceMotion ? undefined : { scale: 1.02, transition: { duration: 0.4, ease: EASE } }
      }
    >
      <div
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ border: `1.5px solid ${project.accentColor}` }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: NOISE_SVG,
          mixBlendMode: 'overlay',
          opacity: 0.07,
        }}
        aria-hidden="true"
      />

      <div
        className="absolute -top-32 -right-32 w-96 h-96 pointer-events-none rounded-full transition-opacity duration-500 opacity-60 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle, ${hexToRgba(project.accentColor, 0.24)}, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative h-full p-8 md:p-12 flex flex-col justify-between">
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
            <span className="font-mono text-[10px] tracking-[0.3em] text-white/55">
              {project.year}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        <div
          className="flex flex-wrap justify-end max-w-[60%] ml-auto"
          style={{ gap: 8 }}
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-widest uppercase rounded-full text-white/85"
              style={{
                border: '1px solid rgba(255,255,255,0.22)',
                padding: '5px 11px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-6">
          <p
            className="text-sm md:text-base max-w-xl leading-relaxed text-white/75"
            style={{
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
              className="font-mono text-xs tracking-[0.18em] uppercase whitespace-nowrap text-white hover:text-white transition-colors inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 hover:border-white/70"
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

function StatusBadge({ status }: { status: Project['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/90">
        <span className="relative w-1.5 h-1.5 rounded-full bg-white">
          <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-70" />
        </span>
        Live
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
        <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
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
    reduceMotion ? [0, 0] : [50, -90],
  );

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
      style={{ opacity: opacityRange, y }}
      aria-hidden="true"
    >
      <p
        className="leading-none select-none text-center"
        style={{
          fontSize: 'clamp(4rem, 11vw, 12rem)',
          opacity: 0.085,
          color: project.accentColor,
          fontFamily:
            'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
          letterSpacing: '-0.025em',
          fontWeight: 400,
          maxWidth: '94vw',
        }}
      >
        {project.title.toUpperCase()}
      </p>
    </motion.div>
  );
}

function ScrollDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4">
      <div
        className="absolute left-1/2 -translate-x-1/2 w-px bg-white/20"
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
    [0.2, 1, 1, 0.3],
  );
  const scale = useTransform(
    progress,
    [w.in[0], w.in[1], w.out[0], w.out[1]],
    [0.85, 1.2, 1.2, 0.85],
  );

  return (
    <motion.div
      className="relative w-2 h-2 rounded-full"
      style={{
        border: '1px solid rgba(255,255,255,0.5)',
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
