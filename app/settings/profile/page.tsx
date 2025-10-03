"use client";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { Tooltip } from "@heroui/tooltip";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { CameraIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";

import { ProfilePageSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserProfile,
  updateUserProfile,
  getUserProfileNoCache,
} from "@/lib/turso";
import SettingsNav from "@/components/SettingsNav";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function ProfileSettingsPage() {
  const { user, loading, forceRefreshProfile } = useAuth();
  const router = useRouter();

  // Local profile state - fetched directly from database without cache
  const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [formInitialized, setFormInitialized] = useState(false);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAvatarTooltip, setShowAvatarTooltip] = useState(false);
  const [showBannerTooltip, setShowBannerTooltip] = useState(false);

  const avatarUrlInputRef = useRef<HTMLInputElement>(null);
  const bannerUrlInputRef = useRef<HTMLInputElement>(null);

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Profile Settings", PAGE_MESSAGES["Profile Settings"]);

    // Cleanup: clear current username from localStorage when component unmounts
    return () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUsername");
      }
    };
  }, []);

  // Fetch profile data directly from database (no cache) when component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;

      try {
        setProfileLoading(true);
        console.log("🔄 Fetching fresh profile data from database (no cache)");

        const result = await getUserProfileNoCache(user.id);

        if (result.error) {
          console.error("Error fetching profile:", result.error);
          addToast({
            title: "Load Failed",
            description: "Failed to load profile data. Please try again.",
            color: "danger",
            variant: "flat",
          });
          return;
        }

        if (result.data) {
          setLocalProfile(result.data as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        addToast({
          title: "Load Failed",
          description: "Failed to load profile data. Please try again.",
          color: "danger",
          variant: "flat",
        });
      } finally {
        setProfileLoading(false);
      }
    };

    if (user?.id && !loading) {
      fetchProfileData();
    }
  }, [user?.id, loading]);

  // Initialize form fields only once when profile data is loaded
  useEffect(() => {
    if (localProfile && !formInitialized) {
      console.log("📝 Initializing form fields with fresh profile data");

      setUsername(localProfile.username || "");
      setDisplayName(localProfile.display_name || "");
      setBio(localProfile.bio || "");
      setAvatarUrl(localProfile.avatar_url || "");
      setBannerUrl(localProfile.banner_url || "");
      setFormInitialized(true);

      console.log("✅ Form fields initialized successfully");
    }
  }, [localProfile, formInitialized]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Filter out any characters that are not lowercase letters, numbers, underscores, or periods
    const filteredValue = value.replace(/[^a-z0-9_.]/g, "");

    setUsername(filteredValue);

    // Store current username in localStorage for global access
    if (typeof window !== "undefined") {
      if (filteredValue.trim()) {
        localStorage.setItem("currentUsername", filteredValue.trim());
      } else {
        localStorage.removeItem("currentUsername");
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent("currentUsernameChanged"));
    }
  };

  const handleCopyProfileUrl = async () => {
    const currentUsername = username.trim() || localProfile?.username;
    const profileUrl = `${window.location.origin}/user/${currentUsername}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      addToast({
        title: "Profile URL Copied",
        description: "Profile URL has been copied to your clipboard!",
        color: "success",
        variant: "flat",
      });
    } catch (error) {
      console.error("Failed to copy URL:", error);
      addToast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        color: "danger",
        variant: "flat",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (!user) {
        throw new Error("No user found");
      }

      const currentUsername = localProfile?.username;
      const trimmedUsername = username.trim();

      // Validate username format if provided
      if (trimmedUsername) {
        const usernameRegex = /^[a-z0-9_.]{3,30}$/;
        if (!usernameRegex.test(trimmedUsername)) {
          addToast({
            title: "Invalid Username",
            description:
              "Username must be 3-30 characters and contain only lowercase letters, numbers, underscores, and periods.",
            color: "danger",
            variant: "flat",
          });
          setSaving(false);
          return;
        }

        // Check username availability if it's different from current username
        if (trimmedUsername !== currentUsername) {
          try {
            const response = await fetch("/api/check-username", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ username: trimmedUsername }),
            });

            const result = await response.json();

            if (!response.ok || !result.available) {
              addToast({
                title: "Username Not Available",
                description:
                  "This username is already taken. Please choose a different one.",
                color: "danger",
                variant: "flat",
              });
              setSaving(false);
              return;
            }
          } catch (error) {
            console.error("Error checking username availability:", error);
            addToast({
              title: "Validation Error",
              description:
                "Failed to check username availability. Please try again.",
              color: "danger",
              variant: "flat",
            });
            setSaving(false);
            return;
          }
        }
      }

      // Prepare update data
      const updateData: any = {
        display_name: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        banner_url: bannerUrl.trim() || undefined,
        last_edit: new Date().toISOString(),
      };

      // Only update username if it's different
      if (trimmedUsername && trimmedUsername !== currentUsername) {
        updateData.username = trimmedUsername;
      }

      const { error } = await updateUserProfile(user.id, updateData);

      if (error) {
        throw new Error(error.message || "Failed to update profile");
      }

      // Show success toast
      addToast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully!",
        color: "success",
        variant: "flat",
      });

      // Clear current username from localStorage after saving
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentUsername");
      }

      // If username changed, invalidate cache and refresh profile
      if (username.trim() !== localProfile?.username) {
        // Force refresh profile in auth context (this will do a fresh database read)
        await forceRefreshProfile();

        // Update local profile state with new data
        const freshProfile = await getUserProfileNoCache(user.id);
        if (freshProfile.data) {
          setLocalProfile(freshProfile.data as UserProfile);
        }
      } else {
        // Just refresh profile normally
        await forceRefreshProfile();
      }

      // Force refresh Next.js router cache
      router.refresh();

      // Force refresh the browser cache for profile-related pages
      if ("caches" in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        } catch (error) {
          console.error("❌ Error clearing browser caches:", error);
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      addToast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        color: "danger",
        variant: "flat",
      });
    } finally {
      setSaving(false);
    }
  };

  const getHasChanges = () => {
    if (!localProfile) return false;

    // Normalize empty strings to null for comparison
    const currentUsername = username.trim() || null;
    const currentDisplayName = displayName.trim() || null;
    const currentBio = bio.trim() || null;
    const currentAvatarUrl = avatarUrl.trim() || null;
    const currentBannerUrl = bannerUrl.trim() || null;

    const profileUsername = localProfile.username?.trim() || null;
    const profileDisplayName = localProfile.display_name?.trim() || null;
    const profileBio = localProfile.bio?.trim() || null;
    const profileAvatarUrl = localProfile.avatar_url?.trim() || null;
    const profileBannerUrl = localProfile.banner_url?.trim() || null;

    return (
      currentUsername !== profileUsername ||
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

    return localProfile?.username || "Unknown User";
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Show loading skeleton while auth is loading or profile is being fetched
  if (loading || profileLoading) {
    return <ProfilePageSkeleton />;
  }

  // Redirect to signin if no user
  if (!user) {
    return null;
  }

  // Show error message if profile failed to load
  if (!localProfile && !profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Failed to Load Profile</h1>
          <p className="text-default-500 mb-4">
            Unable to load your profile data. Please try refreshing the page.
          </p>
          <Button color="primary" onPress={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  const hasChanges = getHasChanges();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <SettingsNav />

      {/* Header */}
      <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4 xs:mb-8">
            <div className="mb-4">
              <h1 className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-default-500 mt-1 text-sm xs:text-base">
                Customize your profile information
              </p>
            </div>
            {/* Mobile-only divider */}
            <div className="w-full h-px bg-divider xs:hidden" />
          </div>
        </div>
      </div>

      {/* Banner Section - Full width on mobile */}
      <div className="w-full mb-4 xs:mb-10">
        <div className="flex flex-col items-center">
          <div className="relative w-full xs:max-w-2xl mb-4">
            <div className="relative w-full h-32 xs:h-40 sm:h-48 overflow-hidden rounded-lg border border-divider">
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
                <CameraIcon className="w-6 h-6 xs:w-8 xs:h-8 text-white" />
              </button>
            </div>
          </div>
          <div className="text-center px-4 xs:px-0">
            <p className="text-sm text-default-500 mb-1">Profile Banner</p>
            <p className="text-xs text-default-400">
              Click on the banner to change it
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 xs:px-4">
        <div className="max-w-6xl mx-auto">
          <Divider className="my-4 xs:-mt-3 xs:mb-12" />

          {/* Avatar Section */}
          <div className="mb-4 xs:mb-10">
            <div className="flex flex-col items-center">
              <button
                aria-label="Change avatar"
                className="relative group mb-1 xs:mb-6 cursor-pointer bg-transparent border-none p-0"
                type="button"
                onClick={handleAvatarClick}
              >
                <Avatar
                  isBordered
                  className="w-24 h-24 xs:w-32 xs:h-32 text-large transition-transform group-hover:scale-105"
                  color="primary"
                  name={getDisplayName()}
                  src={getAvatarSrc()}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <CameraIcon className="w-6 h-6 xs:w-8 xs:h-8 text-white" />
                </div>
              </button>
              <div className="text-center px-4 xs:px-0 mt-3 xs:mt-0">
                <p className="text-sm text-default-500 mb-1">Profile Avatar</p>
                <p className="text-xs text-default-400">
                  Click on the avatar to change it
                </p>
              </div>
            </div>
          </div>

          <Divider className="my-4 xs:my-8" />

          {/* Form Fields */}
          <div className="space-y-4 xs:space-y-8">
            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-sm font-semibold text-foreground"
                  htmlFor="username"
                >
                  Username
                </label>
                <span className="text-xs text-default-400">
                  {username.length}/30
                </span>
              </div>
              <Input
                classNames={{
                  input: "text-sm xs:text-base",
                  inputWrapper: "h-11 xs:h-12",
                }}
                id="username"
                maxLength={30}
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
              />
              <p className="text-xs text-default-400 mt-1.5">
                Username must be 3-30 characters and contain only lowercase
                letters, numbers, underscores, and periods.
              </p>
            </div>

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
                  input: "text-sm xs:text-base",
                  inputWrapper: "h-11 xs:h-12",
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
                  input: "text-sm xs:text-base",
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
                    input: "text-sm xs:text-base",
                    inputWrapper: "h-11 xs:h-12",
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
                    input: "text-sm xs:text-base",
                    inputWrapper: "h-11 xs:h-12",
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

          <Divider className="my-6 xs:my-8" />

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              size="lg"
              variant="flat"
              onPress={() =>
                router.push(
                  `/user/${username.trim() || localProfile?.username}`
                )
              }
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
          <div className="mt-6 xs:mt-12 pt-4 xs:pt-8 pb-8 xs:pb-12 border-t border-divider">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4">
              <p className="text-sm xs:text-base font-medium text-default-600">
                Profile URL
              </p>
              <div className="flex items-center gap-2">
                <button
                  className={`text-sm xs:text-base truncate font-mono text-left ${
                    username.trim() !== localProfile?.username
                      ? "text-warning hover:underline"
                      : "text-primary hover:underline"
                  }`}
                  onClick={() =>
                    router.push(
                      `/user/${username.trim() || localProfile?.username}`
                    )
                  }
                >
                  /{username.trim() || localProfile?.username}
                  {username.trim() !== localProfile?.username && (
                    <span className="ml-1 text-xs text-warning">(unsaved)</span>
                  )}
                </button>
                <button
                  className="text-default-400 hover:text-primary transition-colors p-1"
                  title="Copy profile URL"
                  onClick={handleCopyProfileUrl}
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
