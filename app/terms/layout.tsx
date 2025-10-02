import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read Stataku's terms of service to understand the rules and guidelines for using our platform.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "user agreement",
    "platform rules",
    "service guidelines",
  ],
  openGraph: {
    title: "Terms of Service - Stataku",
    description:
      "Read Stataku's terms of service to understand the rules and guidelines for using our platform.",
    type: "website",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
