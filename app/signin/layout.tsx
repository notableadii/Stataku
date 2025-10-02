import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Stataku account to track your anime and manga progress, rate titles, and connect with the community.",
  keywords: [
    "sign in",
    "login",
    "account",
    "authentication",
    "user login",
    "access account",
  ],
  openGraph: {
    title: "Sign In - Stataku",
    description:
      "Sign in to your Stataku account to track your anime and manga progress, rate titles, and connect with the community.",
    type: "website",
    images: [
      {
        url: "/og-signin.png",
        width: 1200,
        height: 630,
        alt: "Sign In to Stataku",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In - Stataku",
    description:
      "Sign in to your Stataku account to track your anime and manga progress.",
    images: ["/og-signin.png"],
  },
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
