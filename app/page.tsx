'use client';

import { useRef, useState, useEffect, useLayoutEffect } from 'react';
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
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
      className="relative flex items-center justify-center overflow-hidden py-10 md:py-12 min-h-[420px]"
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          className="font-mono text-xs tracking-[0.45em] text-gray-500 mb-6 uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          The Pitch  ·  02
        </motion.p>
        <motion.h2
          className="font-extrabold leading-[0.96] tracking-tight"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '-0.035em' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          Most freelancers<br />ship templates.<br />
          <span className="text-gray-400">I ship custom builds.</span>
        </motion.h2>
        <motion.p
          className="mt-7 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed"
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

function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const stepsRef   = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heading first
      gsap.from(eyebrowRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      });
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
        },
      });

      // Border line draws downward
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stepsRef.current,
            start: 'top 85%',
          },
        },
      );

      // Steps stagger in
      const stepNodes = stepsRef.current?.querySelectorAll<HTMLElement>('.process-step') ?? [];
      gsap.from(stepNodes, {
        opacity: 0,
        y: 50,
        duration: 0.75,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: stepsRef.current,
          start: 'top 85%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative bg-[#fafafa] py-10 md:py-12 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p
            ref={eyebrowRef}
            className="font-mono text-xs tracking-[0.45em] text-gray-500 mb-3 uppercase"
          >
            Process  ·  05
          </p>
          <h2
            ref={headingRef}
            className="font-extrabold tracking-tight"
            style={{
              fontSize: 'clamp(2.5rem, 7vw, 6rem)',
              letterSpacing: '-0.035em',
              lineHeight: 0.96,
            }}
          >
            From idea<br />to launch.
          </h2>
        </div>

        <div ref={stepsRef} className="relative pl-8 md:pl-10">
          {/* Drawing border line */}
          <div
            ref={lineRef}
            className="absolute left-0 top-0 w-[2px] h-full bg-black/10 origin-top"
            aria-hidden="true"
          />

          <div className="space-y-5 md:space-y-6">
            {STEPS.map((step) => (
              <div key={step.num} className="process-step relative pl-2 md:pl-4">
                {/* Active dot */}
                <span
                  className="absolute -left-[42px] top-3 w-3 h-3 rounded-full bg-black"
                  aria-hidden="true"
                />
                <div className="flex items-start gap-6">
                  <span className="font-mono text-sm text-gray-400 pt-1 min-w-[3rem]">
                    {step.num}
                  </span>
                  <div className="flex-1">
                    <h3
                      className="text-2xl md:text-4xl font-extrabold mb-2"
                      style={{ letterSpacing: '-0.025em' }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-base md:text-lg max-w-2xl leading-relaxed">
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
    const ctx = gsap.context(() => {
      gsap.from(eyebrowRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.1,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
      });
      const blocks = blocksRef.current?.querySelectorAll<HTMLElement>('p') ?? [];
      gsap.from(blocks, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: blocksRef.current, start: 'top 85%' },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative bg-white text-black py-10 md:py-12 px-6 border-t border-black/[0.07]"
    >
      <div className="max-w-4xl mx-auto">
        <p
          ref={eyebrowRef}
          className="font-mono text-xs tracking-[0.45em] text-gray-500 mb-5 uppercase"
        >
          About  ·  06
        </p>
        <h2
          ref={headingRef}
          className="font-extrabold tracking-tight mb-6 leading-[0.96] text-black"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 6rem)', letterSpacing: '-0.035em' }}
        >
          I&apos;m Yates. 16.<br />Self-taught.{' '}
          <span className="text-black">Based in Newnan, GA.</span>
        </h2>
        <div
          ref={blocksRef}
          className="space-y-5 text-lg md:text-xl text-gray-700 leading-relaxed"
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
    window.open(`mailto:ylunsford1@gmail.com?subject=${subject}&body=${body}`);
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="py-10 md:py-12 px-6 border-t border-black/[0.07]"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs tracking-[0.45em] text-gray-500 mb-3 uppercase">
            Contact  ·  07
          </p>
          <h2
            className="font-extrabold tracking-tight leading-[0.96]"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 7.5rem)', letterSpacing: '-0.035em' }}
          >
            Let&apos;s build<br />something good.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
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
                <input
                  type="text" required placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <input
                  type="email" required placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
                />
                <textarea
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
            className="bg-black text-white rounded-2xl p-6 md:p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-extrabold mb-4" style={{ letterSpacing: '-0.02em' }}>
              Or book a free call
            </h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              15 minutes. We talk about what you&apos;re trying to build, I tell you if I&apos;m the
              right fit, and we go from there. No pressure, no pitch deck.
            </p>
            <a
              href="https://cal.com/lunsfordsoftware/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-white text-black rounded-full text-sm font-semibold transition-all duration-300 hover:bg-gray-200 hover:scale-[1.04] hover:shadow-2xl mb-8"
            >
              Book a 15-min call →
            </a>
            <div className="pt-6 border-t border-white/10 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Email</span>
                <a href="mailto:ylunsford1@gmail.com" className="text-white hover:text-gray-300 transition-colors">
                  ylunsford1@gmail.com
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
   FOOTER  — oversized wordmark marquee
═══════════════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="border-t border-black/10 overflow-hidden bg-[#fafafa]">
      <div className="py-4 border-b border-black/[0.04] overflow-hidden">
        <Marquee
          items={['LUNSFORD', '·', 'LUNSFORD', '·', 'LUNSFORD', '·', 'LUNSFORD', '·']}
          speed={22}
          itemClassName="font-extrabold tracking-tight px-6 leading-none text-black/[0.06]"
          itemStyle={{ fontSize: 'clamp(3.5rem, 9vw, 8rem)' }}
        />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="font-mono">© {new Date().getFullYear()} Lunsford Software Development</div>
        <div className="font-mono text-xs tracking-widest uppercase">Built in Newnan, GA</div>
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
    window.open(`mailto:ylunsford1@gmail.com?subject=${subject}&body=${body}`);
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
            <input
              type="text" required placeholder="Your name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
            <input
              type="email" required placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors"
            />
            <textarea
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
