import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Niente ottimizzatore di Vercel (limiti del piano gratuito): le foto le ridimensiona Supabase,
    // vedi src/lib/imageLoader.ts. Larghezze ridotte = meno versioni diverse da tenere in cache.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384],
  },
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
};

export default nextConfig;
