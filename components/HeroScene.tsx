'use client';

/* eslint-disable react-hooks/immutability --
   R3F idiomatically mutates refs, uniforms, camera, and material properties
   inside useFrame. The new react-hooks/immutability rule misfires on every
   line of an R3F render loop. */

import { useRef, useMemo, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
// (useThree retained for Nebula viewport sizing)
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Constants
═══════════════════════════════════════════════════════════ */
const STAR_COUNT  = 4500;
const SHARD_COUNT = 320;

/* ═══════════════════════════════════════════════════════════
   Stellar-temperature color sampler.
   Returns realistic colors weighted to match the actual
   distribution of visible stars (mostly A-F-G class).
   Per user direction: blue, white, yellow tints — no orange.
═══════════════════════════════════════════════════════════ */
function sampleStellarColor(): [number, number, number] {
  const t = Math.random();
  if (t < 0.05)  return [0.74, 0.81, 1.00]; // O-type — deep blue
  if (t < 0.18)  return [0.86, 0.92, 1.00]; // B-type — blue-white
  if (t < 0.62)  return [1.00, 1.00, 1.00]; // A/F   — pure white
  if (t < 0.85)  return [1.00, 0.98, 0.92]; // G     — warm-white
  return            [1.00, 0.95, 0.80];      // K-soft — yellow-tinted, NOT orange
}

/* ═══════════════════════════════════════════════════════════
   StarField — photoreal, multi-layer parallax stars
═══════════════════════════════════════════════════════════ */
interface StarBuffers {
  pos: Float32Array;
  col: Float32Array;
  siz: Float32Array;
  dep: Float32Array;
  pha: Float32Array;
  spd: Float32Array;
}

function buildStarBuffers(): StarBuffers {
  const pos = new Float32Array(STAR_COUNT * 3);
  const col = new Float32Array(STAR_COUNT * 3);
  const siz = new Float32Array(STAR_COUNT);
  const dep = new Float32Array(STAR_COUNT);
  const pha = new Float32Array(STAR_COUNT);
  const spd = new Float32Array(STAR_COUNT);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Thick spherical shell so stars feel volumetric, not flat
    const rNorm = Math.random();
    const r     = 8 + rNorm * 42;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);

    const [cr, cg, cb] = sampleStellarColor();
    col[i * 3]     = cr;
    col[i * 3 + 1] = cg;
    col[i * 3 + 2] = cb;

    // Power-law size distribution — most stars tiny, a few brilliant
    const s = Math.random();
    siz[i] = s < 0.86
      ? 0.45 + s * 1.4
      : 2.2 + Math.pow(s - 0.86, 0.6) * 22;

    dep[i] = rNorm;                               // 0 = near, 1 = far
    pha[i] = Math.random() * Math.PI * 2;
    spd[i] = 0.28 + Math.random() * 2.4;
  }
  return { pos, col, siz, dep, pha, spd };
}

const STAR_BUFFERS = buildStarBuffers();

function StarField({
  scrollRef,
  mouseRef,
}: {
  scrollRef: MutableRefObject<number>;
  mouseRef:  MutableRefObject<{ x: number; y: number }>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef    = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uScroll: { value: 0 },
    uMouse:  { value: new THREE.Vector2(0, 0) },
  }), []);

  const vertexShader = /* glsl */`
    attribute float aSize;
    attribute vec3  aColor;
    attribute float aDepth;
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uScroll;
    uniform vec2  uMouse;
    varying vec3  vColor;
    varying float vAlpha;
    varying float vDepth;

    void main() {
      vec3 pos = position;

      // Mouse parallax — near stars sweep more
      float nearWeight = 1.0 - aDepth;
      pos.x += uMouse.x * nearWeight * 1.4;
      pos.y += uMouse.y * nearWeight * 0.9;

      // Scroll: near stars drift up; everything also pulls toward camera
      pos.y += uScroll * (0.4 + nearWeight * 4.6);
      pos.z += uScroll * nearWeight * 5.5;

      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

      // Twinkle modulates both size and alpha
      float twinkle = sin(uTime * aSpeed + aPhase) * 0.42 + 0.58;

      // Scroll brightens stars (warp feel)
      float boost = 1.0 + uScroll * 1.5;

      float perspSize = aSize * twinkle * boost * (340.0 / max(0.1, -mvPos.z));
      gl_PointSize = clamp(perspSize, 0.55, 100.0);
      gl_Position  = projectionMatrix * mvPos;

      vColor = aColor;
      vAlpha = twinkle * (0.78 + nearWeight * 0.22);
      vDepth = aDepth;
    }
  `;

  const fragmentShader = /* glsl */`
    varying vec3  vColor;
    varying float vAlpha;
    varying float vDepth;

    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;

      // Two-zone falloff: tight bright core + soft halo
      float core = 1.0 - smoothstep(0.0, 0.085, d);
      float halo = (1.0 - smoothstep(0.06, 0.5, d)) * 0.55;
      float a    = (core + halo * (0.75 + (1.0 - vDepth) * 0.3));

      // Subtle chromatic warmth toward the halo edge — sells "real lens"
      vec3 c = mix(vColor * 1.05, vColor * 0.85, smoothstep(0.0, 0.5, d));

      gl_FragColor = vec4(c, a * vAlpha);
    }
  `;

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uScroll.value +=
        (scrollRef.current - mat.uniforms.uScroll.value) * 0.06;
      const m = mat.uniforms.uMouse.value as THREE.Vector2;
      m.x += (mouseRef.current.x - m.x) * 0.05;
      m.y += (mouseRef.current.y - m.y) * 0.05;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.006;
      pointsRef.current.rotation.x  = Math.sin(Date.now() * 0.00006) * 0.04;
    }
  });

  useEffect(() => {
    const mat = matRef.current;
    return () => { mat?.dispose(); };
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[STAR_BUFFERS.pos, 3]} />
        <bufferAttribute attach="attributes-aColor"   args={[STAR_BUFFERS.col, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[STAR_BUFFERS.siz, 1]} />
        <bufferAttribute attach="attributes-aDepth"   args={[STAR_BUFFERS.dep, 1]} />
        <bufferAttribute attach="attributes-aPhase"   args={[STAR_BUFFERS.pha, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[STAR_BUFFERS.spd, 1]} />
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

/* ═══════════════════════════════════════════════════════════
   Nebula — full-screen far plane with multi-octave noise.
   Subtle photoreal gas clouds. Monochrome (gray/white on void).
═══════════════════════════════════════════════════════════ */
function Nebula({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uScroll: { value: 0 },
  }), []);

  const vertexShader = /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = /* glsl */`
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScroll;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p  = rot * p * 2.07;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      // Drifting field — extremely slow
      vec2 uv = vUv * 2.4 + vec2(uTime * 0.004, uTime * 0.002);

      float n1 = fbm(uv);
      float n2 = fbm(uv * 1.6 + vec2(8.3, -3.1));
      float cloud = n1 * (0.55 + n2 * 0.6);

      // Asymmetric density pockets to mimic Hubble-style imagery
      vec2 hot1 = vec2(0.22, 0.72);
      vec2 hot2 = vec2(0.80, 0.26);
      vec2 hot3 = vec2(0.55, 0.50);
      float m1  = smoothstep(0.55, 0.0, distance(vUv, hot1));
      float m2  = smoothstep(0.50, 0.0, distance(vUv, hot2)) * 0.7;
      float m3  = smoothstep(0.35, 0.0, distance(vUv, hot3)) * 0.4;
      float mask = max(max(m1, m2), m3);

      float density = pow(cloud, 1.6) * mask * (0.55 + uScroll * 0.35);

      // Tinted monochrome: bright clouds are slightly cool white;
      // dim regions fall to pure black void
      vec3 brightTint = vec3(0.86, 0.89, 0.96);
      vec3 dimTint    = vec3(0.05, 0.06, 0.08);
      vec3 col        = mix(dimTint, brightTint, density);

      // Subtle star-dust grain
      float grain = (hash(vUv * 1500.0) - 0.5) * 0.025;
      col += grain;

      gl_FragColor = vec4(col, density * 0.92);
    }
  `;

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uScroll.value +=
        (scrollRef.current - mat.uniforms.uScroll.value) * 0.05;
    }
  });

  useEffect(() => {
    const mat = matRef.current;
    return () => { mat?.dispose(); };
  }, []);

  return (
    <mesh position={[0, 0, -34]} renderOrder={-10}>
      <planeGeometry args={[viewport.width * 14, viewport.height * 14]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   Simplex 3D noise GLSL (Ashima) — injected into hero form
═══════════════════════════════════════════════════════════ */
const SIMPLEX_GLSL = /* glsl */`
  vec4 _permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 _taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = _permute(_permute(_permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = _taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

/* ═══════════════════════════════════════════════════════════
   HeroForm — displaced PBR icosahedron with proper normal
   recomputation. Reacts dramatically to scroll.
═══════════════════════════════════════════════════════════ */
interface DisplacementUniforms {
  uTime:    { value: number };
  uDistort: { value: number };
  uSpeed:   { value: number };
  uScroll:  { value: number };
  uExplode: { value: number };
}

function createDisplacedMaterial(): {
  material: THREE.MeshStandardMaterial;
  uniforms: DisplacementUniforms;
} {
  const material = new THREE.MeshStandardMaterial({
    color:           new THREE.Color('#f0f2f5'),
    metalness:       0.96,
    roughness:       0.18,
    envMapIntensity: 2.1,
  });

  const uniforms: DisplacementUniforms = {
    uTime:    { value: 0 },
    uDistort: { value: 0.16 },
    uSpeed:   { value: 1.2 },
    uScroll:  { value: 0 },
    uExplode: { value: 0 },
  };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime    = uniforms.uTime;
    shader.uniforms.uDistort = uniforms.uDistort;
    shader.uniforms.uSpeed   = uniforms.uSpeed;
    shader.uniforms.uScroll  = uniforms.uScroll;
    shader.uniforms.uExplode = uniforms.uExplode;

    // Inject helpers at the very top of the vertex shader
    shader.vertexShader = `
      uniform float uTime;
      uniform float uDistort;
      uniform float uSpeed;
      uniform float uScroll;
      uniform float uExplode;
      ${SIMPLEX_GLSL}

      float getDisp(vec3 p, float t) {
        float n1 = snoise(p * 1.15 + vec3(t * 0.18));
        float n2 = snoise(p * 2.7  + vec3(t * 0.32 + 17.3));
        float n3 = snoise(p * 5.4  + vec3(t * 0.55 - 11.7));
        return n1 * 0.62 + n2 * 0.28 + n3 * 0.10;
      }

      vec3 computeDisplacedNormal(vec3 pos, vec3 nrm, float t, float amp) {
        vec3 up = abs(nrm.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 tang  = normalize(cross(nrm, up));
        vec3 bitan = cross(nrm, tang);
        float eps = 0.045;
        float d0 = getDisp(pos, t);
        float dT = getDisp(pos + tang  * eps, t);
        float dB = getDisp(pos + bitan * eps, t);
        vec3 p0 = pos + nrm * d0 * amp;
        vec3 pT = (pos + tang  * eps) + nrm * dT * amp;
        vec3 pB = (pos + bitan * eps) + nrm * dB * amp;
        return normalize(cross(pB - p0, pT - p0));
      }
      ${shader.vertexShader}
    `;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      /* glsl */`
        float _t   = uTime * uSpeed;
        float _amp = uDistort * (1.0 + uScroll * 2.2);
        vec3 objectNormal = computeDisplacedNormal(position, normal, _t, _amp);
        #ifdef USE_TANGENT
          vec3 objectTangent = vec3(tangent.xyz);
        #endif
      `,
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      /* glsl */`
        float _d = getDisp(position, _t);
        // Explode mode — vertices fly along original normal at high scroll
        vec3 transformed = position
          + normal * _d * _amp
          + normal * uExplode * (0.55 + snoise(position * 3.1) * 0.35);
      `,
    );
  };

  return { material, uniforms };
}

function HeroForm({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const meshRef    = useRef<THREE.Mesh>(null);
  const innerRef   = useRef<THREE.Mesh>(null);
  const haloRef    = useRef<THREE.Mesh>(null);

  const { material, uniforms } = useMemo(() => createDisplacedMaterial(), []);
  const inner = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      color:        new THREE.Color('#ffffff'),
      transparent:  true,
      opacity:      0.0,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
    });
    return mat;
  }, []);
  const halo = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color:        new THREE.Color('#ffffff'),
      transparent:  true,
      opacity:      0.045,
      side:         THREE.BackSide,
      blending:     THREE.AdditiveBlending,
      depthWrite:   false,
    });
  }, []);

  const geo = useMemo(() => new THREE.IcosahedronGeometry(1.4, 5), []);
  const innerGeo = useMemo(() => new THREE.IcosahedronGeometry(1.32, 3), []);
  const haloGeo  = useMemo(() => new THREE.SphereGeometry(2.2, 48, 48), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;

    uniforms.uTime.value    = t;
    uniforms.uScroll.value += (s - uniforms.uScroll.value) * 0.07;
    uniforms.uSpeed.value   = 1.1 + s * 4.0;
    uniforms.uDistort.value = 0.16 + Math.pow(s, 1.4) * 0.55;

    // Past ~75% scroll, vertices begin pulling apart
    const explodeTarget = Math.max(0, (s - 0.62) / 0.38);
    uniforms.uExplode.value +=
      (explodeTarget * 0.9 - uniforms.uExplode.value) * 0.08;

    if (meshRef.current) {
      meshRef.current.rotation.x  = t * 0.12 + s * 1.4;
      meshRef.current.rotation.y  = t * 0.22 + s * 2.6;
      meshRef.current.rotation.z  = s * 0.7;
      meshRef.current.scale.setScalar(1 + s * 0.42);
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = -t * 0.18 - s * 1.0;
      innerRef.current.rotation.y =  t * 0.14 + s * 1.6;
      // Inner glow blooms as the outer shell distorts more
      inner.opacity = 0.05 + s * 0.42;
      innerRef.current.scale.setScalar(0.78 + s * 0.18);
    }
    if (haloRef.current) {
      haloRef.current.scale.setScalar(1 + Math.sin(t * 0.55) * 0.02 + s * 0.25);
      halo.opacity = 0.045 + s * 0.05;
    }
  });

  useEffect(() => {
    return () => {
      material.dispose();
      inner.dispose();
      halo.dispose();
      geo.dispose();
      innerGeo.dispose();
      haloGeo.dispose();
    };
  }, [material, inner, halo, geo, innerGeo, haloGeo]);

  return (
    <group>
      {/* Outer displaced PBR shell */}
      <mesh ref={meshRef} geometry={geo}>
        <primitive object={material} attach="material" />
      </mesh>

      {/* Inner glow core — blooms with scroll */}
      <mesh ref={innerRef} geometry={innerGeo}>
        <primitive object={inner} attach="material" />
      </mesh>

      {/* Soft outer halo — fresnel-feel atmosphere */}
      <mesh ref={haloRef} geometry={haloGeo}>
        <primitive object={halo} attach="material" />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Shards — particle field that emerges + drifts outward
   as the hero form pulls apart.
═══════════════════════════════════════════════════════════ */
interface ShardBuffers {
  pos: Float32Array;
  dir: Float32Array;
  pha: Float32Array;
  spd: Float32Array;
}

function buildShardBuffers(): ShardBuffers {
  const pos = new Float32Array(SHARD_COUNT * 3);
  const dir = new Float32Array(SHARD_COUNT * 3);
  const pha = new Float32Array(SHARD_COUNT);
  const spd = new Float32Array(SHARD_COUNT);
  for (let i = 0; i < SHARD_COUNT; i++) {
    const r     = 1.5 + Math.random() * 0.4;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    pos[i * 3]     = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    // Outward unit vector — used by shader to project drift
    const inv = 1 / Math.hypot(x, y, z);
    dir[i * 3]     = x * inv;
    dir[i * 3 + 1] = y * inv;
    dir[i * 3 + 2] = z * inv;
    pha[i] = Math.random() * Math.PI * 2;
    spd[i] = 0.45 + Math.random() * 1.7;
  }
  return { pos, dir, pha, spd };
}

const SHARD_BUFFERS = buildShardBuffers();

function Shards({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uScroll: { value: 0 },
  }), []);

  const vertexShader = /* glsl */`
    attribute vec3  aDir;
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uScroll;
    varying float vAlpha;
    void main() {
      vec3 pos = position;
      // Emerge after 55% scroll
      float emerge = smoothstep(0.55, 0.95, uScroll);
      float drift  = emerge * (1.2 + sin(uTime * aSpeed + aPhase) * 0.25);
      pos += aDir * drift * (2.2 + uScroll * 2.0);
      vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (1.4 + emerge * 4.0) * (200.0 / max(0.1, -mvPos.z));
      gl_Position  = projectionMatrix * mvPos;
      vAlpha = emerge * (0.45 + 0.55 * sin(uTime * aSpeed * 1.4 + aPhase));
    }
  `;

  const fragmentShader = /* glsl */`
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;
      float core = 1.0 - smoothstep(0.0, 0.1, d);
      float halo = (1.0 - smoothstep(0.08, 0.5, d)) * 0.45;
      gl_FragColor = vec4(vec3(1.0), (core + halo) * vAlpha);
    }
  `;

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uScroll.value +=
        (scrollRef.current - mat.uniforms.uScroll.value) * 0.07;
    }
  });

  useEffect(() => {
    const mat = matRef.current;
    return () => { mat?.dispose(); };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[SHARD_BUFFERS.pos, 3]} />
        <bufferAttribute attach="attributes-aDir"     args={[SHARD_BUFFERS.dir, 3]} />
        <bufferAttribute attach="attributes-aPhase"   args={[SHARD_BUFFERS.pha, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[SHARD_BUFFERS.spd, 1]} />
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

/* ═══════════════════════════════════════════════════════════
   ShootingStars — rare, sharp white streaks
═══════════════════════════════════════════════════════════ */
interface StreakData {
  line:    THREE.Line;
  geo:     THREE.BufferGeometry;
  mat:     THREE.LineBasicMaterial;
  active:  boolean;
  pos:     THREE.Vector3;
  vel:     THREE.Vector3;
  life:    number;
  maxLife: number;
}

const _tempDir = new THREE.Vector3();

function spawnStreak(s: StreakData): void {
  s.active  = true;
  s.life    = 0;
  s.maxLife = 0.42 + Math.random() * 0.78;
  const angle = -0.18 + Math.random() * 0.12;
  const speed = 16 + Math.random() * 20;
  s.pos.set(-19 + Math.random() * 4, 5 + (Math.random() * 9 - 4.5), -2 - Math.random() * 6);
  s.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed * 0.3, 0);
}

function ShootingStars() {
  const groupRef  = useRef<THREE.Group>(null);
  const dataRef   = useRef<StreakData[]>([]);
  const elapsed   = useRef(0);
  const nextSpawn = useRef(0);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    nextSpawn.current = 1.2 + Math.random() * 3.5;

    for (let i = 0; i < 5; i++) {
      const geo  = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
      const mat  = new THREE.LineBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0, depthWrite: false,
      });
      const line = new THREE.Line(geo, mat);
      group.add(line);
      dataRef.current.push({
        line, geo, mat,
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0, maxLife: 0,
      });
    }

    const groupCapture = group;
    const dataCapture  = dataRef.current.slice();
    return () => {
      dataCapture.forEach(({ line, geo, mat }) => {
        groupCapture.remove(line);
        geo.dispose();
        mat.dispose();
      });
      dataRef.current = [];
    };
  }, []);

  useFrame((_, delta) => {
    elapsed.current += delta;
    if (elapsed.current >= nextSpawn.current) {
      const inactive = dataRef.current.find(s => !s.active);
      if (inactive) spawnStreak(inactive);
      nextSpawn.current = elapsed.current + 1.5 + Math.random() * 6.5;
    }
    for (const s of dataRef.current) {
      if (!s.active) continue;
      s.life += delta;
      s.pos.addScaledVector(s.vel, delta);

      const p = s.life / s.maxLife;
      s.mat.opacity = p < 0.12 ? p / 0.12 : 1 - (p - 0.12) / 0.88;

      _tempDir.copy(s.vel).normalize();
      const trail = 1.2 + s.vel.length() * 0.06;
      const arr = s.geo.attributes.position.array as Float32Array;
      arr[0] = s.pos.x; arr[1] = s.pos.y; arr[2] = s.pos.z;
      arr[3] = s.pos.x - _tempDir.x * trail;
      arr[4] = s.pos.y - _tempDir.y * trail;
      arr[5] = s.pos.z - _tempDir.z * trail;
      s.geo.attributes.position.needsUpdate = true;

      if (s.life >= s.maxLife) { s.active = false; s.mat.opacity = 0; }
    }
  });

  return <group ref={groupRef} />;
}

/* ═══════════════════════════════════════════════════════════
   Lighting — studio render feel.
   Subtle blue-white ambient + sharp top-right key + dim
   bottom-left cool fill, plus one slow-moving rim so the
   icosahedron's chrome reads as alive without going cartoon.
═══════════════════════════════════════════════════════════ */
function SceneLighting({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const rimRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    if (rimRef.current) {
      rimRef.current.position.set(
        Math.cos(t * 0.28) * 4.2,
        2.4 + Math.sin(t * 0.24) * 1.4,
        Math.sin(t * 0.36) * 3.0,
      );
      rimRef.current.intensity = 1.3 + s * 0.7;
    }
  });

  return (
    <>
      <ambientLight intensity={0.26} color="#d8e2f0" />
      <directionalLight position={[ 6,  5,  4]} intensity={1.65} color="#ffffff" />
      <directionalLight position={[-4, -2, -3]} intensity={0.55} color="#a8b8d0" />
      <pointLight ref={rimRef} color="#ffffff" intensity={1.3} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Mouse capture — feeds parallax into the star shader
═══════════════════════════════════════════════════════════ */
function MouseCapture({
  mouseRef,
}: {
  mouseRef: MutableRefObject<{ x: number; y: number }>;
}) {
  useEffect(() => {
    // Listen on window so touch scroll never gets blocked by the canvas
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = ((e.clientX / window.innerWidth)  * 2 - 1);
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [mouseRef]);
  return null;
}

/* ═══════════════════════════════════════════════════════════
   HeroScene — root Canvas
═══════════════════════════════════════════════════════════ */
interface HeroSceneProps {
  scrollRef: MutableRefObject<number>;
}

export default function HeroScene({ scrollRef }: HeroSceneProps) {
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 46 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <color attach="background" args={['#000003']} />
      {/* Studio env gives the icosahedron real reflections.
          We hide its background — only its lighting contributes. */}
      <Environment preset="studio" environmentIntensity={0.55} />

      <MouseCapture  mouseRef={mouseRef} />
      <SceneLighting scrollRef={scrollRef} />
      <Nebula        scrollRef={scrollRef} />
      <StarField     scrollRef={scrollRef} mouseRef={mouseRef} />
      <ShootingStars />
      <HeroForm      scrollRef={scrollRef} />
      <Shards        scrollRef={scrollRef} />
    </Canvas>
  );
}
