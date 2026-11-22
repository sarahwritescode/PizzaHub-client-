import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The browser talks to /api/auth/* and /api/orders/* on THIS site and Next
  // forwards them to the backend. That makes the session cookie first-party
  // (same domain as the pages), so proxy.ts and the dashboard layouts can see
  // it in production, and the backend's customer-only order routes accept it.
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "");
    if (!backend) return [];
    return [
      {
        source: "/api/auth/:path*",
        destination: `${backend}/api/auth/:path*`,
      },
      { source: "/api/orders", destination: `${backend}/api/orders` },
      {
        source: "/api/orders/:path*",
        destination: `${backend}/api/orders/:path*`,
      },
    ];
  },
};

export default nextConfig;
