export const cacheTags = {
  blogs: 'content:blogs',
  blog: (slug: string) => `content:blog:${slug}`,
  blogCategories: 'content:blog-categories',
  projects: 'content:projects',
  project: (slug: string) => `content:project:${slug}`,
  about: 'content:about',
  aboutSection: (key: string) => `content:about:${key}`,
  skills: 'content:skills',
} as const;
