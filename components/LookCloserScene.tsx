'use client';

/* eslint-disable react-hooks/immutability --
   R3F idiomatically mutates refs, uniforms, camera, and material properties
   inside useFrame. The new react-hooks/immutability rule misfires on every
   line of an R3F render loop. */

import { useRef, useMemo, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ═══════════════════════════════════════════════════════════
   Util — smoothstep & easeOutCubic
═══════════════════════════════════════════════════════════ */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

/* ═══════════════════════════════════════════════════════════
   Atmospheric motes — slow, drifting dust
═══════════════════════════════════════════════════════════ */
const MOTE_COUNT = 320;

function buildMoteBuffers() {
  const pos = new Float32Array(MOTE_COUNT * 3);
  const pha = new Float32Array(MOTE_COUNT);
  const spd = new Float32Array(MOTE_COUNT);
  for (let i = 0; i < MOTE_COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 18;
    pos[i * 3 + 1] = Math.random() * 8 - 3;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    pha[i] = Math.random() * Math.PI * 2;
    spd[i] = 0.18 + Math.random() * 0.42;
  }
  return { pos, pha, spd };
}
const MOTE_BUFFERS = buildMoteBuffers();

function Motes() {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  const vertexShader = /* glsl */`
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    varying float vAlpha;
    void main() {
      vec3 pos = position;
      pos.y = mod(pos.y + uTime * aSpeed * 0.18, 9.0) - 3.0;
      pos.x += sin(uTime * aSpeed * 0.25 + aPhase) * 0.18;
      pos.z += cos(uTime * aSpeed * 0.2  + aPhase) * 0.18;
      vec4 mv = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = (1.0 + sin(uTime + aPhase) * 0.4) * (90.0 / max(0.1, -mv.z));
      gl_Position = projectionMatrix * mv;
      vAlpha = 0.18 + 0.22 * sin(uTime * aSpeed + aPhase);
    }
  `;

  const fragmentShader = /* glsl */`
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;
      float a = (1.0 - smoothstep(0.05, 0.5, d)) * vAlpha;
      gl_FragColor = vec4(vec3(0.95), a);
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
        <bufferAttribute attach="attributes-position" args={[MOTE_BUFFERS.pos, 3]} />
        <bufferAttribute attach="attributes-aPhase"   args={[MOTE_BUFFERS.pha, 1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[MOTE_BUFFERS.spd, 1]} />
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
   Ring + blade group — flies in, locks at scroll milestone.
   Now using MeshPhysicalMaterial with clearcoat for studio
   product-render reflections.
═══════════════════════════════════════════════════════════ */
function RingAssembly({
  yPos,
  radius,
  thickness,
  bladeCount,
  bladeHeight,
  lockAt,
  fromOffset,
  rotationSpeed,
  scrollRef,
}: {
  yPos: number;
  radius: number;
  thickness: number;
  bladeCount: number;
  bladeHeight: number;
  lockAt: number;
  fromOffset: [number, number, number];
  rotationSpeed: number;
  scrollRef: MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef  = useRef<THREE.Mesh>(null);

  // Smoother geometry — 64 radial segments minimum, 192 tubular for the rings
  const ringGeo  = useMemo(
    () => new THREE.TorusGeometry(radius, thickness, 64, 192),
    [radius, thickness],
  );
  const bladeGeo = useMemo(
    () => new THREE.BoxGeometry(0.09, bladeHeight, 0.24),
    [bladeHeight],
  );

  // Chrome — clearcoat physical material reads as real machined metal
  const ringMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#fbfcff'),
    metalness:          1.0,
    roughness:          0.05,
    envMapIntensity:    2.0,
    clearcoat:          1.0,
    clearcoatRoughness: 0.1,
  }), []);

  // Blades — slightly darker, still polished
  const bladeMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#1a1a1c'),
    metalness:          0.8,
    roughness:          0.2,
    envMapIntensity:    1.5,
    clearcoat:          0.8,
    clearcoatRoughness: 0.15,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    const assembled = easeOutCubic(smoothstep(lockAt - 0.10, lockAt, s));
    const visible   = smoothstep(lockAt - 0.15, lockAt - 0.02, s);
    if (groupRef.current) {
      const inv = 1 - assembled;
      groupRef.current.position.set(
        fromOffset[0] * inv * 6,
        yPos + fromOffset[1] * inv * 5,
        fromOffset[2] * inv * 6,
      );
      groupRef.current.scale.setScalar(assembled);
      groupRef.current.rotation.y = t * rotationSpeed + s * Math.PI * 0.3;
      groupRef.current.rotation.x = (1 - assembled) * 0.6;
    }
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshPhysicalMaterial;
      mat.opacity = visible;
      mat.transparent = visible < 1;
    }
  });

  useEffect(() => {
    return () => {
      ringGeo.dispose();
      bladeGeo.dispose();
      ringMat.dispose();
      bladeMat.dispose();
    };
  }, [ringGeo, bladeGeo, ringMat, bladeMat]);

  const bladePositions = useMemo(() => {
    return Array.from({ length: bladeCount }, (_, i) => {
      const a = (i / bladeCount) * Math.PI * 2;
      return {
        x:   Math.cos(a) * radius,
        z:   Math.sin(a) * radius,
        rot: a,
      };
    });
  }, [bladeCount, radius]);

  return (
    <group ref={groupRef}>
      <mesh ref={ringRef} geometry={ringGeo} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <primitive object={ringMat} attach="material" />
      </mesh>
      {bladePositions.map((p, i) => (
        <mesh
          key={i}
          geometry={bladeGeo}
          position={[p.x, 0, p.z]}
          rotation={[0, -p.rot, 0]}
          castShadow
          receiveShadow
        >
          <primitive object={bladeMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Central column — bumped to 96 radial segments
═══════════════════════════════════════════════════════════ */
function Column({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geo  = useMemo(() => new THREE.CylinderGeometry(0.16, 0.16, 5.0, 96, 1), []);
  const mat  = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#ffffff'),
    metalness:          1.0,
    roughness:          0.05,
    envMapIntensity:    2.0,
    clearcoat:          1.0,
    clearcoatRoughness: 0.08,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    const assembled = easeOutCubic(smoothstep(0, 0.06, s));
    if (meshRef.current) {
      meshRef.current.scale.y = assembled;
      meshRef.current.position.y = -0.2 + (1 - assembled) * -3.5;
      meshRef.current.rotation.y = t * 0.16 + s * 0.5;
    }
  });

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [geo, mat]);

  return (
    <mesh ref={meshRef} geometry={geo} position={[0, -0.2, 0]} castShadow receiveShadow>
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   Crown — icosahedron on top of column. Now physical w/ clearcoat.
═══════════════════════════════════════════════════════════ */
function Crown({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);

  const geo  = useMemo(() => new THREE.IcosahedronGeometry(0.52, 1), []);
  const mat  = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#ffffff'),
    metalness:          1.0,
    roughness:          0.05,
    envMapIntensity:    2.4,
    clearcoat:          1.0,
    clearcoatRoughness: 0.06,
  }), []);
  const wireGeo = useMemo(() => new THREE.IcosahedronGeometry(0.68, 1), []);
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({
    color:        new THREE.Color('#ffffff'),
    wireframe:    true,
    transparent:  true,
    opacity:      0.32,
    depthWrite:   false,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    const assembled = easeOutCubic(smoothstep(0.62, 0.74, s));
    if (meshRef.current) {
      meshRef.current.position.y = 2.55 + (1 - assembled) * 5.0;
      meshRef.current.scale.setScalar(assembled);
      meshRef.current.rotation.x = t * 0.5 + s * 1.4;
      meshRef.current.rotation.y = t * 0.7 + s * 1.8;
    }
    if (wireRef.current) {
      wireRef.current.position.y = 2.55 + (1 - assembled) * 5.0;
      wireRef.current.scale.setScalar(assembled * 1.05);
      wireRef.current.rotation.x = -t * 0.4;
      wireRef.current.rotation.y =  t * 0.6;
    }
  });

  useEffect(() => {
    return () => {
      geo.dispose();
      mat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
    };
  }, [geo, mat, wireGeo, wireMat]);

  return (
    <group>
      <mesh ref={meshRef} geometry={geo} castShadow receiveShadow>
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh ref={wireRef} geometry={wireGeo}>
        <primitive object={wireMat} attach="material" />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   ExpandingRing — thin glowing torus that scales outward
   Smoother torus, 192 tubular segments
═══════════════════════════════════════════════════════════ */
function ExpandingRing({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef  = useRef<THREE.MeshBasicMaterial>(null);
  const geo = useMemo(() => new THREE.TorusGeometry(1, 0.018, 24, 192), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    const fire = smoothstep(0.62, 0.92, s);
    if (meshRef.current) {
      const scale = 0.5 + fire * 3.6;
      meshRef.current.scale.setScalar(scale);
      meshRef.current.rotation.y = t * 0.18;
    }
    if (matRef.current) {
      matRef.current.opacity =
        fire * 0.75 * (1 - smoothstep(0.94, 1.0, s) * 0.55);
    }
  });

  useEffect(() => () => { geo.dispose(); }, [geo]);

  return (
    <mesh ref={meshRef} geometry={geo} rotation={[Math.PI / 2, 0, 0]}>
      <meshBasicMaterial
        ref={matRef}
        color={0xffffff}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   ParticleBurst — 3x particles (840) for a much bigger pop
═══════════════════════════════════════════════════════════ */
const BURST_COUNT = 840;

function buildBurstBuffers() {
  const pos = new Float32Array(BURST_COUNT * 3);
  const dir = new Float32Array(BURST_COUNT * 3);
  const spd = new Float32Array(BURST_COUNT);
  const pha = new Float32Array(BURST_COUNT);
  for (let i = 0; i < BURST_COUNT; i++) {
    pos[i * 3]     = 0;
    pos[i * 3 + 1] = 0.3 + Math.random() * 0.4;
    pos[i * 3 + 2] = 0;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    dir[i * 3]     = Math.sin(phi) * Math.cos(theta);
    dir[i * 3 + 1] = Math.sin(phi) * Math.sin(theta);
    dir[i * 3 + 2] = Math.cos(phi);
    spd[i] = 0.6 + Math.random() * 1.6;
    pha[i] = Math.random() * Math.PI * 2;
  }
  return { pos, dir, spd, pha };
}
const BURST_BUFFERS = buildBurstBuffers();

function ParticleBurst({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime:   { value: 0 },
    uScroll: { value: 0 },
  }), []);

  const vertexShader = /* glsl */`
    attribute vec3  aDir;
    attribute float aSpeed;
    attribute float aPhase;
    uniform float uTime;
    uniform float uScroll;
    varying float vAlpha;
    void main() {
      float fire = smoothstep(0.76, 0.98, uScroll);
      float reach = fire * (3.2 + uScroll * 6.0);
      vec3 p = position
        + aDir * reach * aSpeed
        + vec3(0.0, sin(uTime * 0.6 + aPhase) * 0.06, 0.0);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = (2.4 + fire * 6.0) * (240.0 / max(0.1, -mv.z));
      gl_Position = projectionMatrix * mv;
      vAlpha = fire * (1.0 - smoothstep(0.96, 1.0, uScroll) * 0.45);
    }
  `;

  const fragmentShader = /* glsl */`
    varying float vAlpha;
    void main() {
      vec2 uv = gl_PointCoord - vec2(0.5);
      float d = length(uv);
      if (d > 0.5) discard;
      float core = 1.0 - smoothstep(0.0, 0.1, d);
      float halo = (1.0 - smoothstep(0.08, 0.5, d)) * 0.55;
      gl_FragColor = vec4(vec3(1.0), (core + halo) * vAlpha);
    }
  `;

  useFrame((_, delta) => {
    const mat = matRef.current;
    if (mat) {
      mat.uniforms.uTime.value += delta;
      mat.uniforms.uScroll.value +=
        (scrollRef.current - mat.uniforms.uScroll.value) * 0.08;
    }
  });

  useEffect(() => {
    const mat = matRef.current;
    return () => { mat?.dispose(); };
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[BURST_BUFFERS.pos, 3]} />
        <bufferAttribute attach="attributes-aDir"     args={[BURST_BUFFERS.dir, 3]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[BURST_BUFFERS.spd, 1]} />
        <bufferAttribute attach="attributes-aPhase"   args={[BURST_BUFFERS.pha, 1]} />
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
   Satellites — 4 octahedra orbiting the structure
═══════════════════════════════════════════════════════════ */
interface SatelliteDef {
  offset: number;
  radius: number;
  speed:  number;
  yBase:  number;
  yAmp:   number;
}

const SATELLITES: SatelliteDef[] = [
  { offset: 0,                   radius: 2.7,  speed:  0.6,  yBase:  0.2, yAmp: 0.28 },
  { offset: Math.PI * 0.5,       radius: 2.4,  speed: -0.55, yBase: -0.4, yAmp: 0.22 },
  { offset: Math.PI,             radius: 2.95, speed:  0.72, yBase:  0.8, yAmp: 0.34 },
  { offset: Math.PI * 1.5,       radius: 2.55, speed: -0.42, yBase: -0.1, yAmp: 0.30 },
];

function Satellites({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const geo = useMemo(() => new THREE.OctahedronGeometry(0.13, 0), []);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color:              new THREE.Color('#ffffff'),
    metalness:          1.0,
    roughness:          0.05,
    envMapIntensity:    2.0,
    clearcoat:          1.0,
    clearcoatRoughness: 0.1,
  }), []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    const visible = easeOutCubic(smoothstep(0.08, 0.32, s));
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        const sat = SATELLITES[i];
        const angle = sat.offset + t * sat.speed + s * 0.6;
        const m = child as THREE.Mesh;
        m.position.set(
          Math.cos(angle) * sat.radius * visible,
          sat.yBase + Math.sin(t * sat.speed * 1.4 + sat.offset) * sat.yAmp,
          Math.sin(angle) * sat.radius * visible,
        );
        m.rotation.x = t * 0.7 + i;
        m.rotation.y = t * 0.5;
        m.scale.setScalar(visible);
      });
    }
  });

  useEffect(() => {
    return () => { geo.dispose(); mat.dispose(); };
  }, [geo, mat]);

  return (
    <group ref={groupRef}>
      {SATELLITES.map((_, i) => (
        <mesh key={i} geometry={geo} castShadow>
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Floor — reflective mirror plate (receives shadows)
═══════════════════════════════════════════════════════════ */
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.85, 0]} receiveShadow>
      <planeGeometry args={[44, 44]} />
      <MeshReflectorMaterial
        blur={[260, 100]}
        resolution={1024}
        mixBlur={1.1}
        mixStrength={56}
        roughness={0.88}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#060608"
        metalness={0.65}
        mirror={0.45}
      />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════
   Structure — drag-rotation wrapper + slow scroll-driven rotation
═══════════════════════════════════════════════════════════ */
function Structure({
  scrollRef,
  dragRef,
}: {
  scrollRef: MutableRefObject<number>;
  dragRef:   MutableRefObject<number>;
}) {
  const wrapRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const s = scrollRef.current;
    if (wrapRef.current) {
      // Whole-scene scroll-driven rotation: slow majestic spin
      wrapRef.current.rotation.y = t * 0.18 + s * Math.PI * 0.6 + dragRef.current;
      wrapRef.current.rotation.x = Math.sin(t * 0.35) * 0.04 + s * 0.08;
      wrapRef.current.position.y = -0.3 + Math.sin(t * 0.4) * 0.08;
    }
  });

  return (
    <group ref={wrapRef}>
      <Column scrollRef={scrollRef} />
      <RingAssembly
        yPos={-1.2}
        radius={1.85}
        thickness={0.06}
        bladeCount={8}
        bladeHeight={0.72}
        lockAt={0.18}
        fromOffset={[-1.6, 0.2, -0.9]}
        rotationSpeed={0.18}
        scrollRef={scrollRef}
      />
      <RingAssembly
        yPos={0.0}
        radius={1.35}
        thickness={0.05}
        bladeCount={10}
        bladeHeight={0.56}
        lockAt={0.32}
        fromOffset={[1.7, -0.1, 0.7]}
        rotationSpeed={-0.26}
        scrollRef={scrollRef}
      />
      <RingAssembly
        yPos={1.2}
        radius={0.94}
        thickness={0.04}
        bladeCount={12}
        bladeHeight={0.42}
        lockAt={0.48}
        fromOffset={[-0.5, 1.7, 0.55]}
        rotationSpeed={0.42}
        scrollRef={scrollRef}
      />
      <Crown      scrollRef={scrollRef} />
      <Satellites scrollRef={scrollRef} />
      <ExpandingRing  scrollRef={scrollRef} />
      <ParticleBurst  scrollRef={scrollRef} />
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   Camera dolly — same path, wider FOV preserved
═══════════════════════════════════════════════════════════ */
function CameraDolly({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const { camera } = useThree();

  useFrame(() => {
    const s = scrollRef.current;
    const zoom = 18 - 9 * easeOutCubic(smoothstep(0, 0.55, s));
    const orbitT = smoothstep(0.55, 0.95, s);
    const orbitAngle = orbitT * Math.PI * 0.5;
    const targetX = Math.sin(orbitAngle) * zoom * 0.5;
    const targetZ = Math.cos(orbitAngle) * zoom;
    const targetY = 0.8 + Math.sin(s * Math.PI) * 0.5;

    camera.position.x += (targetX - camera.position.x) * 0.09;
    camera.position.y += (targetY - camera.position.y) * 0.09;
    camera.position.z += (targetZ - camera.position.z) * 0.09;
    camera.lookAt(0, 0.3, 0);
  });

  return null;
}

/* ═══════════════════════════════════════════════════════════
   Drag handler — feeds delta into dragRef
═══════════════════════════════════════════════════════════ */
function DragControls({ dragRef }: { dragRef: MutableRefObject<number> }) {
  const { gl } = useThree();
  const dragging = useRef(false);
  const lastX = useRef(0);

  useEffect(() => {
    const el = gl.domElement;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      dragging.current = true;
      lastX.current = e.clientX;
      try { el.setPointerCapture(e.pointerId); } catch { /* noop */ }
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      dragRef.current += dx * 0.008;
    };
    const onUp = (e: PointerEvent) => {
      dragging.current = false;
      try { el.releasePointerCapture(e.pointerId); } catch { /* noop */ }
      el.style.cursor = 'grab';
    };

    el.style.cursor = 'grab';
    el.style.touchAction = 'pan-y';
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('pointerleave',  onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('pointerleave',  onUp);
      el.style.cursor = '';
    };
  }, [gl, dragRef]);

  return null;
}

/* ═══════════════════════════════════════════════════════════
   Lighting — cinematic studio:
     - Strong key spotlight from top with shadows
     - Blue rim light from behind (cold accent)
     - Warm white fill from below
     - Subtle ambient bounce
═══════════════════════════════════════════════════════════ */
function Lighting() {
  const spotRef = useRef<THREE.SpotLight>(null);

  useEffect(() => {
    if (spotRef.current) {
      // Configure shadow camera for a tight, sharp shadow
      spotRef.current.shadow.mapSize.set(2048, 2048);
      spotRef.current.shadow.camera.near = 1;
      spotRef.current.shadow.camera.far  = 30;
      spotRef.current.shadow.bias        = -0.0005;
      spotRef.current.shadow.radius      = 8;
    }
  }, []);

  return (
    <>
      {/* Soft ambient bounce — keeps shadow side from going pure black */}
      <ambientLight intensity={0.22} color="#d8e2f0" />

      {/* KEY — strong spotlight from top */}
      <spotLight
        ref={spotRef}
        position={[2, 10, 4]}
        intensity={3}
        angle={Math.PI / 5}
        penumbra={0.6}
        decay={1.4}
        color="#ffffff"
        castShadow
      />

      {/* RIM — blue cold accent from behind */}
      <directionalLight
        position={[-4, 3, -6]}
        intensity={0.5}
        color="#4488ff"
      />

      {/* FILL — warm white from below to lift the shadow side */}
      <directionalLight
        position={[0, -3, 4]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Secondary fill — slight cold from left side */}
      <pointLight position={[-3, 1, 2]} intensity={0.4} color="#a8b8d0" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   LookCloserScene — root Canvas with bloom postprocessing
═══════════════════════════════════════════════════════════ */
interface LookCloserSceneProps {
  scrollRef: MutableRefObject<number>;
  dragRef:   MutableRefObject<number>;
}

export default function LookCloserScene({ scrollRef, dragRef }: LookCloserSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 18], fov: 50 }}
      dpr={[1, 2]}
      shadows
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#040407']} />
      <fog   attach="fog"        args={['#040407', 12, 34]} />

      <Environment preset="city" environmentIntensity={0.5} />

      <DragControls dragRef={dragRef} />
      <CameraDolly  scrollRef={scrollRef} />
      <Lighting />
      <Floor />
      <Structure scrollRef={scrollRef} dragRef={dragRef} />
      <Motes />

      {/* Cinematic post — bloom for the chrome highlights + soft vignette */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          mipmapBlur
          luminanceThreshold={0.3}
          luminanceSmoothing={0.4}
          intensity={0.8}
          radius={0.7}
        />
        <Vignette
          eskil={false}
          offset={0.18}
          darkness={0.55}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}
