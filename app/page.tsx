import { Link } from "@heroui/link";
import { button as buttonStyles } from "@heroui/theme";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";

export default function Home() {
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
      </div>
    </section>
  );
}
