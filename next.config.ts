import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "hdmonhqhsaomwskzktdm.supabase.co";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    // Product shots are square and rendered at a handful of fixed sizes.
    imageSizes: [64, 96, 128, 200, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Next 16 narrowed the default to [75]; 90 is for the PDP hero and lightbox.
    qualities: [75, 90],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      // No Cache-Control override for /_next/static — Next already serves
      // those immutable, and overriding it breaks dev-time revalidation.
    ];
  },

  async redirects() {
    return [
      // /product/... was never shipped, but the reference site used it and the
      // sales team hands out links by hand. Cheap insurance.
      { source: "/product/:slug", destination: "/products/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
