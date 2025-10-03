import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Stataku",
  description:
    "Read Stataku's terms of service and user agreement. Understand your rights and responsibilities when using our social platform.",
  keywords: [
    "terms of service",
    "user agreement",
    "terms and conditions",
    "legal",
    "Stataku",
    "user rights",
    "service terms",
    "agreement",
  ],
  openGraph: {
    title: "Terms of Service - Stataku",
    description: "Read Stataku's terms of service and user agreement.",
    type: "website",
    url: "https://stataku.com/terms",
    siteName: "Stataku",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Stataku Terms of Service",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service - Stataku",
    description: "Read Stataku's terms of service and user agreement.",
    images: ["/logo.png"],
    creator: "@stataku",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
