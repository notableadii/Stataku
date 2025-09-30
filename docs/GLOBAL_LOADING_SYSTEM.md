# Global Loading System

## Overview

The global loading system provides a consistent loading experience across the entire Stataku application. It shows a branded loading screen with the "Stataku" text and a white spinner whenever the application is initializing or loading.

## Components

### 1. GlobalLoadingContext (`contexts/GlobalLoadingContext.tsx`)

A React context that manages the global loading state:

- `isInitialLoading`: Boolean indicating if the app is in initial loading state
- `isAppReady`: Boolean indicating if the app is ready for user interaction
- `setInitialLoading(loading)`: Function to manually trigger loading state
- `setAppReady(ready)`: Function to set app ready state

### 2. GlobalLoadingSpinner (`components/GlobalLoadingSpinner.tsx`)

The visual loading component that displays:

- "Stataku" text (no animation)
- Properly spinning HeroUI spinner with theme-aware colors
- Black or white background based on theme
- Smooth fade-in/fade-out transitions

### 3. GlobalLoadingWrapper (`components/GlobalLoadingWrapper.tsx`)

A wrapper component that:

- Consumes the global loading context
- Conditionally renders the loading spinner
- Wraps the main application content

## Usage

### Automatic Loading

The global loading system automatically activates:

1. **Initial Page Load**: When the application first loads
2. **Page Refresh**: When any page is refreshed (F5, Ctrl+R)
3. **Navigation**: When navigating between pages (with proper state management)

### Manual Loading

You can manually trigger the loading state:

```tsx
import { useGlobalLoading } from "@/contexts/GlobalLoadingContext";

function MyComponent() {
  const { setInitialLoading } = useGlobalLoading();

  const handleAction = async () => {
    setInitialLoading(true);
    // Perform some async operation
    await someAsyncOperation();
    setInitialLoading(false);
  };
}
```

## Configuration

### Loading Duration

The default loading duration is approximately 2 seconds, simulating:

- Database initialization (800ms)
- Authentication check (600ms)
- Theme loading (400ms)
- Component hydration (200ms)

### Visual Customization

The loading spinner can be customized by modifying:

- Theme-aware background colors (black/white) in `GlobalLoadingSpinner.tsx`
- Text styling and animations
- Spinner size and color (automatically adapts to theme)
- Transition durations

## Testing

### Test Page

Visit `/test-global-loading` to:

- View current loading state
- Manually trigger loading
- Test navigation between pages
- Switch between light/dark themes
- Verify theme-aware loading behavior

Visit `/test-theme-loading` to:

- Test theme detection on different page types
- Switch between light/dark/system themes
- Test loading screen on routed pages, 404 pages, and custom slugs
- View debug console logs for theme detection

Visit `/test-profile` to:

- Test profile page navigation with different usernames
- Verify error handling for non-existent profiles
- Test 404 page behavior for invalid profiles
- Check console logs for profile data debugging

### Manual Testing

1. **Initial Load**: Visit any page to see the loading screen
2. **Page Refresh**: Refresh any page (F5) to see loading
3. **Navigation**: Use the test page navigation buttons
4. **Manual Trigger**: Use the "Trigger Loading" button
5. **Theme Testing**: Switch themes and trigger loading to see color changes

## Integration

The global loading system is integrated into the root layout (`app/layout.tsx`) and wraps all application content. It works alongside existing loading states without conflicts.

### Profile Loading Removal

The individual profile loading screen has been removed from the profile page (`app/[username]/page.tsx`) to provide a cleaner user experience. Profile loading is now handled by the global loading system.

### Profile Page Error Handling

The profile page now includes robust error handling:

- **Null Safety**: Added proper null checks to prevent "Cannot read properties of null" errors
- **Data Validation**: Validates profile data before rendering to ensure it has required fields
- **Graceful Fallbacks**: Shows appropriate fallback values when data is missing
- **404 Handling**: Properly triggers 404 page for non-existent profiles
- **Debug Logging**: Includes console logging for troubleshooting profile data issues

### 404 Page Centering

The 404 page has been fixed to display perfectly centered:

- **Perfect Centering**: Uses `fixed inset-0` to center the card both horizontally and vertically
- **Viewport Coverage**: Takes up the entire viewport, ignoring layout constraints
- **Theme Integration**: Maintains proper background color based on current theme
- **Responsive Design**: Includes proper margins for mobile devices
- **Z-Index Management**: Ensures the 404 page appears above other content

### Spinner Animation

The HeroUI Spinner component is properly configured to spin automatically. The spinner uses theme-aware colors (white for dark theme, black for light theme) and should display smooth rotation animation.

### Theme Detection

The loading screen uses robust theme detection that works across all page types:

- **Primary**: Uses `resolvedTheme` from next-themes for accurate theme detection
- **Fallback**: Falls back to `theme` if `resolvedTheme` is not available
- **System Detection**: Detects system preference when theme is set to "system"
- **Hydration Safe**: Prevents hydration mismatches by waiting for component mount
- **Debug Logging**: Includes development console logging for troubleshooting

This ensures the loading screen displays the correct colors (black for dark theme, white for light theme) on all page types including routed pages, 404 pages, and custom profile slugs.

## Best Practices

1. **Don't Override**: Avoid setting `isInitialLoading` to `false` manually unless necessary
2. **Use for Long Operations**: Only use manual loading for operations longer than 1 second
3. **Test Thoroughly**: Always test loading states across different pages and scenarios
4. **Performance**: The loading system is optimized to not impact app performance

## Troubleshooting

### Loading Not Showing

- Check if `GlobalLoadingProvider` is properly wrapped around your app
- Verify the context is being consumed correctly
- Check for any JavaScript errors in the console

### Loading Stuck

- The loading state automatically resets on page refresh
- Use the test page to manually trigger loading state changes
- Check the browser console for any errors

### Performance Issues

- The loading system uses minimal resources
- Loading duration can be adjusted in the context file
- Animations are CSS-based for optimal performance
