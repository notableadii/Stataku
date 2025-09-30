# Skeleton Loading Implementation Guide

This document provides a comprehensive guide for implementing skeleton loading throughout the application using HeroUI components.

## Overview

Skeleton loading provides visual feedback to users while content is being loaded, improving perceived performance and user experience. Our implementation uses HeroUI's `Skeleton` component with custom reusable skeleton patterns.

## Available Skeleton Components

### Card Skeletons

Located in `components/skeletons/CardSkeleton.tsx`

#### `CardSkeleton`

Basic card skeleton with customizable elements.

```tsx
import { CardSkeleton } from "@/components/skeletons";

<CardSkeleton
  className="mb-4"
  showImage={false}
  showChips={true}
  showProgress={false}
  showButton={true}
/>;
```

#### `AnimeCardSkeleton`

Pre-configured for anime/manga cards.

```tsx
import { AnimeCardSkeleton } from "@/components/skeletons";

<AnimeCardSkeleton className="mb-4" />;
```

#### `RecommendationCardSkeleton`

Pre-configured for recommendation cards with progress bars.

```tsx
import { RecommendationCardSkeleton } from "@/components/skeletons";

<RecommendationCardSkeleton className="mb-4" />;
```

#### `StatsCardSkeleton`

Pre-configured for statistics cards.

```tsx
import { StatsCardSkeleton } from "@/components/skeletons";

<StatsCardSkeleton className="mb-4" />;
```

### Form Skeletons

Located in `components/skeletons/FormSkeleton.tsx`

#### `FormSkeleton`

Basic form skeleton with customizable fields.

```tsx
import { FormSkeleton } from "@/components/skeletons";

<FormSkeleton
  className="w-full"
  showTitle={true}
  showSubtitle={true}
  fieldCount={3}
  showSocialButtons={true}
  showFooter={true}
/>;
```

#### `SignInFormSkeleton`

Pre-configured for sign-in forms.

```tsx
import { SignInFormSkeleton } from "@/components/skeletons";

<SignInFormSkeleton className="w-full" />;
```

#### `SignUpFormSkeleton`

Pre-configured for sign-up forms.

```tsx
import { SignUpFormSkeleton } from "@/components/skeletons";

<SignUpFormSkeleton className="w-full" />;
```

#### `UsernameFormSkeleton`

Pre-configured for username creation forms.

```tsx
import { UsernameFormSkeleton } from "@/components/skeletons";

<UsernameFormSkeleton className="w-full" />;
```

### Profile Skeletons

Located in `components/skeletons/ProfileSkeleton.tsx`

#### `ProfileSkeleton`

Basic profile skeleton with customizable sections.

```tsx
import { ProfileSkeleton } from "@/components/skeletons";

<ProfileSkeleton
  className="w-full"
  showAvatar={true}
  showStats={true}
  showActions={true}
/>;
```

#### `UserProfileSkeleton`

Pre-configured for user profile sections.

```tsx
import { UserProfileSkeleton } from "@/components/skeletons";

<UserProfileSkeleton className="w-full" />;
```

#### `ProfilePageSkeleton`

Pre-configured for entire profile pages.

```tsx
import { ProfilePageSkeleton } from "@/components/skeletons";

<ProfilePageSkeleton className="w-full" />;
```

### List Skeletons

Located in `components/skeletons/ListSkeleton.tsx`

#### `ListSkeleton`

Basic list skeleton with customizable items.

```tsx
import { ListSkeleton } from "@/components/skeletons";

<ListSkeleton
  className="space-y-6"
  itemCount={6}
  showHeader={true}
  showChips={true}
  showPagination={true}
/>;
```

#### `BrowsePageSkeleton`

Pre-configured for browse pages.

```tsx
import { BrowsePageSkeleton } from "@/components/skeletons";

<BrowsePageSkeleton className="w-full" />;
```

#### `DiscoveryPageSkeleton`

Pre-configured for discovery pages.

```tsx
import { DiscoveryPageSkeleton } from "@/components/skeletons";

<DiscoveryPageSkeleton className="w-full" />;
```

## Implementation Patterns

### 1. Page-Level Loading

For entire pages that need loading states:

```tsx
"use client";

import { useState, useEffect } from "react";
import { BrowsePageSkeleton } from "@/components/skeletons";

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <BrowsePageSkeleton />;
  }

  return <div>{/* Your actual content */}</div>;
}
```

### 2. Component-Level Loading

For individual components that need loading states:

```tsx
import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody, CardHeader } from "@heroui/card";

export function MyComponent({ isLoading, data }) {
  return (
    <Card>
      <CardHeader>
        {isLoading ? (
          <Skeleton className="h-6 w-3/4 rounded-lg" />
        ) : (
          <h3>{data.title}</h3>
        )}
      </CardHeader>
      <CardBody>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
        ) : (
          <div>{data.content}</div>
        )}
      </CardBody>
    </Card>
  );
}
```

### 3. Form Loading States

For forms that need loading states during submission:

```tsx
"use client";

import { useState } from "react";
import { SignInFormSkeleton } from "@/components/skeletons";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSkeleton(true);

    try {
      // Your API call
      await signIn(email, password);
    } catch (error) {
      setIsLoading(false);
      setShowSkeleton(false);
    }
  };

  if (showSkeleton) {
    return <SignInFormSkeleton />;
  }

  return <form onSubmit={handleSubmit}>{/* Your form content */}</form>;
}
```

## Best Practices

### 1. Consistent Timing

- Use consistent loading times across similar components
- Consider using different timings for different types of content (forms: 1-2s, data: 2-3s)

### 2. Skeleton Shape Matching

- Ensure skeleton shapes closely match the actual content
- Use appropriate widths and heights for different elements

### 3. Responsive Design

- Make sure skeleton components work well on all screen sizes
- Test on mobile, tablet, and desktop

### 4. Accessibility

- Skeleton components should not interfere with screen readers
- Use appropriate ARIA labels when needed

### 5. Performance

- Don't overuse skeleton loading for very fast operations
- Consider using skeleton loading for operations that take more than 500ms

## Customization

### Creating Custom Skeletons

If you need a custom skeleton that doesn't fit existing patterns:

```tsx
import { Skeleton } from "@heroui/skeleton";
import { Card, CardBody, CardHeader } from "@heroui/card";

export function CustomSkeleton({ className = "" }) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 rounded-lg" />
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
```

### Styling Skeletons

You can customize skeleton appearance using Tailwind classes:

```tsx
<Skeleton className="h-6 w-3/4 rounded-lg bg-gradient-to-r from-gray-200 to-gray-300" />
```

## Testing

### Manual Testing

1. Navigate to each page with skeleton loading
2. Verify skeleton appears during loading
3. Verify content appears after loading completes
4. Test on different screen sizes

### Automated Testing

Consider adding tests for skeleton loading states:

```tsx
import { render, screen } from "@testing-library/react";
import { BrowsePageSkeleton } from "@/components/skeletons";

test("renders skeleton loading state", () => {
  render(<BrowsePageSkeleton />);
  expect(screen.getByTestId("skeleton-container")).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Skeleton not appearing**: Check if `isLoading` state is properly set
2. **Layout shift**: Ensure skeleton dimensions match actual content
3. **Performance issues**: Don't render too many skeleton components at once

### Debug Tips

1. Use browser dev tools to inspect skeleton elements
2. Check console for any errors related to skeleton components
3. Verify HeroUI skeleton package is properly installed

## Future Enhancements

Consider these improvements for future versions:

1. **Animation**: Add subtle animations to skeleton loading
2. **Theming**: Support for different skeleton themes
3. **Accessibility**: Enhanced screen reader support
4. **Performance**: Lazy loading for skeleton components
5. **Customization**: More granular control over skeleton appearance

## Conclusion

This skeleton loading implementation provides a consistent, accessible, and performant way to show loading states throughout the application. By following the patterns and best practices outlined in this guide, you can ensure a great user experience during content loading.
