"use client";

import { useRef, type ComponentType, type SVGProps } from "react";
import { motion, useInView } from "framer-motion";
import {
  LuCloudCog, LuCodeXml, LuDatabase, LuMonitor, LuServerCog,
  LuShapes, LuSmartphone, LuWrench,
} from "react-icons/lu";
import {
  SiAngular, SiCplusplus, SiCss, SiDjango, SiDocker, SiExpress,
  SiFastapi, SiFigma, SiFirebase, SiGit, SiGithub, SiGo,
  SiGooglecloud, SiGraphql, SiHtml5, SiJavascript, SiKotlin,
  SiKubernetes, SiLaravel, SiLinux, SiMongodb, SiMysql, SiNestjs,
  SiNextdotjs, SiNginx, SiNodedotjs, SiPhp, SiPostgresql, SiPrisma,
  SiPython, SiReact, SiRedis, SiRuby, SiRust, SiSharp, SiSqlite,
  SiSupabase, SiSvelte, SiSwift, SiTailwindcss, SiTypescript,
  SiVercel, SiVuedotjs, SiSocketdotio, 
  SiUbuntu,
  SiGitlab
} from "react-icons/si";
import { FaAws, FaJava, FaMicrosoft } from "react-icons/fa";
import { Skill } from "@/types/api";
import { SectionReveal } from "@/components/ui/SectionReveal";

type SkillsSectionProps = { skills: Skill[] };
type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
type BrandMeta = { color: string; icon: IconComponent; label: string };

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  return skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});
}

const CATEGORY_META: Record<string, { icon: IconComponent; accent: string }> = {
  Frontend: { icon: LuMonitor, accent: "#8b5cf6" },
  Backend: { icon: LuServerCog, accent: "#6366f1" },
  Database: { icon: LuDatabase, accent: "#3b82f6" },
  DevOps: { icon: LuCloudCog, accent: "#a855f7" },
  Mobile: { icon: LuSmartphone, accent: "#ec4899" },
  Tools: { icon: LuWrench, accent: "#06b6d4" },
  Language: { icon: LuCodeXml, accent: "#10b981" },
  Other: { icon: LuShapes, accent: "#f59e0b" },
};

function defaultMeta(category: string) {
  return CATEGORY_META[category] ?? CATEGORY_META.Other;
}

// Vector marks and official brand colors. Keys are normalized by `normKey`.
const BRAND: Record<string, BrandMeta> = {
  react: { color: "#61DAFB", icon: SiReact, label: "React" },
  nextjs: { color: "#A3A3A3", icon: SiNextdotjs, label: "Next.js" },
  typescript: { color: "#3178C6", icon: SiTypescript, label: "TypeScript" },
  javascript: { color: "#E8CF20", icon: SiJavascript, label: "JavaScript" },
  nodejs: { color: "#5FA04E", icon: SiNodedotjs, label: "Node.js" },
  python: { color: "#3776AB", icon: SiPython, label: "Python" },
  go: { color: "#00ADD8", icon: SiGo, label: "Go" },
  golang: { color: "#00ADD8", icon: SiGo, label: "Go" },
  rust: { color: "#CE422B", icon: SiRust, label: "Rust" },
  java: { color: "#ED8B00", icon: FaJava, label: "Java" },
  kotlin: { color: "#7F52FF", icon: SiKotlin, label: "Kotlin" },
  swift: { color: "#F05138", icon: SiSwift, label: "Swift" },
  php: { color: "#777BB4", icon: SiPhp, label: "PHP" },
  ruby: { color: "#CC342D", icon: SiRuby, label: "Ruby" },
  csharp: { color: "#512BD4", icon: SiSharp, label: "C#" },
  cpp: { color: "#00599C", icon: SiCplusplus, label: "C++" },
  vue: { color: "#42B883", icon: SiVuedotjs, label: "Vue" },
  vuejs: { color: "#42B883", icon: SiVuedotjs, label: "Vue.js" },
  angular: { color: "#DD0031", icon: SiAngular, label: "Angular" },
  svelte: { color: "#FF3E00", icon: SiSvelte, label: "Svelte" },
  tailwind: { color: "#06B6D4", icon: SiTailwindcss, label: "Tailwind CSS" },
  tailwindcss: { color: "#06B6D4", icon: SiTailwindcss, label: "Tailwind CSS" },
  css: { color: "#663399", icon: SiCss, label: "CSS" },
  css3: { color: "#663399", icon: SiCss, label: "CSS" },
  html: { color: "#E34F26", icon: SiHtml5, label: "HTML" },
  html5: { color: "#E34F26", icon: SiHtml5, label: "HTML" },
  nestjs: { color: "#E0234E", icon: SiNestjs, label: "NestJS" },
  express: { color: "#A3A3A3", icon: SiExpress, label: "Express" },
  expressjs: { color: "#A3A3A3", icon: SiExpress, label: "Express" },
  fastapi: { color: "#009688", icon: SiFastapi, label: "FastAPI" },
  django: { color: "#44B78B", icon: SiDjango, label: "Django" },
  laravel: { color: "#FF2D20", icon: SiLaravel, label: "Laravel" },
  websocket: { color: "#FF2D20", icon: SiSocketdotio, label: "WebSocket" },
  postgresql: { color: "#4169E1", icon: SiPostgresql, label: "PostgreSQL" },
  postgres: { color: "#4169E1", icon: SiPostgresql, label: "PostgreSQL" },
  mysql: { color: "#4479A1", icon: SiMysql, label: "MySQL" },
  mongodb: { color: "#47A248", icon: SiMongodb, label: "MongoDB" },
  redis: { color: "#FF4438", icon: SiRedis, label: "Redis" },
  sqlite: { color: "#55A6D9", icon: SiSqlite, label: "SQLite" },
  graphql: { color: "#E10098", icon: SiGraphql, label: "GraphQL" },
  docker: { color: "#2496ED", icon: SiDocker, label: "Docker" },
  kubernetes: { color: "#326CE5", icon: SiKubernetes, label: "Kubernetes" },
  aws: { color: "#FF9900", icon: FaAws, label: "AWS" },
  amazonwebservices: { color: "#FF9900", icon: FaAws, label: "AWS" },
  gcp: { color: "#4285F4", icon: SiGooglecloud, label: "Google Cloud" },
  googlecloud: { color: "#4285F4", icon: SiGooglecloud, label: "Google Cloud" },
  azure: { color: "#0078D4", icon: FaMicrosoft, label: "Microsoft Azure" },
  microsoftazure: { color: "#0078D4", icon: FaMicrosoft, label: "Microsoft Azure" },
  ubuntu: { color: "#FCC624", icon: SiUbuntu, label: "Ubuntu" },
  nginx: { color: "#009639", icon: SiNginx, label: "NGINX" },
  git: { color: "#F05032", icon: SiGit, label: "Git" },
  github: { color: "#A3A3A3", icon: SiGithub, label: "GitHub" },
  gitlab: { color: "#E24329", icon: SiGitlab, label: "Gitlab" },
  firebase: { color: "#FFCA28", icon: SiFirebase, label: "Firebase" },
  supabase: { color: "#3FCF8E", icon: SiSupabase, label: "Supabase" },
  prisma: { color: "#A3A3A3", icon: SiPrisma, label: "Prisma" },
  figma: { color: "#F24E1E", icon: SiFigma, label: "Figma" },
  vercel: { color: "#A3A3A3", icon: SiVercel, label: "Vercel" },
};

function normKey(name: string) {
  return name
    .toLowerCase()
    .replace(/c\+\+/g, "cpp")
    .replace(/c#/g, "csharp")
    .replace(/[^a-z0-9]/g, "");
}

function getBrands(name: string) {
  const parts = name
    .split(/\s*(?:\/|,|&|\band\b)\s*|\s+\+\s+/i)
    .filter(Boolean);
  const matches = parts
    .map((part) => BRAND[normKey(part)])
    .filter((brand): brand is BrandMeta => Boolean(brand));

  if (matches.length > 0) {
    return Array.from(new Map(matches.map((brand) => [brand.label, brand])).values());
  }

  const exact = BRAND[normKey(name)];
  return exact ? [exact] : [];
}

function SkillTag({ skill }: { skill: Skill }) {
  const brands = getBrands(skill.name);
  const primaryColor = brands[0]?.color;

  return (
    <motion.span
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-[13px] font-medium text-neutral-700 transition-all duration-150 select-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      style={primaryColor ? {
        borderColor: `color-mix(in srgb, ${primaryColor} 35%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${primaryColor} 10%, transparent)`,
      } : undefined}
    >
      {brands.length > 0 ? (
        <span className="flex items-center gap-1" aria-hidden="true">
          {brands.map(({ color, icon: BrandIcon, label }) => (
            <BrandIcon key={label} className="size-4 shrink-0" style={{ color }} />
          ))}
        </span>
      ) : skill.icon ? (
        <span className="text-base leading-none" aria-hidden="true">{skill.icon}</span>
      ) : (
        <LuCodeXml className="size-4 text-neutral-400" aria-hidden="true" />
      )}
      <span>{skill.name}</span>
    </motion.span>
  );
}

function CategoryCard({ category, skills, index }: { category: string; skills: Skill[]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const meta = defaultMeta(category);
  const CategoryIcon = meta.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border bg-white p-5 transition-all duration-200 hover:shadow-lg dark:bg-neutral-900/70"
      style={{ borderColor: `${meta.accent}30` }}
      whileHover={{ borderColor: `${meta.accent}60`, boxShadow: `0 4px 24px ${meta.accent}14` }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg" style={{ color: meta.accent, backgroundColor: `${meta.accent}14` }}>
          <CategoryIcon className="size-[18px]" aria-hidden="true" />
        </span>
        <h3 className="text-[11px] font-mono font-semibold text-neutral-400 uppercase tracking-widest dark:text-neutral-500">{category}</h3>
        {/* <span className="ml-auto text-[11px] font-mono text-neutral-300 dark:text-neutral-700">{skills.length}</span> */}
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => <SkillTag key={skill.id} skill={skill} />)}
      </div>
    </motion.div>
  );
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  const entries = Object.entries(groupByCategory(skills));

  return (
    <section id="skills" className="py-16 sm:py-24 px-4 sm:px-6">
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
              style={{ fontFamily: "var(--font-display, 'Syne')", fontSize: "clamp(2rem, 4.5vw, 3.25rem)", letterSpacing: "-0.035em" }}
            >
              Tech I work with
            </h2>
            <p className="mt-3 text-neutral-700 dark:text-neutral-200 max-w-sm mx-auto text-[16px]">Tools and technologies across the full stack.</p>
          </div>
        </SectionReveal>

        {entries.length === 0 ? (
          <SectionReveal>
            <p className="text-center text-neutral-400 font-mono">Skills coming soon...</p>
          </SectionReveal>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {entries.map(([category, categorySkills], index) => (
              <CategoryCard key={category} category={category} skills={categorySkills} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
