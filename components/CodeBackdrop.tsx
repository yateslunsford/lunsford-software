'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import gsap from 'gsap';

/* ─── Authentic code snippets from the actual stack ─── */
const SNIPPET_A = `'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealOptions {
  y?: number;
  duration?: number;
  stagger?: number;
}

export function useScrollReveal(opts: RevealOptions = {}) {
  const { y = 48, duration = 0.8, stagger = 0.12 } = opts;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.reveal-item', {
        opacity: 0,
        y,
        duration,
        ease: 'power3.out',
        stagger,
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [y, duration, stagger]);

  return containerRef;
}`;

const SNIPPET_B = `import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import type * as THREE from 'three';

function Icosahedron() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += delta * 0.4;
    mesh.current.rotation.x += delta * 0.15;
  });

  useEffect(() => {
    return () => {
      mesh.current?.geometry.dispose();
    };
  }, []);

  return (
    <Float speed={1.4} floatIntensity={0.8}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          wireframe
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} />
      <Icosahedron />
      <Environment preset="city" />
    </Canvas>
  );
}`;

const SNIPPETS = [SNIPPET_A, SNIPPET_B] as const;

const FONT_PX    = 12;
const LINE_H     = 1.6;
const LINE_H_PX  = FONT_PX * LINE_H; // ~19.2 px

/* ═══════════════════════════════════════════════════════════
   CodeBackdrop — types authentic code character-by-character
   as atmospheric texture behind FeaturedWork content.
   opacity ≈ 0.07, mask-faded top+bottom, prefers-reduced-motion
   aware. No rAF — driven entirely by GSAP.
═══════════════════════════════════════════════════════════ */
export default function CodeBackdrop() {
  const reduceMotion  = useReducedMotion() ?? false;
  const containerRef  = useRef<HTMLDivElement>(null);
  const preRef        = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const pre       = preRef.current;
    if (!container || !pre) return;

    /* Reduced-motion: static text, no animation */
    if (reduceMotion) {
      pre.textContent = SNIPPETS[0];
      return;
    }

    let mounted = true;

    const ctx = gsap.context(() => {
      // quickSetter bypasses the tween overhead for per-frame Y updates
      const setY = gsap.quickSetter(pre, 'y', 'px') as (v: number) => void;
      let snippetIdx = 0;

      function typeNext(): void {
        if (!mounted || !pre || !container) return;
        const snippet = SNIPPETS[snippetIdx % SNIPPETS.length];
        snippetIdx++;

        pre.textContent = '';
        gsap.set(pre, { y: 0, opacity: 1 });

        const state = { char: 0 };
        let prev    = 0;

        gsap.to(state, {
          char:     snippet.length,
          duration: snippet.length * 0.030,  // ~30 ms / char — streaming feel
          ease:     'none',
          delay:    0.5,
          onUpdate() {
            if (!mounted) return;
            const idx = Math.floor(state.char);
            if (idx === prev) return;
            prev = idx;

            pre.textContent = snippet.slice(0, idx);

            // Drift older lines upward so the cursor line stays visible
            const lines    = (pre.textContent.match(/\n/g)?.length ?? 0) + 1;
            const maxLines = Math.floor(container.clientHeight / LINE_H_PX);
            if (lines > maxLines) {
              setY(-(lines - maxLines) * LINE_H_PX);
            }
          },
          onComplete() {
            if (!mounted) return;
            pre.textContent = snippet; // settle — no cursor artifact
            gsap.delayedCall(2.5, () => {
              if (!mounted) return;
              gsap.to(pre, {
                opacity:    0,
                duration:   1.0,
                ease:       'power2.in',
                onComplete: typeNext,
              });
            });
          },
        });
      }

      typeNext();
    }, containerRef);

    return () => {
      mounted = false;
      ctx.revert();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        opacity: 0.07,
        maskImage:
          'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
      }}
    >
      <pre
        ref={preRef}
        className="absolute top-10 left-8 right-8 will-change-transform"
        style={{
          fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
          fontSize:   `${FONT_PX}px`,
          lineHeight: LINE_H,
          color:      '#ffffff',
          margin:     0,
          padding:    0,
          whiteSpace: 'pre',
          tabSize:    2,
        }}
      />
    </div>
  );
}
