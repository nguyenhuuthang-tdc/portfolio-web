import Link from "next/link";
import type { Project } from "@/types/api";
import { SectionReveal } from "@/components/ui/SectionReveal";

type ProcessedProject = Project & {
  techList: string[];
  isLive: boolean;
};

function ExternalIcon() {
  return (
    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function ProjectStatus({ project }: { project: ProcessedProject }) {
  if (project.isLive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Live
      </span>
    );
  }

  if (project.githubUrl) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/20 bg-violet-500/[0.07] px-2.5 py-1 text-[11px] font-medium text-violet-700 dark:text-violet-300">
        <GitHubIcon />
        Open Source
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/80 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
      <span className={`size-1.5 rounded-full ${project.status === "in_progress" ? "bg-amber-500" : "bg-neutral-400"}`} />
      {project.status === "in_progress" ? "In Progress" : "Client Project"}
    </span>
  );
}

function TechStack({ technologies }: { technologies: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {technologies.map((tech) => (
        <span
          key={tech}
          className="rounded-md border border-neutral-200/80 bg-neutral-50 px-2.5 py-1 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400"
        >
          {tech}
        </span>
      ))}
    </div>
  );
}

function ProjectActions({ project }: { project: ProcessedProject }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {project.hasDetail && (
        <Link
          href={`/projects/${project.slug}`}
          className="group/link inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
        >
          View case study
          <span className="transition-transform group-hover/link:translate-x-0.5"><ArrowIcon /></span>
        </Link>
      )}
      {project.isLive && project.demoUrl && (
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-violet-700 dark:hover:text-violet-400"
        >
          Live Demo <ExternalIcon />
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:border-violet-300 hover:text-violet-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-violet-700 dark:hover:text-violet-400"
        >
          <GitHubIcon />
          Source
        </a>
      )}
    </div>
  );
}

function ProjectCard({ project, index, featured }: { project: ProcessedProject; index: number; featured: boolean }) {
  const projectNumber = String(index + 1).padStart(2, "0");

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-500/[0.06] dark:border-neutral-800/80 dark:bg-neutral-950/80 dark:hover:border-violet-700/60 ${
        featured ? "md:col-span-2 sm:p-8" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-violet-500 via-indigo-400/70 to-transparent opacity-70" />
      <div className="pointer-events-none absolute top-0 right-0 size-28 bg-linear-to-bl from-violet-600/[0.08] to-transparent blur-sm" />

      <header className="relative mb-7 flex items-center justify-between gap-4">
        <span className="font-mono text-[10px] font-medium tracking-[0.18em] text-neutral-400 dark:text-neutral-600">
          {/* ~/PROJECTS/{projectNumber} */}
        </span>
        <ProjectStatus project={project} />
      </header>

      <div className={`relative flex flex-1 flex-col ${featured ? "lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.65fr)] lg:gap-14" : ""}`}>
        <div className="flex flex-col">
          <h3
            className={`font-bold leading-[1.08] tracking-[-0.035em] text-neutral-950 transition-colors group-hover:text-violet-700 dark:text-neutral-50 dark:group-hover:text-violet-300 ${
              featured ? "text-3xl sm:text-4xl" : "text-2xl"
            }`}
            style={{ fontFamily: "var(--font-display, 'Space Grotesk')" }}
          >
            {project.title}
          </h3>

          {project.description && (
            <p className={`mt-4 text-sm leading-7 text-neutral-600 dark:text-neutral-400 ${featured ? "max-w-2xl sm:text-[15px]" : "line-clamp-3"}`}>
              {project.description}
            </p>
          )}

          <div className="mt-7 hidden lg:block">
            {featured && <ProjectActions project={project} />}
          </div>
        </div>

        <div className={`${featured ? "mt-8 border-t border-neutral-200/70 pt-6 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 dark:border-neutral-800" : "mt-7"}`}>
          {featured && (
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400 dark:text-neutral-600">
              Core stack
            </p>
          )}
          <TechStack technologies={project.techList} />
        </div>
      </div>

      <footer className={`relative mt-7 border-t border-neutral-200/70 pt-5 dark:border-neutral-800 ${featured ? "lg:hidden" : ""}`}>
        <ProjectActions project={project} />
      </footer>
    </article>
  );
}

type ProjectsSectionProps = {
  projects: Project[];
};

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const processedProjects: ProcessedProject[] = projects.map((project) => ({
    ...project,
    techList: project.techStack ?? [],
    isLive: Boolean(project.demoUrl),
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
          </div>
        </SectionReveal>

        {processedProjects.length === 0 ? (
          <SectionReveal>
            <div className="aspect-video rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-400 text-sm font-mono">
              Projects coming soon...
            </div>
          </SectionReveal>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {processedProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                featured={index === 0 && processedProjects.length > 2}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
