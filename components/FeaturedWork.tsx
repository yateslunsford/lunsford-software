'use client';

import { useRef, useLayoutEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { projects, type Project } from '@/lib/projects';
import MagneticCTA from '@/components/MagneticCTA';
import Button from '@/components/ui/Button';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* Lazy-load the star canvas — never SSR Three.js */
const WorkStarsScene = dynamic(
  () => import('@/components/WorkStarsScene'),
  { ssr: false, loading: () => null },
);

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

function hexToRgba(hex: string, alpha: number): string {
  const v = hex.replace('#', '');
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ═══════════════════════════════════════════════════════════
   FEATURED WORK — static grid with GSAP fade-up on scroll.
   No swipe, no sticky scroll. Cards appear in place.
═══════════════════════════════════════════════════════════ */
export default function FeaturedWork() {
  const reduceMotion = useReducedMotion() ?? false;
  const sectionRef   = useRef<HTMLElement>(null);
  const cardsRef     = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduceMotion) return;
    const mm = gsap.matchMedia();
    mm.add({
      isMobile:  '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
    }, (ctx) => {
      const { isMobile } = ctx.conditions as Record<string, boolean>;
      const cards = cardsRef.current?.querySelectorAll<HTMLElement>('.featured-card') ?? [];
      gsap.from(cards, {
        opacity: 0,
        y:        isMobile ? 20 : 40,
        duration: isMobile ? 0.35 : 0.6,
        ease: 'power3.out',
        stagger:  isMobile ? 0.08 : 0.12,
        scrollTrigger: {
          trigger: cardsRef.current,
          start:   'top 85%',
        },
      });
    });
    return () => mm.revert();
  }, [reduceMotion]);

  return (
    <section
      id="work"
      ref={sectionRef}
      className="relative bg-black overflow-hidden py-16 sm:py-20 md:py-24"
    >
      {/* Starfield — 30 % opacity, sits behind all content */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.3 }}
        aria-hidden="true"
      >
        <WorkStarsScene />
      </div>

      {/* Animated film-grain overlay */}
      <NoiseGrain reduceMotion={reduceMotion} />

      <div className="relative z-10 max-w-[1160px] mx-auto px-4 sm:px-6">

        {/* ── PRIORITY 1: SEE ALL WORK button — top center ── */}
        <div className="flex justify-center mb-12">
          <MagneticCTA
            label="SEE ALL WORK"
            href="/work"
            reduceMotion={reduceMotion}
          />
        </div>

        {/* Section label — 48px below the button, left-aligned */}
        <div className="mb-10 sm:mb-12">
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] sm:tracking-[0.45em] text-white/65 uppercase">
            Featured Work
          </p>
          <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-white/35 mt-1">
            04 · Selected Builds
          </p>
        </div>

        {/* ── PRIORITY 3: Cards — fade-up on scroll, no swipe ── */}
        <div ref={cardsRef} className="space-y-6 sm:space-y-8">
          {projects.map((p) => (
            <ProjectCard key={p.slug} project={p} reduceMotion={reduceMotion} />
          ))}
        </div>

        {/* Closing CTA */}
        <div className="flex justify-center mt-12 sm:mt-16">
          <Button href="/work">See all work</Button>
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROJECT CARD — static layout; hover scale via Framer Motion
═══════════════════════════════════════════════════════════ */
function ProjectCard({
  project,
  reduceMotion,
}: {
  project: Project;
  reduceMotion: boolean;
}) {
  const isExternal = project.url.startsWith('http');

  return (
    <motion.div
      className="featured-card group relative w-full overflow-hidden"
      style={{
        height:       'clamp(340px, 52vh, 480px)',
        background:   project.color,
        borderRadius: '20px',
        border:       `1.5px solid ${hexToRgba(project.accentColor, 0.32)}`,
        boxShadow:    '0 50px 120px rgba(0,0,0,0.62), 0 0 0 1px rgba(255,255,255,0.06)',
        willChange:   'transform',
      }}
      whileHover={
        reduceMotion
          ? undefined
          : { scale: 1.015, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
      }
    >
      {/* Accent border — visible on hover */}
      <div
        className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ border: `1.5px solid ${project.accentColor}` }}
        aria-hidden="true"
      />

      {/* Card noise */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: NOISE_SVG, mixBlendMode: 'overlay', opacity: 0.07 }}
        aria-hidden="true"
      />

      {/* Corner accent glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 pointer-events-none rounded-full transition-opacity duration-500 opacity-60 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${hexToRgba(project.accentColor, 0.24)}, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="relative h-full p-5 sm:p-8 md:p-12 flex flex-col justify-between">

        {/* Title row */}
        <div className="flex items-start justify-between gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h3
              className="text-white leading-none"
              style={{
                fontSize:    'clamp(1.75rem, 6vw, 6rem)',
                letterSpacing: '-0.03em',
                fontFamily:  'var(--font-anton), system-ui',
                fontWeight:  400,
              }}
            >
              {project.title}
            </h3>
            <p
              className="font-mono text-[11px] sm:text-xs md:text-sm mt-2 sm:mt-3 tracking-wide"
              style={{ color: project.accentColor }}
            >
              {project.client}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-white/55">
              {project.year}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Tags */}
        <div
          className="flex flex-wrap justify-end max-w-[80%] sm:max-w-[60%] ml-auto"
          style={{ gap: 6 }}
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase rounded-full text-white/85"
              style={{ border: '1px solid rgba(255,255,255,0.22)', padding: '4px 9px' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description + action */}
        <div className="flex items-end justify-between gap-3 sm:gap-6">
          <p
            className="text-xs sm:text-sm md:text-base max-w-xl leading-relaxed text-white/75"
            style={{
              display:           '-webkit-box',
              WebkitLineClamp:   2,
              WebkitBoxOrient:   'vertical',
              overflow:          'hidden',
            }}
          >
            {project.description}
          </p>

          {project.status === 'in-progress' ? (
            <span
              className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase px-3 py-1.5 sm:px-4 sm:py-2 rounded-full whitespace-nowrap"
              style={{ border: `1px solid ${project.accentColor}`, color: project.accentColor }}
            >
              In Progress
            </span>
          ) : (
            <a
              href={project.url}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="font-mono text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.18em] uppercase whitespace-nowrap text-white hover:text-white transition-colors inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/30 hover:border-white/70"
            >
              View
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

/* ─── Status dot + label ─── */
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

/* ─── Animated film grain ─── */
function NoiseGrain({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      style={{ backgroundImage: NOISE_SVG, mixBlendMode: 'overlay', opacity: 0.04 }}
      animate={reduceMotion ? undefined : { opacity: [0.03, 0.055, 0.035, 0.05, 0.03] }}
      transition={reduceMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    />
  );
}
