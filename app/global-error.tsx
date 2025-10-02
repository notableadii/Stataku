"use client";

import { useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Error", PAGE_MESSAGES.Error);
  }, []);

  return (
    <html lang="en">
      <head>
        <title>Error - Stataku</title>
        <meta
          name="description"
          content="An error occurred on Stataku. Please try again."
        />
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
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
      </body>
    </html>
  );
}
