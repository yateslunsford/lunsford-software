'use client';

import { useRef, useMemo, useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ── module-level reusable vector to avoid per-frame allocations ── */
const _tempDir = new THREE.Vector3();

const STAR_COUNT = 800;

/* ═══════════════════════════════════════════════════════════
   StarField — GPU-twinkling shader points
═══════════════════════════════════════════════════════════ */
function StarField({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Points>(null);
  const matRef   = useRef<THREE.ShaderMaterial>(null);

  const [positions, sizes, phases, speeds] = useMemo(() => {
    const pos = new Float32Array(STAR_COUNT * 3);
    const siz = new Float32Array(STAR_COUNT);
    const pha = new Float32Array(STAR_COUNT);
    const spd = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 9 + Math.random() * 22;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      siz[i] = 0.7 + Math.random() * 2.6;
      pha[i] = Math.random() * Math.PI * 2;
      spd[i] = 0.3 + Math.random() * 1.8;
    }
    return [pos, siz, pha, spd];
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  const vertexShader = /* glsl */`
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    uniform float uTime;
    void main() {
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      float twinkle = sin(uTime * aSpeed + aPhase) * 0.45 + 0.55;
      float perspSize = aSize * twinkle * (280.0 / max(0.1, -mvPos.z));
      gl_PointSize = clamp(perspSize, 0.5, 64.0);
      gl_Position  = projectionMatrix * mvPos;
    }
  `;

  const fragmentShader = /* glsl */`
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float a = 1.0 - smoothstep(0.1, 0.5, d);
      gl_FragColor = vec4(1.0, 0.97, 0.93, a * 0.88);
    }
  `;

  useFrame((_, delta) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += delta;
    if (groupRef.current) {
      groupRef.current.rotation.y  += delta * 0.008;
      groupRef.current.position.y   = scrollRef.current * 2.2;
    }
  });

  useEffect(() => {
    const mat = matRef.current;
    return () => { mat?.dispose(); };
  }, []);

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize"    args={[sizes,     1]} />
        <bufferAttribute attach="attributes-aPhase"   args={[phases,    1]} />
        <bufferAttribute attach="attributes-aSpeed"   args={[speeds,    1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════
   ShootingStars — imperative THREE.Line objects
═══════════════════════════════════════════════════════════ */
interface StarData {
  line: THREE.Line;
  geo: THREE.BufferGeometry;
  mat: THREE.LineBasicMaterial;
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
}

function spawnStar(s: StarData): void {
  s.active  = true;
  s.life    = 0;
  s.maxLife = 0.55 + Math.random() * 0.75;
  const angle = -0.18 + Math.random() * 0.12;
  const speed = 12 + Math.random() * 15;
  s.pos.set(-15 + Math.random() * 4, 4 + (Math.random() * 9 - 4.5), -3 - Math.random() * 5);
  s.vel.set(Math.cos(angle) * speed, Math.sin(angle) * speed * 0.35, 0);
}

function ShootingStars() {
  const groupRef  = useRef<THREE.Group>(null);
  const dataRef   = useRef<StarData[]>([]);
  const elapsed   = useRef(0);
  const nextSpawn = useRef(1.0 + Math.random() * 2);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
      const mat  = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
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

    return () => {
      dataRef.current.forEach(({ line, geo, mat }) => {
        group.remove(line);
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
      if (inactive) spawnStar(inactive);
      nextSpawn.current = elapsed.current + 1.2 + Math.random() * 4.5;
    }

    for (const s of dataRef.current) {
      if (!s.active) continue;
      s.life += delta;
      s.pos.addScaledVector(s.vel, delta);

      const progress = s.life / s.maxLife;
      s.mat.opacity  = progress < 0.15
        ? progress / 0.15
        : 1.0 - (progress - 0.15) / 0.85;

      _tempDir.copy(s.vel).normalize();
      const trailLen = 1.0 + s.vel.length() * 0.045;
      const arr = s.geo.attributes.position.array as Float32Array;
      arr[0] = s.pos.x;                          arr[1] = s.pos.y;                          arr[2] = s.pos.z;
      arr[3] = s.pos.x - _tempDir.x * trailLen;  arr[4] = s.pos.y - _tempDir.y * trailLen;  arr[5] = s.pos.z - _tempDir.z * trailLen;
      s.geo.attributes.position.needsUpdate = true;

      if (s.life >= s.maxLife) { s.active = false; s.mat.opacity = 0; }
    }
  });

  return <group ref={groupRef} />;
}

/* ═══════════════════════════════════════════════════════════
   GemCore — morphing icosahedron with dynamic lights
═══════════════════════════════════════════════════════════ */
function GemCore({ scrollRef }: { scrollRef: MutableRefObject<number> }) {
  const meshRef   = useRef<THREE.Mesh>(null);
  const wireRef   = useRef<THREE.Mesh>(null);
  const light1Ref = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2, 1), []);

  const origPos = useMemo(() => {
    const arr = geometry.attributes.position.array as Float32Array;
    return new Float32Array(arr);
  }, [geometry]);

  useEffect(() => {
    const geo = geometry;
    return () => {
      geo.dispose();
      (meshRef.current?.material as THREE.Material | undefined)?.dispose();
      (wireRef.current?.material as THREE.Material | undefined)?.dispose();
    };
  }, [geometry]);

  useFrame(({ clock }, delta) => {
    const t      = clock.getElapsedTime();
    const scroll = scrollRef.current;

    /* Organic vertex displacement — breathing + scroll-driven amplitude */
    const amplitude = 0.055 + scroll * 0.28;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const ox = origPos[i], oy = origPos[i + 1], oz = origPos[i + 2];
      const r  = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const wave = Math.sin(t * 1.3 + (ox / r) * 3.8 + (oy / r) * 2.6) * amplitude;
      pos[i]     = ox * (1 + wave);
      pos[i + 1] = oy * (1 + wave);
      pos[i + 2] = oz * (1 + wave);
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    /* Rotation accelerates with scroll progress */
    const speed = 1 + scroll * 2.8;
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.11 * speed;
      meshRef.current.rotation.y += delta * 0.17 * speed;
      meshRef.current.rotation.z += delta * 0.05 * speed;
    }
    if (wireRef.current) {
      wireRef.current.rotation.x -= delta * 0.06 * speed;
      wireRef.current.rotation.y += delta * 0.10 * speed;
      wireRef.current.rotation.z -= delta * 0.04 * speed;
    }

    /* Orbiting colored lights */
    if (light1Ref.current) {
      light1Ref.current.position.set(
        Math.cos(t * 0.65) * 4.5,
        Math.sin(t * 0.48) * 3.8,
        Math.sin(t * 0.82) * 4.0,
      );
      light1Ref.current.intensity = 3.8 + Math.sin(t * 1.4) * 1.1;
    }
    if (light2Ref.current) {
      light2Ref.current.position.set(
        Math.cos(t * 0.88 + 2.1) * 5.2,
        Math.sin(t * 0.57 + 1.0) * 4.2,
        Math.cos(t * 0.38) * 4.8,
      );
      light2Ref.current.intensity = 2.5 + Math.sin(t * 0.9 + 1) * 0.8;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.10} />
      <pointLight ref={light1Ref} color="#ff8c3c" intensity={3.8} />
      <pointLight ref={light2Ref} color="#7030ff" intensity={2.5} />
      <pointLight position={[0, 0, 5.5]} color="#ffe0b0" intensity={0.7} />

      {/* Solid metallic gem */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshPhysicalMaterial
          color="#ff8030"
          emissive="#b83800"
          emissiveIntensity={0.22}
          metalness={0.94}
          roughness={0.03}
          envMapIntensity={1.4}
        />
      </mesh>

      {/* Outer wireframe ghost */}
      <mesh ref={wireRef} geometry={geometry} scale={1.075}>
        <meshBasicMaterial
          color="#ffaa60"
          wireframe
          transparent
          opacity={0.065}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   HeroScene — Canvas root
═══════════════════════════════════════════════════════════ */
interface HeroSceneProps {
  scrollRef: MutableRefObject<number>;
}

export default function HeroScene({ scrollRef }: HeroSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Environment preset="city" />
      <StarField    scrollRef={scrollRef} />
      <ShootingStars />
      <GemCore      scrollRef={scrollRef} />
    </Canvas>
  );
}
