import { AboutSection, Skill } from '@/types/api';
import { apiFetch } from '@/lib/api/client';
import { cacheTags } from '@/lib/cache/tags';

const STATIC_SECTIONS: Record<string, string> = {
  hero: 'Software Developer passionate about building modern, user-centric web experiences.',
  about_me:
    "Full-stack developer with a strong passion for elegant logic, pixel-perfect interfaces, and code that doesn't break at 2 AM. Driven by continuous learning, continuous integration, and continuous curiosity.",
  experience: '',
};

const STATIC_SKILLS: Skill[] = [
  { id: 0, name: 'Javascript', category: 'Language', level: 5, icon: null, order: 0, isVisible: true },
  { id: 1, name: 'TypeScript', category: 'Language', level: 5, icon: null, order: 1, isVisible: true },
  { id: 2, name: 'PHP', category: 'Language', level: 5, icon: null, order: 2, isVisible: true },
  { id: 3, name: 'HTML / CSS', category: 'Frontend', level: 5, icon: null, order: 0, isVisible: true },
  { id: 4, name: 'AJAX', category: 'Frontend', level: 5, icon: null, order: 0, isVisible: true },
  { id: 5, name: 'PWA', category: 'Frontend', level: 5, icon: null, order: 0, isVisible: true },
  { id: 6, name: 'React / Next.js', category: 'Frontend', level: 5, icon: null, order: 3, isVisible: true },
  { id: 7, name: 'Vue / Nuxt.js', category: 'Frontend', level: 5, icon: null, order: 4, isVisible: true },
  { id: 8, name: 'TailwindCSS', category: 'Frontend', level: 5, icon: null, order: 5, isVisible: true },
  { id: 9, name: 'Node.js', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 10, name: 'Express', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 11, name: 'Laravel', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 12, name: 'GraphQL', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 13, name: 'Redis', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 14, name: 'WebSocket', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 15, name: 'MySQL', category: 'Database', level: 4, icon: null, order: 3, isVisible: true },
  { id: 16, name: 'PostgreSQL', category: 'Database', level: 4, icon: null, order: 3, isVisible: true },
  { id: 17, name: 'Firebase', category: 'Database', level: 4, icon: null, order: 3, isVisible: true },
  { id: 18, name: 'Docker', category: 'DevOps', level: 3, icon: null, order: 4, isVisible: true },
  { id: 19, name: 'Nginx', category: 'DevOps', level: 3, icon: null, order: 4, isVisible: true },
  { id: 20, name: 'Ubuntu', category: 'DevOps', level: 3, icon: null, order: 4, isVisible: true },
  { id: 21, name: 'Git / Github / Gitlab', category: 'DevOps', level: 3, icon: null, order: 4, isVisible: true },
  { id: 22, name: 'CI/CD', category: 'DevOps', level: 3, icon: null, order: 4, isVisible: true },
  { id: 23, name: 'AWS (S3)', category: 'Other', level: 3, icon: null, order: 4, isVisible: true },
  { id: 24, name: 'Google Cloud Pub/Sub', category: 'Other', level: 3, icon: null, order: 4, isVisible: true },
//   Docker, Docker Compose, Nginx, Git (GitHub/GitLab), CI/CD, AWS (S3
];

export async function getAboutSections(): Promise<AboutSection[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: AboutSection[] }>(
        '/api/v1/public/about/sections',
        {
          revalidate: 86400,
          tags: [cacheTags.about],
        }
      );
      return res.data;
    } catch {
      // fall through
    }
  }
  return Object.entries(STATIC_SECTIONS).map(([key, content], i) => ({
    id: i + 1,
    key,
    content,
    label: key.replace(/_/g, ' '),
    updatedAt: new Date().toISOString(),
  }));
}

export async function getAboutSection(key: string): Promise<string> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: AboutSection }>(
        `/api/v1/public/about/sections/${key}`,
        {
          revalidate: 86400,
          tags: [cacheTags.about, cacheTags.aboutSection(key)],
        }
      );
      return res.data.content;
    } catch {
      // fall through
    }
  }
  return STATIC_SECTIONS[key] ?? '';
}

export async function getSkills(): Promise<Skill[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Skill[] }>(
        '/api/v1/public/about/skills',
        {
          revalidate: 86400,
          tags: [cacheTags.skills],
        }
      );
      return res.data;
    } catch {
      // fall through
    }
  }
  return STATIC_SKILLS;
}
