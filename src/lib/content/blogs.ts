import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Blog, BlogCategory, PaginatedResponse } from '@/types/api';
import { apiFetch } from '@/lib/api/client';

const CONTENT_DIR = path.join(process.cwd(), 'content/writings');

// --- Local MDX fallback ---

function getLocalPosts(): Blog[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), 'utf-8');
      const { data, content } = matter(raw);
      return {
        id: data.id ?? 0,
        title: data.title ?? filename.replace(/\.(mdx|md)$/, ''),
        slug: data.slug ?? filename.replace(/\.(mdx|md)$/, ''),
        content,
        excerpt: data.excerpt ?? null,
        thumbnail: data.thumbnail ?? null,
        status: 'published' as const,
        viewCount: data.viewCount ?? 0,
        publishedAt: data.publishedAt ?? null,
        categories: data.categories ?? [],
        createdAt: data.createdAt ?? new Date().toISOString(),
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) return 0;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

function getLocalPostBySlug(slug: string): Blog | null {
  const posts = getLocalPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

// --- Public API ---

export async function getBlogPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
}): Promise<{ posts: Blog[]; total: number; page: number; limit: number; totalPages: number }> {
  if (process.env.API_URL) {
    try {
      const qs = new URLSearchParams({
        status: 'published',
        page: String(params?.page ?? 1),
        limit: String(params?.limit ?? 10),
        ...(params?.category ? { category: params.category } : {}),
      });

	  console.log(qs.toString());

      const res = await apiFetch<PaginatedResponse<Blog>>(`/api/blogs?${qs}`, {
        revalidate: 3600,
      });

      console.log(res);

      return {
        posts: res.data,
        total: res.pagination.total,
        page: res.pagination.page,
        limit: res.pagination.limit,
        totalPages: res.pagination.totalPages,
      };
    } catch {
      // fall through to local
    }
  }

  const all = getLocalPosts();
  const filtered = params?.category
    ? all.filter((p) => p.categories.some((c) => c.slug === params.category))
    : all;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const posts = filtered.slice(start, start + limit);

  return {
    posts,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
  };
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: Blog }>(
        `/api/blogs/slug/${slug}`,
        { revalidate: 3600 }
      );
      return res.data;
    } catch {
      // fall through
    }
  }

  return getLocalPostBySlug(slug);
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  if (process.env.API_URL) {
    try {
      const res = await apiFetch<{ success: boolean; data: BlogCategory[] }>(
        '/api/blogs/categories',
        { revalidate: 86400 }
      );
      return res.data;
    } catch {
      // fall through
    }
  }
  return [];
}

export async function recordBlogView(blogId: number): Promise<void> {
  if (!process.env.NEXT_PUBLIC_API_URL) return;
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/${blogId}/view`, {
      method: 'POST',
    });
  } catch {
    // silent
  }
}
