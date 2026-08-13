/**
 * DescentHero — cinematic full-screen scroll-driven spearfishing hero.
 * Scroll progress = descent. No React re-renders on scroll.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { ChromaticAberrationEffect, VignetteEffect } from "postprocessing";
import * as THREE from "three";

const MAX_DEPTH = 45;
const SCROLL_VH = 480;
const scroll = { p: 0, started: false };
/* Damped copy of scroll.p, advanced once per frame — every scene element and
   the HUD read this, so all motion shares the same water-like inertia. */
const smooth = { p: 0 };
const dummy = new THREE.Object3D();
const fogColor = new THREE.Color();
const chromaOffset = new THREE.Vector2();

const SURFACE = new THREE.Color("#7FE3D4");
const MID = new THREE.Color("#1B4F72");
const DEEP = new THREE.Color("#061421");
const FLOOR = new THREE.Color("#000000");
const CERULEAN = new THREE.Color("#0E6A8A");

type Profile = { mobile: boolean; lowPower: boolean; reducedMotion: boolean };

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function ease(t: number) {
  return t * t * (3 - 2 * t);
}

function fogAt(t: number, out: THREE.Color) {
  if (t < 0.2) {
    out.copy(SURFACE).lerp(MID, t / 0.2);
    return 0.012 + t * 0.035;
  }
  if (t < 0.45) {
    out.copy(MID).lerp(CERULEAN, (t - 0.2) / 0.25);
    return 0.019 + ((t - 0.2) / 0.25) * 0.02;
  }
  if (t < 0.75) {
    out.copy(CERULEAN).lerp(DEEP, (t - 0.45) / 0.3);
    return 0.039 + ((t - 0.45) / 0.3) * 0.032;
  }
  out.copy(DEEP).lerp(FLOOR, (t - 0.75) / 0.25);
  return 0.071 + ((t - 0.75) / 0.25) * 0.04;
}

function detectProfile(): Profile {
  const mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency || 8;
  const lowMemory =
    "deviceMemory" in navigator && (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4;
  return { mobile, reducedMotion, lowPower: mobile || reducedMotion || cores <= 4 || lowMemory };
}

const causticVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const causticFrag = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 7.0;
    uv += vec2(uTime * 0.03, -uTime * 0.02);
    float v = 0.0;
    vec2 p = uv;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      v += sin(p.x * 1.3 + uTime * (0.55 + fi * 0.18) + fi)
         * cos(p.y * 1.1 - uTime * (0.4 + fi * 0.14) + fi);
      p *= 1.73;
    }
    float c = pow(max(v * 0.22 + 0.5, 0.0), 4.0);
    vec2 d = abs(vUv - 0.5) * 2.0;
    float edge = 1.0 - smoothstep(0.55, 1.0, max(d.x, d.y));
    float fade = 1.0 - smoothstep(0.12, 0.5, uProgress);
    vec3 color = mix(vec3(0.05, 0.42, 0.5), vec3(0.5, 0.97, 0.91), c);
    gl_FragColor = vec4(color, c * 0.5 * edge * fade);
  }
`;

function Caustics() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uProgress: { value: 0 } },
        vertexShader: causticVert,
        fragmentShader: causticFrag,
      }),
    [],
  );
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uProgress.value = smooth.p;
  });
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 11.6, -3]} material={material}>
      <planeGeometry args={[48, 48]} />
    </mesh>
  );
}

function GodRays() {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#bff7ef",
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const rays = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: -7 + i * 2.6,
        z: -4 - (i % 3),
        tilt: (i - 2.5) * 0.06,
      })),
    [],
  );
  useFrame((state) => {
    const t = smooth.p;
    const visible = 1 - THREE.MathUtils.smoothstep(t, 0.18, 0.52);
    material.opacity = 0.09 * visible;
    if (group.current && visible > 0) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.08) * 0.07;
    }
  });
  return (
    <group ref={group} position={[0, 7, -6]}>
      {rays.map((ray) => (
        <mesh key={ray.x} position={[ray.x, -7, ray.z]} rotation={[0.2, 0, ray.tilt]} material={material}>
          <planeGeometry args={[1.15, 24]} />
        </mesh>
      ))}
    </group>
  );
}

function Diver({ reducedMotion }: { reducedMotion: boolean }) {
  const root = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const path = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 13.2, -1.1),
        new THREE.Vector3(1.8, 10.0, 0.3),
        new THREE.Vector3(0.3, 6.2, 1.0),
        new THREE.Vector3(-0.9, 1.8, 0.2),
        new THREE.Vector3(0.25, -4.2, -0.7),
        new THREE.Vector3(-0.45, -12.0, 0.35),
        new THREE.Vector3(0.55, -20.0, 0.7),
        new THREE.Vector3(0.05, -27.8, 0),
      ]),
    [],
  );
  const point = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const down = useMemo(() => new THREE.Vector3(0, -1, 0), []);

  useFrame((state) => {
    if (!root.current) return;
    const t = clamp01(smooth.p);
    path.getPointAt(ease(t), point);
    path.getTangentAt(ease(t), tangent).normalize();
    root.current.position.copy(point);
    quat.setFromUnitVectors(down, tangent);
    root.current.quaternion.slerp(quat, 0.08);
    const duck = 1 - THREE.MathUtils.smoothstep(t, 0, 0.18);
    root.current.rotation.z += duck * 0.35;
    const kicking = !reducedMotion && t < 0.45;
    const kick = kicking ? Math.sin(state.clock.elapsedTime * 7.2) * 0.5 : 0;
    if (left.current) left.current.rotation.x = kick;
    if (right.current) right.current.rotation.x = -kick;
  });

  const skin = "#0a161c";
  const fin = "#7fe3d4";
  return (
    <group ref={root}>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.15, 12, 12]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <capsuleGeometry args={[0.13, 0.52, 6, 10]} />
        <meshStandardMaterial color={skin} roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 0.16, 0]} rotation={[0, 0, -0.45]}>
        <capsuleGeometry args={[0.04, 0.38, 4, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <mesh position={[-0.2, 0.16, 0]} rotation={[0, 0, 0.45]}>
        <capsuleGeometry args={[0.04, 0.38, 4, 8]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      <group ref={left} position={[-0.07, -0.36, 0]}>
        <mesh position={[0, -0.26, 0]}>
          <capsuleGeometry args={[0.045, 0.4, 4, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0, -0.56, 0.12]} rotation={[0.95, 0, 0]}>
          <boxGeometry args={[0.16, 0.035, 0.38]} />
          <meshStandardMaterial color={fin} emissive={fin} emissiveIntensity={0.18} />
        </mesh>
      </group>
      <group ref={right} position={[0.07, -0.36, 0]}>
        <mesh position={[0, -0.26, 0]}>
          <capsuleGeometry args={[0.045, 0.4, 4, 8]} />
          <meshStandardMaterial color={skin} />
        </mesh>
        <mesh position={[0, -0.56, 0.12]} rotation={[0.95, 0, 0]}>
          <boxGeometry args={[0.16, 0.035, 0.38]} />
          <meshStandardMaterial color={fin} emissive={fin} emissiveIntensity={0.18} />
        </mesh>
      </group>
      <mesh position={[0.26, 0.02, 0.16]} rotation={[0.15, 0.35, 0.08]}>
        <cylinderGeometry args={[0.016, 0.016, 0.85, 6]} />
        <meshStandardMaterial color="#9aa7a4" metalness={0.75} roughness={0.32} />
      </mesh>
      <pointLight position={[1.2, 0.5, 1.4]} intensity={5.5} distance={6.5} color="#7fd8e8" />
    </group>
  );
}

function FishSchool({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.ConeGeometry(0.09, 0.34, 5);
    geo.rotateX(Math.PI / 2);
    return geo;
  }, []);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#8fd4c8", roughness: 0.45, transparent: true, opacity: 0.7 }),
    [],
  );
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 2.8,
        z: (Math.random() - 0.5) * 5,
        phase: i * 0.41,
      })),
    [count],
  );

  useFrame((state) => {
    if (!mesh.current) return;
    const t = smooth.p;
    const visible = t > 0.18 && t < 0.5;
    mesh.current.visible = visible;
    if (!visible) return;
    const time = reducedMotion ? 0 : state.clock.elapsedTime;
    const cx = Math.sin(time * 0.16) * 3.4;
    const cy = THREE.MathUtils.lerp(7.2, -1.5, (t - 0.2) / 0.25);
    seeds.forEach((seed, i) => {
      let x = cx + seed.x + Math.sin(time * 0.7 + seed.phase) * 0.4;
      let y = cy + seed.y + Math.cos(time * 0.5 + seed.phase) * 0.22;
      const z = -4 + seed.z;
      for (let j = 0; j < seeds.length; j += 1) {
        if (j === i) continue;
        const other = seeds[j];
        if (!other) continue;
        const dx = x - (cx + other.x);
        const dy = y - (cy + other.y);
        const dist = Math.hypot(dx, dy) + 0.001;
        if (dist < 0.55) {
          x += (dx / dist) * 0.04;
          y += (dy / dist) * 0.04;
        }
      }
      dummy.position.set(x, y, z);
      dummy.lookAt(x + 1.1, y, z);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} />;
}

function Particles({
  count,
  mode,
  reducedMotion,
}: {
  count: number;
  mode: "bubbles" | "snow";
  reducedMotion: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(
    () => new THREE.SphereGeometry(mode === "bubbles" ? 0.05 : 0.016, 6, 6),
    [mode],
  );
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: mode === "bubbles" ? "#e8fffb" : "#dceff5",
        transparent: true,
        opacity: mode === "bubbles" ? 0.35 : 0.16,
        depthWrite: false,
      }),
    [mode],
  );
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * (mode === "bubbles" ? 12 : 22),
        y: Math.random() * 28 - 14,
        z: (Math.random() - 0.5) * (mode === "bubbles" ? 8 : 16),
        s: mode === "bubbles" ? 0.45 + Math.random() * 0.7 : 0.4 + Math.random() * 0.5,
        v: mode === "bubbles" ? 1.6 + Math.random() * 2.2 : 0.14 + Math.random() * 0.32,
      })),
    [count, mode],
  );

  useFrame((_, dt) => {
    if (!mesh.current) return;
    const camY = THREE.MathUtils.lerp(8.2, -26, smooth.p);
    data.forEach((p, i) => {
      if (!reducedMotion) p.y += p.v * dt;
      if (p.y > 14) p.y = -14;
      dummy.position.set(p.x, camY + p.y, p.z);
      dummy.scale.setScalar(p.s);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
    material.opacity =
      mode === "bubbles"
        ? 0.34 * (1 - THREE.MathUtils.smoothstep(smooth.p, 0.38, 0.72))
        : 0.12 + smooth.p * 0.22;
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />;
}

function Kelp() {
  const group = useRef<THREE.Group>(null);
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#02080c", roughness: 1 }),
    [],
  );
  useFrame(() => {
    if (!group.current) return;
    const t = smooth.p;
    group.current.visible = t > 0.68;
    group.current.position.y = THREE.MathUtils.lerp(-20, -9, (t - 0.75) / 0.25);
  });
  return (
    <group ref={group}>
      {[-7.2, -5, -3.1, 4.4, 6.3, 8.1].map((x, i) => (
        <mesh key={x} position={[x, -6, -8 - (i % 3)]} material={material}>
          <cylinderGeometry args={[0.07 + (i % 3) * 0.03, 0.16, 16, 6]} />
        </mesh>
      ))}
      <mesh position={[9.4, -8, -6]} material={material}>
        <boxGeometry args={[4.2, 18, 1.1]} />
      </mesh>
    </group>
  );
}

function Rig({ reducedMotion, mobile }: { reducedMotion: boolean; mobile: boolean }) {
  const { camera, scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2("#7FE3D4", 0.012), []);
  const background = useMemo(() => new THREE.Color("#7FE3D4"), []);

  useEffect(() => {
    scene.fog = fog;
    scene.background = background;
    return () => {
      scene.fog = null;
    };
  }, [background, fog, scene]);

  useFrame((state, dt) => {
    smooth.p = THREE.MathUtils.damp(smooth.p, scroll.p, 3.4, dt);
    const t = smooth.p;
    const cam = camera as THREE.PerspectiveCamera;
    const targetY = THREE.MathUtils.lerp(8.2, -26, ease(t));
    cam.position.y = THREE.MathUtils.damp(cam.position.y, targetY, 3, dt);
    if (!reducedMotion) {
      const time = state.clock.elapsedTime;
      cam.position.x = Math.sin(time * 0.32) * 0.14;
      cam.position.z = 7.2 + Math.cos(time * 0.24) * 0.1;
    } else {
      cam.position.x = 0;
      cam.position.z = 7.2;
    }
    cam.fov = mobile ? 50 : 38;
    cam.updateProjectionMatrix();
    cam.lookAt(0, cam.position.y - 1.4, -4);
    if (!reducedMotion) cam.rotation.z += Math.sin(state.clock.elapsedTime * 0.22) * 0.018;
    const density = fogAt(t, fogColor);
    fog.color.copy(fogColor);
    fog.density = density;
    background.copy(fogColor);
  });

  return null;
}

function PostFX({ enabled, mobile }: { enabled: boolean; mobile: boolean }) {
  const vignette = useRef<VignetteEffect>(null);
  const chroma = useRef<ChromaticAberrationEffect>(null);
  useFrame(() => {
    const t = smooth.p;
    if (vignette.current) vignette.current.darkness = 0.3 + t * 0.58;
    if (chroma.current) {
      chromaOffset.set(0.0014 * t, 0.0009 * t);
      chroma.current.offset.copy(chromaOffset);
    }
  });
  if (!enabled) return null;
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom luminanceThreshold={0.64} luminanceSmoothing={0.42} intensity={0.36} mipmapBlur />
      <Vignette ref={vignette} eskil={false} offset={0.15} darkness={0.32} />
      <Noise opacity={0.032} />
      {mobile ? null : <ChromaticAberration ref={chroma} offset={chromaOffset} />}
    </EffectComposer>
  );
}

function Scene({ profile }: { profile: Profile }) {
  const bubbles = profile.mobile ? 24 : 80;
  const snow = profile.mobile ? 60 : 200;
  const fish = profile.mobile ? 6 : 18;
  return (
    <>
      <Rig reducedMotion={profile.reducedMotion} mobile={profile.mobile} />
      <ambientLight intensity={0.2} />
      <hemisphereLight args={["#7FE3D4", "#061421", 0.55]} />
      <directionalLight position={[4, 18, 6]} intensity={1.35} color="#e7fffb" />
      <pointLight position={[0, 12, 2]} intensity={16} distance={26} color="#7FE3D4" />
      <mesh position={[0, 12.15, -3]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[56, 56]} />
        <meshBasicMaterial color="#8ff0e4" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <Caustics />
      <GodRays />
      <Diver reducedMotion={profile.reducedMotion} />
      <FishSchool count={fish} reducedMotion={profile.reducedMotion} />
      <Particles count={bubbles} mode="bubbles" reducedMotion={profile.reducedMotion} />
      <Particles count={snow} mode="snow" reducedMotion={profile.reducedMotion} />
      <Kelp />
      <PostFX enabled={!profile.lowPower} mobile={profile.mobile} />
    </>
  );
}

function Overlay() {
  const depthRef = useRef<HTMLSpanElement>(null);
  const markerRef = useRef<HTMLSpanElement>(null);
  const holdRef = useRef<HTMLSpanElement>(null);
  const heartRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLParagraphElement>(null);
  const aRef = useRef<HTMLHeadingElement>(null);
  const bRef = useRef<HTMLHeadingElement>(null);
  const cRef = useRef<HTMLHeadingElement>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const tick = (now: number) => {
      const t = smooth.p;
      if (scroll.started && startedAt.current === null) startedAt.current = now;
      if (depthRef.current) depthRef.current.textContent = `${(t * MAX_DEPTH).toFixed(1)}m`;
      if (markerRef.current) markerRef.current.style.top = `${t * 100}%`;
      if (aRef.current) aRef.current.style.opacity = String(clamp01(1 - Math.abs(t - 0.08) / 0.14));
      if (bRef.current) bRef.current.style.opacity = String(clamp01(1 - Math.abs(t - 0.38) / 0.15));
      if (cRef.current) cRef.current.style.opacity = String(clamp01(1 - Math.abs(t - 0.86) / 0.16));
      if (cueRef.current && scroll.started) cueRef.current.style.opacity = "0";
      if (holdRef.current && startedAt.current !== null) {
        const elapsed = Math.floor((now - startedAt.current) / 1000);
        holdRef.current.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
      }
      if (heartRef.current) heartRef.current.style.opacity = String(0.4 + Math.abs(Math.sin(now * 0.005)) * 0.6);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="descent-hud">
      <p className="descent-cue" ref={cueRef}>
        Descend
      </p>
      <div className="descent-copy">
        <h1 ref={aRef}>Hold your breath</h1>
        <h1 ref={bRef}>The surface is optional</h1>
        <h1 ref={cRef}>
          Runtian Huang
          <small>Head of IT · Spearfishing & Systems</small>
        </h1>
      </div>
      <aside className="descent-gauge" aria-label="Depth gauge">
        <span>0m</span>
        <div className="descent-track">
          <span className="descent-marker" ref={markerRef} />
        </div>
        <span ref={depthRef}>0.0m</span>
        <span>45m</span>
        <div className="descent-vitals">
          <span ref={holdRef}>00:00</span>
          <span className="descent-heart" ref={heartRef} />
        </div>
      </aside>
    </div>
  );
}

export default function DescentHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<Profile>({
    mobile: false,
    lowPower: false,
    reducedMotion: false,
  });

  useEffect(() => {
    setProfile(detectProfile());
    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const max = el.offsetHeight - window.innerHeight;
      scroll.p = max > 0 ? clamp01(-el.getBoundingClientRect().top / max) : 0;
      if (scroll.p > 0.012) scroll.started = true;
    };
    const start = () => {
      scroll.started = true;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener("wheel", start, { passive: true, once: true });
    window.addEventListener("touchstart", start, { passive: true, once: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section className="descent-hero" ref={sectionRef} id="top" style={{ height: `${SCROLL_VH}vh` }}>
      <div className="descent-stage">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 8.2, 7.2], fov: 38, near: 0.1, far: 80 }}
          gl={{ antialias: !profile.lowPower, powerPreference: "high-performance" }}
          style={{ pointerEvents: "none" }}
        >
          <Scene profile={profile} />
        </Canvas>
        <Overlay />
      </div>
    </section>
  );
}
