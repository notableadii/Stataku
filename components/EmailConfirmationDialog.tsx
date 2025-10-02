"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { supabase } from "@/lib/supabase";

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onConfirmed: () => void;
}

export function EmailConfirmationDialog({
  isOpen,
  onClose,
  email,
  onConfirmed,
}: EmailConfirmationDialogProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Check email confirmation status
  const checkEmailConfirmation = async () => {
    setIsChecking(true);
    setError(null);

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        setError("Failed to check email confirmation status");

        return;
      }

      if (user && user.email_confirmed_at) {
        setIsConfirmed(true);
        // Call onConfirmed after a short delay to show the success state
        setTimeout(() => {
          onConfirmed();
        }, 1500);
      }
    } catch (err) {
      setError("An error occurred while checking email confirmation");
      // eslint-disable-next-line no-console
      console.error("Error checking email confirmation:", err);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-check every 3 seconds when dialog is open
  useEffect(() => {
    if (!isOpen) return;

    // Check immediately
    checkEmailConfirmation();

    // Set up interval to check every 3 seconds
    const interval = setInterval(checkEmailConfirmation, 3000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleRefresh = () => {
    checkEmailConfirmation();
  };

  // Resend confirmation email
  const handleResendEmail = async () => {
    setIsResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setResendError(error.message);
      } else {
        setResendSuccess(true);
        // Clear success message after 3 seconds
        setTimeout(() => setResendSuccess(false), 3000);
      }
    } catch (err) {
      setResendError("Failed to resend confirmation email. Please try again.");
      // eslint-disable-next-line no-console
      console.error("Error resending confirmation email:", err);
    } finally {
      setIsResending(false);
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setError(null);
    setResendSuccess(false);
    setResendError(null);
    onClose();
  };

  return (
    <Modal
      classNames={{
        base: "mx-4",
        backdrop: "bg-black/50 backdrop-blur-sm",
      }}
      hideCloseButton={!isConfirmed}
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {isConfirmed ? (
              <CheckCircleIcon className="w-6 h-6 text-success" />
            ) : (
              <ExclamationTriangleIcon className="w-6 h-6 text-warning" />
            )}
            <span className="text-lg font-semibold">
              {isConfirmed ? "Email Confirmed!" : "Confirm Your Email"}
            </span>
          </div>
        </ModalHeader>

        <ModalBody className="pb-4">
          {isConfirmed ? (
            <div className="text-center py-4">
              <div className="text-success text-6xl mb-4">✅</div>
              <p className="text-success font-medium mb-2">
                Your email has been successfully confirmed!
              </p>
              <p className="text-sm text-default-500">
                Redirecting you to create your username...
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="text-warning text-6xl mb-4">📧</div>
              <p className="text-default-700 mb-4">
                We&apos;ve sent a confirmation email to:
              </p>
              <p className="font-mono text-sm bg-default-100 px-3 py-2 rounded-lg mb-4">
                {email}
              </p>
              <p className="text-sm text-default-500 mb-4">
                Please check your email and click the confirmation link to
                verify your account.
              </p>

              {error && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-4">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              {resendSuccess && (
                <div className="bg-success-50 border border-success-200 rounded-lg p-3 mb-4">
                  <p className="text-success text-sm">
                    ✅ Confirmation email sent successfully! Please check your
                    inbox.
                  </p>
                </div>
              )}

              {resendError && (
                <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-4">
                  <p className="text-danger text-sm">{resendError}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-default-500">
                {isChecking ? (
                  <>
                    <Spinner size="sm" />
                    <span>Checking confirmation status...</span>
                  </>
                ) : (
                  <span>We&apos;ll check automatically every 3 seconds</span>
                )}
              </div>
            </div>
          )}
        </ModalBody>

        <ModalFooter className="pt-0">
          {!isConfirmed && (
            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  color="primary"
                  isLoading={isChecking}
                  variant="flat"
                  onPress={handleRefresh}
                >
                  {isChecking ? "Checking..." : "Refresh Status"}
                </Button>
                <Button
                  className="flex-1"
                  color="secondary"
                  isLoading={isResending}
                  variant="flat"
                  onPress={handleResendEmail}
                >
                  {isResending ? "Sending..." : "Resend Email"}
                </Button>
              </div>
              <Button
                className="w-full"
                color="default"
                variant="bordered"
                onPress={handleClose}
              >
                Close
              </Button>
            </div>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
