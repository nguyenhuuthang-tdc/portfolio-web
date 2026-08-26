"use client";

import { Suspense, lazy, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";

const HeroScene = lazy(() =>
  import("@/components/three/HeroScene").then((m) => ({
    default: m.HeroScene,
  }))
);

type HeroSectionProps = {
  bio: string;
};

/* ── Typing animation (desktop only) ── */
const ROLES = [
  "Full-Stack Developer",
  "Backend Developer",
  "Open Source Builder",
];

function TypewriterRole() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    const role = ROLES[idx];
    if (phase === "typing") {
      if (text.length < role.length) {
        const t = setTimeout(() => setText(role.slice(0, text.length + 1)), 68);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("holding"), 2200);
      return () => clearTimeout(t);
    }
    if (phase === "holding") {
      const t = setTimeout(() => setPhase("deleting"), 200);
      return () => clearTimeout(t);
    }
    if (phase === "deleting") {
      if (text.length > 0) {
        const t = setTimeout(() => setText(text.slice(0, -1)), 35);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setIdx((i) => (i + 1) % ROLES.length);
        setPhase("typing");
      }, 0);
      return () => clearTimeout(t);
    }
  }, [text, phase, idx]);

  return (
    <span className="inline-flex items-center gap-1">
      <span className="gradient-text">{text}</span>
      <span className="typing-cursor" />
    </span>
  );
}

/*
 * MobileBg — always present in the DOM.
 * Shown/hidden via CSS: .hero-mobile-bg { display:none } on desktop,
 * display:block on pointer:coarse / max-width:767px.
 * This way it paints immediately without waiting for isMobile JS detection.
 * Colors use CSS variables that switch with .dark class — no JS needed.
 */
function MobileBg() {
  return (
    <div className="hero-mobile-bg absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: "380px",
          height: "380px",
          background: "var(--hero-mobile-orb)",
        }}
      />
      <div
        className="absolute top-1/4 right-1/4 rounded-full"
        style={{
          width: "220px",
          height: "220px",
          background: "var(--hero-mobile-accent)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2"
        style={{ marginLeft: "-130px", marginTop: "-130px", transform: "rotate(-15deg) scaleX(1.7)" }}
      >
        <div
          style={{
            width: "260px",
            height: "260px",
            border: "1px solid var(--hero-mobile-ring)",
            borderRadius: "50%",
          }}
        />
      </div>
    </div>
  );
}

/* ── Main section ── */
export function HeroSection({ bio }: HeroSectionProps) {
  /*
   * isMobile is only used to:
   *   1. Pass `mobile` prop to HeroScene for perf tuning
   *   2. Show/hide typewriter vs static role text
   *   3. Show/hide scroll indicator animation
   * It does NOT gate any visible content — CSS handles show/hide of MobileBg.
   * Default false is fine: SSR renders desktop layout, CSS corrects on mobile
   * without a flash because MobileBg visibility is pure CSS.
   */
  const { resolvedTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mobile =
      window.innerWidth < 768 ||
      window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const rafId = requestAnimationFrame(() => {
      setIsMobile(mobile);
      setReducedMotion(reduced);
      /*
       * 200ms on mobile: gives the browser one paint cycle to render
       * MobileBg + hero content before Three.js starts initialising.
       */
      const t = setTimeout(() => setSceneReady(true), mobile ? 200 : 300);
      return () => clearTimeout(t);
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  /*
   * Desktop dark: particle galaxy (GalaxyBackground) — skip the sphere.
   * Mobile / light / reduced-motion: keep the morphing icosahedron.
   */
  const showSphere =
    sceneReady &&
    (isMobile || resolvedTheme === "light" || reducedMotion);

  /*
   * resolvedTheme is available immediately after hydration because next-themes
   * injects a blocking inline script that sets the .dark class before React
   * renders. We no longer gate on `mounted` — CSS variables driven by the
   * .dark class handle all theme-dependent colors without JS.
   */

  return (
    <section
      id="hero"
      className="hero-section relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      {/* MobileBg always in DOM — CSS shows it only on mobile/touch */}
      <MobileBg />

      {showSphere && (
        <Suspense fallback={null}>
          <HeroScene mobile={isMobile} />
        </Suspense>
      )}

      {/* Ambient glow — desktop only, CSS hides on mobile */}
      <div
        className="hero-desktop-only absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full blur-[140px] pointer-events-none z-5"
        style={{ background: "var(--hero-glow)" }}
      />

      {/* Bottom fade — mobile always; desktop light only (desktop dark uses galaxy) */}
      <div
        className="hero-bottom-fade absolute inset-x-0 bottom-0 pointer-events-none z-10"
        style={{
          height: "var(--hero-fade-h)",
          background: "var(--hero-fade)",
        }}
      />

      {/* ── Content — renders immediately, no mount gate ── */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-28 pb-16">

        {/* Status badge */}
        <div
          className="hero-badge inline-flex items-center gap-2 text-[11px] font-mono font-semibold px-4 py-1.5 rounded-full mb-10 uppercase tracking-[0.14em] border"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span
              className="hero-desktop-only animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "var(--hero-dot-ping)" }}
            />
            <span
              className="relative inline-flex rounded-full h-1.5 w-1.5"
              style={{ background: "var(--hero-dot-color)" }}
            />
          </span>
          Available for opportunities
        </div>

        {/* Headline */}
        <motion.h1
          className="lg:flex lg:items-baseline lg:gap-[0.3em] xl:block"
          style={{ fontFamily: "var(--font-display, 'Space Grotesk')" }}
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="block font-extrabold leading-[0.92] tracking-tight mb-2 lg:mb-0 xl:mb-2 text-[clamp(3.5rem,12vw,6rem)] lg:text-[clamp(3rem,5.5vw,4.5rem)] xl:text-[clamp(5rem,5vw,9.5rem)]"
            style={{
              letterSpacing: "-0.045em",
              color: "var(--hero-h1-color)",
              fontFamily: "var(--font-display, 'Space Grotesk')",
            }}
          >
            Building
          </span>
          <span
            className="block font-extrabold leading-[0.92] tracking-tight text-[clamp(3.5rem,12vw,6rem)] lg:text-[clamp(3rem,5.5vw,4.5rem)] xl:text-[clamp(5rem,5vw,9.5rem)] hero-h2"
            style={{ letterSpacing: "-0.045em" }}
          >
            the web.
          </span>
        </motion.h1>

        {/* Name + role */}
        <motion.div
          className="mt-7 mb-5 space-y-3"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
        >
          <p
            className="text-[20px] sm:text-[23px] font-bold uppercase tracking-[0.2em]"
            style={{ color: "var(--hero-name-color)" }}
          >
            Tom Nguyen
          </p>
          <p
            className="text-[26px] sm:text-[32px] font-bold"
            style={{ fontFamily: "var(--font-display, 'Space Grotesk')" }}
          >
            <span className="hero-role-static gradient-text">Full-Stack Developer</span>
            {!isMobile && <span className="hero-desktop-only"><TypewriterRole /></span>}
          </p>
        </motion.div>

        {/* Bio */}
        <motion.p
          className="text-[17px] sm:text-[18px] max-w-lg mx-auto mb-10 leading-relaxed"
          style={{ color: "var(--hero-name-color)" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.42 }}
        >
          {bio}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          <Link
            href="/#projects"
            className="group relative inline-flex items-center gap-2 px-7 py-3.5 text-[15px] font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:shadow-violet-500/35"
          >
            <span className="absolute inset-0 bg-linear-to-r from-violet-600 to-indigo-600 group-hover:from-violet-500 group-hover:to-indigo-500 transition-all" />
            <span className="relative">View Projects</span>
            <svg
              className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/#contact"
            className="inline-flex items-center px-7 py-3.5 text-[15px] font-semibold rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              border: "1px solid var(--hero-gettouched-border)",
              background: "var(--hero-gettouched-bg)",
              color: "var(--hero-gettouched-color)",
            }}
          >
            Get in Touch
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        {!isMobile ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="mt-20 flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
              style={{ border: "1px solid var(--hero-scroll-border)" }}
            >
              <div className="w-1 h-2.5 rounded-full bg-linear-to-b from-violet-400 to-transparent" />
            </motion.div>
            <span
              className="text-[10px] font-mono uppercase tracking-[0.22em]"
              style={{ color: "var(--hero-scroll-color)" }}
            >
              Scroll
            </span>
          </motion.div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-2">
            <div
              className="w-5 h-8 rounded-full flex items-start justify-center pt-1.5"
              style={{ border: "1px solid var(--hero-mobile-scroll-border)" }}
            >
              <div className="w-1 h-2.5 rounded-full bg-linear-to-b from-violet-400 to-transparent" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
