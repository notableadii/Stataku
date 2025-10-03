import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Stataku",
  description:
    "Sign in to your Stataku account. Access your dashboard, manage your profile, and connect with the community.",
  keywords: [
    "sign in",
    "login",
    "account",
    "Stataku",
    "authentication",
    "access",
    "social platform",
  ],
  openGraph: {
    title: "Sign In - Stataku",
    description: "Sign in to your Stataku account and access your dashboard.",
    type: "website",
    url: "https://stataku.com/signin",
    siteName: "Stataku",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Sign In to Stataku",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - Stataku",
    description: "Sign in to your Stataku account.",
    images: ["/logo.png"],
    creator: "@stataku",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
