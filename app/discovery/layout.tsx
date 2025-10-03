import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discovery - Stataku",
  description:
    "Discover new content and trending topics on Stataku. Find what's popular in the community and explore new interests.",
  keywords: [
    "discovery",
    "trending",
    "popular",
    "Stataku",
    "community",
    "content",
    "explore",
    "social platform",
  ],
  openGraph: {
    title: "Discovery - Stataku",
    description: "Discover new content and trending topics on Stataku.",
    type: "website",
    url: "https://stataku.com/discovery",
    siteName: "Stataku",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Discovery on Stataku",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Discovery - Stataku",
    description: "Discover new content and trending topics on Stataku.",
    images: ["/logo.png"],
    creator: "@stataku",
  },
};

export default function DiscoveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
