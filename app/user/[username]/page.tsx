"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import {
  UserProfile,
  getUserProfileBySlug,
  getUserProfileBySlugNoCache,
} from "@/lib/turso";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usernameNotFound, setUsernameNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(
    async (forceRefresh = false) => {
      if (!username) return;

      try {
        setLoading(true);
        setError(null);

        console.log(
          `Fetching profile ${forceRefresh ? "(no cache)" : "(with cache)"} for username: ${username}`,
        );
        const { data, error: fetchError } = forceRefresh
          ? await getUserProfileBySlugNoCache(username)
          : await getUserProfileBySlug(username);

        if (fetchError) {
          if (fetchError.message.includes("Profile not found")) {
            setUsernameNotFound(true);

            return;
          }
          throw new Error(fetchError.message);
        }

        // Ensure we have valid profile data before setting it
        if (data && data.username) {
          console.log("Profile loaded successfully:", data);
          setProfile(data);
        } else {
          // If profile data is invalid, show custom message
          setUsernameNotFound(true);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);

        // Check if this is a 404 error or network error
        const errorMessage = err instanceof Error ? err.message : String(err);

        if (
          errorMessage.includes("404") ||
          errorMessage.includes("Not Found") ||
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("NetworkError") ||
          errorMessage.includes("AbortError") ||
          (err instanceof Error && err.name === "AbortError")
        ) {
          setUsernameNotFound(true);

          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch profile",
        );
      } finally {
        setLoading(false);
      }
    },
    [username],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Check if the logged-in user is viewing their own profile
  const isOwnProfile =
    user &&
    currentUserProfile &&
    profile &&
    (currentUserProfile.id === profile.id ||
      currentUserProfile.username === profile.username);

  // Listen for profile updates from AuthContext
  useEffect(() => {
    if (isOwnProfile && currentUserProfile) {
      console.log("Profile updated in AuthContext, updating display");
      setProfile(currentUserProfile);
    }
  }, [isOwnProfile, currentUserProfile]);

  // Force refresh profile data when user navigates back to their profile after editing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isOwnProfile) {
        console.log("Page became visible, refreshing profile data");
        fetchProfile(true); // Force refresh without cache
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOwnProfile, fetchProfile]);

  if (usernameNotFound) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background pt-20">
        <div className="text-center">
          <div className="text-default-300 text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold mb-2">No Username Found</h1>
          <p className="text-default-500">
            The username &quot;{username}&quot; does not exist or is not
            available.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background pt-20">
        <div className="text-center">
          <div className="text-danger text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-default-500">{error}</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-primary text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-2">Loading Profile</h1>
          <p className="text-default-500">Fetching profile data...</p>
        </div>
      </div>
    );
  }

  // If profile is still null after loading, don't render anything
  if (!profile || !profile.username) {
    return null;
  }

  // Get banner source - use profile banner_url if available, otherwise use default banner
  const getBannerSrc = () => {
    if (profile?.banner_url && profile.banner_url.trim() !== "") {
      return profile.banner_url;
    }

    return "/banners/banner.jpg";
  };

  // Get avatar source - use profile avatar_url if available, otherwise use universal avatar
  const getAvatarSrc = () => {
    if (profile?.avatar_url && profile.avatar_url.trim() !== "") {
      return profile.avatar_url;
    }

    return "/avatars/universal-avatar.jpg";
  };

  // Get display name - use profile display_name if available, otherwise use username
  const getDisplayName = () => {
    if (profile?.display_name && profile.display_name.trim() !== "") {
      return profile.display_name;
    }

    return profile?.username || "Unknown User";
  };

  // Calculate days since user joined
  const getDaysSinceJoined = () => {
    if (!profile?.created_at) return null;

    const joinDate = new Date(profile.created_at);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - joinDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full">
        {/* Banner Section */}
        <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden rounded-lg sm:rounded-none">
          <img
            alt="Profile banner"
            className="w-full h-full object-cover"
            src={getBannerSrc()}
          />
          {/* Overlay for better text readability if needed */}
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Profile Content Container */}
        <div className="w-full -mt-16 sm:-mt-20 md:-mt-24 relative z-10">
          {/* Profile Picture - Overlapping Banner */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar
                isBordered
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 text-large border-4 border-background shadow-lg"
                name={getDisplayName()}
                src={getAvatarSrc()}
              />
            </div>
          </div>

          {/* Profile Info Section - Full width like banner */}
          <div className="w-full px-4 pb-6">
            {/* Name, Username, and Edit Button */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-4">
              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
                  {getDisplayName()}
                </h1>
                <p className="text-default-500 text-base sm:text-lg">
                  @{profile?.username}
                </p>
              </div>

              {/* Edit Button */}
              {isOwnProfile && (
                <Button
                  className="w-full sm:w-auto"
                  color="primary"
                  size="sm"
                  startContent={
                    <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                  variant="flat"
                  onPress={() => router.push("/settings/profile")}
                >
                  <span className="sm:inline">Edit Profile</span>
                </Button>
              )}
            </div>

            {/* Divider line */}
            <div className="w-full h-px bg-divider mb-4" />

            {/* Bio and Member Since */}
            <div className="text-center sm:text-left">
              {/* Bio */}
              {profile?.bio && profile.bio.trim() !== "" && (
                <p className="text-default-600 mb-3 text-sm sm:text-base leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Member joined */}
              <p className="text-xs sm:text-sm text-default-400">
                {(() => {
                  const daysSinceJoined = getDaysSinceJoined();

                  if (daysSinceJoined === null) {
                    return "Joined Unknown";
                  }

                  if (daysSinceJoined === 0) {
                    return "Joined today";
                  }

                  if (daysSinceJoined === 1) {
                    return "Joined 1 day ago";
                  }

                  return `Joined ${daysSinceJoined} days ago`;
                })()}
              </p>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div>
          <div className="py-2 px-0 sm:p-6 border-b border-divider/50">
            <h2 className="text-lg sm:text-xl font-semibold">Activity</h2>
          </div>
          <div className="py-2 px-0 sm:p-6 md:p-8">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center px-4">
                <div className="text-default-300 text-5xl sm:text-6xl mb-3 sm:mb-4">
                  📝
                </div>
                <h3 className="text-base sm:text-lg font-medium text-default-500 mb-1 sm:mb-2">
                  No activity found
                </h3>
                <p className="text-xs sm:text-sm text-default-400">
                  This user hasn&apos;t shared any activity yet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
