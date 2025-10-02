import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse",
  description:
    "Discover and explore thousands of anime, manga, manwha, and manhua titles. Find your next favorite series and track your progress.",
  keywords: [
    "browse anime",
    "browse manga",
    "discover anime",
    "discover manga",
    "anime database",
    "manga database",
    "manwha",
    "manhua",
    "anime search",
    "manga search",
  ],
  openGraph: {
    title: "Browse Anime & Manga - Stataku",
    description:
      "Discover and explore thousands of anime, manga, manwha, and manhua titles. Find your next favorite series and track your progress.",
    type: "website",
    images: [
      {
        url: "/og-browse.png",
        width: 1200,
        height: 630,
        alt: "Browse Anime & Manga on Stataku",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse Anime & Manga - Stataku",
    description:
      "Discover and explore thousands of anime, manga, manwha, and manhua titles.",
    images: ["/og-browse.png"],
  },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
