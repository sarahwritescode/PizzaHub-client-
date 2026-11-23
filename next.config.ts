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
  async redirects() {
    return [
      {
        source: "/dashboard/vendor",
        destination: "/vendor/dashboard",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.replace(/\/$/, "");
    if (!backend) return [];
    return [
      // Vendor menu, vendor orders and image upload (all vendor-only on the
      // backend). Same first-party cookie approach as /api/orders.
      {
        source: "/api/vendor/:path*",
        destination: `${backend}/api/vendor/:path*`,
      },
      // Admin dashboard, menu moderation, users and transactions (admin-only
      // on the backend).
      {
        source: "/api/admin/:path*",
        destination: `${backend}/api/admin/:path*`,
      },
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
