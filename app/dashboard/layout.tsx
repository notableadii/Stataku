import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - Stataku",
  description:
    "Your personal dashboard on Stataku. Manage your profile, view your activity, and connect with the community.",
  keywords: [
    "dashboard",
    "Stataku",
    "profile",
    "activity",
    "social platform",
    "personal",
    "account",
  ],
  openGraph: {
    title: "Dashboard - Stataku",
    description:
      "Your personal dashboard on Stataku. Manage your profile and connect with the community.",
    type: "website",
    url: "https://stataku.com/dashboard",
    siteName: "Stataku",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Stataku Dashboard",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard - Stataku",
    description: "Your personal dashboard on Stataku.",
    images: ["/og"],
    creator: "@stataku",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
