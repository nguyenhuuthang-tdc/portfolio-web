const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { revalidate?: number | false }
): Promise<T> {
  const { revalidate, ...fetchOptions } = options ?? {};

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    next: revalidate !== undefined ? { revalidate } : { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}
