import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Turbopack est explicitement activé
   * (obligatoire en Next 16 dès qu'on enlève Webpack)
   */
  turbopack: {},

  images: {
    // Autorise les domaines externes pour les images (Firebase, YouTube, Vimeo, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "player.vimeo.com",
        pathname: "/**",
      },
    ],

    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    unoptimized: false,
  },

  // Expérimental : augmente les timeouts pour les routes API & optimisations
  experimental: {
    proxyTimeout: 120000,
  },

  // Headers de cache
  async headers() {
    return [
      {
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
