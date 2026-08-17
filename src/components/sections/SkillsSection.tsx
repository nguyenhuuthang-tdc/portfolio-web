"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Skill } from "@/types/api";
import { SectionReveal } from "@/components/ui/SectionReveal";

type SkillsSectionProps = {
  skills: Skill[];
};

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});
}

const CATEGORY_META: Record<string, { icon: string; accent: string }> = {
  Frontend:  { icon: "⚡", accent: "#8b5cf6" },
  Backend:   { icon: "🔧", accent: "#6366f1" },
  Database:  { icon: "🗄️", accent: "#3b82f6" },
  DevOps:    { icon: "🚀", accent: "#a855f7" },
  Mobile:    { icon: "📱", accent: "#ec4899" },
  Tools:     { icon: "🛠️", accent: "#06b6d4" },
  Language:  { icon: "💻", accent: "#10b981" },
  Other:     { icon: "✨", accent: "#f59e0b" },
};

function defaultMeta(cat: string) {
  return CATEGORY_META[cat] ?? { icon: "✦", accent: "#8b5cf6" };
}

/*
 * Auto brand-color lookup from tech name.
 * Covers the most common tech stack — no per-skill hardcoding needed.
 * Admin can also override via the `icon` field (emoji/symbol) in the dashboard.
 */
const BRAND: Record<string, { hex: string; emoji: string }> = {
  react:        { hex: "#61DAFB", emoji: "⚛️" },
  nextjs:       { hex: "#ffffff", emoji: "▲" },
  "next.js":    { hex: "#ffffff", emoji: "▲" },
  typescript:   { hex: "#3178C6", emoji: "🔷" },
  javascript:   { hex: "#F7DF1E", emoji: "🟨" },
  nodejs:       { hex: "#339933", emoji: "🟢" },
  "node.js":    { hex: "#339933", emoji: "🟢" },
  python:       { hex: "#3776AB", emoji: "🐍" },
  go:           { hex: "#00ADD8", emoji: "🔵" },
  golang:       { hex: "#00ADD8", emoji: "🔵" },
  rust:         { hex: "#CE422B", emoji: "🦀" },
  java:         { hex: "#ED8B00", emoji: "☕" },
  kotlin:       { hex: "#7F52FF", emoji: "🟣" },
  swift:        { hex: "#F05138", emoji: "🦅" },
  php:          { hex: "#777BB4", emoji: "🐘" },
  ruby:         { hex: "#CC342D", emoji: "💎" },
  csharp:       { hex: "#239120", emoji: "🟩" },
  "c#":         { hex: "#239120", emoji: "🟩" },
  cpp:          { hex: "#00599C", emoji: "⚙️" },
  "c++":        { hex: "#00599C", emoji: "⚙️" },
  vue:          { hex: "#42B883", emoji: "💚" },
  angular:      { hex: "#DD0031", emoji: "🔴" },
  svelte:       { hex: "#FF3E00", emoji: "🔶" },
  tailwindcss:  { hex: "#06B6D4", emoji: "💨" },
  tailwind:     { hex: "#06B6D4", emoji: "💨" },
  css:          { hex: "#264DE4", emoji: "🎨" },
  html:         { hex: "#E34F26", emoji: "🌐" },
  nestjs:       { hex: "#E0234E", emoji: "🔴" },
  express:      { hex: "#8B8B8B", emoji: "⚡" },
  fastapi:      { hex: "#009688", emoji: "🚀" },
  django:       { hex: "#092E20", emoji: "🌿" },
  laravel:      { hex: "#FF2D20", emoji: "🔴" },
  postgresql:   { hex: "#336791", emoji: "🐘" },
  postgres:     { hex: "#336791", emoji: "🐘" },
  mysql:        { hex: "#4479A1", emoji: "🐬" },
  mongodb:      { hex: "#47A248", emoji: "🍃" },
  redis:        { hex: "#DC382D", emoji: "🔴" },
  sqlite:       { hex: "#003B57", emoji: "🗃️" },
  graphql:      { hex: "#E10098", emoji: "◉" },
  docker:       { hex: "#2496ED", emoji: "🐳" },
  kubernetes:   { hex: "#326CE5", emoji: "⎈" },
  aws:          { hex: "#FF9900", emoji: "☁️" },
  gcp:          { hex: "#4285F4", emoji: "☁️" },
  azure:        { hex: "#0078D4", emoji: "☁️" },
  linux:        { hex: "#FCC624", emoji: "🐧" },
  nginx:        { hex: "#009639", emoji: "🌐" },
  git:          { hex: "#F05032", emoji: "🔀" },
  github:       { hex: "#8B8B8B", emoji: "🐙" },
  firebase:     { hex: "#FFCA28", emoji: "🔥" },
  supabase:     { hex: "#3ECF8E", emoji: "💚" },
  prisma:       { hex: "#5A67D8", emoji: "🔷" },
  figma:        { hex: "#F24E1E", emoji: "🎨" },
  vercel:       { hex: "#8B8B8B", emoji: "▲" },
};

function normKey(name: string) {
  return name.toLowerCase().replace(/[\s._-]/g, "");
}

function getBrand(name: string) {
  const key = normKey(name);
  return BRAND[key] ?? BRAND[name.toLowerCase()] ?? null;
}

/* ── Single skill tag with auto brand color ── */
function SkillTag({ skill }: { skill: Skill }) {
  const brand = getBrand(skill.name);

  // Icon: prefer explicit from API, then auto brand emoji, then nothing
  const icon = skill.icon || brand?.emoji;

  const brandHex = brand?.hex;
  const alpha22 = brandHex ? `${brandHex}22` : undefined;  // ~13% opacity
  const alpha55 = brandHex ? `${brandHex}55` : undefined;  // ~33% opacity

  return (
    <motion.span
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition-all duration-150 cursor-default select-none text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
      style={brandHex ? {
        borderColor: alpha55,
        backgroundColor: alpha22,
        color: brandHex,
      } : undefined}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span style={brandHex ? { color: "inherit" } : undefined}>{skill.name}</span>
    </motion.span>
  );
}

/* ── Category card ── */
function CategoryCard({
  category,
  skills,
  index,
}: {
  category: string;
  skills: Skill[];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const meta = defaultMeta(category);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border bg-white dark:bg-neutral-900/40 p-5 transition-all duration-200 hover:shadow-lg"
      style={{
        borderColor: `${meta.accent}30`,
        boxShadow: isInView ? `0 0 0 0 ${meta.accent}00` : undefined,
      }}
      whileHover={{ borderColor: `${meta.accent}60`, boxShadow: `0 4px 24px ${meta.accent}14` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg leading-none">{meta.icon}</span>
        <h3 className="text-[11px] font-mono font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          {category}
        </h3>
        <span className="ml-auto text-[11px] font-mono text-neutral-300 dark:text-neutral-700">
          {skills.length}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillTag key={skill.id} skill={skill} />
        ))}
      </div>
    </motion.div>
  );
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const grouped = groupByCategory(skills);
  const entries = Object.entries(grouped);

  return (
    <section
      id="skills"
      className="py-16 sm:py-24 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <SectionReveal>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 text-[11px] font-mono font-semibold text-violet-500 dark:text-violet-400 uppercase tracking-[0.2em] mb-4">
              <span className="w-6 h-px bg-violet-500/50" />
              Skills
              <span className="w-6 h-px bg-violet-500/50" />
            </span>
            <h2
              className="font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 mt-2"
              style={{
                fontFamily: "var(--font-display, 'Syne')",
                fontSize: "clamp(2rem, 4.5vw, 3.25rem)",
                letterSpacing: "-0.035em",
              }}
            >
              Tech I work with
            </h2>
            <p className="mt-3 text-neutral-700 dark:text-neutral-200 max-w-sm mx-auto text-[16px]">
              Tools and technologies across the full stack.
            </p>
          </div>
        </SectionReveal>

        {entries.length === 0 ? (
          <SectionReveal>
            <p className="text-center text-neutral-400 font-mono">
              Skills coming soon...
            </p>
          </SectionReveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(([category, categorySkills], i) => (
              <CategoryCard
                key={category}
                category={category}
                skills={categorySkills}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
