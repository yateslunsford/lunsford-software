'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, Text, Sparkles } from '@react-three/drei';
import { useScroll, useTransform, motion, transform, MotionValue } from 'framer-motion';
import * as THREE from 'three';

function Card({ progress }: { progress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const baseScale = Math.max(0.55, Math.min((viewport.width * 0.55) / 3.5, 0.95));

  useFrame(() => {
    if (!groupRef.current) return;
    const p = progress.get();
    const rotY = transform(p, [0, 0.1, 0.25, 0.45, 0.65, 0.85, 0.93, 1], [0, 0.14, Math.PI, Math.PI * 4, Math.PI * 6, Math.PI * 7.6, Math.PI * 7.99, Math.PI * 8]);
    const rotX = transform(p, [0, 0.1, 0.25, 0.4, 0.55, 0.7, 0.85, 0.93, 1], [0, 0.14, 0.44, -0.61, 0.78, -0.52, 0.35, 0.09, 0]);
    const rotZ = transform(p, [0, 0.15, 0.3, 0.5, 0.65, 0.8, 0.93, 1], [0, 0.09, -0.3, 0.42, -0.34, 0.2, 0.07, 0]);
    const posY = transform(p, [0, 0.1, 0.4, 0.7, 0.9, 0.93, 1], [0, 0.1, 0.25, 0.3, 0.15, 0, 0]);
    const animScale = transform(p, [0, 0.1, 0.4, 0.85, 0.92, 0.95, 1], [1, 1.05, 1.1, 1.05, 1.0, 1.08, 1.0]);
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

export default function CardHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const textOpacity = useTransform(scrollYProgress, [0.88, 0.98], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.88, 0.98], [20, 0]);
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <section ref={sectionRef} className="relative" style={{ height: '250vh', background: 'linear-gradient(to bottom, #080808 0%, #080808 55%, #2a2a2a 75%, #b8b8b8 90%, #fafafa 100%)' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(255,140,60,0.15), transparent 55%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`, mixBlendMode: 'overlay' }} />
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} style={{ position: 'absolute', inset: 0 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
          <directionalLight position={[-5, 2, 3]} intensity={0.7} color="#ff8c3c" />
          <pointLight position={[0, -3, 2]} intensity={0.4} color="#ffaa55" />
          <Card progress={scrollYProgress} />
          <Sparkles count={150} scale={[14, 13, 5]} size={3} speed={0.4} color="#ffffff" opacity={0.6} />
        </Canvas>
        <motion.div className="absolute inset-x-0 text-center px-6 z-10" style={{ bottom: '6vh', opacity: textOpacity, y: textY }}>
          <p className="text-gray-700 text-base md:text-xl font-normal max-w-xl mx-auto mb-4 leading-relaxed">Custom websites that don&apos;t look like everyone else&apos;s.</p>
          <a href="#contact" className="inline-block px-8 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors">Start a project →</a>
        </motion.div>
        <motion.div className="absolute bottom-3 inset-x-0 text-center" style={{ opacity: scrollHintOpacity }}>
          <p className="text-white/30 text-[10px] font-mono tracking-[0.4em] uppercase">Scroll</p>
        </motion.div>
      </div>
    </section>
  );
}