"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useTheme } from "next-themes";
import { Project } from "@/types/api";
import { SectionReveal } from "@/components/ui/SectionReveal";
import { ProjectCardSkeleton } from "@/components/ui/Skeleton";

type ProcessedProject = Project & {
  techList: string[];
  isLive: boolean;
};

/* ── Icons ─────────────────────────────────── */
function ExternalIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

/* ── Gradient palettes — vibrant, look great in both light & dark ── */
const GRADIENTS = [
  "from-violet-500 via-purple-500 to-indigo-600",
  "from-indigo-500 via-blue-500 to-cyan-500",
  "from-purple-500 via-violet-500 to-pink-500",
  "from-blue-500 via-indigo-600 to-violet-500",
];

/* ── Project card — two-zone layout (visual top + content bottom) ── */
function ProjectCard({
  project,
  index,
  featured,
  isLight,
}: {
  project: ProcessedProject;
  index: number;
  featured: boolean;
  isLight: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const gradient = GRADIENTS[index % GRADIENTS.length];

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className={`group rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ${
        featured ? "lg:col-span-2" : ""
      }`}
      style={{
        border: isLight
          ? "1px solid rgba(139, 92, 246, 0.18)"
          : "1px solid rgba(139, 92, 246, 0.14)",
        boxShadow: isLight
          ? "0 2px 8px rgba(139,92,246,0.08), 0 8px 32px rgba(139,92,246,0.06)"
          : "0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04) inset",
        background: isLight ? "rgba(255,255,255,0.92)" : "rgba(10,8,20,0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* ─── Visual zone (top) ─── */}
      <div
        className="relative overflow-hidden"
        style={{ height: featured ? "260px" : "196px" }}
      >
        {project.thumbnail ? (
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.04]"
          />
        ) : (
          <div className={`absolute inset-0 bg-linear-to-br ${gradient}`}>
            {/* Subtle grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            {/* Large initial letter */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-extrabold text-white/15 select-none"
                style={{
                  fontFamily: "var(--font-display, 'Space Grotesk')",
                  fontSize: "clamp(5rem, 18vw, 10rem)",
                  letterSpacing: "-0.06em",
                }}
              >
                {project.title.charAt(0)}
              </span>
            </div>
          </div>
        )}

        {/* Always-dark overlay on images for badge readability */}
        {project.thumbnail && (
          <div className="absolute inset-0 bg-linear-to-b from-black/30 to-transparent" />
        )}

        {/* Top badges row */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
          {/* Tech tags */}
          <div className="flex flex-wrap gap-1.5">
            {project.techList.slice(0, featured ? 5 : 3).map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md backdrop-blur-sm"
                style={{
                  background: "rgba(0,0,0,0.45)",
                  color: "rgba(255,255,255,0.82)",
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
          {/* Status badge */}
          {project.isLive ? (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(6,78,59,0.75)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              Live
            </span>
          ) : (
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.14)" }}>
              <GitHubIcon />
              Open Source
            </span>
          )}
        </div>
      </div>

      {/* ─── Content zone (bottom) ─── */}
      <div className="p-5">
        <h3
          className="font-bold leading-tight mb-1.5 transition-colors duration-200 group-hover:text-violet-600 dark:group-hover:text-violet-400"
          style={{
            fontFamily: "var(--font-display, 'Space Grotesk')",
            fontSize: featured ? "clamp(1.15rem, 2.5vw, 1.45rem)" : "1.05rem",
            letterSpacing: "-0.02em",
            color: isLight ? "#1e1b4b" : "#f5f3ff",
          }}
        >
          {project.title}
        </h3>

        {project.description && (
          <p
            className="text-sm leading-relaxed line-clamp-2 mb-4"
            style={{ color: isLight ? "#6b7280" : "rgba(255,255,255,0.5)" }}
          >
            {project.description}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {project.hasDetail && (
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white transition-all duration-150 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
            >
              Details
            </Link>
          )}
          {project.isLive && project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 hover:scale-105"
              style={{
                background: isLight ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.08)",
                color: isLight ? "#6d28d9" : "rgba(255,255,255,0.75)",
                border: isLight ? "1px solid rgba(139,92,246,0.2)" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              Live Demo <ExternalIcon />
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 hover:scale-105"
              style={{
                background: isLight ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.08)",
                color: isLight ? "#374151" : "rgba(255,255,255,0.75)",
                border: isLight ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <GitHubIcon />
              Code
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Section ───────────────────────────────── */
type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* Mounted guard — prevents hydration mismatch from resolvedTheme */
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* Default dark during SSR; switch to actual theme after mount */
  const isLight = mounted && resolvedTheme === "light";

  const processedProjects: ProcessedProject[] = projects.map((p) => ({
    ...p,
    techList: p.techStack ?? [],
    isLive: Boolean(p.demoUrl),
  }));

  return (
    <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="mb-12">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold text-violet-500 dark:text-violet-400 uppercase tracking-[0.2em] mb-4">
              <span className="w-5 h-px bg-violet-500/50" />
              Projects
            </span>
            <h2
              className="font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100"
              style={{
                fontFamily: "var(--font-display, 'Space Grotesk')",
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                letterSpacing: "-0.035em",
              }}
            >
              Things I&apos;ve built
            </h2>
            <p className="mt-2 text-neutral-400 dark:text-neutral-500 text-[15px]">
              A selection of projects from my work.
            </p>
          </div>
        </SectionReveal>

        {processedProjects.length === 0 ? (
          <SectionReveal>
            <div className="aspect-video rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 text-sm font-mono">
              Projects coming soon...
            </div>
          </SectionReveal>
        ) : !mounted ? (
          /*
           * Skeleton grid — shown before client hydration.
           * Prevents the jarring "nothing → sudden content" flash on mobile.
           * Matches the real card layout so no layout shift on hydration.
           */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {processedProjects.map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {processedProjects.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                featured={i === 0 && processedProjects.length > 2}
                isLight={isLight}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
