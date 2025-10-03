"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { motion } from "framer-motion";
import NextLink from "next/link";

import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { signOut, supabase } from "@/lib/supabase";
import { UserProfileSkeleton } from "@/components/skeletons";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";
// Animation imports removed - using simple hover effects only

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading, profileLoading, profileError, session } =
    useAuth();

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

    // If we have a user but no profile, wait for auto-creation to complete
    if (!profile) {
      // Still loading profile - wait
      if (profileLoading) {
        return;
      }

      // Profile loading is complete, but still no profile
      // This should be rare now with auto-creation, but handle gracefully
      if (profileError) {
        console.error("Profile loading error:", profileError);
        // Don't redirect - show error state instead
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

  // If we reach here without a profile, show debugging information
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-bold text-warning">Profile Missing</h1>
          <p className="text-default-500">
            User is authenticated but profile is not available.
          </p>
          <div className="bg-content1 p-4 rounded-lg text-left text-sm">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <ul className="space-y-1 text-default-600">
              <li>User ID: {user?.id}</li>
              <li>User Email: {user?.email}</li>
              <li>Profile Loading: {profileLoading ? "Yes" : "No"}</li>
              <li>Profile Error: {profileError || "None"}</li>
              <li>Auth Loading: {loading ? "Yes" : "No"}</li>
            </ul>
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button color="primary" onPress={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button
              color="success"
              variant="bordered"
              onPress={async () => {
                try {
                  // Get current session token for API authentication
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();
                  const token = session?.access_token;

                  if (!token) {
                    alert("No authentication token available");
                    return;
                  }

                  const response = await fetch("/api/force-create-profile", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  const result = await response.json();
                  console.log("Force create profile result:", result);
                  if (result.success) {
                    window.location.reload();
                  } else {
                    alert("Failed to create profile: " + result.error);
                  }
                } catch (error) {
                  console.error("Error creating profile:", error);
                  alert("Error creating profile");
                }
              }}
            >
              Create Profile
            </Button>
            <Button
              color="warning"
              variant="bordered"
              onPress={async () => {
                try {
                  const response = await fetch("/api/resend-welcome-email", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session?.access_token}`,
                    },
                  });

                  const result = await response.json();

                  if (response.ok && result.success) {
                    alert(
                      `✅ Welcome email resent successfully!\n\nEmail: ${result.data.email}\nUsername: ${result.data.username}`
                    );
                  } else {
                    alert(
                      `❌ Failed to resend welcome email: ${result.error}\n\nRetryable: ${result.retryable ? "Yes" : "No"}`
                    );
                  }
                } catch (error) {
                  console.error("Error resending welcome email:", error);
                  alert("Error resending welcome email");
                }
              }}
            >
              Resend Welcome Email
            </Button>
            <Button
              color="secondary"
              variant="bordered"
              onPress={() => router.push("/signin")}
            >
              Sign In Again
            </Button>
          </div>
        </div>
      </div>
    );
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

        {/* Profile Completion Notification */}
        {profile && !profile.last_edit && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-warning bg-warning-50/50">
              <CardBody className="py-4 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-warning-100 flex items-center justify-center">
                      <span className="text-warning-600 text-xl">⚠️</span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-warning-800 mb-1">
                      Complete Your Profile
                    </h3>
                    <p className="text-warning-700 text-sm mb-3">
                      You haven&apos;t updated your profile yet! Customize your
                      username, display name, and bio to make your profile
                      uniquely yours.
                    </p>
                    <Button
                      as={NextLink}
                      className="w-full sm:w-auto"
                      color="warning"
                      href="/settings/profile"
                      size="sm"
                      variant="solid"
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

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
