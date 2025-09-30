"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/supabase";
import { UserProfileSkeleton } from "@/components/skeletons";

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    } else if (!loading && user && !profile) {
      router.push("/create-username");
    }
  }, [user, profile, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full space-y-6">
          <UserProfileSkeleton />
        </div>
      </div>
    );
  }

  if (!user || !profile) {
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
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              Your Profile
            </h2>
          </CardHeader>
          <CardBody className="gap-6 py-6 px-4 sm:px-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar
                src="/api/avatar"
                size="lg"
                className="w-20 h-20"
                name={profile.username}
              />
              <div className="text-center">
                <h3 className="text-lg font-semibold">@{profile.username}</h3>
                <p className="text-sm text-default-500">{user.email}</p>
                <Chip size="sm" color="primary" variant="flat" className="mt-2">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="text-center py-6">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-default-500">Anime Watched</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-6">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-default-500">Manga Read</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-6">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-default-500">Hours Watched</div>
            </CardBody>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              Quick Actions
            </h2>
          </CardHeader>
          <CardBody className="gap-4 py-6 px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                color="primary"
                variant="flat"
                size="lg"
                className="h-16"
                onClick={() => router.push("/browse")}
              >
                Browse Content
              </Button>
              <Button
                color="secondary"
                variant="flat"
                size="lg"
                className="h-16"
                onClick={() => router.push("/discovery")}
              >
                Discover New
              </Button>
              <Button
                color="default"
                variant="flat"
                size="lg"
                className="h-16"
                onClick={() => router.push(`/user/${profile.username}`)}
              >
                View Profile
              </Button>
            </div>
            <div className="flex justify-center mt-4">
              <Button color="danger" variant="light" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
