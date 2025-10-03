import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Debug Metadata - Stataku",
  description: "Debug page to test social media metadata",
  openGraph: {
    title: "Debug Metadata - Stataku",
    description: "This is a debug page to test social media metadata",
    type: "website",
    url: "https://stataku.com/debug-metadata",
    siteName: "Stataku",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Debug Metadata Test",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Debug Metadata - Stataku",
    description: "This is a debug page to test social media metadata",
    images: ["/logo.png"],
    creator: "@stataku",
  },
};

export default function DebugMetadataPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Metadata Test</h1>

        <div className="space-y-6">
          <div className="bg-content1 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Test Social Media Sharing
            </h2>
            <p className="mb-4">
              This page is configured with proper Open Graph and Twitter Card
              metadata. Test it by sharing this URL on social media platforms.
            </p>

            <div className="space-y-2">
              <p>
                <strong>URL to test:</strong> https://stataku.com/debug-metadata
              </p>
              <p>
                <strong>OG Image:</strong> https://stataku.com/og
              </p>
              <p>
                <strong>Expected Title:</strong> Debug Metadata - Stataku
              </p>
              <p>
                <strong>Expected Description:</strong> This is a debug page to
                test social media metadata
              </p>
            </div>
          </div>

          <div className="bg-content1 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Testing Tools</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://developers.facebook.com/tools/debug/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Facebook Sharing Debugger
                </a>
              </li>
              <li>
                <a
                  href="https://cards-dev.twitter.com/validator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Twitter Card Validator
                </a>
              </li>
              <li>
                <a
                  href="https://www.opengraph.xyz/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenGraph.xyz Preview
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/post-inspector/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  LinkedIn Post Inspector
                </a>
              </li>
            </ul>
          </div>

          <div className="bg-content1 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Common Issues</h2>
            <ul className="space-y-2 text-sm">
              <li>
                • Make sure the OG image URL is accessible
                (https://stataku.com/og)
              </li>
              <li>• Check that the image dimensions are correct (1200x630)</li>
              <li>• Verify that all URLs use HTTPS</li>
              <li>
                • Some platforms cache metadata - try using their debug tools to
                refresh
              </li>
              <li>
                • Discord may take a few minutes to update cached metadata
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
