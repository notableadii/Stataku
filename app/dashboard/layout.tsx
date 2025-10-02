import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your personal anime and manga tracking dashboard. View your profile, track your progress, and manage your collection.",
  keywords: [
    "dashboard",
    "anime tracker",
    "manga tracker",
    "profile",
    "collection",
    "progress tracking",
    "personal dashboard",
  ],
  openGraph: {
    title: "Dashboard - Stataku",
    description:
      "Your personal anime and manga tracking dashboard. View your profile, track your progress, and manage your collection.",
    type: "website",
    images: [
      {
        url: "/og-dashboard.png",
        width: 1200,
        height: 630,
        alt: "Stataku Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - Stataku",
    description: "Your personal anime and manga tracking dashboard.",
    images: ["/og-dashboard.png"],
  },
  robots: {
    index: false, // Dashboard should not be indexed
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
