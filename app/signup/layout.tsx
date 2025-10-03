import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Stataku - Sign Up",
  description:
    "Create your Stataku account and join our community. Start connecting, sharing, and discovering on our social platform.",
  keywords: [
    "sign up",
    "register",
    "join",
    "create account",
    "Stataku",
    "community",
    "social platform",
    "registration",
  ],
  openGraph: {
    title: "Join Stataku - Sign Up",
    description: "Create your Stataku account and join our community.",
    type: "website",
    url: "https://stataku.com/signup",
    siteName: "Stataku",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Join Stataku",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join Stataku - Sign Up",
    description: "Create your Stataku account and join our community.",
    images: ["/logo.png"],
    creator: "@stataku",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
