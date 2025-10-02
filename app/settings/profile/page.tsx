"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { CameraIcon } from "@heroicons/react/24/outline";

import { ProfilePageSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, updateUserProfile } from "@/lib/turso";
import SettingsNav from "@/components/SettingsNav";

export default function ProfileSettingsPage() {
  const { user, profile, loading, forceRefreshProfile } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);
  const [showBannerTooltip, setShowBannerTooltip] = useState(false);

  const avatarUrlInputRef = useRef<HTMLInputElement>(null);
  const bannerUrlInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await updateUserProfile(user.id, {
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        banner_url: bannerUrl.trim() || undefined,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });

      // Refresh profile in auth context
      await forceRefreshProfile();

      // Force refresh Next.js router cache
      router.refresh();

      // Force refresh the browser cache for profile-related pages
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();

          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
          console.log("✅ Browser caches cleared");
        } catch (error) {
          console.error("❌ Error clearing browser caches:", error);
        }
      }

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

  const getHasChanges = () => {
    if (!profile) return false;
    const fullProfile = profile as UserProfile;

    // Normalize empty strings to null for comparison
    const currentDisplayName = displayName.trim() || null;
    const currentBio = bio.trim() || null;
    const currentAvatarUrl = avatarUrl.trim() || null;
    const currentBannerUrl = bannerUrl.trim() || null;

    const profileDisplayName = fullProfile.display_name?.trim() || null;
    const profileBio = fullProfile.bio?.trim() || null;
    const profileAvatarUrl = fullProfile.avatar_url?.trim() || null;
    const profileBannerUrl = fullProfile.banner_url?.trim() || null;

    return (
      currentDisplayName !== profileDisplayName ||
      currentBio !== profileBio ||
      currentAvatarUrl !== profileAvatarUrl ||
      currentBannerUrl !== profileBannerUrl
    );
  };

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

  const handleBannerClick = () => {
    if (bannerUrlInputRef.current) {
      bannerUrlInputRef.current.focus();
      setShowBannerTooltip(true);
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setShowBannerTooltip(false);
      }, 3000);
    }
  };

  const handleBannerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBannerUrl(e.target.value);
    // Hide tooltip when user starts typing
    if (showBannerTooltip) {
      setShowBannerTooltip(false);
    }
  };

  // Get avatar source - use current avatarUrl if available, otherwise use universal avatar
  const getAvatarSrc = () => {
    if (avatarUrl && avatarUrl.trim() !== "") {
      return avatarUrl;
    }

    return "/avatars/universal-avatar.jpg";
  };

  // Get banner source - use current bannerUrl if available, otherwise use default banner
  const getBannerSrc = () => {
    if (bannerUrl && bannerUrl.trim() !== "") {
      return bannerUrl;
    }

    return "/banners/banner.jpg";
  };

  // Get display name - use current displayName if available, otherwise use username
  const getDisplayName = () => {
    if (displayName && displayName.trim() !== "") {
      return displayName;
    }

    return profile?.username || "Unknown User";
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (profile) {
      const fullProfile = profile as UserProfile;

      console.log("🔄 Profile data changed, updating form fields:", {
        display_name: fullProfile.display_name,
        bio: fullProfile.bio,
        avatar_url: fullProfile.avatar_url,
        banner_url: fullProfile.banner_url,
      });

      setDisplayName(fullProfile.display_name || "");
      setBio(fullProfile.bio || "");
      setAvatarUrl(fullProfile.avatar_url || "");
      setBannerUrl(fullProfile.banner_url || "");
    }
  }, [profile]);

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  if (!user || !profile) {
    return null;
  }

  const hasChanges = getHasChanges();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <SettingsNav />

      {/* Header */}
      <div className="py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 -mt-4 sm:-mt-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-2 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-1 sm:mb-2">
              Profile Settings
            </h1>
            <p className="text-default-500 text-base sm:text-lg">
              Customize your profile information
            </p>
          </div>
        </div>
      </div>

      {/* Banner Section - Full width on mobile */}
      <div className="w-full mb-2 sm:mb-10">
        <div className="flex flex-col items-center">
          <div className="relative w-full sm:max-w-2xl mb-4">
            <div className="relative w-full h-32 sm:h-40 md:h-48 overflow-hidden rounded-lg border border-divider">
              <img
                alt="Profile banner preview"
                className="w-full h-full object-cover"
                src={getBannerSrc()}
              />
              <button
                aria-label="Change banner"
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                type="button"
                onClick={handleBannerClick}
              >
                <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </button>
            </div>
          </div>
          <div className="text-center px-4 sm:px-0">
            <p className="text-sm text-default-500 mb-1">Profile Banner</p>
            <p className="text-xs text-default-400">
              Click on the banner to change it
            </p>
          </div>
        </div>
      </div>

      <div className="py-0 px-0 sm:py-6 sm:px-6 lg:py-8 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Divider className="my-4 sm:-mt-3 sm:mb-12" />

          {/* Avatar Section */}
          <div className="mb-2 sm:mb-10">
            <div className="flex flex-col items-center">
              <button
                aria-label="Change avatar"
                className="relative group mb-1 sm:mb-6 cursor-pointer bg-transparent border-none p-0"
                type="button"
                onClick={handleAvatarClick}
              >
                <Avatar
                  isBordered
                  className="w-24 h-24 sm:w-32 sm:h-32 text-large transition-transform group-hover:scale-105"
                  color="primary"
                  name={getDisplayName()}
                  src={getAvatarSrc()}
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
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
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
                  className="text-sm font-semibold text-foreground"
                  htmlFor="display-name"
                >
                  Display Name
                </label>
                <span className="text-xs text-default-400">
                  {displayName.length}/50
                </span>
              </div>
              <Input
                classNames={{
                  input: "text-sm sm:text-base",
                  inputWrapper: "h-11 sm:h-12",
                }}
                id="display-name"
                maxLength={50}
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <p className="text-xs text-default-400 mt-1.5">
                This is how others will see your name
              </p>
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-sm font-semibold text-foreground"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <span className="text-xs text-default-400">
                  {bio.length}/500
                </span>
              </div>
              <Textarea
                classNames={{
                  input: "text-sm sm:text-base",
                }}
                id="bio"
                maxLength={500}
                maxRows={8}
                minRows={4}
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-default-400 mt-1.5">
                A brief description about you
              </p>
            </div>

            {/* Avatar URL */}
            <div>
              <label
                className="text-sm font-semibold text-foreground block mb-1.5"
                htmlFor="avatar-url"
              >
                Avatar URL
              </label>
              <Tooltip
                showArrow
                color="primary"
                content="Change your avatar from here"
                isOpen={showAvatarTooltip}
                placement="top"
              >
                <Input
                  ref={avatarUrlInputRef}
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "h-11 sm:h-12",
                  }}
                  id="avatar-url"
                  placeholder="https://example.com/avatar.jpg"
                  type="url"
                  value={avatarUrl}
                  onChange={handleAvatarUrlChange}
                />
              </Tooltip>
              <p className="text-xs text-default-400 mt-1.5">
                Enter a URL to your profile picture
              </p>
            </div>

            {/* Banner URL */}
            <div>
              <label
                className="text-sm font-semibold text-foreground block mb-1.5"
                htmlFor="banner-url"
              >
                Banner URL
              </label>
              <Tooltip
                showArrow
                color="primary"
                content="Change your banner from here"
                isOpen={showBannerTooltip}
                placement="top"
              >
                <Input
                  ref={bannerUrlInputRef}
                  classNames={{
                    input: "text-sm sm:text-base",
                    inputWrapper: "h-11 sm:h-12",
                  }}
                  id="banner-url"
                  placeholder="https://example.com/banner.jpg"
                  type="url"
                  value={bannerUrl}
                  onChange={handleBannerUrlChange}
                />
              </Tooltip>
              <p className="text-xs text-default-400 mt-1.5">
                Enter a URL to your profile banner
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
              className="w-full sm:w-auto"
              size="lg"
              variant="flat"
              onPress={() => router.push(`/user/${profile.username}`)}
            >
              Cancel
            </Button>
            <Button
              className="font-semibold w-full sm:w-auto"
              color="primary"
              isDisabled={!hasChanges || saving}
              isLoading={saving}
              size="lg"
              onPress={handleSave}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>

          {/* Footer Info */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-divider">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-default-400">
              <p className="text-xs sm:text-sm">Profile URL</p>
              <a
                className="text-primary hover:underline text-xs sm:text-sm truncate"
                href={`/user/${profile.username}`}
              >
                /{profile.username}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
