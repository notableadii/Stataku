"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ProfilePageSkeleton } from "@/components/skeletons";
import { CameraIcon } from "@heroicons/react/24/outline";
import { UserProfile } from "@/lib/turso";

export default function ProfilePage() {
  const { user, profile, loading, refreshProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);

  const avatarUrlInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (avatarUrlInputRef.current) {
      avatarUrlInputRef.current.focus();
      setShowAvatarTooltip(true);
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setShowAvatarTooltip(false);
      }, 3000);
    }
  };

  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUrl(e.target.value);
    // Hide tooltip when user starts typing
    if (showAvatarTooltip) {
      setShowAvatarTooltip(false);
    }
  };

  // Get avatar source - use current avatarUrl if available, otherwise use universal avatar
  const getAvatarSrc = () => {
    if (avatarUrl) {
      return avatarUrl;
    }
    return "/avatars/universal-avatar.jpg";
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      const fullProfile = profile as UserProfile;
      setDisplayName(fullProfile.display_name || "");
      setBio(fullProfile.bio || "");
      setAvatarUrl(fullProfile.avatar_url || "");
    }
  }, [profile]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!user || !profile) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (!user) {
        throw new Error("No user found");
      }

      const response = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          avatar_url: avatarUrl.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Refresh profile in auth context
      await refreshProfile();

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = profile
    ? (() => {
        const fullProfile = profile as UserProfile;
        return (
          displayName !== (fullProfile.display_name || "") ||
          bio !== (fullProfile.bio || "") ||
          avatarUrl !== (fullProfile.avatar_url || "")
        );
      })()
    : false;

  return (
    <div className="min-h-screen bg-background py-0 px-0 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-2 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
            Edit Profile
          </h1>
          <p className="text-default-500 text-base sm:text-lg">
            Customize your profile information
          </p>
        </div>

        {/* Avatar Section */}
        <div className="mb-2 sm:mb-10">
          <div className="flex flex-col items-center">
            <button
              type="button"
              className="relative group mb-1 sm:mb-6 cursor-pointer bg-transparent border-none p-0"
              onClick={handleAvatarClick}
              aria-label="Change avatar"
            >
              <Avatar
                src={getAvatarSrc()}
                className="w-24 h-24 sm:w-32 sm:h-32 text-large transition-transform group-hover:scale-105"
                name={displayName || profile.username}
                isBordered
                color="primary"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
            </button>
            <div className="text-center">
              <p className="text-sm text-default-500 mb-1">
                @{profile.username}
              </p>
              <p className="text-xs text-default-400">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <Divider className="my-2 sm:my-8" />

        {/* Form Fields */}
        <div className="space-y-3 sm:space-y-8">
          {/* Display Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="display-name"
                className="text-sm font-semibold text-foreground"
              >
                Display Name
              </label>
              <span className="text-xs text-default-400">
                {displayName.length}/50
              </span>
            </div>
            <Input
              id="display-name"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              classNames={{
                input: "text-sm sm:text-base",
                inputWrapper: "h-11 sm:h-12",
              }}
            />
            <p className="text-xs text-default-400 mt-1.5">
              This is how others will see your name
            </p>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="bio"
                className="text-sm font-semibold text-foreground"
              >
                Bio
              </label>
              <span className="text-xs text-default-400">{bio.length}/500</span>
            </div>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              minRows={4}
              maxRows={8}
              classNames={{
                input: "text-sm sm:text-base",
              }}
            />
            <p className="text-xs text-default-400 mt-1.5">
              A brief description about you
            </p>
          </div>

          {/* Avatar URL */}
          <div>
            <label
              htmlFor="avatar-url"
              className="text-sm font-semibold text-foreground block mb-1.5"
            >
              Avatar URL
            </label>
            <Tooltip
              content="Change your avatar from here"
              isOpen={showAvatarTooltip}
              placement="top"
              color="primary"
              showArrow
            >
              <Input
                id="avatar-url"
                ref={avatarUrlInputRef}
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={handleAvatarUrlChange}
                type="url"
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "h-11 sm:h-12",
                }}
              />
            </Tooltip>
            <p className="text-xs text-default-400 mt-1.5">
              Enter a URL to your profile picture
            </p>
          </div>
        </div>

        <Divider className="my-6 sm:my-8" />

        {/* Message */}
        {message && (
          <div
            className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg ${
              message.type === "success"
                ? "bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400"
                : "bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-400"
            }`}
          >
            <p className="text-xs sm:text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <Button
            variant="flat"
            onPress={() => router.push(`/${profile.username}`)}
            size="lg"
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={saving}
            isDisabled={!hasChanges || saving}
            size="lg"
            className="font-semibold w-full sm:w-auto"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-divider">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-default-400">
            <p className="text-xs sm:text-sm">Profile URL</p>
            <a
              href={`/${profile.username}`}
              className="text-primary hover:underline text-xs sm:text-sm truncate"
            >
              /{profile.username}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
