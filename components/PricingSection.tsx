'use client';

import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

/* ─── Tier definitions ─── */
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

/* ─── Static base transforms — the ALWAYS-ON fan positions ─── */
const BASE: Record<number, { x: number; rotate: number; scale: number; opacity: number }> = {
  0: { x: -40, rotate: -6, scale: 0.92, opacity: 0.82 }, // Starter
  1: { x: 0,   rotate: 0,  scale: 1.05, opacity: 1.0  }, // Pro
  2: { x: 40,  rotate: 6,  scale: 0.92, opacity: 0.82 }, // Custom
};

/* Derive animate-target based on hover state */
function cardState(index: number, hovered: number | null) {
  const base = BASE[index];
  // Only react to side-card hover (not Pro itself)
  const sideHovered = hovered !== null && hovered !== 1;

  if (!sideHovered) return base;

  if (index === hovered) {
    // This side card is being hovered — advance
    return { x: 0, rotate: 0, scale: 1.02, opacity: 1 };
  }
  if (index === 1) {
    // Pro retreats while a side card is hovered
    return { x: 0, rotate: 0, scale: 0.97, opacity: 0.88 };
  }
  // The other, un-hovered side card fades further back
  return { ...base, opacity: 0.55 };
}

/* power3.out ≈ cubic-bezier(0.22, 1, 0.36, 1) */
const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Desktop card ─── */
function DesktopCard({
  tier,
  hovered,
  onHoverStart,
  onHoverEnd,
  onSelect,
}: {
  tier: Tier;
  hovered: number | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onSelect: () => void;
}) {
  const { index, title, price, tag, features, featured } = tier;
  const target = cardState(index, hovered);

  return (
    /*
     * Outer .card-wrapper: GSAP targets this for the y-drop entrance.
     * Inner motion.div: Framer Motion owns x / rotate / scale / opacity.
     * Different elements → zero transform conflict.
     */
    <div className="card-wrapper" style={{ zIndex: featured ? 10 : 5 }}>
      <motion.div
        /*
         * initial = base fan position so there is no layout-shift on mount.
         * animate = hover-driven target; Framer Motion diffs and transitions.
         */
        initial={BASE[index]}
        animate={target}
        transition={{ duration: 0.38, ease: EASE }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        className={`relative w-64 md:w-72 p-6 rounded-2xl border cursor-default select-none ${
          featured
            ? 'bg-black text-white border-transparent shadow-2xl'
            : 'bg-white text-black border-black/10 shadow-2xl'
        }`}
        style={
          featured
            ? { boxShadow: '0 0 0 1px rgba(251,146,60,0.35), 0 25px 50px rgba(0,0,0,0.35)' }
            : undefined
        }
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
              className="shrink-0 text-[10px] font-mono font-semibold uppercase bg-orange-400 text-black px-2 py-1 rounded-full"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              Most Popular
            </motion.span>
          )}
        </div>

        {/* Title + price */}
        <h3 className="text-3xl font-extrabold mb-1">{title}</h3>
        <div className={`text-4xl font-extrabold mb-5 ${featured ? 'text-white' : 'text-black'}`}>
          {price}
        </div>

        {/* Feature list */}
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

        {/* Pro: animated orange border glow overlay */}
        {featured && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0 1px rgba(251,146,60,0.2)',
                '0 0 0 1px rgba(251,146,60,0.6)',
                '0 0 0 1px rgba(251,146,60,0.2)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  );
}

/* ─── Mobile card (shared by carousel) ─── */
function MobileCard({ tier, onSelect }: { tier: Tier; onSelect: () => void }) {
  const { title, price, tag, features, featured } = tier;

  return (
    <div
      className={`snap-center shrink-0 w-[290px] p-6 rounded-2xl border ${
        featured
          ? 'bg-black text-white border-transparent shadow-2xl'
          : 'bg-white text-black border-black/10 shadow-2xl'
      }`}
      style={
        featured
          ? { boxShadow: '0 0 0 1px rgba(251,146,60,0.35), 0 20px 40px rgba(0,0,0,0.3)' }
          : undefined
      }
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
          <span className="shrink-0 text-[10px] font-mono font-semibold uppercase bg-orange-400 text-black px-2 py-1 rounded-full">
            Most Popular
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
  const sectionRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const carouselRef  = useRef<HTMLDivElement>(null);
  const hasAnimated  = useRef(false);

  const [hovered, setHovered] = useState<number | null>(null);

  /*
   * useLayoutEffect runs synchronously before the browser paints.
   * GSAP.set moves cards to y:-200 immediately, so there is no
   * single-frame flash of cards at y:0 before the entrance fires.
   */
  useLayoutEffect(() => {
    const wrappers = containerRef.current?.querySelectorAll<HTMLElement>('.card-wrapper');
    if (wrappers) gsap.set(Array.from(wrappers), { y: -200 });
  }, []);

  /*
   * IntersectionObserver fires the entrance once the section scrolls into
   * view. Uses browser-native IO (not GSAP ScrollTrigger) so it is fully
   * compatible with Lenis smooth-scroll.
   */
  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const wrappers = Array.from(container.querySelectorAll<HTMLElement>('.card-wrapper'));

        /*
         * Pro (index 1, center) drops first — stagger from:'center' handles
         * ordering automatically: center → sides at +120ms each.
         */
        gsap.to(wrappers, {
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: { each: 0.12, from: 'center' },
          /*
           * After the entrance completes, clear the GSAP inline transform so
           * Framer Motion can own the element transforms cleanly.
           */
          onComplete: () => gsap.set(wrappers, { clearProps: 'transform' }),
        });

        observer.disconnect();
      },
      { rootMargin: '-5% 0px', threshold: 0 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  /* Mobile: auto-scroll carousel to Pro card on mount */
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const proCard = carousel.children[1] as HTMLElement | undefined;
    if (!proCard) return;
    carousel.scrollTo({
      left: proCard.offsetLeft - (carousel.offsetWidth - proCard.offsetWidth) / 2,
      behavior: 'auto',
    });
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-20 px-6">

      {/* Section header */}
      <div className="text-center mb-12">
        <p className="font-mono text-xs tracking-[0.4em] text-gray-500 mb-4 uppercase">Services</p>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Three ways to work together.
        </h2>
      </div>

      {/* ── Desktop: flex row, fan transforms, always visible ── */}
      <div
        ref={containerRef}
        className="hidden md:flex items-center justify-center max-w-5xl mx-auto"
        style={{ perspective: '1500px', gap: '1rem' }}
      >
        {TIERS.map((tier) => (
          <DesktopCard
            key={tier.index}
            tier={tier}
            hovered={hovered}
            onHoverStart={() => setHovered(tier.index)}
            onHoverEnd={() => setHovered(null)}
            onSelect={() => onTierSelect({ tier: tier.title, price: tier.price })}
          />
        ))}
      </div>

      {/* ── Mobile: horizontal scroll-snap carousel ── */}
      <div
        ref={carouselRef}
        className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-6 px-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {TIERS.map((tier) => (
          <MobileCard
            key={tier.index}
            tier={tier}
            onSelect={() => onTierSelect({ tier: tier.title, price: tier.price })}
          />
        ))}
      </div>

    </section>
  );
}
