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
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // Keep ScrollTrigger in lock-step with Lenis' tick.
    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // Smooth out mobile touch scrolling — fixes jank on iOS/Android
    ScrollTrigger.normalizeScroll(true);

    let rafId = 0;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.off('scroll', onScroll);
      ScrollTrigger.normalizeScroll(false);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
