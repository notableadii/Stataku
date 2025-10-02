"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function AuthCodeErrorPage() {
  const router = useRouter();

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Auth Code Error", PAGE_MESSAGES["Auth Code Error"]);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center gap-4">
            <div className="p-3 bg-danger/10 rounded-full">
              <ExclamationTriangleIcon className="w-8 h-8 text-danger" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Authentication Error
              </h1>
              <p className="text-default-500 mt-2">
                There was an error confirming your email address.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-sm text-default-600 text-center">
            The confirmation link may have expired or been used already. Please
            try requesting a new confirmation email.
          </p>
          <div className="flex gap-3">
            <Button
              className="flex-1"
              color="primary"
              onPress={() => router.push("/settings")}
            >
              Go to Settings
            </Button>
            <Button
              className="flex-1"
              variant="light"
              onPress={() => router.push("/")}
            >
              Go Home
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
