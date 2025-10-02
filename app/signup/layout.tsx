import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create your Stataku account to start tracking anime and manga, rating titles, and joining our community of enthusiasts.",
  keywords: [
    "sign up",
    "register",
    "create account",
    "join",
    "new user",
    "registration",
  ],
  openGraph: {
    title: "Sign Up - Stataku",
    description:
      "Create your Stataku account to start tracking anime and manga, rating titles, and joining our community of enthusiasts.",
    type: "website",
    images: [
      {
        url: "/og-signup.png",
        width: 1200,
        height: 630,
        alt: "Sign Up for Stataku",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up - Stataku",
    description:
      "Create your Stataku account to start tracking anime and manga.",
    images: ["/og-signup.png"],
  },
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
