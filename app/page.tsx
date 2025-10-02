"use client";

import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";
import { addToast } from "@heroui/toast";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
// Animation imports removed - using simple hover effects only

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get("error");

    if (error) {
      switch (error) {
        case "account-already-linked":
          addToast({
            title: "Account Already Linked",
            description:
              "This Google or Discord account is already linked to another account. Please unlink it first before linking to this account.",
            severity: "danger",
            timeout: 8000,
          });
          break;
        case "oauth-invalid-state":
          addToast({
            title: "Authentication Error",
            description: "OAuth flow failed. Please try again.",
            severity: "danger",
            timeout: 5000,
          });
          break;
        case "oauth-cancelled":
          addToast({
            title: "Linking Cancelled",
            description: "Account linking was cancelled.",
            severity: "warning",
            timeout: 5000,
          });
          break;
        case "email-not-confirmed":
          addToast({
            title: "Email Not Confirmed",
            description: "Please confirm your email before linking accounts.",
            severity: "danger",
            timeout: 5000,
          });
          break;
        case "link-failed":
          addToast({
            title: "Linking Failed",
            description: "Failed to link account. Please try again.",
            severity: "danger",
            timeout: 5000,
          });
          break;
        default:
          addToast({
            title: "Error",
            description: "An error occurred during account linking.",
            severity: "danger",
            timeout: 5000,
          });
      }
      // Clean up URL parameters
      const url = new URL(window.location.href);

      url.searchParams.delete("error");
      router.replace(url.pathname);
    }
  }, [searchParams, router]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-full md:max-w-6xl px-0 md:px-4 text-center">
        <h1
          className={title({
            class: "leading-tight w-full text-2xl md:text-4xl lg:text-5xl",
          })}
        >
          Track, Vote and Share{" "}
          <span
            className={title({
              color: "violet",
              class: "text-2xl md:text-4xl lg:text-5xl",
            })}
          >
            beautiful Rating Cards
          </span>{" "}
          for your Favourite Anime, manga, manwha and manhua
        </h1>
        <div
          className={subtitle({
            class:
              "mt-6 w-full md:!w-1/2 md:max-w-4xl md:mx-auto text-sm md:text-lg lg:text-xl",
          })}
        >
          Discover, rate, and share your thoughts on anime, manga, manwha, and
          manhua with our beautiful rating system and community features.
        </div>
      </div>

      <div className="flex gap-3">
        <motion.div
          transition={{ duration: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            className={buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
              size: "lg",
            })}
            href={siteConfig.links.signup}
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
