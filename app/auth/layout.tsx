import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
  description:
    "Complete your authentication process to access your Stataku account.",
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
