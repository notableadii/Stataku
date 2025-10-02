"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { motion } from "framer-motion";
import NextLink from "next/link";

import { title, subtitle } from "@/components/primitives";
import { GoogleIcon, DiscordIcon } from "@/components/icons";
import { signIn, signInWithGoogle, signInWithDiscord } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { SignInFormSkeleton } from "@/components/skeletons";
import { EmailConfirmationDialog } from "@/components/EmailConfirmationDialog";
import { logPageVisit, PAGE_MESSAGES } from "@/lib/console-logger";
// Animation imports removed - using simple hover effects only

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const router = useRouter();
  const { user, profile, loading, profileLoading } = useAuth();

  // Log page visit with beautiful console message
  useEffect(() => {
    logPageVisit("Sign In", PAGE_MESSAGES["Sign In"]);
  }, []);

  // Redirect if user is already signed in and profile is loaded
  useEffect(() => {
    if (!loading && !profileLoading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, profileLoading, router]);

  // Show loading while checking authentication status or profile
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 sm:space-y-6">
          <div className="text-center">
            <h1 className={title({ class: "mb-2 text-2xl sm:text-3xl" })}>
              Welcome back
            </h1>
            <p className={subtitle({ class: "text-sm sm:text-base" })}>
              Sign in to your account to continue your anime journey
            </p>
          </div>
          <SignInFormSkeleton />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSkeleton(true);
    setError("");

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        setIsLoading(false);
        setShowSkeleton(false);

        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.user.email_confirmed_at) {
          // Show email confirmation dialog
          setPendingEmail(email);
          setShowEmailConfirmation(true);
          setShowSkeleton(false);
          setIsLoading(false);

          return;
        }

        // Email confirmed, redirect to dashboard (AuthContext will handle profile loading)
        router.push("/dashboard");
      }
    } catch (_err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
      setShowSkeleton(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setError(error.message);
      }
    } catch (_err) {
      setError("An unexpected error occurred");
    }
  };

  const handleDiscordSignIn = async () => {
    try {
      const { error } = await signInWithDiscord();

      if (error) {
        setError(error.message);
      }
    } catch (_err) {
      setError("An unexpected error occurred");
    }
  };

  const handleEmailConfirmed = () => {
    setShowEmailConfirmation(false);
    // Redirect to dashboard (AuthContext will handle profile loading)
    router.push("/dashboard");
  };

  if (showSkeleton) {
    return (
      <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-4 sm:space-y-6">
          <div className="text-center">
            <h1 className={title({ class: "mb-2 text-2xl sm:text-3xl" })}>
              Welcome back
            </h1>
            <p className={subtitle({ class: "text-sm sm:text-base" })}>
              Sign in to your account to continue your anime journey
            </p>
          </div>
          <SignInFormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        <div className="text-center">
          <h1 className={title({ class: "mb-2 text-2xl sm:text-3xl" })}>
            Welcome back
          </h1>
          <p className={subtitle({ class: "text-sm sm:text-base" })}>
            Sign in to your account to continue your anime journey
          </p>
        </div>

        <motion.div transition={{ duration: 0.2 }} whileHover={{ y: -2 }}>
          <Card className="w-full">
            <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
              <h2 className="text-xl sm:text-2xl font-bold text-center">
                Sign In
              </h2>
              <p className="text-small text-default-500 text-center">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            <CardBody className="gap-4 py-4 sm:py-6 px-4 sm:px-6">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  isRequired
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-default-200",
                  }}
                  label="Email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  variant="bordered"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  isRequired
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-default-200",
                  }}
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  variant="bordered"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex justify-end">
                  <Link
                    className="text-sm"
                    color="primary"
                    href="/forgot-password"
                    size="sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
                <Button
                  className="w-full"
                  color="primary"
                  isLoading={isLoading}
                  size="lg"
                  type="submit"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="flex items-center gap-4 my-4">
                <Divider className="flex-1" />
                <p className="text-tiny text-default-500">OR</p>
                <Divider className="flex-1" />
              </div>

              <div className="space-y-3">
                <motion.div
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full"
                    size="lg"
                    startContent={<GoogleIcon size={20} />}
                    variant="bordered"
                    onPress={handleGoogleSignIn}
                  >
                    Continue with Google
                  </Button>
                </motion.div>
                <motion.div
                  transition={{ duration: 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full"
                    size="lg"
                    startContent={<DiscordIcon size={20} />}
                    variant="bordered"
                    onPress={handleDiscordSignIn}
                  >
                    Continue with Discord
                  </Button>
                </motion.div>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-default-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    as={NextLink}
                    className="font-medium"
                    color="primary"
                    href="/signup"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Email Confirmation Dialog */}
      <EmailConfirmationDialog
        email={pendingEmail}
        isOpen={showEmailConfirmation}
        onClose={() => setShowEmailConfirmation(false)}
        onConfirmed={handleEmailConfirmed}
      />
    </div>
  );
}
