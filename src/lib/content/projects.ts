import fs from 'fs';
import path from 'path';
import type { ComponentType } from 'react';
import type { Project } from '@/types/api';
import { apiFetch } from '@/lib/api/client';

const CONTENT_DIR = path.join(process.cwd(), 'content/projects');

type ProjectMdxModule = {
  default: ComponentType;
  metadata: Omit<Project, 'detailContent'>;
};

function getLocalProjectSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((filename) => filename.endsWith('.mdx'))
    .map((filename) => filename.replace(/\.mdx$/, ''));
}

async function loadLocalProject(slug: string): Promise<ProjectMdxModule | null> {
  if (!getLocalProjectSlugs().includes(slug)) return null;

  return import(`../../../content/projects/${slug}.mdx`) as Promise<ProjectMdxModule>;
}

function toProject(metadata: ProjectMdxModule['metadata']): Project {
  return {
    ...metadata,
    // Local detail content is rendered from the MDX component, not as raw HTML.
    detailContent: null,
  };
}

async function getLocalProjects(): Promise<Project[]> {
  const modules = await Promise.all(getLocalProjectSlugs().map(loadLocalProject));

  return modules
    .filter((module): module is ProjectMdxModule => Boolean(module))
    .map(({ metadata }) => toProject(metadata))
    .sort((a, b) => a.order - b.order);
}

export async function getProjects(): Promise<Project[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Project[] }>('/api/projects');
      return res.data;
    } catch {
      // fall through to local MDX
    }
  }

  return getLocalProjects();
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Project }>(
        `/api/projects/slug/${encodeURIComponent(slug)}`
      );
      return res.data;
    } catch {
      // fall through to local MDX
    }
  }

  const projectModule = await loadLocalProject(slug);
  return projectModule ? toProject(projectModule.metadata) : null;
}

export async function getProjectMdxComponent(slug: string): Promise<ComponentType | null> {
  const projectModule = await loadLocalProject(slug);
  return projectModule?.default ?? null;
}
