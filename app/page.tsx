'use client';

import { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence, MotionValue } from 'framer-motion';
import Marquee from '@/components/Marquee';
import PricingSection from '@/components/PricingSection';
import FeaturedWork from '@/components/FeaturedWork';

/* ─── Lazy-load the heavy WebGL hero so it doesn't block initial render ─── */
const CardHero = dynamic(() => import('@/components/CardHero'), {
  ssr: false,
  loading: () => (
    <div
      className="relative"
      style={{ height: '250vh', background: 'linear-gradient(to bottom, #080808 0%, #080808 55%, #2a2a2a 75%, #b8b8b8 90%, #fafafa 100%)' }}
    />
  ),
});

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
      <CardHero />
      <Pitch />

      {/* ── Tech stack ribbon between Pitch and Services ── */}
      <TechRibbon />

      <PricingSection onTierSelect={(t) => setModalTier(t)} />
      <FeaturedWork />

      {/* ── Build-facts ribbon between Work and Process ── */}
      <FactsRibbon />

      <Process />

      {/* ── Gradient bridge: light → dark ── */}
      <div
        className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #fafafa, #000000)' }}
        aria-hidden="true"
      />

      <About />

      {/* ── Gradient bridge: dark → light ── */}
      <div
        className="h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #000000, #fafafa)' }}
        aria-hidden="true"
      />

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
   NAV
═══════════════════════════════════════════════════════════ */
function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#fafafa]/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-mono text-sm tracking-tight font-semibold">
          LUNSFORD<span className="text-gray-400">/SOFTWARE</span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#services" className="hover:text-black transition-colors">Services</a>
          <a href="#work"     className="hover:text-black transition-colors">Work</a>
          <a href="#process"  className="hover:text-black transition-colors">Process</a>
          <a href="#about"    className="hover:text-black transition-colors">About</a>
        </div>
        <a
          href="#contact"
          className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-semibold"
        >
          Start a project
        </a>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   PITCH
═══════════════════════════════════════════════════════════ */
function Pitch() {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const yFast = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [200, -200]);
  const ySlow = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [100, -100]);
  const yMid  = useTransform(scrollYProgress, [0, 1], shouldReduce ? [0, 0] : [150, -150]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
      {/* Floating mock-UI cards */}
      <motion.div
        className="absolute top-20 left-[10%] w-40 h-28 md:w-56 md:h-36 bg-white rounded-xl shadow-lg border border-black/5 rotate-[-8deg]"
        style={{ y: yFast }}
      >
        <div className="p-3">
          <div className="w-8 h-2 bg-gray-200 rounded mb-2" />
          <div className="w-full h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-3/4 h-1.5 bg-gray-100 rounded mb-3" />
          <div className="w-16 h-5 bg-black rounded" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-40 right-[8%] w-48 h-32 md:w-64 md:h-44 bg-white rounded-xl shadow-xl border border-black/5 rotate-[6deg]"
        style={{ y: ySlow }}
      >
        <div className="p-3">
          <div className="flex gap-1 mb-3">
            <div className="w-2 h-2 bg-red-300 rounded-full" />
            <div className="w-2 h-2 bg-yellow-300 rounded-full" />
            <div className="w-2 h-2 bg-green-300 rounded-full" />
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-2/3 h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-3/4 h-1.5 bg-gray-100 rounded" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-[20%] w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl shadow-md rotate-[12deg]"
        style={{ y: yMid }}
      />

      <motion.div
        className="absolute bottom-32 right-[15%] w-36 h-24 md:w-52 md:h-32 bg-black rounded-xl shadow-xl rotate-[-5deg]"
        style={{ y: yFast }}
      >
        <div className="p-3">
          <div className="w-12 h-1.5 bg-gray-700 rounded mb-2" />
          <div className="w-full h-1 bg-gray-800 rounded mb-1" />
          <div className="w-2/3 h-1 bg-gray-800 rounded" />
        </div>
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-6 uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          The pitch
        </motion.p>
        <motion.h2
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Most freelancers ship templates.<br />
          <span className="text-gray-400">I ship custom builds.</span>
        </motion.h2>
        <motion.p
          className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Every site is built from scratch. No themes, no page builders, no template farms.
          Just clean code, fast loads, and designs your customers actually remember.
        </motion.p>
      </div>
    </section>
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
        itemClassName="font-mono text-[11px] tracking-[0.2em] text-gray-400 px-2"
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
          itemClassName="font-mono text-[11px] tracking-[0.2em] text-gray-400 px-2"
        />
      </div>
      <div className="py-2.5">
        <Marquee
          items={FACTS_BOT}
          speed={34}
          reverse
          itemClassName="font-mono text-[11px] tracking-[0.2em] text-gray-400 px-2"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PROCESS
═══════════════════════════════════════════════════════════ */
const STEPS = [
  { num: '01', title: 'Discovery', desc: 'Quick call. What you need, what you don\'t, what makes your business different.' },
  { num: '02', title: 'Design',    desc: 'Custom mockups in Figma. You see the whole thing before a line of code is written.' },
  { num: '03', title: 'Build',     desc: 'I code it. Fast, clean, mobile-first. You get updates as it comes together.' },
  { num: '04', title: 'Launch',    desc: 'Live on the web with everything set up — hosting, domain, analytics, the works.' },
] as const;

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section id="process" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-7">
            <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Process</p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">From idea to launch.</h2>
          </div>
          <div className="space-y-5">
            {STEPS.map((step, i) => (
              <ProcessStep
                key={i}
                step={step}
                index={i}
                total={STEPS.length}
                progress={scrollYProgress}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({
  step,
  index,
  total,
  progress,
}: {
  step: { num: string; title: string; desc: string };
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const shouldReduce = useReducedMotion();
  const start = index / total;
  const end   = (index + 1) / total;

  const scale   = useTransform(
    progress,
    [Math.max(0, start - 0.05), start, end, Math.min(1, end + 0.05)],
    shouldReduce ? [1, 1, 1, 1] : [0.95, 1.05, 1.05, 0.95],
  );
  const opacity = useTransform(
    progress,
    [Math.max(0, start - 0.1), start, end, Math.min(1, end + 0.1)],
    [0.3, 1, 1, 0.3],
  );
  const x = useTransform(progress, [start, end], shouldReduce ? [0, 0] : [0, 20]);

  return (
    <motion.div
      className="flex items-start gap-8 border-l-2 border-black/10 pl-8 py-2"
      style={{ scale, opacity, x, originX: 0 }}
    >
      <div className="font-mono text-sm text-gray-400 pt-2 min-w-[3rem]">{step.num}</div>
      <div className="flex-1">
        <h3 className="text-2xl md:text-4xl font-extrabold mb-2">{step.title}</h3>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl">{step.desc}</p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ABOUT
═══════════════════════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="py-20 px-6 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <motion.p
          className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-6 uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          About
        </motion.p>
        <motion.h2
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-7 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          I&apos;m Yates. 16. Self-taught.{' '}
          <span className="text-gray-500">Based in Newnan, GA.</span>
        </motion.h2>
        <motion.div
          className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.2 }}
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
          <p className="text-white">
            That&apos;s the whole pitch. Quality work, fair price, and someone who actually picks up.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════
   CONTACT
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
    <section id="contact" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Contact</p>
          <h2 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight">
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
            <h3 className="text-2xl font-extrabold mb-6">Send a message</h3>
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
                  className="w-full py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
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
            <h3 className="text-2xl font-extrabold mb-4">Or book a free call</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              15 minutes. We talk about what you&apos;re trying to build, I tell you if I&apos;m the
              right fit, and we go from there. No pressure, no pitch deck.
            </p>
            <a
              href="https://cal.com/lunsfordsoftware/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-3.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors mb-8"
            >
              Book a 15-min call →
            </a>
            <div className="pt-6 border-t border-white/10 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Email</span>
                <a href="mailto:ylunsford1@gmail.com" className="text-white hover:text-orange-400 transition-colors">
                  ylunsford1@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Phone</span>
                <a href="tel:4702152012" className="text-white hover:text-orange-400 transition-colors">
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
      {/* Ghost wordmark strip */}
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
        <h3 className="text-2xl font-extrabold mb-6">Let&apos;s talk about your project.</h3>

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
              className="w-full py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
            >
              Send inquiry →
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
