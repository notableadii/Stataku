"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";
import { title, subtitle } from "@/components/primitives";
import { GoogleIcon, DiscordIcon } from "@/components/icons";
import { signUp, signInWithGoogle, signInWithDiscord } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import NextLink from "next/link";
import { SignUpFormSkeleton } from "@/components/skeletons";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState("");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const router = useRouter();
  const { user, profile } = useAuth();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!acceptTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setShowSkeleton(true);
    setError("");

    try {
      const { data, error } = await signUp(email, password);

      if (error) {
        setError(error.message);
        setIsLoading(false);
        setShowSkeleton(false);
        return;
      }

      if (data.user) {
        // Always redirect to username creation for new signups
        router.push("/create-username");
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
              Join Stataku
            </h1>
            <p className={subtitle({ class: "text-sm sm:text-base" })}>
              Create your account and start tracking your favorite anime and
              manga
            </p>
          </div>
          <SignUpFormSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-background -mt-10 sm:pt-3 md:pt-4 lg:pt-6 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4 sm:space-y-6">
        <div className="text-center">
          <h1 className={title({ class: "mb-2 text-2xl sm:text-3xl" })}>
            Join Stataku
          </h1>
          <p className={subtitle({ class: "text-sm sm:text-base" })}>
            Create your account and start tracking your favorite anime and manga
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center">
              Sign Up
            </h2>
            <p className="text-small text-default-500 text-center">
              Fill in your details to create your account
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
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-default-200",
                }}
              />
              <Input
                type="password"
                label="Password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isRequired
                variant="bordered"
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-default-200",
                }}
              />
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isRequired
                variant="bordered"
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                classNames={{
                  input: "text-sm",
                  inputWrapper: "border-default-200",
                }}
              />

              <div className="space-y-2">
                <Checkbox
                  isSelected={acceptTerms}
                  onValueChange={setAcceptTerms}
                  isInvalid={!!errors.terms}
                >
                  <span className="text-sm">
                    I agree to the{" "}
                    <Link color="primary" href="/terms" size="sm">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link color="primary" href="/privacy" size="sm">
                      Privacy Policy
                    </Link>
                  </span>
                </Checkbox>
                {errors.terms && (
                  <p className="text-danger text-tiny">{errors.terms}</p>
                )}
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
                {isLoading ? "Creating account..." : "Create Account"}
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
                Already have an account?{" "}
                <Link
                  as={NextLink}
                  href="/signin"
                  color="primary"
                  className="font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
