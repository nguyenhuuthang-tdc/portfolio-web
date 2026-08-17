"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

/* ── Morphing icosahedron sphere ── */
function MorphSphere({ isLight, mobile }: { isLight: boolean; mobile: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { geometry, originalPositions } = useMemo(() => {
    /*
     * detail=4 → 1280 triangles (desktop)
     * detail=3 → 720 triangles (mobile) — smoother silhouette vs detail=2 (320 tri)
     *   while still 43% fewer vertices than desktop
     */
    const geo = new THREE.IcosahedronGeometry(1.5, mobile ? 3 : 4);
    const orig = new Float32Array(geo.attributes.position.array);
    return { geometry: geo, originalPositions: orig };
  }, [mobile]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = meshRef.current.geometry.attributes
      .position as THREE.BufferAttribute;

    for (let i = 0; i < pos.count; i++) {
      const ox = originalPositions[i * 3];
      const oy = originalPositions[i * 3 + 1];
      const oz = originalPositions[i * 3 + 2];
      const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
      const noise =
        Math.sin(ox * 2.8 + t * 0.9) *
        Math.cos(oy * 3.2 + t * 0.65) *
        Math.sin(oz * 2.1 + t * 0.75) *
        0.22;
      const scale = 1 + noise / dist;
      pos.setXYZ(i, ox * scale, oy * scale, oz * scale);
    }
    pos.needsUpdate = true;
    meshRef.current.rotation.y = t * 0.13;
    meshRef.current.rotation.x = Math.sin(t * 0.08) * 0.22;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
      <group>
        {/* Solid morphing core */}
        <mesh ref={meshRef} geometry={geometry}>
          <meshStandardMaterial
            color={isLight ? "#818cf8" : "#8b5cf6"}
            roughness={isLight ? 0.3 : 0.08}
            metalness={isLight ? 0.2 : 0.78}
            transparent
            opacity={isLight ? 0.2 : 1}
          />
        </mesh>
        {/* Outer wireframe */}
        <mesh geometry={geometry} scale={1.07} rotation={[0.4, 0.3, 0.2]}>
          <meshBasicMaterial
            color={isLight ? "#6366f1" : "#a78bfa"}
            wireframe
            transparent
            opacity={isLight ? 0.28 : 0.18}
          />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Orbiting rings ── */
function OrbitRings({ isLight }: { isLight: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.18;
    groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.15;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.6, 0.013, 8, 128]} />
        <meshBasicMaterial
          color={isLight ? "#5b21b6" : "#7c3aed"}
          transparent
          opacity={isLight ? 0.55 : 0.4}
        />
      </mesh>
      <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[3.3, 0.009, 8, 128]} />
        <meshBasicMaterial
          color={isLight ? "#4338ca" : "#6366f1"}
          transparent
          opacity={isLight ? 0.38 : 0.22}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 4, Math.PI / 4, Math.PI / 8]}>
        <torusGeometry args={[4.0, 0.006, 8, 128]} />
        <meshBasicMaterial
          color={isLight ? "#7c3aed" : "#a855f7"}
          transparent
          opacity={isLight ? 0.22 : 0.12}
        />
      </mesh>
    </group>
  );
}

/* ── Pre-generated particle data (stable across renders, no Math.random in useMemo) ── */
const DOT_COUNT = 80; // Reduced from 120 — sufficient visual, lighter GPU
const DOT_POSITIONS = (() => {
  const pos = new Float32Array(DOT_COUNT * 3);
  const rands = new Float32Array(DOT_COUNT * 6); // r, theta, phi, c0, c1, c2
  for (let i = 0; i < DOT_COUNT; i++) {
    rands[i * 6 + 0] = Math.random();
    rands[i * 6 + 1] = Math.random();
    rands[i * 6 + 2] = Math.random();
    rands[i * 6 + 3] = Math.random();
    rands[i * 6 + 4] = Math.random();
    rands[i * 6 + 5] = Math.random();
    const r = 5 + rands[i * 6 + 0] * 4;
    const theta = rands[i * 6 + 1] * Math.PI * 2;
    const phi = Math.acos(2 * rands[i * 6 + 2] - 1);
    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = r * Math.cos(phi);
  }
  return { pos, rands };
})();

/* ── Floating particles cluster ── */
function FloatingDots({ isLight }: { isLight: boolean }) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const { pos, rands } = DOT_POSITIONS;
    const col = new Float32Array(DOT_COUNT * 3);
    for (let i = 0; i < DOT_COUNT; i++) {
      // Deeper violet palette for light mode (more visible on lavender bg)
      col[i * 3]     = isLight ? 0.35 + rands[i * 6 + 3] * 0.2  : 0.45 + rands[i * 6 + 3] * 0.35;
      col[i * 3 + 1] = isLight ? 0.1  + rands[i * 6 + 4] * 0.1  : 0.25 + rands[i * 6 + 4] * 0.2;
      col[i * 3 + 2] = isLight ? 0.6  + rands[i * 6 + 5] * 0.3  : 0.75 + rands[i * 6 + 5] * 0.25;
    }
    return { positions: pos, colors: col };
  }, [isLight]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isLight ? 0.08 : 0.06}
        vertexColors
        transparent
        opacity={isLight ? 0.75 : 0.65}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Scene export ── */
export function HeroScene({ mobile = false }: { mobile?: boolean }) {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 58 }}
      style={{ position: "absolute", inset: 0 }}
      gl={{
        antialias: true,         // enable on all devices — modern mobile GPUs handle MSAA well
        alpha: true,
        powerPreference: "high-performance",
      }}
      dpr={mobile ? [1, 2] : [1, 1.5]}  // mobile: up to 2× DPR for crisp Retina rendering; desktop capped at 1.5×
    >
      {/* Stars only in dark mode, fewer on mobile */}
      {!isLight && (
        <Stars
          radius={55}
          depth={40}
          count={mobile ? 1500 : 4000}
          factor={3.5}
          saturation={0.6}
          fade
          speed={mobile ? 0.6 : 1.2}
        />
      )}

      <ambientLight intensity={isLight ? 2.2 : 0.4} />
      <pointLight
        position={[6, 6, 6]}
        intensity={isLight ? 3.5 : 2.5}
        color={isLight ? "#7c3aed" : "#8b5cf6"}
      />
      <pointLight
        position={[-6, -4, 4]}
        intensity={isLight ? 2.0 : 1.2}
        color={isLight ? "#4f46e5" : "#4f46e5"}
      />
      {/* Skip third light on mobile — fewer draw calls */}
      {!mobile && (
        <pointLight
          position={[0, -6, 2]}
          intensity={isLight ? 1.2 : 0.6}
          color={isLight ? "#6d28d9" : "#a855f7"}
        />
      )}

      <MorphSphere isLight={isLight} mobile={mobile} />
      <OrbitRings isLight={isLight} />
      {/* Skip floating dots on mobile — each point is a draw call */}
      {!mobile && <FloatingDots isLight={isLight} />}
    </Canvas>
  );
}
