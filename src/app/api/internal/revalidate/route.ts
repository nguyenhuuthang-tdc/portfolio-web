import { createHmac, timingSafeEqual } from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { cacheTags } from '@/lib/cache/tags';

export const runtime = 'nodejs';

const MAX_BODY_BYTES = 4096;
const MAX_CLOCK_SKEW_SECONDS = 300;
const SIGNATURE_PATTERN = /^[a-f0-9]{64}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const KEY_PATTERN = /^[a-z0-9_]+$/;

const eventNames = [
  'blog.changed',
  'blog-category.changed',
  'project.changed',
  'about.changed',
  'skill.changed',
] as const;

type RevalidationEventName = (typeof eventNames)[number];

type RevalidationPayload = {
  event: RevalidationEventName;
  slugs: string[];
  keys: string[];
};

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function isValidSignature(rawBody: string, timestamp: string, signature: string, secret: string): boolean {
  if (!SIGNATURE_PATTERN.test(signature)) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');
  const receivedBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
}

function parseStringList(
  value: unknown,
  pattern: RegExp,
  maxLength: number
): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 10) return null;
  if (!value.every((item) => typeof item === 'string' && item.length <= maxLength && pattern.test(item))) {
    return null;
  }
  return Array.from(new Set(value));
}

function parsePayload(value: unknown): RevalidationPayload | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (!eventNames.includes(candidate.event as RevalidationEventName)) return null;

  const slugs = parseStringList(candidate.slugs, SLUG_PATTERN, 200);
  const keys = parseStringList(candidate.keys, KEY_PATTERN, 100);
  if (!slugs || !keys) return null;

  return {
    event: candidate.event as RevalidationEventName,
    slugs,
    keys,
  };
}

function expireTag(tag: string): void {
  revalidateTag(tag, { expire: 0 });
}

function invalidate(payload: RevalidationPayload): void {
  switch (payload.event) {
    case 'blog.changed':
      expireTag(cacheTags.blogs);
      payload.slugs.forEach((slug) => {
        expireTag(cacheTags.blog(slug));
        revalidatePath(`/writings/${slug}`);
      });
      revalidatePath('/');
      revalidatePath('/writings');
      revalidatePath('/api/blogs');
      revalidatePath('/sitemap.xml');
      break;
    case 'blog-category.changed':
      expireTag(cacheTags.blogCategories);
      expireTag(cacheTags.blogs);
      revalidatePath('/');
      revalidatePath('/writings');
      revalidatePath('/writings/[slug]', 'page');
      revalidatePath('/api/blogs');
      break;
    case 'project.changed':
      expireTag(cacheTags.projects);
      payload.slugs.forEach((slug) => {
        expireTag(cacheTags.project(slug));
        revalidatePath(`/projects/${slug}`);
      });
      revalidatePath('/');
      revalidatePath('/sitemap.xml');
      break;
    case 'about.changed':
      expireTag(cacheTags.about);
      payload.keys.forEach((key) => expireTag(cacheTags.aboutSection(key)));
      revalidatePath('/');
      break;
    case 'skill.changed':
      expireTag(cacheTags.skills);
      revalidatePath('/');
      break;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret || secret.length < 32) {
    return json({ success: false, error: 'Revalidation is not configured' }, 503);
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BODY_BYTES) return json({ success: false, error: 'Payload too large' }, 413);

  const timestamp = request.headers.get('x-revalidation-timestamp') ?? '';
  const signature = request.headers.get('x-revalidation-signature') ?? '';
  const timestampSeconds = Number(timestamp);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > MAX_CLOCK_SKEW_SECONDS
  ) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return json({ success: false, error: 'Payload too large' }, 413);
  }
  if (!isValidSignature(rawBody, timestamp, signature, secret)) {
    return json({ success: false, error: 'Unauthorized' }, 401);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return json({ success: false, error: 'Invalid JSON payload' }, 400);
  }

  const payload = parsePayload(parsed);
  if (!payload) return json({ success: false, error: 'Invalid revalidation event' }, 400);

  invalidate(payload);
  return json({ success: true, revalidated: true }, 200);
}
