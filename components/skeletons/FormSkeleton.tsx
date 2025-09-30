"use client";

import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody, CardHeader } from "@heroui/card";

interface FormSkeletonProps {
  className?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  fieldCount?: number;
  showSocialButtons?: boolean;
  showFooter?: boolean;
}

export const FormSkeleton: React.FC<FormSkeletonProps> = ({
  className = "",
  showTitle = true,
  showSubtitle = true,
  fieldCount = 3,
  showSocialButtons = true,
  showFooter = true,
}) => {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="flex flex-col gap-1 pb-0 px-4 sm:px-6 pt-4 sm:pt-6">
        {showTitle && <Skeleton className="h-8 w-32 mx-auto rounded-lg" />}
        {showSubtitle && <Skeleton className="h-4 w-48 mx-auto rounded" />}
      </CardHeader>
      <CardBody className="gap-4 py-4 sm:py-6 px-4 sm:px-6">
        <div className="space-y-4">
          {Array.from({ length: fieldCount }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}

          {showSocialButtons && (
            <>
              <div className="flex items-center gap-4 my-4">
                <Skeleton className="h-px flex-1 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
                <Skeleton className="h-px flex-1 rounded" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            </>
          )}

          <Skeleton className="h-12 w-full rounded-lg" />

          {showFooter && (
            <div className="text-center pt-4">
              <Skeleton className="h-4 w-48 mx-auto rounded" />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export const SignInFormSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <FormSkeleton
    className={className}
    fieldCount={2}
    showSocialButtons={true}
    showFooter={true}
  />
);

export const SignUpFormSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <FormSkeleton
    className={className}
    fieldCount={3}
    showSocialButtons={true}
    showFooter={true}
  />
);

export const UsernameFormSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => (
  <FormSkeleton
    className={className}
    fieldCount={1}
    showSocialButtons={false}
    showFooter={false}
  />
);
