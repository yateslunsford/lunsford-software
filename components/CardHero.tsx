'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, Sparkles } from '@react-three/drei';
import {
  useScroll,
  useTransform,
  motion,
  transform,
  MotionValue,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useMotionValueEvent,
} from 'framer-motion';
import * as THREE from 'three';

/* ─── Text scramble hook ─── */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·—!@#';

function useScramble(target: string, active: boolean): string {
  const [text, setText] = useState(target);

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let progress = 0;
    let rafId: number;

    const tick = () => {
      setText(
        target
          .split('')
          .map((char, i) => {
            if (char === ' ' || char === "'" || char === '.') return char;
            if (i < progress) return target[i];
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join(''),
      );
      if (frame % 2 === 0) progress += 0.7;
      frame++;
      if (progress < target.length) {
        rafId = requestAnimationFrame(tick);
      } else {
        setText(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [active, target]);

  return text;
}

/* ─── 3D spinning business card ─── */
function Card({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const baseScale = Math.max(0.55, Math.min((viewport.width * 0.55) / 3.5, 0.95));

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.get();
    const rotY = transform(p,
      [0, 0.1, 0.25, 0.45, 0.65, 0.85, 0.93, 1],
      [0, 0.14, Math.PI, Math.PI * 4, Math.PI * 6, Math.PI * 7.6, Math.PI * 7.99, Math.PI * 8],
    );
    const rotX = transform(p,
      [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.93, 1],
      [0, 0.14, 0.44, -0.61, 0.78, -0.52, 0.35, 0.09, 0],
    );
    const rotZ = transform(p,
      [0, 0.15, 0.3, 0.5, 0.65, 0.8, 0.93, 1],
      [0, 0.09, -0.3, 0.42, -0.34, 0.2, 0.07, 0],
    );
    const posY = transform(p,
      [0, 0.1, 0.4, 0.7, 0.9, 0.93, 1],
      [0, 0.1, 0.25, 0.3, 0.15, 0, 0],
    );
    const animScale = transform(p,
      [0, 0.1, 0.4, 0.85, 0.92, 0.95, 1],
      [1, 1.05, 1.1, 1.05, 1.0, 1.08, 1.0],
    );
    groupRef.current.rotation.y = rotY;
    groupRef.current.rotation.x = rotX;
    groupRef.current.rotation.z = rotZ;
    groupRef.current.position.y = posY;
    groupRef.current.scale.setScalar(baseScale * animScale);
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[3.5, 2, 0.05]} radius={0.08} smoothness={4}>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
      </RoundedBox>
      <Text position={[-1.4, 0.55, 0.026]} fontSize={0.32} color="#0a0a0a" anchorX="left" anchorY="middle" letterSpacing={-0.03}>LUNSFORD</Text>
      <Text position={[-1.4, 0.27, 0.026]} fontSize={0.075} color="#666666" anchorX="left" anchorY="middle" letterSpacing={0.3}>SOFTWARE DEVELOPMENT</Text>
      <mesh position={[1.45, 0.55, 0.026]}>
        <torusGeometry args={[0.15, 0.008, 16, 32]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      <Text position={[1.45, 0.55, 0.027]} fontSize={0.1} color="#666666" anchorX="center" anchorY="middle">LS</Text>
      <Text position={[-1.4, -0.75, 0.026]} fontSize={0.075} color="#888888" anchorX="left" anchorY="middle" letterSpacing={0.12}>EST. 2026 · NEWNAN, GA</Text>
      <Text position={[1.4, -0.75, 0.026]} fontSize={0.075} color="#888888" anchorX="right" anchorY="middle" letterSpacing={0.05}>ylunsford1@gmail.com</Text>
      <group rotation={[0, Math.PI, 0]}>
        <Text position={[0, 0.18, 0.026]} fontSize={0.1} color="#666666" anchorX="center" anchorY="middle" letterSpacing={0.35}>CUSTOM WEBSITES</Text>
        <Text position={[0, -0.15, 0.026]} fontSize={0.38} color="#0a0a0a" anchorX="center" anchorY="middle" letterSpacing={-0.025}>Built right.</Text>
      </group>
    </group>
  );
}

/* ─── Hero section ─── */
export default function CardHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  /* Existing CTA reveal */
  const textOpacity        = useTransform(scrollYProgress, [0.88, 0.98], [0, 1]);
  const textY              = useTransform(scrollYProgress, [0.88, 0.98], [20, 0]);
  const scrollHintOpacity  = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  /* Ghost "BUILT RIGHT" text — drifts upward, fades before CTA appears */
  const ghostY       = useTransform(scrollYProgress, [0, 0.9], [0, -60]);
  const ghostOpacity = useTransform(scrollYProgress, [0.05, 0.22, 0.72, 0.86], [0, 1, 1, 0]);

  /* Cursor-following glow — spring-smoothed, 60 fps */
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.4);
  const springX = useSpring(rawX, { stiffness: 55, damping: 22 });
  const springY = useSpring(rawY, { stiffness: 55, damping: 22 });
  const pctX = useTransform(springX, [0, 1], ['0%', '100%']);
  const pctY = useTransform(springY, [0, 1], ['0%', '100%']);
  const cursorGlow = useMotionTemplate`radial-gradient(circle at ${pctX} ${pctY}, rgba(255,140,60,0.18), transparent 38%)`;

  /* Scramble the tagline the moment it first becomes visible */
  const [scrambleActive, setScrambleActive] = useState(false);
  const TAGLINE = "Custom websites that don't look like everyone else's.";
  const scrambled = useScramble(TAGLINE, scrambleActive);

  useMotionValueEvent(textOpacity, 'change', (v) => {
    if (v > 0.08 && !scrambleActive) setScrambleActive(true);
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(e.clientX / rect.width);
      rawY.set(e.clientY / rect.height);
    },
    [rawX, rawY],
  );

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{
        height: '250vh',
        background: 'linear-gradient(to bottom, #080808 0%, #080808 55%, #2a2a2a 75%, #b8b8b8 90%, #fafafa 100%)',
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Static ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,140,60,0.15), transparent 55%)' }}
        />

        {/* Cursor-following reactive glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: cursorGlow }}
        />

        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Ghost "BUILT RIGHT" — massive ambient text that drifts on scroll */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
          style={{ y: ghostY, opacity: ghostOpacity }}
          aria-hidden="true"
        >
          <p
            className="font-black tracking-tight text-white leading-none select-none whitespace-nowrap"
            style={{ fontSize: 'clamp(5rem, 18vw, 20rem)', opacity: 0.028 }}
          >
            BUILT RIGHT
          </p>
        </motion.div>

        {/* 3D canvas */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          style={{ position: 'absolute', inset: 0 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-5, 2, 3]} intensity={0.7} color="#ff8c3c" />
          <pointLight position={[0, -3, 2]} intensity={0.4} color="#ffaa55" />
          <Card progress={scrollYProgress} />
          <Sparkles count={150} scale={[14, 13, 5]} size={3} speed={0.4} color="#ffffff" opacity={0.6} />
        </Canvas>

        {/* CTA text — scrambles into existence on scroll reveal */}
        <motion.div
          className="absolute inset-x-0 text-center px-6 z-10"
          style={{ bottom: '6vh', opacity: textOpacity, y: textY }}
        >
          <p className="text-gray-700 text-base md:text-xl font-normal max-w-xl mx-auto mb-4 leading-relaxed font-mono tracking-tight">
            {scrambled}
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            Start a project →
          </a>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-3 inset-x-0 text-center"
          style={{ opacity: scrollHintOpacity }}
        >
          <p className="text-white/30 text-[10px] font-mono tracking-[0.4em] uppercase">Scroll</p>
        </motion.div>

      </div>
    </section>
  );
}
