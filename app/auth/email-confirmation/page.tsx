"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import {
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmailConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [confirmationStatus, setConfirmationStatus] = useState<
    "success" | "error" | "loading"
  >("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkConfirmationStatus = () => {
      const confirmed = searchParams.get("confirmed");
      const error = searchParams.get("error");
      const type = searchParams.get("type");

      if (confirmed === "true") {
        setConfirmationStatus("success");
        if (type === "email_change") {
          setMessage(
            "Your email address has been updated successfully! You can now sign in with your new email address."
          );
        } else {
          setMessage(
            "Your email has been confirmed successfully! You can now use all features of your account."
          );
        }
      } else if (error || confirmed === "false") {
        setConfirmationStatus("error");
        if (error === "verification_failed") {
          setMessage(
            "Email verification failed. The confirmation link may be expired or invalid. Please try updating your email again."
          );
        } else if (error === "invalid_link") {
          setMessage(
            "Invalid confirmation link. Please check your email for the correct confirmation link."
          );
        } else {
          setMessage(
            "Unable to confirm your email. This could be due to an expired or invalid confirmation link. Please try again."
          );
        }
      } else if (type === "email_change") {
        setConfirmationStatus("success");
        setMessage(
          "Your email address has been updated successfully! You can now sign in with your new email address."
        );
      } else {
        setConfirmationStatus("error");
        setMessage(
          "Invalid confirmation link. Please check your email for the correct confirmation link."
        );
      }

      setIsLoading(false);
    };

    checkConfirmationStatus();
  }, [searchParams]);

  const handleRetry = () => {
    router.push("/settings");
  };

  // Navigation handled by router.push calls directly

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-default-50">
        <Card className="max-w-md w-full p-6 shadow-lg rounded-xl">
          <CardBody className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-default-600">
              Verifying your email confirmation...
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-default-50 p-4">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg rounded-xl border-0">
          <CardHeader className="flex flex-col items-center pb-4">
            <motion.div
              animate={{ scale: 1 }}
              className={`p-4 rounded-full mb-4 ${
                confirmationStatus === "success"
                  ? "bg-success-100 dark:bg-success-900/20"
                  : "bg-danger-100 dark:bg-danger-900/20"
              }`}
              initial={{ scale: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {confirmationStatus === "success" ? (
                <CheckCircleIcon className="w-16 h-16 text-success-600 dark:text-success-400" />
              ) : (
                <XCircleIcon className="w-16 h-16 text-danger-600 dark:text-danger-400" />
              )}
            </motion.div>

            <motion.h1
              animate={{ opacity: 1 }}
              className={`text-2xl font-bold ${
                confirmationStatus === "success"
                  ? "text-success-600 dark:text-success-400"
                  : "text-danger-600 dark:text-danger-400"
              }`}
              initial={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              {confirmationStatus === "success"
                ? "Email Confirmed!"
                : "Confirmation Failed"}
            </motion.h1>
          </CardHeader>

          <CardBody className="text-center space-y-6">
            <motion.div
              animate={{ opacity: 1 }}
              className="space-y-4"
              initial={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-center">
                <EnvelopeIcon className="w-8 h-8 text-default-400 mr-2" />
                <span className="text-sm text-default-500">
                  Email Confirmation
                </span>
              </div>

              <p className="text-default-700 dark:text-default-300 leading-relaxed">
                {message}
              </p>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              transition={{ delay: 0.5 }}
            >
              {confirmationStatus === "success" ? (
                <>
                  <Button
                    as={Link}
                    className="w-full"
                    color="primary"
                    href="/settings"
                    size="lg"
                  >
                    Go to Settings
                  </Button>
                  <Button
                    as={Link}
                    className="w-full"
                    href="/"
                    size="lg"
                    variant="light"
                  >
                    Go Home
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full"
                    color="primary"
                    size="lg"
                    onPress={handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button
                    as={Link}
                    className="w-full"
                    href="/"
                    size="lg"
                    variant="light"
                  >
                    Go Home
                  </Button>
                </>
              )}
            </motion.div>

            {confirmationStatus === "error" && (
              <motion.div
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-sm font-semibold text-warning-700 dark:text-warning-300 mb-2">
                  Need Help?
                </h3>
                <p className="text-xs text-warning-600 dark:text-warning-400">
                  If you continue to have issues, please check your spam folder
                  or contact support.
                </p>
              </motion.div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
