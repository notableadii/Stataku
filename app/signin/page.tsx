"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { title, subtitle } from "@/components/primitives";
import { GoogleIcon, DiscordIcon } from "@/components/icons";
import { signIn, signInWithGoogle, signInWithDiscord } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import NextLink from "next/link";
import { SignInFormSkeleton } from "@/components/skeletons";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const router = useRouter();
  const { user, profile } = useAuth();

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
        // Check if user has a profile (username)
        if (profile) {
          router.push("/dashboard");
        } else {
          router.push("/create-username");
        }
      }
    } catch (err) {
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
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const handleDiscordSignIn = async () => {
    try {
      const { error } = await signInWithDiscord();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-default-200",
                }}
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                variant="bordered"
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-default-200",
                }}
              />
              <div className="flex justify-end">
                <Link
                  color="primary"
                  href="/forgot-password"
                  size="sm"
                  className="text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
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
              <Button
                variant="bordered"
                size="lg"
                className="w-full"
                startContent={<GoogleIcon size={20} />}
                onPress={handleGoogleSignIn}
              >
                Continue with Google
              </Button>
              <Button
                variant="bordered"
                size="lg"
                className="w-full"
                startContent={<DiscordIcon size={20} />}
                onPress={handleDiscordSignIn}
              >
                Continue with Discord
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-default-500">
                Don&apos;t have an account?{" "}
                <Link
                  as={NextLink}
                  href="/signup"
                  color="primary"
                  className="font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
