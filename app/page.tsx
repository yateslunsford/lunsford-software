'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

export default function Home() {
  return (
    <main className="bg-[#fafafa] text-[#0a0a0a]">
      <Nav />
      <Hero />
      <Pitch />
      <Services />
      <FeaturedWork />
      <Process />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}

/* ============ NAV ============ */
function Nav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-[#fafafa]/70 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="#" className="font-mono text-sm tracking-tight font-medium">LUNSFORD<span className="text-gray-400">/SOFTWARE</span></a>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#services" className="hover:text-black transition-colors">Services</a>
          <a href="#work" className="hover:text-black transition-colors">Work</a>
          <a href="#process" className="hover:text-black transition-colors">Process</a>
          <a href="#about" className="hover:text-black transition-colors">About</a>
        </div>
        <a href="#contact" className="text-sm bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors">Start a project</a>
      </div>
    </nav>
  );
}

/* ============ HERO ============ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const letters = "LUNSFORD".split("");
  const subtitleOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const subtitleY = useTransform(scrollYProgress, [0.45, 0.6], [40, 0]);
  const ctaOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.6, 0.8], [40, 0]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.4]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: bgScale, background: 'radial-gradient(circle at 50% 50%, rgba(255,180,120,0.08), transparent 70%)' }} />
        <div className="relative flex items-center justify-center px-4" style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}>
          {letters.map((letter, i) => (<Letter key={i} letter={letter} index={i} total={letters.length} progress={scrollYProgress} />))}
        </div>
        <motion.div className="absolute inset-x-0 top-1/2 text-center mt-32" style={{ opacity: subtitleOpacity, y: subtitleY }}>
          <p className="font-mono text-xs md:text-sm tracking-[0.5em] text-gray-500 uppercase">Software Development</p>
        </motion.div>
        <motion.div className="absolute bottom-20 inset-x-0 text-center px-6" style={{ opacity: ctaOpacity, y: ctaY }}>
          <p className="text-xl md:text-3xl text-gray-800 mb-8 font-light max-w-2xl mx-auto leading-snug">Custom websites that don&apos;t look like everyone else&apos;s.</p>
          <a href="#contact" className="inline-block px-8 py-3.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Start a project →</a>
        </motion.div>
        <motion.div className="absolute bottom-6 inset-x-0 text-center text-xs text-gray-400 font-mono tracking-widest" style={{ opacity: scrollHintOpacity }}>SCROLL</motion.div>
      </div>
    </section>
  );
}

function Letter({ letter, index, total, progress }: { letter: string; index: number; total: number; progress: MotionValue<number> }) {
  const stagger = index / total;
  const start = stagger * 0.3;
  const end = start + 0.4;
  const rotateY = useTransform(progress, [start, end], [0, 540]);
  const z = useTransform(progress, [start, (start + end) / 2, end], [0, 80 + index * 15, 0]);
  const opacity = useTransform(progress, [0.45, 0.55], [1, 0]);

  return (
    <motion.span className="inline-block font-black tracking-tight leading-none select-none" style={{ fontSize: 'clamp(3rem, 13vw, 12rem)', rotateY, z, opacity, transformStyle: 'preserve-3d' }}>{letter}</motion.span>
  );
}

/* ============ PITCH ============ */
function Pitch() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yFast = useTransform(scrollYProgress, [0, 1], [200, -200]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const yMid = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden py-32">
      <motion.div className="absolute top-20 left-[10%] w-40 h-28 md:w-56 md:h-36 bg-white rounded-xl shadow-lg border border-black/5 rotate-[-8deg]" style={{ y: yFast }}>
        <div className="p-3">
          <div className="w-8 h-2 bg-gray-200 rounded mb-2" />
          <div className="w-full h-1.5 bg-gray-100 rounded mb-1" />
          <div className="w-3/4 h-1.5 bg-gray-100 rounded mb-3" />
          <div className="w-16 h-5 bg-black rounded" />
        </div>
      </motion.div>
      <motion.div className="absolute top-40 right-[8%] w-48 h-32 md:w-64 md:h-44 bg-white rounded-xl shadow-xl border border-black/5 rotate-[6deg]" style={{ y: ySlow }}>
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
      <motion.div className="absolute bottom-20 left-[20%] w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl shadow-md rotate-[12deg]" style={{ y: yMid }} />
      <motion.div className="absolute bottom-32 right-[15%] w-36 h-24 md:w-52 md:h-32 bg-black rounded-xl shadow-xl rotate-[-5deg]" style={{ y: yFast }}>
        <div className="p-3">
          <div className="w-12 h-1.5 bg-gray-700 rounded mb-2" />
          <div className="w-full h-1 bg-gray-800 rounded mb-1" />
          <div className="w-2/3 h-1 bg-gray-800 rounded" />
        </div>
      </motion.div>
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-6 uppercase" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>The pitch</motion.p>
        <motion.h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>Most freelancers ship templates.<br /><span className="text-gray-400">I ship custom builds.</span></motion.h2>
        <motion.p className="mt-8 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }}>Every site is built from scratch. No themes, no page builders, no template farms. Just clean code, fast loads, and designs your customers actually remember.</motion.p>
      </div>
    </section>
  );
}

/* ============ SERVICES ============ */
function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);

  return (
    <section id="services" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <motion.div className="text-center mb-12" style={{ opacity: headerOpacity }}>
          <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Services</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Three ways to work together.</h2>
        </motion.div>
        <div className="relative flex items-center justify-center w-full max-w-6xl" style={{ perspective: '1500px' }}>
          <ServiceCard index={0} progress={scrollYProgress} title="Starter" price="$800" tag="Small business" features={["Up to 5 pages", "Mobile responsive", "Contact form", "SEO basics", "Launch in 2 weeks"]} />
          <ServiceCard index={1} progress={scrollYProgress} title="Pro" price="$2,000" tag="Most popular" features={["Up to 10 pages", "Custom design", "CMS so you can edit", "Email automation", "Launch in 3-4 weeks"]} featured />
          <ServiceCard index={2} progress={scrollYProgress} title="Custom" price="$3,500+" tag="E-commerce / scale" features={["Unlimited pages", "Full e-commerce", "Custom integrations", "Booking systems", "Ongoing support"]} />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ index, progress, title, price, tag, features, featured }: { index: number; progress: MotionValue<number>; title: string; price: string; tag: string; features: string[]; featured?: boolean }) {
  const startScroll = 0.15;
  const endScroll = 0.55;
  const positions = [-340, 0, 340];
  const rotations = [-8, 0, 8];
  const finalX = positions[index];
  const finalRotate = rotations[index];
  const x = useTransform(progress, [startScroll, endScroll], [0, finalX]);
  const rotate = useTransform(progress, [startScroll, endScroll], [0, finalRotate]);
  const z = useTransform(progress, [startScroll, endScroll], [-index * 20, 0]);
  const cardOpacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.div className={`absolute w-72 md:w-80 p-8 rounded-2xl border ${featured ? 'bg-black text-white border-black shadow-2xl' : 'bg-white text-black border-black/10 shadow-xl'}`} style={{ x, rotate, z, opacity: cardOpacity, transformStyle: 'preserve-3d', zIndex: featured ? 10 : 5 }}>
      <div className="flex items-center justify-between mb-6">
        <span className={`text-xs font-mono tracking-widest uppercase ${featured ? 'text-orange-300' : 'text-gray-400'}`}>{tag}</span>
        {featured && (<span className="text-[10px] font-mono uppercase bg-orange-400 text-black px-2 py-1 rounded-full">Popular</span>)}
      </div>
      <h3 className="text-3xl font-bold mb-2">{title}</h3>
      <div className={`text-4xl font-bold mb-6 ${featured ? 'text-white' : 'text-black'}`}>{price}</div>
      <ul className="space-y-3">
        {features.map((f, i) => (<li key={i} className={`text-sm flex items-start gap-2 ${featured ? 'text-gray-300' : 'text-gray-700'}`}><span className={featured ? 'text-orange-400' : 'text-black'}>→</span>{f}</li>))}
      </ul>
    </motion.div>
  );
}

/* ============ FEATURED WORK ============ */
function FeaturedWork() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const mockupY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const mockupRotate = useTransform(scrollYProgress, [0, 1], [4, -4]);

  return (
    <section id="work" ref={ref} className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Featured Work</p>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Recent build.</h2>
        </motion.div>
        <motion.div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl" style={{ y: mockupY, rotate: mockupRotate, transformStyle: 'preserve-3d' }}>
          <div className="bg-zinc-900 px-4 py-3 flex items-center gap-2 border-b border-zinc-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 bg-red-500/70 rounded-full" />
              <div className="w-2.5 h-2.5 bg-yellow-500/70 rounded-full" />
              <div className="w-2.5 h-2.5 bg-green-500/70 rounded-full" />
            </div>
            <div className="ml-4 text-xs font-mono text-gray-500">ruined-visions-site.vercel.app</div>
          </div>
          <div className="relative h-[400px] md:h-[500px] bg-gradient-to-b from-zinc-900 to-black flex flex-col items-center justify-center text-center p-8">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full" />
              <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full" />
              <div className="absolute bottom-1/4 left-1/2 w-0.5 h-0.5 bg-white rounded-full" />
              <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full" />
              <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-white rounded-full" />
            </div>
            <div className="text-white text-3xl md:text-5xl font-black tracking-widest mb-4 relative z-10">RUINED VISIONS</div>
            <div className="text-orange-400 text-xs font-mono tracking-[0.4em] uppercase relative z-10">Drop · July 17 · 8PM EST</div>
            <div className="mt-8 px-6 py-2 border border-white/30 text-white text-xs font-mono tracking-widest uppercase relative z-10">57 Days · 14 Hrs · 22 Min</div>
          </div>
        </motion.div>
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Stat label="Build time" value="3 weeks" />
          <Stat label="Integrations" value="10+" />
          <Stat label="Tech stack" value="Next.js 16" />
          <Stat label="Status" value="Pre-launch" />
        </motion.div>
        <motion.div className="mt-12 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.4 }}>
          <a href="https://ruined-visions-site.vercel.app" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3.5 border-2 border-black text-black rounded-full text-sm font-medium hover:bg-black hover:text-white transition-colors">View live site →</a>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold mb-1">{value}</div>
      <div className="text-xs font-mono tracking-widest uppercase text-gray-500">{label}</div>
    </div>
  );
}

/* ============ PROCESS ============ */
function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const steps = [
    { num: "01", title: "Discovery", desc: "Quick call. What you need, what you don't, what makes your business different." },
    { num: "02", title: "Design", desc: "Custom mockups in Figma. You see the whole thing before a line of code is written." },
    { num: "03", title: "Build", desc: "I code it. Fast, clean, mobile-first. You get updates as it comes together." },
    { num: "04", title: "Launch", desc: "Live on the web with everything set up — hosting, domain, analytics, the works." },
  ];

  return (
    <section id="process" ref={ref} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden px-6">
        <div className="max-w-6xl mx-auto w-full">
          <div className="mb-12">
            <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Process</p>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">From idea to launch.</h2>
          </div>
          <div className="space-y-8">
            {steps.map((step, i) => (<ProcessStep key={i} step={step} index={i} total={steps.length} progress={scrollYProgress} />))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ step, index, total, progress }: { step: { num: string; title: string; desc: string }; index: number; total: number; progress: MotionValue<number> }) {
  const start = index / total;
  const end = (index + 1) / total;
  const scale = useTransform(progress, [Math.max(0, start - 0.05), start, end, Math.min(1, end + 0.05)], [0.95, 1.05, 1.05, 0.95]);
  const opacity = useTransform(progress, [Math.max(0, start - 0.1), start, end, Math.min(1, end + 0.1)], [0.3, 1, 1, 0.3]);
  const x = useTransform(progress, [start, end], [0, 20]);

  return (
    <motion.div className="flex items-start gap-8 border-l-2 border-black/10 pl-8 py-2" style={{ scale, opacity, x, originX: 0 }}>
      <div className="font-mono text-sm text-gray-400 pt-2 min-w-[3rem]">{step.num}</div>
      <div className="flex-1">
        <h3 className="text-2xl md:text-4xl font-bold mb-2">{step.title}</h3>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl">{step.desc}</p>
      </div>
    </motion.div>
  );
}

/* ============ ABOUT ============ */
function About() {
  return (
    <section id="about" className="py-32 px-6 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <motion.p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-6 uppercase" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }}>About</motion.p>
        <motion.h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-12 leading-tight" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}>I&apos;m Yates. 16. Self-taught. <span className="text-gray-500">Based in Newnan, GA.</span></motion.h2>
        <motion.div className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }}>
          <p>I started building websites because the agencies in town were charging local businesses $5,000 for template sites that loaded slow and looked like every other site in town.</p>
          <p>I do it different. Every site is custom. Every line of code is hand-written. And I answer the phone when you call — because I&apos;m not running an agency, I&apos;m running a one-person operation that takes pride in shipping work I&apos;d put my name on.</p>
          <p className="text-white">That&apos;s the whole pitch. Quality work, fair price, and someone who actually picks up.</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============ CONTACT ============ */
function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }}>
          <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Contact</p>
          <h2 className="text-4xl md:text-7xl font-bold tracking-tight leading-tight">Let&apos;s build<br />something good.</h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.1 }}>
            <h3 className="text-2xl font-bold mb-6">Send a message</h3>
            {submitted ? (
              <div className="p-6 bg-black text-white rounded-2xl">
                <p className="font-medium mb-2">Got it. I&apos;ll respond within 24 hours.</p>
                <p className="text-sm text-gray-400">In a rush? Text me at 470-215-2012.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required placeholder="Your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors" />
                <input type="email" required placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors" />
                <textarea required rows={5} placeholder="What are you trying to build?" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 bg-white border border-black/10 rounded-xl focus:outline-none focus:border-black transition-colors resize-none" />
                <button type="submit" className="w-full py-3.5 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">Send →</button>
              </form>
            )}
          </motion.div>
          <motion.div className="bg-black text-white rounded-2xl p-8 md:p-10" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h3 className="text-2xl font-bold mb-4">Or book a free call</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">15 minutes. We talk about what you&apos;re trying to build, I tell you if I&apos;m the right fit, and we go from there. No pressure, no pitch deck.</p>
            <a href="https://cal.com/lunsfordsoftware/15min" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-3.5 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors mb-8">Book a 15-min call →</a>
            <div className="pt-8 border-t border-white/10 space-y-3 text-sm">
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Email</span>
                <a href="mailto:ylunsford1@gmail.com" className="text-white hover:text-orange-400 transition-colors">ylunsford1@gmail.com</a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="font-mono text-xs tracking-widest uppercase w-16">Phone</span>
                <a href="tel:4702152012" className="text-white hover:text-orange-400 transition-colors">470-215-2012</a>
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

/* ============ FOOTER ============ */
function Footer() {
  return (
    <footer className="border-t border-black/10 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <div className="font-mono">© {new Date().getFullYear()} Lunsford Software Development</div>
        <div className="font-mono text-xs tracking-widest uppercase">Built in Newnan, GA</div>
      </div>
    </footer>
  );
}