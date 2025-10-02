import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your Stataku account settings, profile information, and preferences.",
  keywords: [
    "settings",
    "account settings",
    "profile settings",
    "preferences",
    "account management",
  ],
  robots: {
    index: false, // Settings pages should not be indexed
    follow: false,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
