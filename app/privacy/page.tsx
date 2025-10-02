"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";

import { title, subtitle } from "@/components/primitives";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function PrivacyPage() {
  const router = useRouter();

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Privacy Policy", PAGE_MESSAGES["Privacy Policy"]);
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className={title({ class: "mb-2 text-2xl sm:text-3xl" })}>
            Privacy Policy
          </h1>
          <p className={subtitle({ class: "text-sm sm:text-base" })}>
            How we collect, use, and protect your personal information
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                className="flex-shrink-0"
                size="sm"
                variant="light"
                onPress={() => router.back()}
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </Button>
              <h2 className="text-xl sm:text-2xl font-bold">Privacy Policy</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4 py-4 sm:py-6 px-4 sm:px-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2 text-default-700">
                Privacy Policy
              </h3>
              <p className="text-default-500 mb-4">
                Our comprehensive privacy policy is currently being prepared.
              </p>
              <p className="text-sm text-default-400">
                This page will be updated soon with detailed information about:
              </p>
              <ul className="text-sm text-default-400 mt-4 space-y-1 text-left max-w-md mx-auto">
                <li>• Information we collect from you</li>
                <li>• How we use your personal data</li>
                <li>• Data sharing and third-party services</li>
                <li>• Cookie usage and tracking</li>
                <li>• Data security and protection measures</li>
                <li>• Your rights and data control options</li>
                <li>• Contact information for privacy concerns</li>
              </ul>
              <div className="mt-6">
                <Button
                  color="primary"
                  variant="flat"
                  onPress={() => router.back()}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
