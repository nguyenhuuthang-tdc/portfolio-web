"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const GalaxyField = dynamic(
  () => import("./GalaxyField").then((m) => ({ default: m.GalaxyField })),
  { ssr: false },
);

function isDesktopPointer() {
  return (
    window.innerWidth >= 768 &&
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Site-wide particle galaxy — desktop + dark only.
 * Chunk is not loaded on mobile / light / reduced-motion.
 */
export function GalaxyBackground() {
  const { resolvedTheme } = useTheme();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const sync = () => setDesktop(isDesktopPointer());
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  if (!desktop || resolvedTheme !== "dark") return null;

  return <GalaxyField />;
}
