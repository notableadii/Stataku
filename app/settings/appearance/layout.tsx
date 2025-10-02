import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Appearance Settings",
  description:
    "Customize your Stataku appearance preferences including theme, colors, and display options.",
  keywords: [
    "appearance settings",
    "theme settings",
    "dark mode",
    "light mode",
    "color preferences",
    "display options",
  ],
};

export default function AppearanceSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
