import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse - Stataku",
  description:
    "Browse and discover content on Stataku. Explore what the community is sharing and find interesting profiles.",
  keywords: [
    "browse",
    "discover",
    "explore",
    "Stataku",
    "community",
    "content",
    "profiles",
    "social platform",
  ],
  openGraph: {
    title: "Browse - Stataku",
    description:
      "Browse and discover content on Stataku. Explore what the community is sharing.",
    type: "website",
    url: "https://stataku.com/browse",
    siteName: "Stataku",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Browse on Stataku",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse - Stataku",
    description: "Browse and discover content on Stataku.",
    images: ["/og"],
    creator: "@stataku",
  },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
