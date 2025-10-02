import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Stataku's privacy policy to understand how we collect, use, and protect your personal information.",
  keywords: [
    "privacy policy",
    "privacy",
    "data protection",
    "personal information",
    "data collection",
  ],
  openGraph: {
    title: "Privacy Policy - Stataku",
    description:
      "Read Stataku's privacy policy to understand how we collect, use, and protect your personal information.",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
