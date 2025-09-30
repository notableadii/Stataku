"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { UserProfile } from "@/lib/turso";
import { notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { user, profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        setError(null);

        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch("/api/get-profile-by-slug", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ slug: username }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          if (response.status === 404) {
            // Profile not found, trigger 404 page
            notFound();
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Ensure we have valid profile data before setting it
        if (data.data && data.data.username) {
          setProfile(data.data);
        } else {
          // If profile data is invalid, trigger 404
          notFound();
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
          notFound();
        }

        setError(
          err instanceof Error ? err.message : "Failed to fetch profile"
        );
      }
    };

    fetchProfile();
  }, [username]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-8">
            <div className="text-danger text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Error</h1>
            <p className="text-default-500 mb-4">{error}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  // If profile is still loading or null, don't render anything
  // The global loading screen will handle the loading state
  if (!profile || !profile.username) {
    return null;
  }

  // Check if the logged-in user is viewing their own profile
  const isOwnProfile =
    user &&
    currentUserProfile &&
    (currentUserProfile.id === profile.id ||
      currentUserProfile.username === profile.username);

  return (
    <div className="min-h-screen bg-background py-2 sm:py-6 md:py-8">
      <div className="container mx-auto max-w-full px-0 sm:px-6 lg:px-4">
        {/* Profile Header */}
        <div className="mb-4 sm:mb-10">
          <div className="py-2 px-0 sm:p-6 md:p-8">
            {/* Top Section: Avatar, Name/Username, and Edit Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 md:gap-6 mb-2 sm:mb-4">
              {/* Avatar */}
              <Avatar
                src={profile?.avatar_url || "/api/avatar"}
                className="w-20 h-20 sm:w-24 sm:h-24 text-large"
                name={profile?.display_name || profile?.username}
                isBordered
              />

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-1 mb-1 sm:mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold truncate">
                    {profile?.display_name ||
                      profile?.username ||
                      "Unknown User"}
                  </h1>
                  <p className="text-default-500 text-base sm:text-lg truncate">
                    @{profile?.username}
                  </p>
                </div>
              </div>

              {/* Edit Button - Right Side */}
              {isOwnProfile && (
                <Button
                  color="primary"
                  variant="flat"
                  startContent={
                    <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  }
                  onPress={() => router.push("/profile")}
                  className="w-full sm:w-auto self-start"
                  size="sm"
                >
                  <span className="sm:inline">Edit Profile</span>
                </Button>
              )}
            </div>

            {/* Divider line - Spans full width */}
            <div className="w-full h-px bg-divider mb-3 sm:mb-4"></div>

            {/* Bottom Section: Bio and Member Since */}
            <div>
              {/* Bio */}
              {profile?.bio && (
                <p className="text-default-600 mb-2 sm:mb-3 text-sm sm:text-base leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Member since */}
              <p className="text-xs sm:text-sm text-default-400">
                Member since{" "}
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : "Unknown"}
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
