'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

// Register once at module level — safe to call repeatedly but cleaner here.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.config({ force3D: true });

    /* Easter egg — styled console greeting for curious devs */
    // eslint-disable-next-line no-console
    console.log(
      '%c  LUNSFORD SOFTWARE DEVELOPMENT  \n%c  Built by Yates Lunsford · 16 · Newnan, GA  \n%c  Curious? → lunsfordsoftware@gmail.com  ',
      'background:#000;color:#fff;font-size:14px;font-weight:bold;padding:6px 12px;',
      'background:#000;color:#9ca3af;font-size:11px;padding:2px 12px;',
      'background:#000;color:#6b7280;font-size:11px;padding:2px 12px 6px;',
    );

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node: HTMLElement) => !!node.closest('[data-lenis-prevent]'),
    });

    // Keep ScrollTrigger in lock-step with Lenis' tick.
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
