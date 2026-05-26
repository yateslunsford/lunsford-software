'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── 2 000 stars — half the density of HeroScene ─── */
const STAR_COUNT = 2000;

function sampleColor(): [number, number, number] {
  const t = Math.random();
  if (t < 0.05) return [0.74, 0.81, 1.0];
  if (t < 0.18) return [0.86, 0.92, 1.0];
  if (t < 0.62) return [1.0,  1.0,  1.0];
  if (t < 0.85) return [1.0,  0.98, 0.92];
  return               [1.0,  0.95, 0.80];
}

/* Build buffers at module scope — created once, never rebuilt */
const BUF_POS = new Float32Array(STAR_COUNT * 3);
const BUF_COL = new Float32Array(STAR_COUNT * 3);
const BUF_SIZ = new Float32Array(STAR_COUNT);
const BUF_DEP = new Float32Array(STAR_COUNT);
const BUF_PHA = new Float32Array(STAR_COUNT);
const BUF_SPD = new Float32Array(STAR_COUNT);

for (let i = 0; i < STAR_COUNT; i++) {
  const rNorm = Math.random();
  const r     = 8 + rNorm * 42;
  const theta = Math.random() * Math.PI * 2;
  const phi   = Math.acos(2 * Math.random() - 1);
  BUF_POS[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  BUF_POS[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  BUF_POS[i * 3 + 2] = r * Math.cos(phi);

  const [cr, cg, cb]  = sampleColor();
  BUF_COL[i * 3]     = cr;
  BUF_COL[i * 3 + 1] = cg;
  BUF_COL[i * 3 + 2] = cb;

  const s     = Math.random();
  BUF_SIZ[i] = s < 0.86 ? 0.35 + s * 1.0 : 1.6 + Math.pow(s - 0.86, 0.6) * 12;
  BUF_DEP[i] = rNorm;
  BUF_PHA[i] = Math.random() * Math.PI * 2;
  BUF_SPD[i] = 0.2 + Math.random() * 1.5;
}

/* ─── Static star field — only uTime drives a gentle twinkle ─── */
function WorkStars() {
  const matRef   = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const vertexShader = /* glsl */`
    attribute float aSize;
    attribute vec3  aColor;
    attribute float aDepth;
    attribute float aPhase;
    attribute float aSpeed;
    uniform  float  uTime;
    varying  vec3   vColor;
    varying  float  vAlpha;
    varying  float  vDepth;

    void main() {
      vec4  mvPos   = modelViewMatrix * vec4(position, 1.0);
      float twinkle = sin(uTime * aSpeed + aPhase) * 0.42 + 0.58;
      float sz      = aSize * twinkle * (300.0 / max(0.1, -mvPos.z));
      gl_PointSize  = clamp(sz, 0.4, 55.0);
      gl_Position   = projectionMatrix * mvPos;
      vColor = aColor;
      vDepth = aDepth;
      vAlpha = twinkle * (0.78 + (1.0 - aDepth) * 0.22);
    }
  `;

  const fragmentShader = /* glsl */`
    varying vec3  vColor;
    varying float vAlpha;
    varying float vDepth;

    void main() {
      vec2  uv   = gl_PointCoord - vec2(0.5);
      float d    = length(uv);
      if (d > 0.5) discard;
      float core = 1.0 - smoothstep(0.0, 0.085, d);
      float halo = (1.0 - smoothstep(0.06, 0.5, d)) * 0.55;
      float a    = core + halo * (0.75 + (1.0 - vDepth) * 0.3);
      vec3  c    = mix(vColor * 1.05, vColor * 0.85, smoothstep(0.0, 0.5, d));
      gl_FragColor = vec4(c, a * vAlpha);
    }
  `;

  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
  });

  useEffect(() => {
    const mat = matRef.current;
    return () => { mat?.dispose(); };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[BUF_POS, 3]} />
        <bufferAttribute attach="attributes-aColor"   args={[BUF_COL, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[BUF_SIZ, 1]} />
        <bufferAttribute attach="attributes-aDepth"   args={[BUF_DEP, 1]} />
        <bufferAttribute attach="attributes-aPhase"   args={[BUF_PHA, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[BUF_SPD, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function WorkStarsScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 46 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'default' }}
    >
      <WorkStars />
    </Canvas>
  );
}
