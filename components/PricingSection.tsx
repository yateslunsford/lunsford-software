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

/* ─── Static base transforms — the always-on fan positions ─── */
const BASE: Record<number, { x: number; rotate: number; scale: number; opacity: number }> = {
  0: { x: -40, rotate: -6, scale: 0.92, opacity: 0.82 }, // Starter
  1: { x: 0,   rotate: 0,  scale: 1.05, opacity: 1.0  }, // Pro
  2: { x: 40,  rotate: 6,  scale: 0.92, opacity: 0.82 }, // Custom
};

function cardState(index: number, hovered: number | null) {
  const base = BASE[index];
  const sideHovered = hovered !== null && hovered !== 1;

  if (!sideHovered) return base;

  if (index === hovered) {
    return { x: 0, rotate: 0, scale: 1.02, opacity: 1 };
  }
  if (index === 1) {
    return { x: 0, rotate: 0, scale: 0.97, opacity: 0.88 };
  }
  return { ...base, opacity: 0.55 };
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Desktop card — strict B/W palette ─── */
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
    <div className="card-wrapper" style={{ zIndex: featured ? 10 : 5 }}>
      <motion.div
        initial={BASE[index]}
        animate={target}
        transition={{ duration: 0.38, ease: EASE }}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        className={`relative w-64 md:w-72 p-6 rounded-2xl border cursor-default select-none ${
          featured
            ? 'bg-black text-white border-white/20 shadow-2xl'
            : 'bg-white text-black border-black/10 shadow-2xl'
        }`}
        style={
          featured
            ? { boxShadow: '0 0 0 1px rgba(255,255,255,0.30), 0 25px 50px rgba(0,0,0,0.45)' }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5 gap-2">
          <span
            className={`text-xs font-mono tracking-widest uppercase leading-snug ${
              featured ? 'text-white/65' : 'text-gray-400'
            }`}
          >
            {tag}
          </span>

          {featured && (
            <motion.span
              className="shrink-0 text-[10px] font-mono font-semibold uppercase bg-white text-black px-2 py-1 rounded-full"
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
              <span className={featured ? 'text-white' : 'text-black'}>→</span>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onSelect}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            featured
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          Start with {title} →
        </button>

        {/* Pro: animated white border glow overlay */}
        {featured && (
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 0 1px rgba(255,255,255,0.18)',
                '0 0 0 1px rgba(255,255,255,0.55)',
                '0 0 0 1px rgba(255,255,255,0.18)',
              ],
            }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.div>
    </div>
  );
}

/* ─── Mobile card ─── */
function MobileCard({ tier, onSelect }: { tier: Tier; onSelect: () => void }) {
  const { title, price, tag, features, featured } = tier;

  return (
    <div
      className={`snap-center shrink-0 w-[85vw] p-6 rounded-2xl border ${
        featured
          ? 'bg-black text-white border-white/20 shadow-2xl'
          : 'bg-white text-black border-black/10 shadow-2xl'
      }`}
      style={
        featured
          ? { boxShadow: '0 0 0 1px rgba(255,255,255,0.30), 0 20px 40px rgba(0,0,0,0.4)' }
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-5 gap-2">
        <span
          className={`text-xs font-mono tracking-widest uppercase leading-snug ${
            featured ? 'text-white/65' : 'text-gray-400'
          }`}
        >
          {tag}
        </span>
        {featured && (
          <span className="shrink-0 text-[10px] font-mono font-semibold uppercase bg-white text-black px-2 py-1 rounded-full">
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
            <span className={featured ? 'text-white' : 'text-black'}>→</span>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
          featured
            ? 'bg-white text-black hover:bg-gray-200'
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
  const [activeIndex, setActiveIndex] = useState(1);

  useLayoutEffect(() => {
    const wrappers = containerRef.current?.querySelectorAll<HTMLElement>('.card-wrapper');
    if (wrappers) gsap.set(Array.from(wrappers), { y: -200 });
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;

        const wrappers = Array.from(container.querySelectorAll<HTMLElement>('.card-wrapper'));

        gsap.to(wrappers, {
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: { each: 0.12, from: 'center' },
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

  /* Mobile: track active card for dot indicators */
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onScroll = () => {
      const mid = el.scrollLeft + el.offsetWidth / 2;
      let nearest = 0;
      let best = Infinity;
      Array.from(el.children).forEach((child, i) => {
        const c = child as HTMLElement;
        const dist = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (dist < best) { best = dist; nearest = i; }
      });
      setActiveIndex(nearest);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="services" ref={sectionRef} className="py-10 md:py-12 px-4 sm:px-6">
      {/* Section header */}
      <motion.div
        className="text-center mb-8 sm:mb-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="font-mono text-[10px] sm:text-xs tracking-[0.35em] sm:tracking-[0.45em] text-gray-500 mb-3 sm:mb-4 uppercase">
          Services  ·  03
        </p>
        <h2
          className="font-extrabold tracking-tight"
          style={{ fontSize: 'clamp(1.95rem, 7vw, 6rem)', letterSpacing: '-0.035em', lineHeight: 0.96 }}
        >
          Three ways<br />to work together.
        </h2>
      </motion.div>

      {/* Desktop: flex row */}
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

      {/* Mobile: carousel */}
      <div
        ref={carouselRef}
        data-lenis-prevent
        className="md:hidden flex gap-4 overflow-x-scroll pb-4 snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 hide-scrollbar touch-pan-x overscroll-x-contain"
      >
        {TIERS.map((tier) => (
          <MobileCard
            key={tier.index}
            tier={tier}
            onSelect={() => onTierSelect({ tier: tier.title, price: tier.price })}
          />
        ))}
      </div>

      {/* Dot indicators */}
      <div className="md:hidden flex justify-center gap-2 mt-5" aria-label="Service tier indicators">
        {TIERS.map((tier, i) => (
          <button
            key={tier.index}
            aria-label={`${tier.title} ${tier.price}`}
            onClick={() => {
              const el = carouselRef.current;
              if (!el) return;
              const card = el.children[i] as HTMLElement;
              el.scrollTo({
                left: card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2,
                behavior: 'smooth',
              });
            }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-5 bg-black' : 'w-1.5 bg-black/25'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
