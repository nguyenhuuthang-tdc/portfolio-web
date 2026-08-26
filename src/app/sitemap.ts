import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/content/blogs";
import { getProjects } from "@/lib/content/projects";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ posts }, projects] = await Promise.all([
    getBlogPosts({ limit: 1000 }),
    getProjects(),
  ]);

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/writings"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/writings/${post.slug}`),
      lastModified: post.updatedAt || post.publishedAt || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...projects
      .filter((project) => project.hasDetail)
      .map((project) => ({
        url: absoluteUrl(`/projects/${project.slug}`),
        lastModified: project.completedAt || undefined,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ];
}
