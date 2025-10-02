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
    const profileTitle = `@${profile.username} - ${displayName} - Stataku`;
    const profileDescription = profile.bio
      ? `${profile.bio} - View ${displayName}'s profile on Stataku.`
      : `View ${displayName}'s profile on Stataku. See their anime and manga ratings, reviews, and activity.`;

    // Use profile avatar if available, otherwise use default
    const profileImage = profile.avatar_url || "/avatars/universal-avatar.jpg";

    return {
      title: profileTitle,
      description: profileDescription,
      keywords: [
        `${profile.username}`,
        `${displayName}`,
        "user profile",
        "anime profile",
        "manga profile",
        "Stataku profile",
        "user ratings",
        "user reviews",
      ],
      openGraph: {
        title: profileTitle,
        description: profileDescription,
        type: "profile",
        images: [
          {
            url: profileImage,
            width: 400,
            height: 400,
            alt: `${displayName}'s profile picture`,
          },
        ],
      },
      twitter: {
        card: "summary",
        title: profileTitle,
        description: profileDescription,
        images: [profileImage],
      },
      alternates: {
        canonical: `/user/${username}`,
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