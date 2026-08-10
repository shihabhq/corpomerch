import type { MetadataRoute } from "next";

import { SITE } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /cart is per-visitor and has nothing to index; /api is machine-only.
        disallow: ["/api/", "/cart"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
