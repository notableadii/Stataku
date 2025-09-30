"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { title, subtitle } from "@/components/primitives";
import { DiscoveryPageSkeleton } from "@/components/skeletons";

interface TrendingContent {
  title: string;
  rating: number;
  genre: string;
  popularity: number;
  type: string;
}

interface Recommendation {
  title: string;
  reason: string;
  match: number;
}

export default function DiscoveryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [trendingContent, setTrendingContent] = useState<TrendingContent[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setTrendingContent([
        {
          title: "Jujutsu Kaisen",
          rating: 9.1,
          genre: "Supernatural",
          popularity: 95,
          type: "Anime",
        },
        {
          title: "Solo Leveling",
          rating: 9.3,
          genre: "Action",
          popularity: 98,
          type: "Manwha",
        },
        {
          title: "Spy x Family",
          rating: 8.9,
          genre: "Comedy",
          popularity: 92,
          type: "Manga",
        },
        {
          title: "Tower of God",
          rating: 8.7,
          genre: "Fantasy",
          popularity: 89,
          type: "Manwha",
        },
      ]);

      setRecommendations([
        {
          title: "Chainsaw Man",
          reason: "Based on your love for action anime",
          match: 95,
        },
        {
          title: "Tokyo Ghoul",
          reason: "Similar to your thriller preferences",
          match: 88,
        },
        {
          title: "My Hero Academia",
          reason: "Popular among users with similar taste",
          match: 92,
        },
      ]);
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DiscoveryPageSkeleton />;
  }

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

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🔥 Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingContent.map((content, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start w-full">
                  <h3 className="text-lg font-semibold">{content.title}</h3>
                  <Chip color="primary" size="sm">
                    {content.type}
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-default-500">
                      {content.genre}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-semibold">{content.rating}</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Popularity</span>
                      <span>{content.popularity}%</span>
                    </div>
                    <Progress
                      value={content.popularity}
                      color="primary"
                      size="sm"
                    />
                  </div>
                </div>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="w-full"
                >
                  Explore
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">🎯 Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendations.map((rec, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <h3 className="text-lg font-semibold">{rec.title}</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-sm text-default-600 mb-3">{rec.reason}</p>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Match</span>
                    <span>{rec.match}%</span>
                  </div>
                  <Progress value={rec.match} color="success" size="sm" />
                </div>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  className="w-full"
                >
                  Add to List
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button color="primary" variant="bordered" size="lg">
          Refresh Recommendations
        </Button>
      </div>
    </div>
  );
}
