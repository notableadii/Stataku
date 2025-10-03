import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/settings/",
        "/api/",
        "/auth/",
        "/create-username/",
        "/debug-env/",
        "/test-email/",
      ],
    },
    sitemap: "https://stataku.com/sitemap.xml",
  };
}
