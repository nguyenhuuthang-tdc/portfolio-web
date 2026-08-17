import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { WritingsSection } from "@/components/sections/WritingsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { getAboutSection, getSkills } from "@/lib/content/about";
import { getProjects } from "@/lib/content/projects";
import { getBlogPosts } from "@/lib/content/blogs";

export const revalidate = 3600;

export default async function HomePage() {
  const [bio, aboutMe, skills, projects, { posts }] = await Promise.all([
    getAboutSection("hero"),
    getAboutSection("about_me"),
    getSkills(),
    getProjects(),
    getBlogPosts({ limit: 6 }),
  ]);

  return (
    <>
      <HeroSection bio={bio} />
      {/*
       * page-grid: dot-grid background applied only to sections below the hero.
       * This ensures the hero's bottom fade (from-neutral-50 / from-neutral-950)
       * perfectly matches the plain body bg, with no dot-mismatch at the edge.
       */}
      <div className="page-grid">
        <AboutSection content={aboutMe} />
        <SkillsSection skills={skills} />
        <ProjectsSection projects={projects} />
        <WritingsSection posts={posts} />
        <ContactSection />
      </div>

      {/* Footer */}
      <footer className="py-10 px-4 sm:px-6 border-t border-neutral-100 dark:border-neutral-800/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono text-neutral-400 dark:text-neutral-600">
            © {new Date().getFullYear()}{" "}
            <span className="gradient-text font-semibold">winphony</span>
            .com
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-neutral-400 dark:text-neutral-600">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              GitHub
            </a>
            <span className="w-px h-3 bg-neutral-200 dark:bg-neutral-800" />
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
