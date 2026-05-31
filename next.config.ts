import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Ignore parent lockfiles to prevent OS file watch limit reached
    root: __dirname
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['tp.digiprojects.co.ke', 'https://tp.digiprojects.co.ke']
    }
  },
  async headers() {
    return [
      {
        // Cache static media and fonts aggressively
        source: "/(.*)\\.(png|jpg|jpeg|svg|ico|webp|woff2?)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWA(nextConfig);
