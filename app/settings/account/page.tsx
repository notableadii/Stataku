"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
// import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/skeleton";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { GoogleIcon, DiscordIcon } from "@/components/icons";
import { useSettingsData } from "@/hooks/useSettingsData";
import SettingsNav from "@/components/SettingsNav";

export default function AccountSettingsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use optimized settings data hook
  const {
    settingsData,
    loading: settingsLoading,
    refreshSettingsData,
  } = useSettingsData();

  // Toast notification function
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success",
    title?: string
  ) => {
    addToast({
      title:
        title ||
        (type === "success"
          ? "Success"
          : type === "error"
            ? "Error"
            : "Warning"),
      description: message,
      severity:
        type === "success"
          ? "success"
          : type === "error"
            ? "danger"
            : "warning",
      timeout: type === "error" ? 8000 : 5000,
    });
  };

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    const emailConfirmed = searchParams.get("email_confirmed");

    if (error) {
      switch (error) {
        case "account-already-linked":
          showToast(
            "This Google or Discord account is already linked to another user. Please unlink it from the other account first before linking it to this account.",
            "error",
            "Account Already Linked"
          );
          break;
        case "oauth-invalid-state":
          showToast(
            "OAuth authentication failed. Please try linking your account again.",
            "error",
            "Authentication Error"
          );
          break;
        case "oauth-cancelled":
          showToast(
            "Account linking was cancelled. You can try again anytime.",
            "warning",
            "Linking Cancelled"
          );
          break;
        case "email-not-confirmed":
          showToast(
            "Please confirm your email address before linking additional accounts.",
            "error",
            "Email Not Confirmed"
          );
          break;
        case "link-failed":
          showToast(
            "Unable to link account. Please check your connection and try again.",
            "error",
            "Linking Failed"
          );
          break;
        default:
          showToast(
            "An unexpected error occurred while linking your account. Please try again.",
            "error",
            "Linking Error"
          );
      }
      // Clean up URL parameters
      const url = new URL(window.location.href);

      url.searchParams.delete("error");
      router.replace(url.pathname);
    }

    if (success) {
      switch (success) {
        case "account-linked":
          showToast(
            "Your account has been linked successfully! You can now sign in using this account.",
            "success",
            "Account Linked"
          );
          // Refresh the settings data only if user is logged in
          if (user && !loading) {
            refreshSettingsData();
          }
          break;
      }
      // Clean up URL parameters
      const url = new URL(window.location.href);

      url.searchParams.delete("success");
      router.replace(url.pathname);
    }

    if (emailConfirmed) {
      showToast(
        "Your email address has been confirmed and updated successfully!",
        "success",
        "Email Updated"
      );
      // Clean up URL parameters
      const url = new URL(window.location.href);

      url.searchParams.delete("email_confirmed");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  // State for form inputs
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for loading
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isLinkingAccount, setIsLinkingAccount] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  // Create password for OAuth users
  const handleCreatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast("Please fill in all password fields", "error");

      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");

      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");

      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error("Password creation error:", error);
        showToast(error.message, "error");
      } else {
        showToast(
          "Password created successfully! You can now use email/password to sign in.",
          "success"
        );
        setNewPassword("");
        setConfirmPassword("");

        // Debug: Check user object immediately after password creation
        console.log("=== PASSWORD CREATION DEBUG ===");
        const { data: userAfterPassword } = await supabase.auth.getUser();
        console.log(
          "User after password creation:",
          JSON.stringify(userAfterPassword?.user, null, 2)
        );
        console.log("=== END PASSWORD CREATION DEBUG ===");

        // Add a small delay to ensure Supabase has updated the user metadata
        setTimeout(async () => {
          console.log("Refreshing settings data after password creation...");
          // Refresh settings data to update hasPasswordAuth
          await refreshSettingsData();
        }, 1000);
      }
    } catch (error) {
      console.error("Password creation error:", error);
      showToast("Failed to create password", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      showToast("Please enter a new email address", "error");

      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {
      showToast("Please enter a valid email address", "error");

      return;
    }

    // Check if the new email is different from current email
    if (newEmail === user?.email) {
      showToast("New email must be different from current email", "error");

      return;
    }

    setIsUpdatingEmail(true);
    try {
      console.log("Attempting to update email to:", newEmail);

      // Use Supabase's built-in email change flow
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      console.log("Email update response:", { data, error });

      if (error) {
        console.error("Email update error:", error);
        showToast(error.message, "error");
      } else {
        showToast(
          "Please check your new email address to confirm the change. You will be redirected to the confirmation page after clicking the link in your email.",
          "success"
        );
        setNewEmail("");
        // Refresh settings data to get updated user info
        await refreshSettingsData();
      }
    } catch (error) {
      console.error("Email update error:", error);
      showToast("Failed to update email", "error");
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("Please fill in all password fields", "error");

      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match", "error");

      return;
    }

    if (newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");

      return;
    }

    // Check if new password is different from current password
    if (currentPassword === newPassword) {
      showToast(
        "New password must be different from current password",
        "error"
      );

      return;
    }

    setIsUpdatingPassword(true);
    try {
      console.log("Attempting to update password");

      // For password updates, we don't need to verify the current password
      // Supabase handles this internally when the user is authenticated
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      console.log("Password update response:", { data, error });

      if (error) {
        console.error("Password update error:", error);
        showToast(error.message, "error");
      } else {
        showToast("Password updated successfully", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Refresh settings data
        await refreshSettingsData();
      }
    } catch (error) {
      console.error("Password update error:", error);
      showToast("Failed to update password", "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleLinkAccount = async (provider: string) => {
    setIsLinkingAccount(true);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/link-account-callback?provider=${provider}`,
        },
      });

      if (error) {
        // Provide more specific error messages based on the error
        let errorMessage = error.message;
        let errorTitle = "Linking Failed";

        if (error.message.includes("already linked")) {
          errorMessage = `This ${provider} account is already linked to another user. Please unlink it first.`;
          errorTitle = "Account Already Linked";
        } else if (error.message.includes("email not confirmed")) {
          errorMessage =
            "Please confirm your email address before linking additional accounts.";
          errorTitle = "Email Not Confirmed";
        } else if (error.message.includes("invalid")) {
          errorMessage = "Invalid authentication request. Please try again.";
          errorTitle = "Authentication Error";
        }

        showToast(errorMessage, "error", errorTitle);
        setIsLinkingAccount(false);
      } else {
        // The user will be redirected to the OAuth provider
        // Show a message that they're being redirected
        showToast(
          `Redirecting to ${provider}...`,
          "warning",
          "Linking Account"
        );
        // The callback will handle the result and redirect back
      }
    } catch (error) {
      showToast(
        "Unable to initiate account linking. Please check your connection and try again.",
        "error",
        "Linking Error"
      );
      setIsLinkingAccount(false);
    }
  };

  const handleUnlinkAccount = async (identity: any) => {
    try {
      const { error } = await supabase.auth.unlinkIdentity(identity);

      if (error) {
        let errorMessage = error.message;
        let errorTitle = "Unlinking Failed";

        if (error.message.includes("cannot unlink")) {
          errorMessage =
            "Cannot unlink this account. You need at least one account linked to sign in.";
          errorTitle = "Cannot Unlink";
        } else if (error.message.includes("not found")) {
          errorMessage =
            "Account not found. It may have already been unlinked.";
          errorTitle = "Account Not Found";
        }

        showToast(errorMessage, "error", errorTitle);
      } else {
        showToast(
          `${identity.provider} account unlinked successfully`,
          "success",
          "Account Unlinked"
        );
        await refreshSettingsData();
      }
    } catch (error) {
      showToast(
        "Unable to unlink account. Please try again.",
        "error",
        "Unlinking Error"
      );
    }
  };

  const isProviderLinked = (provider: string) => {
    return (
      settingsData?.identities?.some(
        (identity) => identity.provider === provider
      ) || false
    );
  };

  // Use cached profile data
  const currentProfile = profile;

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section Skeleton */}
            <div className="mb-4 xs:mb-8">
              <div className="mb-4">
                <Skeleton className="h-8 xs:h-10 w-48 rounded-lg" />
                <Skeleton className="h-4 w-80 xs:w-96 mt-2 rounded" />
              </div>
              {/* Mobile-only divider */}
              <div className="w-full h-px bg-divider xs:hidden" />
            </div>

            {/* Combined Account Settings Card Skeleton */}
            <div className="xs:bg-content1 xs:border xs:border-divider xs:rounded-xl xs:shadow-small">
              <div className="space-y-6 xs:space-y-8 xs:px-6 xs:pt-6 xs:pb-6">
                {/* Email Address Section Skeleton */}
                <div>
                  <div className="mb-4">
                    <Skeleton className="h-5 w-32 rounded" />
                    <Skeleton className="h-4 w-48 mt-1 rounded" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-10 w-32 rounded-lg" />
                  </div>
                </div>

                {/* Divider Skeleton */}
                <Skeleton className="h-px w-full rounded" />

                {/* Security Section Skeleton */}
                <div>
                  <div className="mb-4">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-4 w-56 mt-1 rounded" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Skeleton className="h-12 w-full rounded-lg" />
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-40 rounded-lg" />
                  </div>
                </div>

                {/* Divider Skeleton */}
                <Skeleton className="h-px w-full rounded" />

                {/* Account Connections Section Skeleton */}
                <div>
                  <div className="mb-4">
                    <Skeleton className="h-5 w-40 rounded" />
                    <Skeleton className="h-4 w-48 mt-1 rounded" />
                  </div>
                  <div className="space-y-4">
                    {/* Google Connection Skeleton */}
                    <div className="flex items-center justify-between p-4 border border-default-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6 rounded" />
                        <div>
                          <Skeleton className="h-5 w-16 rounded" />
                          <Skeleton className="h-4 w-24 mt-1 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </div>
                    </div>

                    {/* Discord Connection Skeleton */}
                    <div className="flex items-center justify-between p-4 border border-default-200 rounded-xl">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-6 rounded" />
                        <div>
                          <Skeleton className="h-5 w-16 rounded" />
                          <Skeleton className="h-4 w-24 mt-1 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !currentProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <SettingsNav />

      <div className="container mx-auto px-2 xs:px-4 py-4 xs:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-4 xs:mb-8">
            <div className="mb-4">
              <h1 className="text-2xl xs:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Account Settings
              </h1>
              <p className="text-default-500 mt-1 text-sm xs:text-base">
                Manage your account security and authentication
              </p>
            </div>
            {/* Mobile-only divider */}
            <div className="w-full h-px bg-divider xs:hidden" />
          </div>

          {/* Combined Account Settings Card */}
          <div className="xs:bg-content1 xs:border xs:border-divider xs:rounded-xl xs:shadow-small">
            <div className="space-y-6 xs:space-y-8 xs:px-6 xs:pt-6 xs:pb-6">
              {/* Email Address Section */}
              <div>
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-foreground">
                    Email Address
                  </h4>
                  <p className="text-sm text-default-500">
                    Update your email address
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    isReadOnly
                    label="Current Email"
                    value={user.email || ""}
                    variant="bordered"
                  />
                  <Input
                    errorMessage={
                      newEmail && newEmail === user?.email
                        ? "New email must be different from current email"
                        : ""
                    }
                    isInvalid={!!(newEmail && newEmail === user?.email)}
                    label="New Email"
                    placeholder="Enter new email address"
                    type="email"
                    value={newEmail}
                    variant="bordered"
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <Button
                    className="w-full sm:w-auto"
                    color="primary"
                    isDisabled={!newEmail || newEmail === user?.email}
                    isLoading={isUpdatingEmail}
                    onPress={handleUpdateEmail}
                  >
                    Update Email
                  </Button>
                </div>
              </div>

              <Divider />

              {/* Security Section */}
              <div>
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-foreground">
                    Security
                  </h4>
                  <p className="text-sm text-default-500">
                    {settingsData?.hasPasswordAuth
                      ? "Change your password"
                      : "Create a password for your account"}
                  </p>
                </div>
                <div className="space-y-4">
                  {settingsData?.hasPasswordAuth ? (
                    // Update Password Form
                    <>
                      <Input
                        label="Current Password"
                        placeholder="Enter current password"
                        type="password"
                        value={currentPassword}
                        variant="bordered"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          errorMessage={
                            newPassword && newPassword.length < 6
                              ? "Password must be at least 6 characters"
                              : ""
                          }
                          isInvalid={!!(newPassword && newPassword.length < 6)}
                          label="New Password"
                          placeholder="Enter new password"
                          type="password"
                          value={newPassword}
                          variant="bordered"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                          errorMessage={
                            confirmPassword && newPassword !== confirmPassword
                              ? "Passwords do not match"
                              : ""
                          }
                          isInvalid={
                            !!(
                              confirmPassword && newPassword !== confirmPassword
                            )
                          }
                          label="Confirm Password"
                          placeholder="Confirm new password"
                          type="password"
                          value={confirmPassword}
                          variant="bordered"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full sm:w-auto"
                        color="primary"
                        isDisabled={
                          !currentPassword ||
                          !newPassword ||
                          !confirmPassword ||
                          newPassword.length < 6 ||
                          newPassword !== confirmPassword ||
                          currentPassword === newPassword
                        }
                        isLoading={isUpdatingPassword}
                        onPress={handleUpdatePassword}
                      >
                        Update Password
                      </Button>
                    </>
                  ) : (
                    // Create Password Form
                    <>
                      <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
                        <p className="text-sm text-warning-700 dark:text-warning-300">
                          You signed in with a social account. Create a password
                          to enable email/password login.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          errorMessage={
                            newPassword && newPassword.length < 6
                              ? "Password must be at least 6 characters"
                              : ""
                          }
                          isInvalid={!!(newPassword && newPassword.length < 6)}
                          label="New Password"
                          placeholder="Enter new password"
                          type="password"
                          value={newPassword}
                          variant="bordered"
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                          errorMessage={
                            confirmPassword && newPassword !== confirmPassword
                              ? "Passwords do not match"
                              : ""
                          }
                          isInvalid={
                            !!(
                              confirmPassword && newPassword !== confirmPassword
                            )
                          }
                          label="Confirm Password"
                          placeholder="Confirm new password"
                          type="password"
                          value={confirmPassword}
                          variant="bordered"
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                      <Button
                        className="w-full sm:w-auto"
                        color="primary"
                        isDisabled={
                          !newPassword ||
                          !confirmPassword ||
                          newPassword.length < 6 ||
                          newPassword !== confirmPassword
                        }
                        isLoading={isUpdatingPassword}
                        onPress={handleCreatePassword}
                      >
                        Create Password
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Divider />

              {/* Account Connections Section */}
              <div>
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-foreground">
                    Account Connections
                  </h4>
                  <p className="text-sm text-default-500">
                    Link your social accounts
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Google Account */}
                  <div className="flex items-center justify-between p-4 border border-default-200 rounded-xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <GoogleIcon size={24} />
                      <div>
                        <p className="font-semibold">Google</p>
                        <p className="text-sm text-default-500">
                          {isProviderLinked("google")
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isProviderLinked("google") ? (
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => {
                            const googleIdentity =
                              settingsData?.identities?.find(
                                (identity) => identity.provider === "google"
                              );

                            if (googleIdentity) {
                              handleUnlinkAccount(googleIdentity);
                            }
                          }}
                        >
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          isLoading={isLinkingAccount}
                          size="sm"
                          variant="flat"
                          onPress={() => handleLinkAccount("google")}
                        >
                          Link
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Discord Account */}
                  <div className="flex items-center justify-between p-4 border border-default-200 rounded-xl hover:border-primary/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <DiscordIcon size={24} />
                      <div>
                        <p className="font-semibold">Discord</p>
                        <p className="text-sm text-default-500">
                          {isProviderLinked("discord")
                            ? "Connected"
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isProviderLinked("discord") ? (
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => {
                            const discordIdentity =
                              settingsData?.identities?.find(
                                (identity) => identity.provider === "discord"
                              );

                            if (discordIdentity) {
                              handleUnlinkAccount(discordIdentity);
                            }
                          }}
                        >
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          isLoading={isLinkingAccount}
                          size="sm"
                          variant="flat"
                          onPress={() => handleLinkAccount("discord")}
                        >
                          Link
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
