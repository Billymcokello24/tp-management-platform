import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TMU Teaching Practice Platform",
    short_name: "TMU TP",
    description:
      "Next Generation Teaching Practice Management Platform for Tom Mboya University",
    start_url: "/login",
    display: "standalone",
    background_color: "#0c1222",
    theme_color: "#9A1E31",
    orientation: "portrait-primary",
    categories: ["education", "productivity"],
    icons: [
      {
        src: "/icon-192x192.png?v=2",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png?v=2",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-touch-icon.png?v=2",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
