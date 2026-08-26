import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { WritingsSection } from "@/components/sections/WritingsSection";
import { ContactSection } from "@/components/sections/ContactSection";
import { GalaxyBackground } from "@/components/three/GalaxyBackground";
import { getAboutSection, getSkills } from "@/lib/content/about";
import { getProjects } from "@/lib/content/projects";
import { getBlogPosts } from "@/lib/content/blogs";
import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  description: DEFAULT_DESCRIPTION,
  alternates: { canonical: "/" },
};

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
      <GalaxyBackground />
      <div className="relative z-2">
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
      </div>
    </>
  );
}
