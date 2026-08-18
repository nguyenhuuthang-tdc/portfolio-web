"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 52000;

const vertexShader = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  varying vec3 vColor;
  varying float vAlpha;

  uniform float uTime;
  uniform float uScroll;
  uniform vec2 uMouse;
  uniform float uPixelRatio;

  void main() {
    float s = smoothstep(0.0, 1.0, uScroll);
    vec3 p = position;

    float spin = uTime * mix(0.022, 0.008, s);
    float c = cos(spin);
    float si = sin(spin);
    p.xz = mat2(c, -si, si, c) * p.xz;

    // Core spin around the bulge origin — before zoom offset, so the ring stays circular
    float coreSpin = uTime * 0.12 * s * exp(-length(p.xz) * 1.8);
    float cc = cos(coreSpin);
    float ss = sin(coreSpin);
    p.xz = mat2(cc, -ss, ss, cc) * p.xz;

    vec3 focus = vec3(2.15, 0.02, 1.05);
    p = (p - focus * s) * mix(1.0, 1.75, s);
    p.y *= mix(1.0, 1.8, s);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);

    // Circular ripple in view space so it stays a circle on screen
    vec2 delta = mvPosition.xy - uMouse;
    float dist = length(delta);
    vec2 dir = delta / max(dist, 0.0001);
    float falloff = smoothstep(2.8, 0.12, dist);
    float ringA = exp(-pow((dist - 0.55) * 2.4, 2.0));
    float ringB = exp(-pow((dist - 1.15) * 1.8, 2.0));
    float wave = sin(dist * 7.2 - uTime * 1.45);
    float push = (ringA * 0.22 + ringB * 0.14 + wave * 0.06) * falloff;
    mvPosition.xy += dir * push;

    gl_Position = projectionMatrix * mvPosition;
    float inner = exp(-length(p.xz) * 1.1);
	gl_PointSize = aSize * uPixelRatio * mix(1.0, 1.15, s) * (1.0 + inner * 0.45 * s);
	vColor = mix(aColor, aColor * vec3(1.15, 0.95, 0.75), inner * 0.35);
    vAlpha = (0.7 + falloff * (ringA + ringB) * 0.35) * mix(1.0, 0.88, s);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    float core = smoothstep(0.38, 0.0, d);
    float halo = smoothstep(0.5, 0.18, d) * 0.22;
    float alpha = (core * 0.9 + halo) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
    #include <colorspace_fragment>
  }
`;

function randn() {
  return Math.random() + Math.random() + Math.random() - 1.5;
}

function buildGalaxy(count: number) {
  const galaxy = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const ring = Math.floor(count * 0.025);

  const bulge = Math.floor(count * 0.08);
  const field = Math.floor(count * 0.22);
  const halo = Math.floor(count * 0.12);
  const disk = count - bulge - ring - field - halo;
  const arms = 4;
  const radiusMax = 10.8;
  const tightness = 3.3;

  let i = 0;

  for (let n = 0; n < bulge; n++, i++) {
    const r = Math.pow(Math.random(), 0.55) * 1.05;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    galaxy[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    galaxy[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.28;
    galaxy[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 1.35 + Math.random() * 0.5;
	colors[i * 3]     = 1.0;
	colors[i * 3 + 1] = 0.72 + Math.random() * 0.18;
	colors[i * 3 + 2] = 0.42 + Math.random() * 0.12;
  }

  for (let n = 0; n < ring; n++, i++) {
	const a = Math.random() * Math.PI * 2;
	const r = 1.15 + randn() * 0.08;
	galaxy[i * 3]     = Math.cos(a) * r;
	galaxy[i * 3 + 1] = randn() * 0.04;
	galaxy[i * 3 + 2] = Math.sin(a) * r;
	sizes[i] = 1.2 + Math.random() * 0.35;
	colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.78; colors[i * 3 + 2] = 1.0;
  }

  for (let n = 0; n < disk; n++, i++) {
    const arm = n % arms;
    let radius = 0;
	for (let t = 0; t < 8 && radius < 1.35; t++) {
	radius = Math.pow(Math.random(), 0.58) * radiusMax;
	}
	const armAngle = arm * ((Math.PI * 2) / arms) + Math.log(radius + 0.4) * tightness;
    const spread = (0.08 + radius * 0.015) * randn();
    const angle = armAngle + spread;

    galaxy[i * 3] = Math.cos(angle) * radius;
    galaxy[i * 3 + 1] = randn() * (0.07 + radius * 0.018);
    galaxy[i * 3 + 2] = Math.sin(angle) * radius;

    const spark = Math.random() > 0.97;
	sizes[i] = spark
	? 1.65 + Math.random() * 0.4
	: 0.82 + Math.random() * 0.32;
	colors[i * 3]     = 0.42 + arm * 0.06;
	colors[i * 3 + 1] = 0.28;
	colors[i * 3 + 2] = 0.78 + Math.random() * 0.12;
    if (spark) {
      colors[i * 3] = 0.92;
      colors[i * 3 + 1] = 0.88;
      colors[i * 3 + 2] = 1.0;
    }
  }

  for (let n = 0; n < field; n++, i++) {
    galaxy[i * 3] = (Math.random() - 0.5) * 22;
    galaxy[i * 3 + 1] = (Math.random() - 0.5) * 10;
    galaxy[i * 3 + 2] = (Math.random() - 0.5) * 16;
    sizes[i] = 0.65 + Math.random() * 0.4;
    colors[i * 3] = 0.4 + Math.random() * 0.18;
    colors[i * 3 + 1] = 0.28 + Math.random() * 0.12;
    colors[i * 3 + 2] = 0.68 + Math.random() * 0.22;
  }

  for (let n = 0; n < halo; n++, i++) {
    const r = 4.5 + Math.random() * 9.5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    galaxy[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    galaxy[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4;
    galaxy[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = 0.68 + Math.random() * 0.35;
    colors[i * 3] = 0.38 + Math.random() * 0.15;
    colors[i * 3 + 1] = 0.28 + Math.random() * 0.1;
    colors[i * 3 + 2] = 0.62 + Math.random() * 0.2;
  }

  return { galaxy, colors, sizes };
}

function GalaxyPoints() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const mouseNdc = useRef(new THREE.Vector2(0, 0));
  const mouseSmooth = useRef(new THREE.Vector2(0, 0));
  const scrollSmooth = useRef(0);
  const { viewport, gl, camera } = useThree();

  const { galaxy, colors, sizes, uniforms } = useMemo(() => {
    const built = buildGalaxy(COUNT);
    return {
      ...built,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uMouse: { value: new THREE.Vector2() },
        uPixelRatio: { value: Math.min(gl.getPixelRatio(), 1.5) },
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseNdc.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdc.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(({ clock }) => {
    const mat = materialRef.current;
    if (!mat) return;

    mouseSmooth.current.lerp(mouseNdc.current, 0.045);
    mat.uniforms.uTime.value = clock.getElapsedTime();
    mat.uniforms.uMouse.value.set(
      mouseSmooth.current.x * (viewport.width / 2),
      mouseSmooth.current.y * (viewport.height / 2),
    );

    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const raw = Math.min(1, window.scrollY / (max * 0.55));
    const t = raw * raw * (3 - 2 * raw);
    scrollSmooth.current += (t - scrollSmooth.current) * 0.06;
    const s = scrollSmooth.current;
    mat.uniforms.uScroll.value = s;

    camera.position.set(0.15 + s * 0.35, 0.22, 11.2 - s * 4.2);
    camera.lookAt(s * 0.15, 0, 0);

    if (groupRef.current) {
      groupRef.current.rotation.x = 0.46 - s * 0.3;
      groupRef.current.rotation.y = 0.26 + s * 0.1;
      groupRef.current.rotation.z = 0.04;
    }
  });

  return (
    <group ref={groupRef} rotation={[0.46, 0.26, 0.04]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[galaxy, 3]} />
          <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
    </group>
  );
}

export function GalaxyField() {
  return (
    <div
      className="fixed inset-0 z-1 pointer-events-none hidden md:block"
      aria-hidden
    >
      <Canvas
        camera={{ position: [0.2, 0.22, 11.2], fov: 58 }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        dpr={[1, 1.5]}
        style={{ width: "100%", height: "100%" }}
      >
        <GalaxyPoints />
      </Canvas>
    </div>
  );
}
