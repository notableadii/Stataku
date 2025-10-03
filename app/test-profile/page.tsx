import { Metadata } from "next";

// Simulate a test user profile for metadata testing
const testProfile = {
  username: "testuser",
  display_name: "Test User",
  bio: "This is a test bio for social media metadata testing. Join me on Stataku!",
  avatar_url: "/avatars/universal-avatar.jpg",
  banner_url: "/banners/banner.jpg",
};

export const metadata: Metadata = {
  title: `${testProfile.display_name} (@${testProfile.username}) - Stataku`,
  description: testProfile.bio
    ? `${testProfile.bio} - Join ${testProfile.display_name} on Stataku`
    : `Join ${testProfile.display_name} (@${testProfile.username}) on Stataku - the modern social platform`,
  keywords: [
    testProfile.username,
    testProfile.display_name,
    "Stataku",
    "social platform",
    "user profile",
    "community",
    "connect",
    "share",
    "discover",
  ],
  authors: [{ name: testProfile.display_name }],
  openGraph: {
    title: `${testProfile.display_name} (@${testProfile.username}) - Stataku`,
    description: testProfile.bio
      ? `${testProfile.bio} - Join ${testProfile.display_name} on Stataku`
      : `Join ${testProfile.display_name} (@${testProfile.username}) on Stataku - the modern social platform`,
    type: "profile",
    url: `https://stataku.com/test-profile`,
    siteName: "Stataku",
    images: [
      {
        url: testProfile.avatar_url,
        width: 400,
        height: 400,
        alt: `${testProfile.display_name}'s profile picture`,
        type: "image/jpeg",
      },
      {
        url: testProfile.banner_url,
        width: 1200,
        height: 630,
        alt: `${testProfile.display_name}'s profile banner`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${testProfile.display_name} (@${testProfile.username}) - Stataku`,
    description: testProfile.bio
      ? `${testProfile.bio} - Join ${testProfile.display_name} on Stataku`
      : `Join ${testProfile.display_name} (@${testProfile.username}) on Stataku - the modern social platform`,
    images: [testProfile.banner_url],
    creator: "@stataku",
  },
  alternates: {
    canonical: `https://stataku.com/test-profile`,
  },
  other: {
    // Discord-specific meta tags for better embed support
    "og:image:width": "1200",
    "og:image:height": "630",
    "og:image:type": "image/jpeg",
    "og:image:alt": `${testProfile.display_name}'s profile on Stataku`,
    "og:site_name": "Stataku",
    "og:locale": "en_US",
    
    // Twitter Card specific meta tags
    "twitter:image:alt": `${testProfile.display_name}'s profile on Stataku`,
    "twitter:site": "@stataku",
    "twitter:creator": "@stataku",
    "twitter:domain": "stataku.com",
    
    // Additional Discord support
    "theme-color": "#667eea",
    "msapplication-TileColor": "#667eea",
    
    // Structured Data for Person
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      name: testProfile.display_name,
      alternateName: testProfile.username,
      url: `https://stataku.com/test-profile`,
      description: testProfile.bio
        ? `${testProfile.bio} - Join ${testProfile.display_name} on Stataku`
        : `Join ${testProfile.display_name} (@${testProfile.username}) on Stataku - the modern social platform`,
      image: testProfile.avatar_url,
      sameAs: [],
    }),
  },
};

export default function TestProfilePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Profile Page</h1>
        
        <div className="space-y-6">
          <div className="bg-content1 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="space-y-2">
              <p><strong>Display Name:</strong> {testProfile.display_name}</p>
              <p><strong>Username:</strong> @{testProfile.username}</p>
              <p><strong>Bio:</strong> {testProfile.bio}</p>
              <p><strong>Avatar:</strong> {testProfile.avatar_url}</p>
              <p><strong>Banner:</strong> {testProfile.banner_url}</p>
            </div>
          </div>

          <div className="bg-content1 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Social Media Sharing</h2>
            <p className="mb-4">
              This page simulates a user profile with proper metadata for social media sharing.
              Test it by sharing this URL on Discord, Facebook, Twitter, or LinkedIn.
            </p>
            
            <div className="space-y-2">
              <p><strong>URL to test:</strong> https://stataku.com/test-profile</p>
              <p><strong>Expected Title:</strong> {testProfile.display_name} (@{testProfile.username}) - Stataku</p>
              <p><strong>Expected Description:</strong> {testProfile.bio} - Join {testProfile.display_name} on Stataku</p>
              <p><strong>Expected Images:</strong> Avatar and banner images should appear in embeds</p>
            </div>
          </div>

          <div className="bg-content1 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Discord Embed Preview</h2>
            <p className="mb-4">
              When shared on Discord, this should show:
            </p>
            <ul className="space-y-1 text-sm">
              <li>• <strong>Title:</strong> {testProfile.display_name} (@{testProfile.username}) - Stataku</li>
              <li>• <strong>Description:</strong> {testProfile.bio} - Join {testProfile.display_name} on Stataku</li>
              <li>• <strong>Image:</strong> Profile banner image (1200x630)</li>
              <li>• <strong>Site:</strong> Stataku</li>
              <li>• <strong>Type:</strong> Profile</li>
            </ul>
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
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
