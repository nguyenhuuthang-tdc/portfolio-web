import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:4000";
let apiPattern: { protocol: "http" | "https"; hostname: string; port?: string; pathname: string };
try {
  const u = new URL(apiUrl);
  apiPattern = {
    protocol: (u.protocol.replace(":", "") as "http" | "https") || "http",
    hostname: u.hostname,
    ...(u.port ? { port: u.port } : {}),
    pathname: "/uploads/**",
  };
} catch {
  apiPattern = { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" };
}

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      apiPattern,
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
