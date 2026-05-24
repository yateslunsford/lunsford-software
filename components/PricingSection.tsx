'use client';

import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  MotionValue,
} from 'framer-motion';

/* ─── Tier data ─── */
export const TIERS = [
  {
    index: 0,
    title: 'Starter',
    price: '$800',
    tag: 'Get online. Look legit.',
    features: [
      '5-page custom site',
      'Mobile responsive',
      'Contact form',
      'SEO foundations',
      '1-week delivery',
    ],
    featured: false,
  },
  {
    index: 1,
    title: 'Pro',
    price: '$2,000',
    tag: 'Sell, scale, ship drops.',
    features: [
      'Everything in Starter',
      'Sanity CMS',
      'Stripe checkout',
      'SMS notifications',
      '2–3 week build',
    ],
    featured: true,
  },
  {
    index: 2,
    title: 'Custom',
    price: '$3,500+',
    tag: 'Build whatever you describe.',
    features: [
      'Full custom systems',
      'Booking & dashboards',
      'API integrations',
      'E-commerce',
      'Ongoing iteration',
    ],
    featured: false,
  },
] as const;

type Tier = (typeof TIERS)[number];

/* power3.out ≈ cubic-bezier(0.22, 1, 0.36, 1) */
const POWER3_OUT = [0.22, 1, 0.36, 1] as const;

/* ─── Desktop ServiceCard ─── */
function ServiceCard({
  tier,
  progress,
  hoveredIndex,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: {
  tier: Tier;
  progress: MotionValue<number>;
  hoveredIndex: number | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}) {
  const POSITIONS = [-340, 0, 340] as const;
  const ROTATIONS = [-8, 0, 8] as const;
  const { index, title, price, tag, features, featured } = tier;

  /* Scroll-driven fan-out */
  const x       = useTransform(progress, [0.15, 0.55], [0, POSITIONS[index]]);
  const rotate  = useTransform(progress, [0.15, 0.55], [0, ROTATIONS[index]]);
  const z       = useTransform(progress, [0.15, 0.55], [-index * 20, 0]);
  /* Opacity: fade out when section exits, always opaque at entry
     (GSAP handles the entrance; Framer Motion handles the exit) */
  const opacity = useTransform(progress, [0, 0.9, 1], [1, 1, 0]);

  /* Hover swap: side cards advance, center retreats */
  const isSideHovered = hoveredIndex !== null && hoveredIndex !== 1;
  const retreatScale  = featured && isSideHovered ? 0.93 : 1;

  return (
    /*
     * Outer div: GSAP animates translateY (entrance drop).
     * Inner motion.div: Framer Motion handles x / rotate / z / opacity.
     * Keeping them on separate elements avoids transform conflicts.
     */
    <div
      className="card-drop-wrapper"
      style={{
        position: 'absolute',
        zIndex: featured ? 10 : 5,
        transformStyle: 'preserve-3d',
      }}
    >
      <motion.div
        className={`w-72 md:w-80 p-6 rounded-2xl border select-none ${
          featured
            ? 'bg-black text-white border-black shadow-2xl'
            : 'bg-white text-black border-black/10 shadow-2xl'
        }`}
        style={{ x, rotate, z, opacity, transformStyle: 'preserve-3d' }}
        /* Hover swap */
        animate={{ scale: retreatScale }}
        whileHover={!featured ? { scale: 1.04 } : undefined}
        transition={{ duration: 0.38, ease: POWER3_OUT }}
        onHoverStart={onHoverStart}
        onHoverEnd={onHoverEnd}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-2">
          <span
            className={`text-xs font-mono tracking-widest uppercase leading-snug ${
              featured ? 'text-orange-300' : 'text-gray-400'
            }`}
          >
            {tag}
          </span>
          {featured && (
            <motion.span
              className="shrink-0 text-[10px] font-mono uppercase bg-orange-400 text-black px-2 py-1 rounded-full"
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Popular
            </motion.span>
          )}
        </div>

        {/* Title + price */}
        <h3 className="text-3xl font-extrabold mb-1">{title}</h3>
        <div className={`text-4xl font-extrabold mb-5 ${featured ? 'text-white' : 'text-black'}`}>
          {price}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 mb-6">
          {features.map((f, i) => (
            <li
              key={i}
              className={`text-sm flex items-start gap-2 ${
                featured ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <span className={featured ? 'text-orange-400' : 'text-black'}>→</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onSelect}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            featured
              ? 'bg-orange-400 text-black hover:bg-orange-300'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Start with {title} →
        </button>

        {/* Pro card: animated border glow */}
        {featured && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ border: '1px solid rgba(251,146,60,0)' }}
            animate={{ borderColor: ['rgba(251,146,60,0)', 'rgba(251,146,60,0.5)', 'rgba(251,146,60,0)'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  );
}

/* ─── Mobile card (scroll-snap carousel) ─── */
function MobileCard({ tier, onSelect }: { tier: Tier; onSelect: () => void }) {
  const { title, price, tag, features, featured } = tier;

  return (
    <div
      className={`snap-center shrink-0 w-[300px] p-6 rounded-2xl border ${
        featured
          ? 'bg-black text-white border-black shadow-2xl'
          : 'bg-white text-black border-black/10 shadow-2xl'
      }`}
    >
      <div className="flex items-start justify-between mb-5 gap-2">
        <span
          className={`text-xs font-mono tracking-widest uppercase leading-snug ${
            featured ? 'text-orange-300' : 'text-gray-400'
          }`}
        >
          {tag}
        </span>
        {featured && (
          <span className="shrink-0 text-[10px] font-mono uppercase bg-orange-400 text-black px-2 py-1 rounded-full">
            Popular
          </span>
        )}
      </div>

      <h3 className="text-3xl font-extrabold mb-1">{title}</h3>
      <div className={`text-4xl font-extrabold mb-5 ${featured ? 'text-white' : 'text-black'}`}>
        {price}
      </div>

      <ul className="space-y-2.5 mb-6">
        {features.map((f, i) => (
          <li
            key={i}
            className={`text-sm flex items-start gap-2 ${featured ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <span className={featured ? 'text-orange-400' : 'text-black'}>→</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
          featured
            ? 'bg-orange-400 text-black hover:bg-orange-300'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        Start with {title} →
      </button>
    </div>
  );
}

/* ─── Main export ─── */
export default function PricingSection({
  onTierSelect,
}: {
  onTierSelect: (t: { tier: string; price: string }) => void;
}) {
  const desktopRef  = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef  = useRef<HTMLDivElement>(null);

  /* Scroll progress drives the desktop fan-out */
  const { scrollYProgress } = useScroll({ target: desktopRef, offset: ['start start', 'end end'] });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.1, 0.85, 1], [0, 1, 1, 0]);

  /* Hover swap state */
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /* Trigger GSAP entrance once the desktop section enters the viewport */
  const isInView    = useInView(desktopRef, { once: true, margin: '-3% 0px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current || !containerRef.current) return;
    hasAnimated.current = true;

    const wrappers = Array.from(
      containerRef.current.querySelectorAll<HTMLElement>('.card-drop-wrapper'),
    );
    if (wrappers.length === 0) return;

    /*
     * power3.out entrance:
     *   Center card (index 1) drops first.
     *   Side cards fan out 120 ms later — feels like the center "throws" them.
     * stagger from: 'center' gives us this ordering automatically.
     */
    gsap.fromTo(
      wrappers,
      { y: -180 },
      {
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: { each: 0.12, from: 'center' },
        /* Clean up the inline transform once done so Framer Motion owns it */
        onComplete: () => gsap.set(wrappers, { clearProps: 'transform' }),
      },
    );
  }, [isInView]);

  /* Auto-scroll mobile carousel to the Pro (center) card on mount */
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    /* Pro card is the second item; offset ≈ card width + gap */
    const proCard = carousel.children[1] as HTMLElement | undefined;
    if (proCard) {
      carousel.scrollTo({ left: proCard.offsetLeft - (carousel.offsetWidth - proCard.offsetWidth) / 2, behavior: 'auto' });
    }
  }, []);

  return (
    <section id="services">

      {/* ── Mobile: horizontal scroll-snap carousel ── */}
      <div className="md:hidden py-20 px-6">
        <div className="text-center mb-10">
          <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Services</p>
          <h2 className="text-4xl font-extrabold tracking-tight">Three ways to work together.</h2>
        </div>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TIERS.map((t) => (
            <MobileCard
              key={t.index}
              tier={t}
              onSelect={() => onTierSelect({ tier: t.title, price: t.price })}
            />
          ))}
        </div>
      </div>

      {/* ── Desktop: sticky scroll-driven fan-out ── */}
      <div ref={desktopRef} className="hidden md:block relative h-[300vh]">
        <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden px-6">

          {/* Section header */}
          <motion.div className="text-center mb-7" style={{ opacity: headerOpacity }}>
            <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Services</p>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Three ways to work together.
            </h2>
          </motion.div>

          {/* Card container — GSAP scope */}
          <div
            ref={containerRef}
            className="relative flex items-center justify-center w-full max-w-6xl"
            style={{ perspective: '1500px' }}
          >
            {TIERS.map((t) => (
              <ServiceCard
                key={t.index}
                tier={t}
                progress={scrollYProgress}
                hoveredIndex={hoveredIndex}
                onHoverStart={() => setHoveredIndex(t.index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onSelect={() => onTierSelect({ tier: t.title, price: t.price })}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
