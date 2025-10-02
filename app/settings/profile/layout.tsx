import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile Settings",
  description:
    "Customize your Stataku profile information, avatar, banner, and display preferences.",
  keywords: [
    "profile settings",
    "avatar",
    "banner",
    "profile customization",
    "display name",
    "bio",
  ],
};

export default function ProfileSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
