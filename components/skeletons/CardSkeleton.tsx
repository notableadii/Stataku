"use client";

import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody, CardHeader } from "@heroui/card";

interface CardSkeletonProps {
  className?: string;
  showImage?: boolean;
  showChips?: boolean;
  showProgress?: boolean;
  showButton?: boolean;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({
  className = "",
  showImage = false,
  showChips = true,
  showProgress = false,
  showButton = true,
}) => {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start w-full">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          {showChips && <Skeleton className="h-6 w-16 rounded-full" />}
        </div>
      </CardHeader>
      <CardBody className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-1/3 rounded" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-8 rounded" />
            </div>
          </div>

          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          )}

          {showButton && <Skeleton className="h-8 w-full rounded-lg" />}
        </div>
      </CardBody>
    </Card>
  );
};

export const AnimeCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => <CardSkeleton className={className} showChips={true} showButton={true} />;

export const RecommendationCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <CardSkeleton
    className={className}
    showChips={false}
    showProgress={true}
    showButton={true}
  />
);

export const StatsCardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <Card className={className}>
    <CardBody className="text-center py-6">
      <Skeleton className="h-8 w-16 mx-auto mb-2 rounded" />
      <Skeleton className="h-4 w-24 mx-auto rounded" />
    </CardBody>
  </Card>
);
