/**
 * Incremental CMS → local MDX sync (writings + projects).
 *
 *   CMS_API_URL=http://localhost:4000 npm run sync:cms
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.resolve(__dirname, '..');
const WRITINGS_DIR = path.join(WEB_ROOT, 'content/writings');
const PROJECTS_DIR = path.join(WEB_ROOT, 'content/projects');
const IMAGES_ROOT = path.join(WEB_ROOT, 'public/images');
const STATE_PATH = path.join(WEB_ROOT, 'content/.sync-state.json');

const API = (process.env.CMS_API_URL || process.env.API_URL || 'http://localhost:4000').replace(
  /\/$/,
  ''
);

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function jsLiteral(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => `${inner}${jsLiteral(item, indent + 1)}`).join(',\n');
    return `[\n${items},\n${pad}]`;
  }
  const keys = Object.keys(value);
  const items = keys.map((key) => `${inner}${key}: ${jsLiteral(value[key], indent + 1)}`).join(',\n');
  return `{\n${items},\n${pad}}`;
}

function writeMdx(filepath, metadata, body) {
  const source = `export const metadata = ${jsLiteral(metadata)}\n\n${body.trim()}\n`;
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, source, 'utf8');
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { categoriesHash: '', writings: {}, projects: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function apiGet(pathname) {
  const res = await fetch(`${API}${pathname}`);
  if (!res.ok) {
    throw new Error(`GET ${pathname} → ${res.status}`);
  }
  return res.json();
}

function resolveMediaUrl(src) {
  if (!src) return null;
  if (src.startsWith('data:')) return null;
  if (src.startsWith('/images/')) return null;

  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const parsed = new URL(src);
      if (parsed.pathname.startsWith('/uploads/')) return `${API}${parsed.pathname}`;
      return src;
    } catch {
      return src;
    }
  }

  const pathName = src.startsWith('/') ? src : `/${src}`;
  if (!pathName.startsWith('/uploads/')) return null;
  return `${API}${pathName}`;
}

function collectMarkdownUrls(markdown) {
  const urls = [];
  const md = markdown.matchAll(/!\[[^\]]*]\(([^)]+)\)/g);
  for (const match of md) urls.push(match[1].trim());
  const html = markdown.matchAll(/<img[^>]+src=["']([^"']+)["']/gi);
  for (const match of html) urls.push(match[1].trim());
  return urls;
}

function extFromUrl(url, fallback = 'webp') {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).replace('.', '').toLowerCase();
    if (ext) return ext.split('?')[0];
  } catch {
    const ext = path.extname(url).replace('.', '').toLowerCase();
    if (ext) return ext;
  }
  return fallback;
}

function safeBase(url) {
  try {
    const base = path.basename(new URL(url).pathname);
    return base.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase() || 'image';
  } catch {
    return 'image';
  }
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${url} → ${res.status}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function materializeImages(kind, slug, markdown, thumbnail) {
  const dir = path.join(IMAGES_ROOT, kind, slug);
  fs.mkdirSync(dir, { recursive: true });
  let nextBody = markdown;
  let nextThumb = thumbnail ?? null;

  const thumbUrl = resolveMediaUrl(thumbnail);
  if (thumbUrl) {
    const ext = extFromUrl(thumbUrl, 'webp');
    const filename = `thumbnail.${ext}`;
    await download(thumbUrl, path.join(dir, filename));
    nextThumb = `/images/${kind}/${slug}/${filename}`;
  } else if (thumbnail?.startsWith('/images/')) {
    nextThumb = thumbnail;
  }

  const seen = new Map();
  for (const raw of collectMarkdownUrls(markdown)) {
    const url = resolveMediaUrl(raw);
    if (!url || seen.has(raw)) continue;
    const ext = extFromUrl(url, 'webp');
    const filename = `${hash(url).slice(0, 8)}-${safeBase(url)}.${ext}`;
    await download(url, path.join(dir, filename));
    const local = `/images/${kind}/${slug}/${filename}`;
    seen.set(raw, local);
    nextBody = nextBody.split(raw).join(local);
    // Surrounding HTML attrs (width, data-align) stay on the same <img> tag.
  }

  return { body: nextBody, thumbnail: nextThumb };
}

function iso(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

function blogMetadata(post, thumbnail) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt ?? null,
    thumbnail: thumbnail ?? null,
    status: post.status,
    viewCount: post.viewCount ?? 0,
    publishedAt: iso(post.publishedAt),
    categories: (post.categories ?? []).map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      color: cat.color,
      description: cat.description ?? null,
    })),
    createdAt: iso(post.createdAt),
    updatedAt: iso(post.updatedAt),
  };
}

function projectMetadata(project) {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description ?? null,
    techStack: project.techStack ?? null,
    githubUrl: project.githubUrl ?? null,
    demoUrl: project.demoUrl ?? null,
    thumbnail: null,
    hasDetail: Boolean(project.hasDetail && project.detailContent),
    order: project.order ?? 0,
    status: project.status,
    completedAt: iso(project.completedAt),
  };
}

async function syncWritings(state) {
  const { data } = await apiGet('/api/blogs/sync-index');
  const catalogChanged = data.categoriesHash !== state.categoriesHash;
  const remoteSlugs = new Set(data.posts.map((p) => p.slug));
  let changed = 0;

  for (const item of data.posts) {
    const prev = state.writings[item.slug];
    const updatedAt = iso(item.updatedAt);
    const stale = !prev || prev.updatedAt !== updatedAt;
    if (!stale && !catalogChanged) continue;

    const { data: post } = await apiGet(`/api/blogs/slug/${encodeURIComponent(item.slug)}`);
    const { body, thumbnail } = stale
      ? await materializeImages('writings', post.slug, post.content || '', post.thumbnail)
      : { body: extractBody(path.join(WRITINGS_DIR, `${item.slug}.mdx`)) || post.content || '', thumbnail: prev?.thumbnail };
    const contentHash = hash(body);
    if (!stale && prev?.contentHash === contentHash && !catalogChanged) continue;

    writeMdx(path.join(WRITINGS_DIR, `${post.slug}.mdx`), blogMetadata(post, thumbnail), body);
    state.writings[item.slug] = {
      id: post.id,
      updatedAt,
      contentHash,
      thumbnail,
    };
    changed += 1;
    console.log(`✓ writing ${post.slug}${stale ? '' : ' (categories)'}`);
  }

  for (const slug of Object.keys(state.writings)) {
    if (remoteSlugs.has(slug)) continue;
    fs.rmSync(path.join(WRITINGS_DIR, `${slug}.mdx`), { force: true });
    fs.rmSync(path.join(IMAGES_ROOT, 'writings', slug), { recursive: true, force: true });
    delete state.writings[slug];
    changed += 1;
    console.log(`– removed writing ${slug}`);
  }

  state.categoriesHash = data.categoriesHash;
  return changed;
}

function extractBody(filepath) {
  if (!fs.existsSync(filepath)) return '';
  const source = fs.readFileSync(filepath, 'utf8');
  if (!source.startsWith('export const metadata')) return source.trim();
  const start = source.indexOf('{');
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(i + 1).trim();
    }
  }
  return source.trim();
}

async function syncProjects(state) {
  const { data } = await apiGet('/api/projects/sync-index');
  const remoteSlugs = new Set(data.projects.map((p) => p.slug));
  let changed = 0;

  for (const item of data.projects) {
    const prev = state.projects[item.slug];
    const updatedAt = iso(item.updatedAt);
    if (prev && prev.updatedAt === updatedAt) continue;

    const { data: project } = await apiGet(`/api/projects/slug/${encodeURIComponent(item.slug)}`);
    const { body } = await materializeImages('projects', project.slug, project.detailContent || '', null);
    const contentHash = hash(body);
    if (prev && prev.contentHash === contentHash && prev.updatedAt === updatedAt) continue;

    writeMdx(path.join(PROJECTS_DIR, `${project.slug}.mdx`), projectMetadata(project), body);
    state.projects[item.slug] = { id: project.id, updatedAt, contentHash };
    changed += 1;
    console.log(`✓ project ${project.slug}`);
  }

  for (const slug of Object.keys(state.projects)) {
    if (remoteSlugs.has(slug)) continue;
    fs.rmSync(path.join(PROJECTS_DIR, `${slug}.mdx`), { force: true });
    fs.rmSync(path.join(IMAGES_ROOT, 'projects', slug), { recursive: true, force: true });
    delete state.projects[slug];
    changed += 1;
    console.log(`– removed project ${slug}`);
  }

  return changed;
}

async function main() {
  console.log(`Sync from ${API}`);
  const state = loadState();
  state.writings ??= {};
  state.projects ??= {};

  const writingsChanged = await syncWritings(state);
  const projectsChanged = await syncProjects(state);
  saveState(state);

  const total = writingsChanged + projectsChanged;
  if (total === 0) {
    console.log('Nothing to sync');
    return;
  }
  console.log(`Done (${total} change(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
