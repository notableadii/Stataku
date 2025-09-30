"use client";

import { useRouter } from "next/navigation";
import { UsernameSelector } from "@/components/UsernameSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { UsernameFormSkeleton } from "@/components/skeletons";

export default function CreateUsernamePage() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  // Redirect if user is not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Redirect if user already has a profile
  useEffect(() => {
    if (!loading && user && profile) {
      router.replace(`/${profile.username}`);
    }
  }, [user, profile, loading, router]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 sm:space-y-6">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              Create Username
            </h1>
            <p className="text-sm sm:text-base text-default-500">
              Choose a unique username for your account
            </p>
          </div>
          <UsernameFormSkeleton />
        </div>
      </div>
    );
  }

  // Don't render if user is not logged in or already has profile
  if (!user || profile) {
    return null;
  }

  const handleUsernameCreated = async (username: string) => {
    // Refresh the profile to update the auth context
    await refreshProfile();
    // Small delay to ensure profile is updated and navbar reflects the change
    setTimeout(() => {
      // Redirect to user's profile page after successful username creation
      router.push(`/${username}`);
    }, 1500);
  };

  const handleCancel = () => {
    // Sign out user if they cancel username creation
    router.push("/signin");
  };

  return (
    <UsernameSelector
      userId={user.id}
      onUsernameCreated={handleUsernameCreated}
      onCancel={handleCancel}
    />
  );
}
