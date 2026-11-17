import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Imports are capped at 4 MB in the app; this leaves room for form
      // overhead while staying under Vercel's ~4.5 MB request body limit.
      bodySizeLimit: "4.4mb",
    },
  },
  // happy-dom (used by Tiptap's server-side HTML parser) should load from
  // node_modules at runtime rather than be bundled.
  serverExternalPackages: ["happy-dom"],
  turbopack: {
    rules: {
      "*.css": {
        as: "*.css",
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
};

export default nextConfig;
