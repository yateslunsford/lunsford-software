'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { LogoMark } from '@/components/Logo';
import Marquee from '@/components/Marquee';
import PricingSection from '@/components/PricingSection';
import FeaturedWork from '@/components/FeaturedWork';
import Hero from '@/components/Hero';
import LookCloser from '@/components/LookCloser';
import StatsBand from '@/components/StatsBand';
import Nav from '@/components/Nav';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─── Marquee content ─── */
const TECH_ITEMS = [
  'NEXT.JS', '·', 'TYPESCRIPT', '·', 'TAILWIND', '·', 'THREE.JS', '·',
  'FRAMER MOTION', '·', 'SANITY CMS', '·', 'STRIPE', '·', 'TWILIO', '·',
  'VERCEL', '·', 'REACT', '·', '@REACT-THREE/FIBER', '·',
];
const FACTS_TOP = [
  'BUILT FROM SCRATCH', '·', '60 FPS', '·', 'ZERO TEMPLATES', '·',
  'CUSTOM CODED', '·', 'SHIPS IN WEEKS', '·', 'MOBILE FIRST', '·',
];
const FACTS_BOT = [
  'NEXT.JS 16', '·', 'HAND-WRITTEN CODE', '·', 'REAL CMS', '·',
  'STRIPE READY', '·', 'SMS NOTIFY', '·', 'VERCEL DEPLOY', '·',
];

/* ═══════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [modalTier, setModalTier] = useState<{ tier: string; price: string } | null>(null);

  return (
    <main className="bg-[#fafafa] text-[#0a0a0a]">
      <Nav />
      <Hero />

      <LookCloser />
      <StatsBand />

      <Pitch />
      <TechRibbon />

      <PricingSection onTierSelect={(t) => setModalTier(t)} />
      <FeaturedWork />

      <FactsRibbon />

      <Process />

      <About />

      <Contact />
      <Footer />

      <AnimatePresence>
        {modalTier && (
          <PricingModal
            tier={modalTier.tier}
            price={modalTier.price}
            onClose={() => setModalTier(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   PITCH  — tightened padding, no min-h-screen dead space
═══════════════════════════════════════════════════════════ */
function Pitch() {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={ref}
      className="relative flex items-center justify-center overflow-hidden py-12 sm:py-10 md:py-12 min-h-[380px] sm:min-h-[420px]"
    >
      {/* Floating mock-UI cards — strict B/W palette, no parallax (Lenis already
          gives the section a sense of motion) */}
      <FloatingCard
        className="hidden md:block absolute top-8 left-[6%] w-48 h-32 bg-white rounded-xl shadow-lg border border-black/5 rotate-[-8deg]"
        delay={0.1}
        shouldReduce={shouldReduce}
      >
        <div className="p-3">
          <div className="w-8 h-2 bg-gray-200 rounded mb-2" />
          <div className="w-full h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-3/4 h-1.5 bg-gray-100 rounded mb-3" />
          <div className="w-16 h-5 bg-black rounded" />
        </div>
      </FloatingCard>

      <FloatingCard
        className="hidden md:block absolute top-14 right-[5%] w-56 h-36 bg-white rounded-xl shadow-xl border border-black/5 rotate-[6deg]"
        delay={0.2}
        shouldReduce={shouldReduce}
      >
        <div className="p-3">
          <div className="flex gap-1 mb-3">
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
            <div className="w-2 h-2 bg-gray-300 rounded-full" />
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-2/3 h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-3/4 h-1.5 bg-gray-100 rounded" />
        </div>
      </FloatingCard>

      <FloatingCard
        className="hidden md:block absolute bottom-6 left-[14%] w-36 h-36 rounded-2xl shadow-md rotate-[12deg]"
        delay={0.3}
        shouldReduce={shouldReduce}
        style={{ background: 'linear-gradient(135deg, #f4f4f5 0%, #d4d4d8 100%)' }}
      />

      <FloatingCard
        className="hidden md:block absolute bottom-10 right-[10%] w-44 h-28 bg-black rounded-xl shadow-xl rotate-[-5deg]"
        delay={0.4}
        shouldReduce={shouldReduce}
      >
        <div className="p-3">
          <div className="w-12 h-1.5 bg-gray-700 rounded mb-2" />
          <div className="w-full h-1 bg-gray-800 rounded mb-1" />
          <div className="w-2/3 h-1 bg-gray-800 rounded" />
        </div>
      </FloatingCard>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.p
          className="font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.45em] text-gray-500 mb-5 sm:mb-6 uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          The Pitch  ·  02
        </motion.p>
        <motion.h2
          className="font-extrabold leading-[0.96] tracking-tight"
          style={{ fontSize: 'clamp(1.95rem, 7vw, 6rem)', letterSpacing: '-0.035em' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Most freelancers<br />ship templates.<br />
          <span className="text-gray-400">I ship custom builds.</span>
        </motion.h2>
        <motion.p
          className="mt-6 sm:mt-7 text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Every site is built from scratch. No themes, no page builders, no template farms.
          Just clean code, fast loads, and designs your customers actually remember.
        </motion.p>
      </div>
    </section>
  );
}

/* ─── Floating mock-UI card — gentle drift, no scroll parallax. ─── */
function FloatingCard({
  className,
  children,
  delay,
  shouldReduce,
  style,
}: {
  className: string;
  children?: React.ReactNode;
  delay: number;
  shouldReduce: boolean | null;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={shouldReduce ? false : { opacity: 0, y: 30 }}
      whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={
        shouldReduce
          ? undefined
          : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TECH RIBBON  (Pitch → Services bridge)
═══════════════════════════════════════════════════════════ */
function TechRibbon() {
  return (
    <div className="border-y border-black/[0.07] py-3 overflow-hidden bg-[#fafafa]">
      <Marquee
        items={TECH_ITEMS}
        speed={40}
        itemClassName="font-mono text-[11px] tracking-[0.22em] text-gray-400 px-2"
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   FACTS RIBBON  (Work → Process bridge)
═══════════════════════════════════════════════════════════ */
function FactsRibbon() {
  return (
    <div className="border-y border-black/[0.07] overflow-hidden bg-[#fafafa]">
      <div className="py-2.5 border-b border-black/[0.04]">
        <Marquee
          items={FACTS_TOP}
          speed={28}
          itemClassName="font-mono text-[11px] tracking-[0.22em] text-gray-400 px-2"
        />
      </div>
      <div className="py-2.5">
        <Marquee
          items={FACTS_BOT}
          speed={34}
          reverse
          itemClassName="font-mono text-[11px] tracking-[0.22em] text-gray-400 px-2"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROCESS — GSAP-driven, staggered reveal + drawing border
═══════════════════════════════════════════════════════════ */
const STEPS = [
  { num: '01', title: 'Discovery', desc: "Quick call. What you need, what you don't, what makes your business different." },
  { num: '02', title: 'Design',    desc: 'Custom mockups in Figma. You see the whole thing before a line of code is written.' },
  { num: '03', title: 'Build',     desc: 'I code it. Fast, clean, mobile-first. You get updates as it comes together.' },
  { num: '04', title: 'Launch',    desc: 'Live on the web with everything set up — hosting, domain, analytics, the works.' },
] as const;

/* Monoline SVG icons for each step — 18×18 viewBox */
function StepIcon({ num }: { num: string }) {
  const common = {
    width: 18, height: 18,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'text-gray-400 flex-shrink-0',
  };
  if (num === '01') return (
    <svg {...common} aria-hidden="true">
      <circle cx="8" cy="8" r="5.5"/>
      <line x1="12.2" y1="12.2" x2="16" y2="16"/>
    </svg>
  );
  if (num === '02') return (
    <svg {...common} aria-hidden="true">
      <path d="M13 2l3 3L6 15H3v-3L13 2z"/>
      <line x1="11" y1="4" x2="14" y2="7"/>
    </svg>
  );
  if (num === '03') return (
    <svg {...common} aria-hidden="true">
      <polyline points="6 4 2 9 6 14"/>
      <polyline points="12 4 16 9 12 14"/>
    </svg>
  );
  return (
    <svg {...common} aria-hidden="true">
      <path d="M9 1C6 5 5 8 5 11h8c0-3-1-6-4-10z"/>
      <line x1="9" y1="11" x2="9" y2="14"/>
      <line x1="6.5" y1="14" x2="11.5" y2="14"/>
    </svg>
  );
}

function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add({
      isMobile:  '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
    }, (ctx) => {
      const { isMobile } = ctx.conditions as Record<string, boolean>;
      const yHead  = isMobile ? 16 : 40;
      const durH   = isMobile ? 0.4 : 0.8;

      gsap.from(eyebrowRef.current, {
        opacity: 0, y: 12, duration: isMobile ? 0.3 : 0.55,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
      gsap.from(headingRef.current, {
        opacity: 0, y: yHead, duration: durH, delay: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });

      gsap.fromTo(lineRef.current, { scaleY: 0 }, {
        scaleY: 1, duration: isMobile ? 0.7 : 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: stepsRef.current, start: 'top 85%' },
      });

      const stepNodes = stepsRef.current?.querySelectorAll<HTMLElement>('.process-step') ?? [];
      gsap.from(stepNodes, {
        opacity: 0,
        y:        isMobile ? 22 : 50,
        duration: isMobile ? 0.4 : 0.75,
        ease: 'power3.out',
        stagger:  isMobile ? 0.1 : 0.15,
        scrollTrigger: { trigger: stepsRef.current, start: 'top 85%' },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative bg-[#fafafa] py-10 md:py-12 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p
            ref={eyebrowRef}
            className="font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.45em] text-gray-500 mb-3 uppercase"
          >
            Process  ·  05
          </p>
          <h2
            ref={headingRef}
            className="font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(1.95rem, 7vw, 6rem)',
              letterSpacing: '-0.035em',
              lineHeight: 0.96,
            }}
          >
            From idea<br />to launch.
          </h2>
        </div>

        <div ref={stepsRef} className="relative pl-6 sm:pl-8 md:pl-10">
          {/* Drawing border line */}
          <div
            ref={lineRef}
            className="absolute left-0 top-0 w-[2px] h-full bg-black/10 origin-top"
            aria-hidden="true"
          />

          <div className="space-y-5 md:space-y-6">
            {STEPS.map((step) => (
              <div key={step.num} className="process-step relative pl-1 sm:pl-2 md:pl-4">
                {/* Active dot */}
                <span
                  className="absolute -left-[31px] sm:-left-[42px] top-3 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-black"
                  aria-hidden="true"
                />
                <div className="flex items-start gap-3 sm:gap-5">
                  <div className="flex flex-col items-center gap-1.5 pt-0.5 flex-shrink-0 w-8 sm:w-10">
                    <StepIcon num={step.num} />
                    <span className="font-mono text-[9px] sm:text-[10px] text-gray-400">{step.num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-xl sm:text-2xl md:text-4xl font-extrabold mb-1.5 sm:mb-2"
                      style={{ letterSpacing: '-0.025em' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   ABOUT — pure white background, black text, GSAP reveal
═══════════════════════════════════════════════════════════ */
function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const blocksRef  = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    mm.add({
      isMobile:  '(max-width: 767px)',
      isDesktop: '(min-width: 768px)',
    }, (ctx) => {
      const { isMobile } = ctx.conditions as Record<string, boolean>;
      gsap.from(eyebrowRef.current, {
        opacity: 0, y: 12, duration: isMobile ? 0.3 : 0.55,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
      gsap.from(headingRef.current, {
        opacity: 0, y: isMobile ? 18 : 40, duration: isMobile ? 0.4 : 0.8, delay: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
      const blocks = blocksRef.current?.querySelectorAll<HTMLElement>('p') ?? [];
      gsap.from(blocks, {
        opacity: 0,
        y:        isMobile ? 14 : 28,
        duration: isMobile ? 0.35 : 0.7,
        ease: 'power3.out',
        stagger:  isMobile ? 0.08 : 0.12,
        scrollTrigger: { trigger: blocksRef.current, start: 'top 85%' },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-white text-black py-10 md:py-12 px-4 sm:px-6 border-t border-black/[0.07]"
    >
      <div className="max-w-4xl mx-auto">
        <p
          ref={eyebrowRef}
          className="font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.45em] text-gray-500 mb-4 sm:mb-5 uppercase"
        >
          About  ·  06
        </p>
        <h2
          ref={headingRef}
          className="font-extrabold tracking-tight mb-5 sm:mb-6 leading-[0.96] text-black"
          style={{ fontSize: 'clamp(1.95rem, 7vw, 6rem)', letterSpacing: '-0.035em' }}
        >
          I&apos;m Yates. 16.<br />Self-taught.{' '}
          <span className="text-black">Based in Newnan, GA.</span>
        </h2>
        <div
          ref={blocksRef}
          className="space-y-4 sm:space-y-5 text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed"
        >
          <p>
            I started building websites because the agencies in town were charging local businesses
            $5,000 for template sites that loaded slow and looked like every other site in town.
          </p>
          <p>
            I do it different. Every site is custom. Every line of code is hand-written. And I answer
            the phone when you call — because I&apos;m not running an agency, I&apos;m running a
            one-person operation that takes pride in shipping work I&apos;d put my name on.
          </p>
          <p className="text-black font-medium">
            That&apos;s the whole pitch. Quality work, fair price, and someone who actually picks up.
          </p>
        </div>

        {/* Skills grid */}
        <div className="mt-10 sm:mt-12">
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-gray-400 mb-5">
            Stack
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
            {[
              'Next.js', 'TypeScript', 'React', 'Tailwind',
              'GSAP', 'Three.js', 'Sanity CMS', 'Stripe',
              'Twilio', 'Vercel', 'Git', 'Figma',
            ].map((skill) => (
              <motion.div
                key={skill}
                className="px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg border border-black/[0.08] text-center"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4 }}
              >
                <span className="font-mono text-[9px] sm:text-[10px] text-gray-600 tracking-wide">
                  {skill}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-10 sm:mt-12">
          <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.35em] uppercase text-gray-400 mb-5">
            Timeline
          </p>
          <div className="relative pl-5 sm:pl-6 space-y-4 sm:space-y-5">
            <div
              className="absolute left-0 top-0 w-px h-full"
              style={{ background: 'linear-gradient(to bottom, #0a0a0a 0%, rgba(0,0,0,0.08) 100%)' }}
              aria-hidden="true"
            />
            {[
              { date: '2026',      label: 'Started self-teaching web development' },
              { date: 'May 2026',  label: 'First paid project — Ruined Visions streetwear drop ($300)' },
              { date: 'May 2026',  label: 'Launched Lunsford Software portfolio' },
              { date: 'Coming',    label: 'LLC filing' },
              { date: 'Coming',    label: 'Scale to more clients' },
            ].map(({ date, label }, i) => (
              <motion.div
                key={i}
                className="relative flex items-start gap-3 sm:gap-4"
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <span
                  className="absolute -left-5 sm:-left-6 top-[7px] w-1.5 h-1.5 rounded-full bg-black"
                  aria-hidden="true"
                />
                <span className="font-mono text-[9px] sm:text-[10px] text-gray-400 tracking-wide min-w-[60px] sm:min-w-[72px] pt-0.5">
                  {date}
                </span>
                <span className="text-sm sm:text-base text-gray-700">{label}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT — tighter padding, divider above
═══════════════════════════════════════════════════════════ */
function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent('New project inquiry — Lunsford Software');
    const body    = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
    );
    window.open(`mailto:lunsfordsoftware@gmail.com?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="py-10 md:py-12 px-4 sm:px-6 border-t border-black/[0.07]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-8 sm:mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.45em] text-gray-500 mb-3 uppercase">
            Contact  ·  07
          </p>
          <h2
            className="font-extrabold tracking-tight leading-[0.96]"
            style={{ fontSize: 'clamp(2.1rem, 8vw, 7.5rem)', letterSpacing: '-0.035em' }}
          >
            Let&apos;s build<br />something good.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-start">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-2xl font-extrabold mb-6" style={{ letterSpacing: '-0.02em' }}>
              Send a message
            </h3>
            {submitted ? (
              <div className="p-6 bg-black text-white rounded-2xl">
                <p className="font-semibold mb-2">Got it. I&apos;ll respond within 24 hours.</p>
                <p className="text-sm text-gray-400">In a rush? Text me at 470-215-2012.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <label htmlFor="contact-name" className="sr-only">Your name</label>
                <input
                  id="contact-name"
                  type="text" required placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <label htmlFor="contact-email" className="sr-only">Email address</label>
                <input
                  id="contact-email"
                  type="email" required placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <label htmlFor="contact-message" className="sr-only">What are you trying to build?</label>
                <textarea
                  id="contact-message"
                  required rows={5} placeholder="What are you trying to build?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-3.5 bg-black text-white rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800 hover:scale-[1.01] hover:shadow-lg"
                >
                  Send →
                </button>
              </form>
            )}
          </motion.div>

          {/* Booking card */}
          <motion.div
            className="bg-black text-white rounded-2xl p-5 sm:p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl sm:text-2xl font-extrabold mb-3 sm:mb-4" style={{ letterSpacing: '-0.02em' }}>
              Or book a free call
            </h3>
            <p className="text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
              15 minutes. We talk about what you&apos;re trying to build, I tell you if I&apos;m the
              right fit, and we go from there. No pressure, no pitch deck.
            </p>
            <a
              href="https://cal.com/lunsfordsoftware/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 sm:px-8 py-3 sm:py-3.5 bg-white text-black rounded-full text-sm font-semibold transition-all duration-300 hover:bg-gray-200 hover:scale-[1.04] hover:shadow-2xl mb-6 sm:mb-8"
            >
              Book a 15-min call →
            </a>
            <div className="pt-6 border-t border-white/10 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Email</span>
                <a href="mailto:lunsfordsoftware@gmail.com" className="text-white hover:text-gray-300 transition-colors">
                  lunsfordsoftware@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Phone</span>
                <a href="tel:4702152012" className="text-white hover:text-gray-300 transition-colors">
                  470-215-2012
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Based</span>
                <span className="text-white">Newnan, GA</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   FOOTER  — 4-column layout with oversized wordmark marquee
═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-black/[0.08] overflow-hidden bg-[#fafafa]">
      {/* Big watermark marquee */}
      <div className="py-4 border-b border-black/[0.04] overflow-hidden" aria-hidden="true">
        <Marquee
          items={['LUNSFORD', '·', 'LUNSFORD', '·', 'LUNSFORD', '·', 'LUNSFORD', '·']}
          speed={22}
          itemClassName="font-extrabold tracking-tight px-4 sm:px-6 leading-none text-black/[0.05]"
          itemStyle={{ fontSize: 'clamp(2.5rem, 9vw, 8rem)' }}
        />
      </div>

      {/* 4-column body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">

          {/* Col 1 — Logo + tagline */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="inline-flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-[#0a0a0a] mb-3">
              <LogoMark size={16} />
              LUNSFORD<span className="text-gray-400">/SOFTWARE</span>
            </a>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-[200px]">
              Custom code. Built from scratch. Ships everywhere.
              Based in Newnan, GA.
            </p>
          </div>

          {/* Col 2 — Navigation */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-gray-400 mb-4">Navigate</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Services', href: '#services' },
                { label: 'Work',     href: '#work' },
                { label: 'Process',  href: '#process' },
                { label: 'About',    href: '#about' },
                { label: 'Contact',  href: '#contact' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-xs sm:text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Contact */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-gray-400 mb-4">Contact</p>
            <ul className="space-y-2.5">
              <li>
                <a href="mailto:lunsfordsoftware@gmail.com" className="text-xs sm:text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors break-all">
                  lunsfordsoftware@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:4702152012" className="text-xs sm:text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors">
                  470-215-2012
                </a>
              </li>
              <li>
                <span className="text-xs sm:text-sm text-gray-500">Newnan, GA</span>
              </li>
              <li className="pt-1">
                <a
                  href="https://cal.com/lunsfordsoftware/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-gray-600 hover:text-[#0a0a0a] transition-colors"
                >
                  Book a free call →
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4 — Stack */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.32em] uppercase text-gray-400 mb-4">Built With</p>
            <ul className="space-y-2.5">
              {['Next.js 16', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Three.js / R3F', 'Vercel'].map((tech) => (
                <li key={tech} className="text-xs sm:text-sm text-gray-500">{tech}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-black/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-gray-400">
            © {new Date().getFullYear()} Lunsford Software Development. All rights reserved.
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-gray-400">
            Built in Newnan, GA
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICING MODAL
═══════════════════════════════════════════════════════════ */
function PricingModal({
  tier,
  price,
  onClose,
}: {
  tier: string;
  price: string;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: `Hi Yates — I'm interested in the ${tier} package (${price}). Here's what I need:\n\n`,
  });
  const [submitted, setSubmitted] = useState(false);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`${tier} package inquiry — Lunsford Software`);
    const body    = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`,
    );
    window.open(`mailto:lunsfordsoftware@gmail.com?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative"
        initial={{ y: 48, opacity: 0, scale: 0.96 }}
        animate={{ y: 0,  opacity: 1, scale: 1    }}
        exit={{    y: 48, opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors text-gray-500 text-sm"
        >
          ✕
        </button>

        <p className="font-mono text-xs tracking-widest uppercase text-gray-400 mb-2">
          {tier} · {price}
        </p>
        <h3 className="text-2xl font-extrabold mb-6" style={{ letterSpacing: '-0.02em' }}>
          Let&apos;s talk about your project.
        </h3>

        {submitted ? (
          <div className="p-6 bg-black text-white rounded-xl text-center">
            <p className="font-semibold mb-1">Email client opened. I&apos;ll reply within 24 hours.</p>
            <p className="text-sm text-gray-400">Prefer to call? 470-215-2012.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label htmlFor="modal-name" className="sr-only">Your name</label>
            <input
              id="modal-name"
              type="text" required placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
            <label htmlFor="modal-email" className="sr-only">Email address</label>
            <input
              id="modal-email"
              type="email" required placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
            <label htmlFor="modal-message" className="sr-only">Project details</label>
            <textarea
              id="modal-message"
              required rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors resize-none text-sm"
            />
            <button
              type="submit"
              className="w-full py-3.5 bg-black text-white rounded-xl font-semibold transition-all duration-300 hover:bg-gray-800 hover:scale-[1.01]"
            >
              Send inquiry →
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
