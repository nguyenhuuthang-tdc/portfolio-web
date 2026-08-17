import { AboutSection, Skill } from '@/types/api';
import { apiFetch } from '@/lib/api/client';

const STATIC_SECTIONS: Record<string, string> = {
  hero: 'Software Developer passionate about building modern, user-centric web experiences.',
  about_me:
    'I am a full-stack developer with a love for clean code, great UX, and continuous learning. When not coding, I play guitar and think about life.',
  experience: '',
};

const STATIC_SKILLS: Skill[] = [
  { id: 1, name: 'TypeScript', category: 'Frontend', level: 5, icon: null, order: 0, isVisible: true },
  { id: 2, name: 'React / Next.js', category: 'Frontend', level: 5, icon: null, order: 1, isVisible: true },
  { id: 3, name: 'Node.js', category: 'Backend', level: 4, icon: null, order: 2, isVisible: true },
  { id: 4, name: 'MySQL', category: 'Database', level: 4, icon: null, order: 3, isVisible: true },
  { id: 5, name: 'Docker', category: 'DevOps', level: 3, icon: null, order: 4, isVisible: true },
];

export async function getAboutSections(): Promise<AboutSection[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: AboutSection[] }>(
        '/api/about/sections',
        { revalidate: 86400 }
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
        `/api/about/sections/${key}`,
        { revalidate: 86400 }
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
        '/api/about/skills',
        { revalidate: 86400 }
      );
      return res.data;
    } catch {
      // fall through
    }
  }
  return STATIC_SKILLS;
}
