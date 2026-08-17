"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/#about",    label: "About",    sectionId: "about" },
  { href: "/#skills",   label: "Skills",   sectionId: "skills" },
  { href: "/#projects", label: "Projects", sectionId: "projects" },
  { href: "/#writings",  label: "Writings", sectionId: "writings" },
  { href: "/#contact",  label: "Contact",  sectionId: "contact" },
];

const SECTIONS = ["about", "skills", "projects", "writings", "contact"];

/* ── Section icons ────────────────────────────── */
const ICONS: Record<string, React.ReactNode> = {
  about: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
  skills: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  projects: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  writings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  contact: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
};

/* ── Theme toggle ─────────────────────────────── */
function ThemeToggle({ atTop, compact }: { atTop?: boolean; compact?: boolean }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return <div className={compact ? "w-7 h-7" : "w-8 h-8"} />;

  const isDark = resolvedTheme === "dark";

  const iconClass = compact
    ? "w-7 h-7 rounded-lg"
    : "w-8 h-8 rounded-xl";

  return (
    <motion.button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      whileTap={{ scale: 0.88 }}
      className={`${iconClass} flex items-center justify-center transition-colors duration-200 cursor-pointer ${
        atTop
          ? "text-neutral-700 hover:text-neutral-900 hover:bg-black/6 dark:text-white/75 dark:hover:text-white dark:hover:bg-white/10"
          : "text-neutral-500 hover:text-neutral-900 dark:text-white/70 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
      }`}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
          transition={{ duration: 0.18 }}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Mobile menu overlay ─────────────────────── */
function MobileMenu({
  open,
  onClose,
  isActive,
}: {
  open: boolean;
  onClose: () => void;
  isActive: (link: (typeof NAV_LINKS)[number]) => boolean;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.18)" }}
            onClick={onClose}
          />

          {/* Menu panel */}
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: -14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 px-4 pt-4"
          >
            <div
              className={`rounded-2xl overflow-hidden shadow-2xl border ${
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
              }`}
            >
              {/* Close button row */}
              <div className="flex items-center justify-end px-3 pt-3 pb-1">
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.88 }}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isDark
                      ? "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                      : "text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                  }`}
                  aria-label="Close menu"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Nav items with stagger — clean, no numbers, no separators */}
              <div className="px-2.5 pb-3">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link);
                  const sectionKey = link.sectionId ?? "writings";
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Link
                        href={link.href}
                        onClick={onClose}
                        className={`group flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-colors duration-150 ${
                          active
                            ? isDark
                              ? "bg-violet-500/12 text-violet-300"
                              : "bg-violet-50 text-violet-700"
                            : isDark
                            ? "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                            : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                        }`}
                      >
                        {/* Icon */}
                        <span
                          className="shrink-0"
                          style={{
                            color: active
                              ? isDark ? "#a78bfa" : "#7c3aed"
                              : isDark ? "#6b7280" : "#9ca3af",
                          }}
                        >
                          {ICONS[sectionKey]}
                        </span>

                        {/* Label */}
                        <span className="text-[18px] font-semibold tracking-tight flex-1">
                          {link.label}
                        </span>

                        {/* Active dot */}
                        {active && (
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-violet-500" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ── Navbar ───────────────────────────────────── */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 40);

    if (pathname !== "/") return;

    const threshold = y + window.innerHeight * 0.45;
    let active = "";
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= threshold) active = id;
    }
    setActiveSection(active);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const initId = requestAnimationFrame(() => handleScroll());
    return () => {
      cancelAnimationFrame(initId);
      window.removeEventListener("scroll", onScroll);
    };
  }, [handleScroll]);

  const isActive = (link: (typeof NAV_LINKS)[number]) => {
    if (link.sectionId === null) return pathname.startsWith(link.href);
    if (pathname !== "/") return false;
    return activeSection === link.sectionId;
  };

  const atTop = pathname === "/" && !scrolled;
  // onDark derived purely from CSS dark: prefix — no JS resolvedTheme needed

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 pointer-events-none">
        <nav
          className={`max-w-5xl mx-auto pointer-events-auto flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
            scrolled
              ? "bg-white/95 dark:bg-neutral-950/95 border border-neutral-200/70 dark:border-neutral-800/60 shadow-xl shadow-black/6 md:backdrop-blur-md"
              : "bg-transparent border border-transparent shadow-none"
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-baseline gap-0.5 leading-none"
            style={{ fontFamily: "var(--font-display, 'Space Grotesk')" }}
          >
            <span
              className={`text-[23px] font-bold tracking-tight transition-colors duration-300 ${
                atTop
                  ? "dark:text-white text-neutral-900"
                  : "gradient-text"
              }`}
            >
              Winphony
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`relative inline-flex items-center px-4 py-2.5 text-[16px] font-semibold rounded-xl transition-colors duration-150 ${
                      active
                        ? atTop
                          ? "dark:text-white text-neutral-900"
                          : "text-violet-600 dark:text-violet-300"
                        : atTop
                        ? "dark:text-white/65 dark:hover:text-white text-neutral-600 hover:text-neutral-900"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className={`absolute inset-0 rounded-xl ${
                          atTop
                            ? "dark:bg-white/12 bg-black/6"
                            : "bg-violet-50 dark:bg-violet-500/12 border border-violet-200/60 dark:border-violet-500/20"
                        }`}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right side controls */}
          <div className="flex items-center gap-1">
            <ThemeToggle atTop={atTop} />

            {/* Mobile hamburger */}
            <motion.button
              onClick={() => setMobileOpen(true)}
              whileTap={{ scale: 0.88 }}
              className={`md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                atTop
                  ? "text-neutral-700 hover:text-neutral-900 hover:bg-black/6 dark:text-white/75 dark:hover:text-white dark:hover:bg-white/10"
                  : "text-neutral-500 dark:text-white/70 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
              }`}
              aria-label="Open menu"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile full menu — rendered outside header to avoid stacking context issues */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isActive={isActive}
      />
    </>
  );
}
