"use client";

import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";

interface ProfileSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  showStats?: boolean;
  showActions?: boolean;
}

export const ProfileSkeleton: React.FC<ProfileSkeletonProps> = ({
  className = "",
  showAvatar = true,
  showStats = true,
  showActions = true,
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
        <Skeleton className="h-8 w-32 mx-auto rounded-lg" />
      </CardHeader>
      <CardBody className="gap-6 py-6 px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          {showAvatar && <Skeleton className="w-20 h-20 rounded-full" />}
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-32 mx-auto rounded" />
            <Skeleton className="h-4 w-48 mx-auto rounded" />
            <Skeleton className="h-6 w-24 mx-auto rounded-full" />
          </div>
        </div>

        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardBody className="text-center py-6">
                  <Skeleton className="h-8 w-16 mx-auto mb-2 rounded" />
                  <Skeleton className="h-4 w-24 mx-auto rounded" />
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {showActions && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export const UserProfileSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <ProfileSkeleton
    className={className}
    showAvatar={true}
    showStats={true}
    showActions={true}
  />
);

export const ProfilePageSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <div className={`container mx-auto px-4 py-8 ${className}`}>
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-8 w-32 mb-8 rounded-lg" />

      <Card>
        <CardHeader className="flex flex-col items-center gap-4 pb-4">
          <Skeleton className="w-20 h-20 rounded-full" />
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  </div>
);
