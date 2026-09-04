import fs from 'fs';
import path from 'path';
import type { ComponentType } from 'react';
import type { Blog, BlogCategory, PaginatedResponse } from '@/types/api';
import { apiFetch } from '@/lib/api/client';
import { cacheTags } from '@/lib/cache/tags';

const CONTENT_DIR = path.join(process.cwd(), 'content/writings');

type BlogMdxModule = {
  default: ComponentType;
  metadata: Omit<Blog, 'content'>;
};

export type BlogDetail = {
  post: Blog;
  MdxContent: ComponentType | null;
};

function getLocalBlogSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((filename) => filename.endsWith('.mdx'))
    .map((filename) => filename.replace(/\.mdx$/, ''));
}

async function importLocalBlog(slug: string): Promise<BlogMdxModule> {
  return import(`../../../content/writings/${slug}.mdx`) as Promise<BlogMdxModule>;
}

async function loadLocalBlog(slug: string): Promise<BlogMdxModule | null> {
  if (!getLocalBlogSlugs().includes(slug)) return null;
  return importLocalBlog(slug);
}

function toBlog(metadata: BlogMdxModule['metadata'], slug: string): Blog {
  const source = fs.readFileSync(path.join(CONTENT_DIR, `${slug}.mdx`), 'utf-8');
  return { ...metadata, content: source };
}

async function getLocalPosts(): Promise<Blog[]> {
  const slugs = getLocalBlogSlugs();
  const modules = await Promise.all(slugs.map(importLocalBlog));

  return modules
    .map(({ metadata }, index) => toBlog(metadata, slugs[index]))
    .filter((post) => post.status === 'published')
    .sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

function uniqueCategories(posts: Blog[]): BlogCategory[] {
  return Array.from(
    new Map(posts.flatMap((post) => post.categories).map((category) => [category.slug, category])).values()
  );
}

export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{ posts: Blog[]; total: number; page: number; limit: number; totalPages: number }> {
  if (process.env.API_URL) {
    try {
      const qs = new URLSearchParams({
        page: String(params?.page ?? 1),
        limit: String(params?.limit ?? 10),
        ...(params?.category ? { category: params.category } : {}),
      });
      const res = await apiFetch<PaginatedResponse<Blog>>(`/api/v1/public/blogs?${qs}`, {
        revalidate: 3600,
        tags: [cacheTags.blogs],
      });

      return {
        posts: res.data,
        total: res.pagination.total,
        page: res.pagination.page,
        limit: res.pagination.limit,
        totalPages: res.pagination.totalPages,
      };
    } catch {
      // fall through to local MDX
    }
  }

  const all = await getLocalPosts();
  const filtered = params?.category
    ? all.filter((post) => post.categories.some((category) => category.slug === params.category))
    : all;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;

  return {
    posts: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

export async function getBlogDetail(slug: string): Promise<BlogDetail | null> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Blog }>(
        `/api/v1/public/blogs/slug/${encodeURIComponent(slug)}`,
        {
          revalidate: 3600,
          tags: [cacheTags.blogs, cacheTags.blog(slug)],
        }
      );
      return { post: res.data, MdxContent: null };
    } catch {
      // fall through to local MDX
    }
  }

  const blogModule = await loadLocalBlog(slug);
  if (!blogModule) return null;

  return {
    post: toBlog(blogModule.metadata, slug),
    MdxContent: blogModule.default,
  };
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  return (await getBlogDetail(slug))?.post ?? null;
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: BlogCategory[] }>(
        '/api/v1/public/blogs/categories',
        {
          revalidate: 86400,
          tags: [cacheTags.blogCategories],
        }
      );
      return res.data;
    } catch {
      // fall through to local MDX
    }
  }

  return uniqueCategories(await getLocalPosts());
}

export async function recordBlogView(blogId: number): Promise<void> {
  if (!process.env.NEXT_PUBLIC_API_URL) return;
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/public/blogs/${blogId}/view`, {
      method: 'POST',
    });
  } catch {
    // silent
  }
}
