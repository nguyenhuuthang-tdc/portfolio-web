import { Project } from '@/types/api';
import { apiFetch } from '@/lib/api/client';

const STATIC_PROJECTS: Project[] = [];

export async function getProjects(): Promise<Project[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Project[] }>('/api/projects', {
        revalidate: 3600,
      });
      return res.data;
    } catch {
      // fall through
    }
  }
  return STATIC_PROJECTS;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Project }>(
        `/api/projects/slug/${slug}`,
        { revalidate: 3600 }
      );
      return res.data;
    } catch {
      // fall through
    }
  }
  return STATIC_PROJECTS.find((p) => p.slug === slug) ?? null;
}
