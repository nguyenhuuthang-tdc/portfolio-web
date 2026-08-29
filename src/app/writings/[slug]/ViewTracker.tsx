"use client";

import { useEffect } from "react";

export function ViewTracker({ blogId }: { blogId: number }) {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return;

    fetch(`${apiUrl}/api/v1/public/blogs/${blogId}/view`, { method: "POST" }).catch(() => {
      // silent
    });
  }, [blogId]);

  return null;
}
