import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile",
  description:
    "View user profiles on Stataku. See their anime and manga ratings, reviews, and activity.",
  keywords: [
    "user profile",
    "profile page",
    "user ratings",
    "user reviews",
    "anime profile",
    "manga profile",
  ],
  openGraph: {
    title: "User Profile - Stataku",
    description:
      "View user profiles on Stataku. See their anime and manga ratings, reviews, and activity.",
    type: "profile",
  },
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
