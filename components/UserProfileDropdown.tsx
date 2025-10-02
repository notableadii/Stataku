"use client";

import React, { useState, useEffect } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "@/contexts/AuthContext";

interface UserProfileDropdownProps {
  isMobile?: boolean;
  className?: string;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  isMobile = false,
  className = "",
}) => {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Listen for localStorage changes to get current username
  useEffect(() => {
    const getCurrentUsername = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("currentUsername");
        setCurrentUsername(stored);
      }
    };

    // Get initial value
    getCurrentUsername();

    // Listen for storage events (when localStorage changes from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "currentUsername") {
        setCurrentUsername(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (for same-tab changes)
    const handleCustomStorageChange = () => {
      getCurrentUsername();
    };

    window.addEventListener(
      "currentUsernameChanged",
      handleCustomStorageChange
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "currentUsernameChanged",
        handleCustomStorageChange
      );
    };
  }, []);

  if (!user || !profile) {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
      onOpenChange();
    }
  };

  const handleProfileClick = () => {
    // Use current username if available (when typing), otherwise use saved username
    const usernameToUse = currentUsername || profile.username;
    router.push(`/user/${usernameToUse}`);
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleDirectLogout = () => {
    onOpen(); // Show confirmation modal
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
      onOpenChange(); // Close modal
    }
  };

  // Get avatar source - use profile avatar_url if available, otherwise use universal avatar
  const getAvatarSrc = () => {
    if (profile.avatar_url) {
      return profile.avatar_url;
    }

    return "/avatars/universal-avatar.jpg";
  };

  if (isMobile) {
    return (
      <div className={`flex items-center justify-between w-full ${className}`}>
        {/* Profile Dropdown - Avatar + Username */}
        <Dropdown
          isOpen={isProfileDropdownOpen}
          placement="bottom-start"
          onOpenChange={setIsProfileDropdownOpen}
        >
          <DropdownTrigger>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-default-100 rounded-lg p-2 -m-2 transition-colors">
              <Avatar
                className="w-8 h-8"
                name={profile.username}
                src={getAvatarSrc()}
              />
              <span className="text-sm font-medium text-foreground">
                {currentUsername || profile.username}
              </span>
            </div>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile actions"
            className="min-w-[200px]"
            variant="flat"
          >
            <DropdownItem
              key="profile"
              startContent={<UserIcon className="w-4 h-4" />}
              onPress={handleProfileClick}
            >
              Profile
            </DropdownItem>
            <DropdownItem
              key="settings"
              startContent={<Cog6ToothIcon className="w-4 h-4" />}
              onPress={handleSettingsClick}
            >
              Settings
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Direct Logout Button */}
        <Button
          isIconOnly
          aria-label="Logout"
          className="min-w-0 w-8 h-8 text-danger hover:bg-danger-50"
          size="sm"
          variant="light"
          onPress={handleDirectLogout}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
        </Button>

        {/* Confirmation Modal */}
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Confirm Logout
                </ModalHeader>
                <ModalBody>
                  <p>
                    Are you sure you want to log out? You&apos;ll need to sign
                    in again to access your account.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button color="default" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isLoggingOut}
                    onPress={confirmLogout}
                  >
                    {isLoggingOut ? "Logging out..." : "Log Out"}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    );
  }

  return (
    <>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <Avatar
            aria-label="Open profile menu"
            className="w-8 h-8 cursor-pointer hover:scale-105 transition-transform"
            name={profile.username}
            src={getAvatarSrc()}
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile actions"
          className="min-w-[200px]"
          variant="flat"
        >
          <DropdownItem
            key="profile"
            startContent={<UserIcon className="w-4 h-4" />}
            onPress={handleProfileClick}
          >
            Profile
          </DropdownItem>
          <DropdownItem
            key="settings"
            startContent={<Cog6ToothIcon className="w-4 h-4" />}
            onPress={handleSettingsClick}
          >
            Settings
          </DropdownItem>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
            onPress={onOpen}
          >
            Log Out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Confirm Logout
              </ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to log out? You&apos;ll need to sign in
                  again to access your account.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="danger"
                  isLoading={isLoggingOut}
                  onPress={handleLogout}
                >
                  {isLoggingOut ? "Logging out..." : "Log Out"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
