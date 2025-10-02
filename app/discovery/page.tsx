"use client";

import { title, subtitle } from "@/components/primitives";

export default function DiscoveryPage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      <div className="text-center mb-8">
        <h1 className={title({ class: "mb-4" })}>Discover New Content</h1>
        <p className={subtitle({ class: "max-w-2xl mx-auto" })}>
          Find trending anime, manga, manwha, and manhua. Get personalized
          recommendations based on your preferences and discover your next
          obsession.
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
