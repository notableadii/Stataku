"use client";

import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody, CardHeader } from "@heroui/card";

interface ListSkeletonProps {
  className?: string;
  itemCount?: number;
  showHeader?: boolean;
  showChips?: boolean;
  showPagination?: boolean;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  className = "",
  itemCount = 6,
  showHeader = true,
  showChips = true,
  showPagination = true,
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {showHeader && (
        <div className="text-center mb-8">
          <Skeleton className="h-8 w-64 mx-auto mb-4 rounded-lg" />
          <Skeleton className="h-4 w-96 mx-auto rounded" />
        </div>
      )}

      {showChips && (
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-16 rounded-full" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: itemCount }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start w-full">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
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
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {showPagination && (
        <div className="text-center mt-8">
          <Skeleton className="h-10 w-32 mx-auto rounded-lg" />
        </div>
      )}
    </div>
  );
};

export const BrowsePageSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={`container mx-auto max-w-7xl px-6 py-8 ${className}`}>
    <ListSkeleton
      itemCount={6}
      showHeader={true}
      showChips={true}
      showPagination={true}
    />
  </div>
);

export const DiscoveryPageSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={`container mx-auto max-w-7xl px-6 py-8 ${className}`}>
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-64 mx-auto mb-4 rounded-lg" />
      <Skeleton className="h-4 w-96 mx-auto rounded" />
    </div>

    <div className="mb-12">
      <Skeleton className="h-8 w-48 mb-6 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start w-full">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-6 w-16 rounded-full" />
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
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>

    <div className="mb-12">
      <Skeleton className="h-8 w-64 mb-6 rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 rounded-lg" />
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <Skeleton className="h-4 w-full rounded" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Skeleton className="h-3 w-12 rounded" />
                    <Skeleton className="h-3 w-8 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>

    <div className="text-center">
      <Skeleton className="h-10 w-48 mx-auto rounded-lg" />
    </div>
  </div>
);
