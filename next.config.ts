import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,
    appIsrStatus: false,
  },
  turbopack: {
    // Ignore parent lockfiles to prevent OS file watch limit reached
    root: __dirname
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

export default nextConfig;
