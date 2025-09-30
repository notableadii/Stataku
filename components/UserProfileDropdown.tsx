"use client";

import React, { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

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
    router.push(`/user/${profile.username}`);
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
          placement="bottom-start"
          isOpen={isProfileDropdownOpen}
          onOpenChange={setIsProfileDropdownOpen}
        >
          <DropdownTrigger>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-default-100 rounded-lg p-2 -m-2 transition-colors">
              <Avatar
                src={getAvatarSrc()}
                className="w-8 h-8"
                name={profile.username}
              />
              <span className="text-sm font-medium text-foreground">
                {profile.username}
              </span>
            </div>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Profile actions"
            variant="flat"
            className="min-w-[200px]"
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
          variant="light"
          size="sm"
          className="min-w-0 w-8 h-8 text-danger hover:bg-danger-50"
          aria-label="Logout"
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
                    onPress={confirmLogout}
                    isLoading={isLoggingOut}
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
            src={getAvatarSrc()}
            className="w-8 h-8 cursor-pointer hover:scale-105 transition-transform"
            name={profile.username}
            aria-label="Open profile menu"
          />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Profile actions"
          variant="flat"
          className="min-w-[200px]"
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
                  onPress={handleLogout}
                  isLoading={isLoggingOut}
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
