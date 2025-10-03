import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Stataku",
  description:
    "Manage your account settings, profile, and preferences on Stataku. Customize your experience and privacy settings.",
  keywords: [
    "settings",
    "account",
    "profile",
    "preferences",
    "privacy",
    "Stataku",
    "configuration",
    "personalization",
  ],
  openGraph: {
    title: "Settings - Stataku",
    description: "Manage your account settings and preferences on Stataku.",
    type: "website",
    url: "https://stataku.com/settings",
    siteName: "Stataku",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Settings on Stataku",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings - Stataku",
    description: "Manage your account settings and preferences on Stataku.",
    images: ["/logo.png"],
    creator: "@stataku",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
