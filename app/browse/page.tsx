"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { title, subtitle } from "@/components/primitives";
import { BrowsePageSkeleton } from "@/components/skeletons";

interface Anime {
  title: string;
  rating: number;
  genre: string;
  status: string;
}

export default function BrowsePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [sampleAnime, setSampleAnime] = useState<Anime[]>([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setSampleAnime([
        {
          title: "Attack on Titan",
          rating: 9.2,
          genre: "Action",
          status: "Completed",
        },
        {
          title: "Demon Slayer",
          rating: 8.8,
          genre: "Action",
          status: "Ongoing",
        },
        {
          title: "One Piece",
          rating: 9.5,
          genre: "Adventure",
          status: "Ongoing",
        },
        { title: "Naruto", rating: 8.7, genre: "Action", status: "Completed" },
        {
          title: "Death Note",
          rating: 9.0,
          genre: "Thriller",
          status: "Completed",
        },
      ]);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <BrowsePageSkeleton />;
  }

  return (
    <div className="container mx-auto max-w-7xl px-6 py-8">
      <div className="text-center mb-8">
        <h1 className={title({ class: "mb-4" })}>Browse Anime & Manga</h1>
        <p className={subtitle({ class: "max-w-2xl mx-auto" })}>
          Discover and explore thousands of anime, manga, manwha, and manhua
          titles. Find your next favorite series and track your progress.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <Chip color="primary" variant="flat">
          All
        </Chip>
        <Chip color="default" variant="flat">
          Action
        </Chip>
        <Chip color="default" variant="flat">
          Romance
        </Chip>
        <Chip color="default" variant="flat">
          Comedy
        </Chip>
        <Chip color="default" variant="flat">
          Drama
        </Chip>
        <Chip color="default" variant="flat">
          Thriller
        </Chip>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleAnime.map((anime, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start w-full">
                <h3 className="text-lg font-semibold">{anime.title}</h3>
                <Chip
                  color={anime.status === "Completed" ? "success" : "warning"}
                  size="sm"
                >
                  {anime.status}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-default-500">{anime.genre}</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{anime.rating}</span>
                </div>
              </div>
              <Button
                color="primary"
                variant="flat"
                size="sm"
                className="w-full"
              >
                View Details
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button color="primary" variant="bordered" size="lg">
          Load More
        </Button>
      </div>
    </div>
  );
}
