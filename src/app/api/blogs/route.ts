import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/content/blogs";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const limit = Number(searchParams.get("limit") ?? 6);
  const category = searchParams.get("category") ?? undefined;

  const result = await getBlogPosts({
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 6,
    category: category || undefined,
  });

  return NextResponse.json(result);
}
