"use client";

import { title, subtitle } from "@/components/primitives";

export default function BrowsePage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      <div className="text-center mb-8">
        <h1 className={title({ class: "mb-4" })}>Browse Anime & Manga</h1>
        <p className={subtitle({ class: "max-w-2xl mx-auto" })}>
          Discover and explore thousands of anime, manga, manwha, and manhua
          titles. Find your next favorite series and track your progress.
        </p>
      </div>

      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">Site under development</h2>
          <p className="text-lg text-default-500">Adding this soon</p>
        </div>
      </div>
    </div>
  );
}
