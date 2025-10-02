"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log page visit with beautiful console message
    logPageVisit("Error", PAGE_MESSAGES.Error);

    // Log the error to an error reporting service
    console.error("Error caught:", error);
  }, [error]);

  // Check if this is a 404 error
  const errorMessage = error.message.toLowerCase();
  const is404 =
    errorMessage.includes("404") ||
    errorMessage.includes("next_http_error_fallback") ||
    errorMessage.includes("not found");

  if (is404) {
    // Redirect to our custom 404 page
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
        <div className="transform -translate-y-8">
          <Card className="max-w-md w-full mx-4">
            <CardBody className="text-center py-8">
              <div className="text-6xl mb-6">🔍</div>
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
              <p className="text-default-500 mb-6">
                The page you&apos;re looking for doesn&apos;t exist or has been
                moved.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  className="w-full sm:w-auto"
                  color="primary"
                  onPress={() => router.back()}
                >
                  Go Back
                </Button>
                <Button
                  as={Link}
                  className="w-full sm:w-auto"
                  color="default"
                  href="/"
                  variant="bordered"
                >
                  Go Home
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // For other errors, show the generic error page
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
      <div className="transform -translate-y-8">
        <Card className="max-w-md w-full mx-4">
          <CardBody className="text-center py-8">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-4xl font-bold mb-4">Error</h1>
            <h2 className="text-2xl font-semibold mb-4">
              Something went wrong!
            </h2>
            <p className="text-default-500 mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                className="w-full sm:w-auto"
                color="primary"
                onPress={() => reset()}
              >
                Try Again
              </Button>
              <Button
                as={Link}
                className="w-full sm:w-auto"
                color="default"
                href="/"
                variant="bordered"
              >
                Go Home
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
