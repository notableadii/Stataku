"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-40">
      {" "}
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
                color="primary"
                onPress={() => router.back()}
                className="w-full sm:w-auto"
              >
                Go Back
              </Button>
              <Button
                as={Link}
                href="/"
                color="default"
                variant="bordered"
                className="w-full sm:w-auto"
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
