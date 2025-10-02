import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Username",
  description:
    "Choose your unique username to complete your Stataku profile setup and start your anime and manga tracking journey.",
  keywords: [
    "create username",
    "username",
    "profile setup",
    "account setup",
    "choose username",
  ],
  openGraph: {
    title: "Create Username - Stataku",
    description:
      "Choose your unique username to complete your Stataku profile setup and start your anime and manga tracking journey.",
    type: "website",
    images: [
      {
        url: "/og-create-username.png",
        width: 1200,
        height: 630,
        alt: "Create Username on Stataku",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Create Username - Stataku",
    description:
      "Choose your unique username to complete your Stataku profile setup.",
    images: ["/og-create-username.png"],
  },
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
};

export default function CreateUsernameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
