import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discovery",
  description:
    "Discover new anime and manga recommendations based on your preferences. Find trending titles and hidden gems in the community.",
  keywords: [
    "anime discovery",
    "manga discovery",
    "recommendations",
    "trending anime",
    "trending manga",
    "anime suggestions",
    "manga suggestions",
    "hidden gems",
  ],
  openGraph: {
    title: "Discovery - Stataku",
    description:
      "Discover new anime and manga recommendations based on your preferences. Find trending titles and hidden gems in the community.",
    type: "website",
    images: [
      {
        url: "/og-discovery.png",
        width: 1200,
        height: 630,
        alt: "Discover New Anime & Manga on Stataku",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discovery - Stataku",
    description:
      "Discover new anime and manga recommendations based on your preferences.",
    images: ["/og-discovery.png"],
  },
};

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
