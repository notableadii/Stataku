"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Spinner } from "@heroui/spinner";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { title, subtitle } from "@/components/primitives";
import { usernameChecker } from "@/lib/username-cache";
import { createUsername } from "@/lib/turso";

interface UsernameSelectorProps {
  userId: string;
  onUsernameCreated: (username: string) => Promise<void>;
  onCancel: () => void;
}

type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error"
  | "success";

export function UsernameSelector({
  userId,
  onUsernameCreated,
  onCancel,
}: UsernameSelectorProps) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<UsernameStatus>("idle");
  const [isCreating, setIsCreating] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const fallbackTimer = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
      if (fallbackTimer.current) {
        clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
      usernameChecker.cancelPendingChecks();
    };
  }, []);

  // Debounced username checking
  const checkUsernameAvailability = useCallback(
    async (inputUsername: string) => {
      if (inputUsername.length < 3) {
        setStatus("invalid");

        return;
      }

      // Don't set checking status here - we already show it immediately in handleUsernameChange
      await usernameChecker.checkUsernameAvailability(
        inputUsername,
        (checkedUsername, available, loading) => {
          console.log(
            `Callback received: checkedUsername="${checkedUsername}", inputUsername="${inputUsername}", available=${available}, loading=${loading}`,
          );
          // Only update if this is still the current username being checked
          if (checkedUsername === inputUsername) {
            // Handle loading state when API call actually starts (after 3 second delay)
            if (loading) {
              console.log("API call started, keeping checking status");
              // Keep the checking status - don't change it
            } else if (available === true) {
              console.log("Setting status to available");
              setStatus("available");
              // Clear fallback timer since we got a successful result
              if (fallbackTimer.current) {
                clearTimeout(fallbackTimer.current);
                fallbackTimer.current = null;
              }
            } else if (available === false) {
              console.log("Setting status to taken");
              setStatus("taken");
              // Clear fallback timer since we got a successful result
              if (fallbackTimer.current) {
                clearTimeout(fallbackTimer.current);
                fallbackTimer.current = null;
              }
            } else {
              console.log("Setting status to error");
              setStatus("error");
              // Clear fallback timer since we got a result (even if error)
              if (fallbackTimer.current) {
                clearTimeout(fallbackTimer.current);
                fallbackTimer.current = null;
              }
            }
          } else {
            console.log("Username mismatch, ignoring callback");
          }
        },
      );
    },
    [], // Remove username dependency to prevent infinite recreation
  );

  // Handle key down to prevent invalid characters and uppercase input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow special keys like backspace, delete, arrow keys, etc.
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
      "Enter",
      "Escape",
      "Shift",
      "Control",
      "Alt",
      "Meta",
      "CapsLock",
      "NumLock",
      "ScrollLock",
      "Pause",
      "Insert",
      "PageUp",
      "PageDown",
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
      "F6",
      "F7",
      "F8",
      "F9",
      "F10",
      "F11",
      "F12",
      "ContextMenu",
    ];

    // Allow special keys to work normally
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) {
      return; // Let the browser handle these keys normally
    }

    // Check if the key is a valid character (letters, digits, underscores, periods)
    const validPattern = /^[a-zA-Z0-9_.]$/;

    if (!validPattern.test(e.key)) {
      e.preventDefault();

      return;
    }

    // Prevent uppercase letters from being typed
    if (e.key >= "A" && e.key <= "Z") {
      e.preventDefault();
      // Convert to lowercase and add to input
      const lowercaseKey = e.key.toLowerCase();
      const currentValue = (e.target as HTMLInputElement).value;
      const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
      const newValue =
        currentValue.slice(0, cursorPosition) +
        lowercaseKey +
        currentValue.slice(cursorPosition);

      handleUsernameChange(newValue);
    }
  };

  // Handle paste to convert to lowercase and filter invalid characters
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").toLowerCase();

    // Filter out invalid characters, keeping only letters, digits, underscores, and periods
    const filteredText = pastedText.replace(/[^a-z0-9_.]/g, "");

    const currentValue = (e.target as HTMLInputElement).value;
    const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
    const newValue =
      currentValue.slice(0, cursorPosition) +
      filteredText +
      currentValue.slice(cursorPosition);

    handleUsernameChange(newValue);
  };

  // Validate username characters (only letters, digits, underscores, and periods)
  const isValidUsername = (username: string): boolean => {
    // Only allow letters, digits, underscores, and periods
    const validPattern = /^[a-z0-9_.]+$/;

    return validPattern.test(username);
  };

  // Handle username input changes
  const handleUsernameChange = (value: string) => {
    // Convert to lowercase automatically
    const lowercaseValue = value.toLowerCase();

    setUsername(lowercaseValue);

    // Clear existing timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }

    // Reset status for short usernames
    if (lowercaseValue.length < 3) {
      setStatus("invalid");

      return;
    }

    // Check for invalid characters
    if (!isValidUsername(lowercaseValue)) {
      setStatus("invalid");

      return;
    }

    // Show checking status immediately for valid usernames
    if (lowercaseValue.length >= 3 && isValidUsername(lowercaseValue)) {
      setStatus("checking");
    }

    // Set up debounced check with 1 second delay
    debounceTimer.current = setTimeout(() => {
      console.log(`Starting check for username: "${lowercaseValue}"`);
      checkUsernameAvailability(lowercaseValue);
    }, 1000); // 1 second delay before database read

    // Add a fallback timeout to reset status if it gets stuck
    fallbackTimer.current = setTimeout(() => {
      setStatus((prevStatus) => {
        if (prevStatus === "checking") {
          console.log("Status stuck in checking, resetting to error");

          return "error";
        }

        return prevStatus;
      });
    }, 4000); // 4 second fallback (1s delay + 3s for API call)
  };

  // Handle username creation
  const handleCreateUsername = async () => {
    if (
      status !== "available" ||
      username.length < 3 ||
      !isValidUsername(username)
    ) {
      return;
    }

    setIsCreating(true);

    try {
      const result = await createUsername(userId, username);

      if (result.success) {
        // Show success message before redirecting
        setStatus("success");
        await onUsernameCreated(result.username);
      } else {
        if (result.conflict) {
          setStatus("taken");
        } else {
          setStatus("error");
        }
      }
    } catch (error) {
      console.error("Error creating username:", error);
      setStatus("error");
    } finally {
      setIsCreating(false);
    }
  };

  // Get status display
  const getStatusDisplay = () => {
    switch (status) {
      case "checking":
        return (
          <div className="flex items-center gap-2 text-sm text-default-500">
            <Spinner size="sm" />
            <span>Checking availability...</span>
          </div>
        );
      case "available":
        return (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckIcon className="w-4 h-4" />
            <span>Username is available!</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckIcon className="w-4 h-4" />
            <span>Username created successfully! Redirecting...</span>
          </div>
        );
      case "taken":
        return (
          <div className="flex items-center gap-2 text-sm text-danger">
            <XMarkIcon className="w-4 h-4" />
            <span>Username is already taken</span>
          </div>
        );
      case "invalid":
        return (
          <div className="flex items-center gap-2 text-sm text-warning">
            <XMarkIcon className="w-4 h-4" />
            <span>
              {username.length < 3
                ? "Username must be at least 3 characters"
                : "Username can only contain letters, digits, underscores, and periods"}
            </span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2 text-sm text-danger">
            <XMarkIcon className="w-4 h-4" />
            <span>Error checking username</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Get input styling based on status
  const getInputProps = () => {
    const baseProps = {
      value: username,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        handleUsernameChange(e.target.value),
      placeholder: "Enter your username",
      maxLength: 30,
    };

    switch (status) {
      case "available":
        return {
          ...baseProps,
          color: "success" as const,
          isInvalid: false,
          classNames: {
            input: "!border-success",
            inputWrapper: "!border-success",
          },
        };
      case "taken":
      case "invalid":
      case "error":
        return {
          ...baseProps,
          color: "danger" as const,
          isInvalid: true,
          classNames: {
            input: "!border-danger",
            inputWrapper: "!border-danger",
          },
        };
      case "checking":
        return {
          ...baseProps,
          color: "primary" as const,
          isInvalid: false,
        };
      default:
        return baseProps;
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center w-full">
          <h1 className={title({ class: "mb-2 text-2xl sm:text-3xl w-full" })}>
            Create Your Username
          </h1>
          <p className={subtitle({ class: "text-base sm:text-lg w-full" })}>
            Choose a unique username for your account
          </p>
        </div>

        {/* Username Selection Card */}
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-1 pb-0 px-6 pt-6">
            <div className="flex items-center gap-3">
              <Avatar
                className="w-12 h-12"
                name={username || "user"}
                size="md"
                src="/api/avatar"
              />
              <div>
                <h2 className="text-lg font-semibold">Choose Username</h2>
                <p className="text-sm text-default-500">
                  This will be your public display name
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="gap-4 py-6 px-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Input
                {...getInputProps()}
                autoComplete="off"
                label="Username"
                spellCheck="false"
                startContent="@"
                style={{ textTransform: "lowercase" }}
                variant="bordered"
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
              />

              {/* Helper Text */}
              <div className="text-xs text-default-400">
                Usernames can only contain letters, digits, underscores, and
                periods • Automatically converted to lowercase • Database check
                after 1 second of no typing
              </div>

              {/* Status Display */}
              {getStatusDisplay()}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                className="flex-1"
                color="primary"
                isDisabled={status !== "available" || isCreating}
                isLoading={isCreating}
                size="lg"
                onPress={handleCreateUsername}
              >
                {isCreating ? "Creating..." : "Create Username"}
              </Button>

              <Button
                color="default"
                isDisabled={isCreating}
                size="lg"
                variant="bordered"
                onPress={onCancel}
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
