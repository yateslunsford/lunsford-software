'use client';

import { useRef } from 'react';
import Link from 'next/link';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion';
import { projects, type Project } from '@/lib/projects';
import MagneticCTA from '@/components/MagneticCTA';

const NOISE_SVG = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

/* ═══════════════════════════════════════════════════════════
   /WORK — full portfolio page
═══════════════════════════════════════════════════════════ */
export default function WorkPage() {
  return (
    <main className="bg-[#060606] text-white">
      <WorkNav />
      <WorkHeader />
      <ProjectGrid />
      <StartCTA />
      <BackToTop />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAV — minimal, page-specific
═══════════════════════════════════════════════════════════ */
function WorkNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#060606]/70 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <Link
          href="/#work"
          className="font-mono text-[10px] sm:text-xs tracking-widest uppercase text-white/45 hover:text-white transition-colors whitespace-nowrap"
        >
          ← Back
        </Link>
        <Link
          href="/#contact"
          className="text-xs sm:text-sm bg-white text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-gray-200 transition-colors font-semibold whitespace-nowrap"
        >
          Start a project
        </Link>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   HEADER — giant "ALL WORK" with monochrome atmosphere
═══════════════════════════════════════════════════════════ */
function WorkHeader() {
  const reduceMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [0, -120],
  );
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Cool white ambient bloom — no orange */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(255,255,255,0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Cool counter-glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 18% 22%, rgba(180,210,255,0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Noise grain */}
      <NoiseGrain reduceMotion={reduceMotion} />

      {/* Centered headline */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6"
        style={{ y, opacity }}
      >
        <motion.h1
          className="text-white leading-[0.85] select-none"
          style={{
            fontSize: 'clamp(3.5rem, 16vw, 18rem)',
            fontFamily:
              'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
            fontWeight: 400,
            letterSpacing: '-0.035em',
            opacity: 0.92,
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 60 }}
          animate={reduceMotion ? undefined : { opacity: 0.92, y: 0 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.0, ease: [0.16, 1, 0.3, 1] }
          }
        >
          ALL WORK
        </motion.h1>
        <motion.p
          className="font-mono text-[10px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.45em] uppercase text-white/45 mt-6 sm:mt-8"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={
            reduceMotion ? undefined : { duration: 0.8, delay: 0.35 }
          }
        >
          Lunsford Software Development · Est. 2026
        </motion.p>
      </motion.div>

      {/* Scroll hint at bottom */}
      <div className="absolute bottom-8 inset-x-0 text-center pointer-events-none">
        <div className="inline-flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
          <span className="font-mono text-[9px] tracking-[0.5em] uppercase text-white/35">
            {projects.length} projects
          </span>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROJECT GRID
═══════════════════════════════════════════════════════════ */
function ProjectGrid() {
  return (
    <section className="relative px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
          {projects.map((p, i) => {
            const fullWidth = i % 3 === 0;
            return (
              <WorkCard
                key={p.slug}
                project={p}
                fullWidth={fullWidth}
                index={i}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   WORK CARD
═══════════════════════════════════════════════════════════ */
function WorkCard({
  project,
  fullWidth,
  index,
}: {
  project: Project;
  fullWidth: boolean;
  index: number;
}) {
  const reduceMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const isExternal = project.url.startsWith('http');
  const isLink = project.status !== 'in-progress' && project.url !== '#';

  const CardInner = (
    <motion.div
      ref={ref}
      initial={reduceMotion ? false : { opacity: 0, y: 60 }}
      animate={
        reduceMotion
          ? undefined
          : inView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 60 }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 0.8,
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1],
            }
      }
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -8,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
            }
      }
      className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl ${
        fullWidth ? 'md:col-span-2' : ''
      }`}
      style={{
        background: project.color,
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        height: 'clamp(340px, 50vw, ' + (fullWidth ? '500px' : '340px') + ')',
      }}
    >
      {/* Accent border that fades in on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ border: `1px solid ${project.accentColor}` }}
        aria-hidden="true"
      />

      {/* Accent corner glow */}
      <div
        className="absolute -top-32 -right-32 w-96 h-96 pointer-events-none rounded-full transition-opacity duration-500 opacity-50 group-hover:opacity-90"
        style={{
          background: `radial-gradient(circle, ${project.accentColor}33, transparent 70%)`,
        }}
        aria-hidden="true"
      />

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

      <div
        className={`relative h-full flex flex-col justify-between ${
          fullWidth ? 'p-5 sm:p-8 md:p-12' : 'p-5 sm:p-6 md:p-10'
        }`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h3
              className="text-white leading-none"
              style={{
                fontSize: fullWidth
                  ? 'clamp(1.85rem, 6vw, 6rem)'
                  : 'clamp(1.5rem, 3.5vw, 3.25rem)',
                letterSpacing: '-0.035em',
                fontFamily:
                  'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
                fontWeight: 400,
              }}
            >
              {project.title}
            </h3>
            <p
              className="font-mono text-[10px] sm:text-xs md:text-sm mt-2 sm:mt-3 tracking-wide"
              style={{ color: project.accentColor }}
            >
              {project.client}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] text-white/45">
              {project.year}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </div>

        {/* Middle: tags */}
        <div
          className={`flex flex-wrap gap-1.5 sm:gap-2 ${
            fullWidth ? 'sm:justify-end sm:max-w-[60%] sm:ml-auto' : ''
          }`}
        >
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-white/75"
              style={{ border: '1px solid rgba(255,255,255,0.14)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between gap-3 sm:gap-6">
          <p
            className={`text-white/60 leading-relaxed ${
              fullWidth ? 'text-xs sm:text-sm md:text-base max-w-xl' : 'text-xs md:text-sm max-w-md'
            }`}
          >
            {project.description}
          </p>
          <div className="relative flex-shrink-0 overflow-hidden h-6">
            {project.status === 'in-progress' ? (
              <span
                className="font-mono text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase px-3 sm:px-4 py-1.5 sm:py-2 rounded-full whitespace-nowrap"
                style={{
                  border: `1px solid ${project.accentColor}`,
                  color: project.accentColor,
                }}
              >
                In Progress
              </span>
            ) : (
              <ViewArrow accentColor={project.accentColor} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (isLink) {
    return (
      <a
        href={project.url}
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        className={`block ${fullWidth ? 'md:col-span-2' : ''}`}
      >
        {CardInner}
      </a>
    );
  }
  return CardInner;
}

/* ─── "View →" link that slides up from below on hover ─── */
function ViewArrow({ accentColor }: { accentColor: string }) {
  return (
    <div className="relative h-6 w-28 overflow-hidden">
      <span
        className="absolute inset-0 flex items-center justify-end font-mono text-xs tracking-widest uppercase text-white/65 transition-transform duration-300 ease-out group-hover:-translate-y-full"
      >
        View →
      </span>
      <span
        className="absolute inset-0 flex items-center justify-end font-mono text-xs tracking-widest uppercase translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"
        style={{ color: accentColor }}
      >
        View →
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STATUS BADGE — strict B/W palette
═══════════════════════════════════════════════════════════ */
function StatusBadge({ status }: { status: Project['status'] }) {
  if (status === 'live') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
        <span className="relative w-1.5 h-1.5 rounded-full bg-white">
          <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-70" />
        </span>
        Live
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/75">
        <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
        Building
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] uppercase text-white/55">
      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
      Concept
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   START CTA — "READY TO BUILD?" with MagneticCTA
═══════════════════════════════════════════════════════════ */
function StartCTA() {
  const reduceMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative bg-[#060606] py-10 sm:py-12 px-4 sm:px-6 overflow-hidden"
    >
      {/* Cool white atmospheric glow — no orange */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,255,255,0.10), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <NoiseGrain reduceMotion={reduceMotion} />

      <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center gap-5 sm:gap-7">
        <motion.p
          className="font-mono text-xs tracking-[0.45em] text-white/40 uppercase"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={
            reduceMotion
              ? undefined
              : inView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 20 }
          }
          transition={reduceMotion ? undefined : { duration: 0.6 }}
        >
          Your project, next
        </motion.p>
        <motion.h2
          className="text-white leading-[0.95] select-none"
          style={{
            fontSize: 'clamp(2.4rem, 10vw, 9rem)',
            fontFamily:
              'var(--font-anton), var(--font-geist-sans), system-ui, sans-serif',
            fontWeight: 400,
            letterSpacing: '-0.035em',
          }}
          initial={reduceMotion ? false : { opacity: 0, y: 40 }}
          animate={
            reduceMotion
              ? undefined
              : inView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 40 }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }
          }
        >
          READY TO BUILD?
        </motion.h2>
        <motion.p
          className="text-base md:text-lg text-white/60 max-w-xl"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={
            reduceMotion
              ? undefined
              : inView
                ? { opacity: 1 }
                : { opacity: 0 }
          }
          transition={
            reduceMotion ? undefined : { duration: 0.8, delay: 0.3 }
          }
        >
          Drop rates start at $800. Deposit secures your spot.
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={
            reduceMotion
              ? undefined
              : inView
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 30 }
          }
          transition={
            reduceMotion ? undefined : { duration: 0.7, delay: 0.45 }
          }
        >
          <MagneticCTA
            label="Start a project"
            href="/#contact"
            reduceMotion={reduceMotion}
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BACK TO TOP
═══════════════════════════════════════════════════════════ */
function BackToTop() {
  return (
    <div className="text-center py-6 sm:py-8 border-t border-white/5">
      <Link
        href="#"
        className="font-mono text-[10px] sm:text-xs tracking-widest uppercase text-white/30 hover:text-white/75 transition-colors"
      >
        ↑ lunsfordsoftware.com
      </Link>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NOISE GRAIN
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
