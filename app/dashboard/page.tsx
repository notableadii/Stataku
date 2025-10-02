"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";

import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/supabase";
import { UserProfileSkeleton } from "@/components/skeletons";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";
// Animation imports removed - using simple hover effects only

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, profileLoading, profileError } = useAuth();

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Dashboard", PAGE_MESSAGES.Dashboard);
  }, []);

  useEffect(() => {
    // Don't make redirect decisions while auth is loading
    if (loading) {
      return;
    }

    // Redirect to signin if no user
    if (!user) {
      router.push("/signin");
      return;
    }

    // If we have a user but no profile, we need to determine why:
    if (!profile) {
      // Still loading profile - wait
      if (profileLoading) {
        return;
      }

      // Profile loading is complete, check the error to determine next action
      if (profileError) {
        // Check if it's a "profile not found" error (legitimate new user)
        if (
          profileError.includes("Profile not found") ||
          profileError.includes("not found") ||
          profileError.includes("No profile found")
        ) {
          // This is a new user who needs to create a username
          router.push("/create-username");
        } else {
          // This is a temporary error (network, auth, etc.) - don't redirect
          // The user will see an error state in the UI and can retry
          console.error("Profile loading error:", profileError);
        }
      } else {
        // No error but no profile - this is also a new user case
        router.push("/create-username");
      }
    }
  }, [user, profile, loading, profileLoading, profileError, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Show loading while auth or profile is loading
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-6">
          <UserProfileSkeleton />
        </div>
      </div>
    );
  }

  // Show error state if there's a profile loading error that's not "profile not found"
  if (
    !user ||
    (!profile && profileError && !profileError.includes("not found"))
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-danger">
            {!user ? "Authentication Required" : "Profile Loading Error"}
          </h1>
          <p className="text-default-500">
            {!user
              ? "Please sign in to access your dashboard."
              : `Failed to load profile: ${profileError}`}
          </p>
          <Button
            color="primary"
            onPress={() => {
              if (!user) {
                router.push("/signin");
              } else {
                window.location.reload();
              }
            }}
          >
            {!user ? "Sign In" : "Retry"}
          </Button>
        </div>
      </div>
    );
  }

  // If we reach here without a profile, it means we're still determining the redirect
  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className={title({ class: "mb-2 text-3xl sm:text-4xl" })}>
            Welcome to Stataku, @{profile.username}!
          </h1>
          <p className={subtitle({ class: "text-base sm:text-lg" })}>
            Your anime and manga tracking dashboard
          </p>
        </div>

        {/* User Profile Card */}
        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -2 }}>
          <Card className="w-full">
            <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-center">
                Your Profile
              </h2>
            </CardHeader>
            <CardBody className="gap-6 py-6 px-4 sm:px-6">
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Avatar
                    className="w-20 h-20"
                    name={profile.username}
                    size="lg"
                    src="/api/avatar"
                  />
                </motion.div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">@{profile.username}</h3>
                  <p className="text-sm text-default-500">{user.email}</p>
                  <Chip
                    className="mt-2"
                    color="primary"
                    size="sm"
                    variant="flat"
                  >
                    Member since{" "}
                    {new Date(profile.created_at).toLocaleDateString()}
                  </Chip>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Development Message */}
        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -2 }}>
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-2xl font-bold mb-2">
                Site under development
              </h2>
              <p className="text-lg text-default-500 mb-6">Adding this soon</p>
              <motion.div
                className="flex justify-center"
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button color="danger" variant="light" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
