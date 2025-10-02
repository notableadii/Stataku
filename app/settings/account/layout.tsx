import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings",
  description:
    "Manage your Stataku account settings, email, password, and connected social accounts.",
  keywords: [
    "account settings",
    "email settings",
    "password settings",
    "social accounts",
    "account security",
  ],
};

export default function AccountSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
