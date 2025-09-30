# Responsive Profile Page Documentation

## Overview

The custom slug profile page (`/[username]`) has been fully optimized for mobile, tablet (iPad mini), and desktop devices with beautiful responsive design that adapts seamlessly across all screen sizes.

## Responsive Breakpoints

We use Tailwind CSS's standard breakpoints:

- **Mobile**: `< 640px` (base styles)
- **Tablet/iPad**: `sm: ≥ 640px` and `md: ≥ 768px`
- **Desktop**: `lg: ≥ 1024px`

## Detailed Responsive Changes

### 1. **Main Container**

**Vertical Padding:**

- Mobile: `py-4` (16px)
- Tablet: `py-6` (24px)
- Desktop: `py-8` (32px)

**Purpose**: Reduces wasted space on mobile while maintaining generous spacing on larger screens.

### 2. **Profile Card**

**Card Padding:**

- Mobile: `p-4` (16px)
- Tablet: `p-6` (24px)
- Desktop: `p-8` (32px)

**Card Spacing (between cards):**

- Mobile: `mb-6` (24px)
- Desktop: `mb-8` (32px)

**Purpose**: Maximizes content area on mobile devices while keeping comfortable spacing on larger screens.

### 3. **Avatar**

**Size:**

- Mobile: `w-20 h-20` (80px × 80px)
- Desktop: `w-24 h-24` (96px × 96px)

**Purpose**: Slightly smaller avatar on mobile saves space and looks more proportional on small screens.

### 4. **Profile Name/Title**

**Font Size:**

- Mobile: `text-2xl` (24px)
- Desktop: `text-3xl` (30px)

**Additional Features:**

- `truncate` class prevents long names from breaking layout
- `min-w-0` on parent allows proper text truncation

**Purpose**: Prevents overly large text on mobile while maintaining impressive size on desktop.

### 5. **Username (@handle)**

**Font Size:**

- Mobile: `text-base` (16px)
- Desktop: `text-lg` (18px)

**Additional Features:**

- `truncate` class for long usernames

**Purpose**: Ensures readability without overwhelming mobile screens.

### 6. **Gap Between Elements**

**Spacing:**

- Mobile: `gap-4` (16px)
- Tablet: `gap-5` (20px)
- Desktop: `gap-6` (24px)

**Applied to**: Avatar, profile info, and edit button container

**Purpose**: Tighter spacing on mobile for better use of limited screen real estate.

### 7. **Edit Profile Button**

**Width:**

- Mobile: `w-full` (100% width)
- Desktop: `w-auto` (auto width)

**Icon Size:**

- Mobile: `w-4 h-4` (16px)
- Desktop: `w-5 h-5` (20px)

**Button Size:**

- All screens: `size="sm"` (small size for better proportions)

**Purpose**: Full-width button on mobile is easier to tap and looks more intentional. Regular width on desktop integrates better with the layout.

### 8. **Bio Text**

**Font Size:**

- Mobile: `text-sm` (14px)
- Desktop: `text-base` (16px)

**Left Margin (alignment):**

- Mobile: `ml-0` (no margin)
- Tablet: `ml-24` (96px)
- Desktop: `ml-[120px]` (120px)

**Spacing:**

- Mobile: `mb-2` (8px)
- Desktop: `mb-3` (12px)

**Purpose**: Bio aligns with the name on larger screens but stays left-aligned on mobile for better readability.

### 9. **Member Since Text**

**Font Size:**

- Mobile: `text-xs` (12px)
- Desktop: `text-sm` (14px)

**Purpose**: Subtle footer-like text that doesn't overwhelm on mobile.

### 10. **Activity Section**

**Header Padding:**

- Mobile: `p-4` (16px)
- Desktop: `p-6` (24px)

**Body Padding:**

- Mobile: `p-4` (16px)
- Tablet: `p-6` (24px)
- Desktop: `p-8` (32px)

**Emoji Size:**

- Mobile: `text-5xl` (48px)
- Desktop: `text-6xl` (60px)

**Vertical Padding (empty state):**

- Mobile: `py-8` (32px)
- Desktop: `py-12` (48px)

**Text Sizes:**

- Title (mobile): `text-base` (16px) → Desktop: `text-lg` (18px)
- Description (mobile): `text-xs` (12px) → Desktop: `text-sm` (14px)

**Purpose**: Proportional scaling of empty state that looks good on all devices.

## Responsive Layout Flow

### Mobile (< 640px)

```
┌────────────────────────────┐
│  Card (p-4)                │
│  ┌──────────────────────┐  │
│  │  🎭 Avatar (80×80)   │  │
│  │                      │  │
│  │  Name (text-2xl)     │  │
│  │  @username (base)    │  │
│  │                      │  │
│  │  [Edit Profile]      │  │ ← Full width
│  │  ──────────────────  │  │
│  │  Bio (text-sm)       │  │
│  │  Member since (xs)   │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

### Tablet/iPad (640px - 1024px)

```
┌────────────────────────────────────────┐
│  Card (p-6)                            │
│  ┌────────────────────────────────┐    │
│  │  🎭 │ Name (text-3xl)   [Edit] │    │
│  │     │ @username (lg)           │    │
│  │  ──────────────────────────────│    │
│  │     │ Bio (text-base)          │    │
│  │     Member since (sm)          │    │
│  └────────────────────────────────┘    │
└────────────────────────────────────────┘
```

### Desktop (> 1024px)

```
┌──────────────────────────────────────────────┐
│  Card (p-8)                                  │
│  ┌──────────────────────────────────────┐    │
│  │  🎭  │ Name (text-3xl)      [Edit]  │    │
│  │      │ @username (lg)               │    │
│  │  ────────────────────────────────── │    │
│  │      │ Bio (text-base, ml-[120px]) │    │
│  │  Member since (sm)                  │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## Key Features

### 1. **Text Truncation**

- Long names and usernames are truncated with ellipsis (`...`)
- Uses `truncate` class for clean overflow handling
- `min-w-0` on parent container enables proper truncation in flex layouts

### 2. **Touch-Friendly**

- Full-width button on mobile (easier to tap)
- Adequate spacing between interactive elements
- Comfortable text sizes for readability

### 3. **Efficient Space Usage**

- Reduced padding on mobile maximizes content area
- Tighter gaps between elements on small screens
- Smaller avatar doesn't overwhelm mobile layout

### 4. **Smooth Transitions**

- Gradual sizing changes across breakpoints
- Three-tier system (mobile → tablet → desktop)
- No jarring jumps in layout or sizing

### 5. **Maintained Hierarchy**

- Visual hierarchy preserved across all screen sizes
- Name always most prominent
- Username and bio properly subordinate
- Member since subtle footer element

## Testing Checklist

### Mobile (< 640px)

- [ ] Avatar is 80×80px
- [ ] Name is text-2xl (24px)
- [ ] Username is text-base (16px)
- [ ] Edit button is full width
- [ ] Bio is text-sm (14px) and not indented
- [ ] Card padding is 16px
- [ ] All text truncates properly
- [ ] Touch targets are adequate

### Tablet/iPad (640px - 768px)

- [ ] Avatar is 96×96px
- [ ] Name is text-3xl (30px)
- [ ] Layout switches to horizontal
- [ ] Edit button is auto width
- [ ] Bio has moderate left margin (96px)
- [ ] Card padding is 24px
- [ ] Everything aligns properly

### Desktop (> 1024px)

- [ ] All elements at maximum size
- [ ] Bio has full left margin (120px)
- [ ] Card padding is 32px
- [ ] Generous spacing throughout
- [ ] Name/username don't truncate unnecessarily
- [ ] Edit button positioned on right

## Device-Specific Optimizations

### iPhone (375px - 428px)

- Optimized for Portrait orientation
- Full-width button for easy thumb access
- Compact but readable text sizes
- Efficient vertical spacing

### iPad Mini (744px - 810px)

- Hybrid layout between mobile and desktop
- Horizontal layout with moderate spacing
- Medium text sizes
- Comfortable padding (24px)

### iPad (820px - 1024px)

- Near-desktop layout
- Larger text and spacing
- Full horizontal layout
- Approaching desktop sizing

### Desktop (> 1024px)

- Maximum sizing and spacing
- Full desktop experience
- Generous whitespace
- Optimal readability

## Performance Considerations

1. **No JavaScript Resizing**: All responsive behavior handled by CSS
2. **Mobile-First**: Base styles target mobile, enhanced for larger screens
3. **Minimal Classes**: Efficient Tailwind class usage
4. **Fast Rendering**: No layout shifts or reflows
5. **Touch Optimization**: Larger tap targets on mobile

## Future Enhancements

- [ ] Add landscape-specific optimizations for mobile
- [ ] Consider extra-large desktop layouts (> 1440px)
- [ ] Add print styles
- [ ] Optimize for foldable devices
- [ ] Add motion preferences for animations

---

**Last Updated**: September 29, 2025
**Version**: 1.0.0
