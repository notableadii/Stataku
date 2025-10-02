import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { AuthProvider } from "@/contexts/AuthContext";
import { GlobalLoadingProvider } from "@/contexts/GlobalLoadingContext";
import { GlobalLoadingWrapper } from "@/components/GlobalLoadingWrapper";
import { DatabaseInitializer } from "@/components/DatabaseInitializer";
import { siteConfig } from "@/config/site";
import { fontSans, fontWaterlily } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { PageTransition } from "@/components/PageTransition";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "social platform",
    "community",
    "connect",
    "share",
    "discover",
    "social media",
    "networking",
    "Stataku",
  ],
  authors: [{ name: "Stataku Team" }],
  creator: "Stataku",
  publisher: "Stataku",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://stataku.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stataku.com",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - ${siteConfig.description}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/og-image.png"],
    creator: "@stataku",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased",
          fontSans.variable,
          fontWaterlily.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
            disableTransitionOnChange: false,
          }}
        >
          <GlobalLoadingProvider>
            <AuthProvider>
              <DatabaseInitializer />
              <GlobalLoadingWrapper>
                <ErrorBoundary>
                  <div className="relative flex flex-col h-screen">
                    <Navbar />
                    <main className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                      <PageTransition>{children}</PageTransition>
                    </main>
                  </div>
                </ErrorBoundary>
              </GlobalLoadingWrapper>
            </AuthProvider>
          </GlobalLoadingProvider>
        </Providers>
      </body>
    </html>
  );
}
