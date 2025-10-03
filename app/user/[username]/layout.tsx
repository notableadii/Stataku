import { Metadata } from "next";

import { getProfileBySlugNoCache } from "@/lib/database-service";

type Props = {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const { data: profile } = await getProfileBySlugNoCache(username);

    if (!profile) {
      return {
        title: `@${username} - User Not Found - Stataku`,
        description: `The user @${username} does not exist on Stataku.`,
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const displayName = profile.display_name || profile.username;
    const profileTitle = `${displayName} (@${profile.username}) - Stataku`;
    const profileDescription = profile.bio
      ? `${profile.bio} - Join ${displayName} on Stataku`
      : `Join ${displayName} (@${profile.username}) on Stataku - the modern social platform`;

    // Use profile avatar if available, otherwise use default
    const profileImage = profile.avatar_url || "/avatars/universal-avatar.jpg";
    const bannerImage = profile.banner_url || "/banners/banner.jpg";

    return {
      title: profileTitle,
      description: profileDescription,
      keywords: [
        profile.username,
        displayName,
        "Stataku",
        "social platform",
        "user profile",
        "community",
        "connect",
        "share",
        "discover",
      ],
      authors: [{ name: displayName }],
      openGraph: {
        title: profileTitle,
        description: profileDescription,
        type: "profile",
        url: `https://stataku.com/user/${username}`,
        siteName: "Stataku",
        images: [
          {
            url: profileImage,
            width: 400,
            height: 400,
            alt: `${displayName}'s profile picture`,
            type: "image/jpeg",
          },
          {
            url: bannerImage,
            width: 1200,
            height: 630,
            alt: `${displayName}'s profile banner`,
            type: "image/jpeg",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: profileTitle,
        description: profileDescription,
        images: [bannerImage],
        creator: "@stataku",
      },
      alternates: {
        canonical: `https://stataku.com/user/${username}`,
      },
      other: {
        // Structured Data for Person
        "application/ld+json": JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: displayName,
          alternateName: profile.username,
          url: `https://stataku.com/user/${username}`,
          description: profileDescription,
          image: profileImage,
          sameAs: [],
        }),
      },
    };
  } catch {
    // Fallback metadata if there's an error
    return {
      title: `@${username} - Stataku`,
      description: `View @${username}'s profile on Stataku.`,
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function UserProfileLayout({ children }: Props) {
  return <>{children}</>;
}
