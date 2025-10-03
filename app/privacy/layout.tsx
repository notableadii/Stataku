import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Stataku",
  description:
    "Learn how Stataku collects, uses, and protects your personal information. Our privacy policy explains your rights and our data practices.",
  keywords: [
    "privacy policy",
    "data protection",
    "privacy",
    "personal information",
    "Stataku",
    "GDPR",
    "data security",
    "user rights",
  ],
  openGraph: {
    title: "Privacy Policy - Stataku",
    description:
      "Learn how Stataku protects your personal information and privacy.",
    type: "website",
    url: "https://stataku.com/privacy",
    siteName: "Stataku",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "Stataku Privacy Policy",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Stataku",
    description:
      "Learn how Stataku protects your personal information and privacy.",
    images: ["/og"],
    creator: "@stataku",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
