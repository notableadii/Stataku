"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";

import { title, subtitle } from "@/components/primitives";
import { useAuth } from "@/contexts/AuthContext";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";

export default function TestEmailPage() {
  const router = useRouter();
  const { user, profile, loading, session } = useAuth();
  // No email data state needed - only testing welcome emails
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Log page visit
  useEffect(() => {
    logPageVisit("Test Email", PAGE_MESSAGES["Test Email"]);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleSendWelcomeEmail = async () => {
    if (!user?.email) {
      setResult({
        success: false,
        message: "No user email found",
      });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-welcome-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `✅ Welcome email sent successfully to ${user.email}!`,
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed to send welcome email: ${data.error || "Unknown error"}`,
          details: data,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Error sending welcome email: ${error.message}`,
        details: error,
      });
    } finally {
      setSending(false);
    }
  };

  const handleTestSMTP = async () => {
    setSending(true);
    setResult(null);

    try {
      const response = await fetch("/api/test-smtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: "✅ SMTP connection test successful!",
          details: data.details,
        });
      } else {
        setResult({
          success: false,
          message: `❌ SMTP test failed: ${data.error || "Unknown error"}`,
          details: data.details,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `❌ Error testing SMTP: ${error.message}`,
        details: error,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className={title({ class: "mb-2 text-3xl sm:text-4xl" })}>
            📧 Welcome Email Tester
          </h1>
          <p className={subtitle({ class: "text-base sm:text-lg" })}>
            Test your welcome email template and SMTP configuration
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Welcome Email Test */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Test Welcome Email</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Current User Email Display */}
              <div className="p-3 bg-default-100 rounded-lg">
                <p className="text-sm text-default-600 mb-1">Sending to:</p>
                <p className="font-medium text-default-900">{user?.email}</p>
              </div>

              {/* Email Type Display */}
              <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center gap-2">
                  <Chip size="sm" color="primary" variant="flat">
                    Welcome Email
                  </Chip>
                  <span className="text-sm text-primary-700">
                    Profile completion email with beautiful template
                  </span>
                </div>
              </div>

              {/* Send Button */}
              <Button
                color="primary"
                size="lg"
                onPress={handleSendWelcomeEmail}
                isLoading={sending}
                isDisabled={!user?.email}
                className="w-full"
              >
                {sending ? "Sending Welcome Email..." : "Send Welcome Email"}
              </Button>
            </CardBody>
          </Card>

          {/* SMTP Test */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">SMTP Configuration</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm text-default-600">
                Test your SMTP connection and configuration without sending
                emails. The welcome email will be sent to your account email.
              </p>

              <Button
                color="secondary"
                variant="bordered"
                size="lg"
                onPress={handleTestSMTP}
                isLoading={sending}
                className="w-full"
              >
                {sending ? "Testing..." : "Test SMTP Connection"}
              </Button>

              <Divider />

              <div className="space-y-2">
                <h3 className="font-medium">Welcome Email Features:</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      ✨ Beautiful black background template
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      📧 Professional email design
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      🎯 Profile completion notification
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Results */}
        {result && (
          <Card className={result.success ? "border-success" : "border-danger"}>
            <CardBody>
              <div className="space-y-2">
                <p className={result.success ? "text-success" : "text-danger"}>
                  {result.message}
                </p>
                {result.details && (
                  <details className="text-sm text-default-600">
                    <summary className="cursor-pointer font-medium">
                      View Details
                    </summary>
                    <pre className="mt-2 p-3 bg-default-100 rounded-lg overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Back Button */}
        <div className="text-center">
          <Button
            color="default"
            variant="bordered"
            onPress={() => router.push("/dashboard")}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
