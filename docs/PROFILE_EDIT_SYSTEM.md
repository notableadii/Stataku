# Profile Edit System Documentation

## Overview

A beautiful and sophisticated profile editing system that allows users to customize their profile with display name, bio, and avatar. The design is clean and modern without using card containers, following a more open and airy layout.

## Features

### 1. **Profile Editing**

- **Display Name**: Up to 50 characters
- **Bio**: Up to 500 characters with multi-line support
- **Avatar URL**: Custom profile picture via URL
- Real-time character count
- Form validation
- Auto-save detection (Save button only enabled when changes are made)

### 2. **Beautiful UI Design**

- No card containers - open, modern layout
- Large, prominent avatar with hover effect
- Clear section separation with dividers
- Responsive design for all screen sizes
- Smooth transitions and animations
- Theme-aware (light/dark mode support)

### 3. **User Experience**

- Loading states with skeletons
- Success/error messages with auto-dismiss
- Real-time profile updates
- Character limit indicators
- Cancel and Save actions
- Profile URL preview
- **Edit Profile Button**: Displayed on user's own profile page
  - Only visible when viewing your own profile
  - Hidden when viewing other users' profiles
  - Hidden when not logged in
  - Beautiful button with pencil icon
  - Positioned on the right side of the profile card

## File Structure

```
app/
├── profile/
│   └── page.tsx                    # Profile edit page
├── [username]/
│   └── page.tsx                    # Profile view page (updated with bio)
└── api/
    ├── update-profile/
    │   └── route.ts                # Profile update endpoint
    ├── get-profile/
    │   └── route.ts                # Get user profile (updated)
    ├── get-profile-by-slug/
    │   └── route.ts                # Get profile by username (updated)
    └── init-db/
        └── route.ts                # Database initialization (updated)

lib/
└── turso.ts                        # Updated UserProfile interface

docs/
└── PROFILE_EDIT_SYSTEM.md         # This file
```

## Database Schema

### Updated `profiles` Table

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,                         -- New field
  avatar_url TEXT,                  -- New field
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE UNIQUE INDEX idx_profiles_slug_unique ON profiles(slug);
```

### UserProfile Interface

```typescript
export interface UserProfile {
  id: string;
  username: string;
  slug: string;
  display_name?: string;
  bio?: string; // New field
  avatar_url?: string; // New field
  created_at: string;
}
```

## API Endpoints

### POST `/api/update-profile`

Updates user profile information.

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "display_name": "John Doe",
  "bio": "Software developer and coffee enthusiast",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user-id",
    "username": "johndoe",
    "slug": "johndoe",
    "display_name": "John Doe",
    "bio": "Software developer and coffee enthusiast",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-09-29T20:03:00Z"
  }
}
```

**Validation:**

- `display_name`: Max 50 characters
- `bio`: Max 500 characters
- `avatar_url`: Must be a valid string
- All fields are optional
- Empty strings are converted to `null`

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "No authorization header"
}

// 400 Bad Request
{
  "error": "Bio must be 500 characters or less"
}

// 500 Internal Server Error
{
  "error": "Failed to update profile"
}
```

## UI Components Used

### HeroUI Components

- `Avatar` - Large profile picture with hover effect
- `Input` - Text input for display name and avatar URL
- `Textarea` - Multi-line bio input
- `Button` - Save and Cancel actions
- `Divider` - Section separators

### Layout Structure

```
┌─────────────────────────────────────┐
│  Edit Profile Header                │
│  ├─ Title                           │
│  └─ Subtitle                        │
├─────────────────────────────────────┤
│  Avatar Section                     │
│  ├─ Large avatar with hover         │
│  ├─ Username                        │
│  └─ Member since                    │
├─────────────────────────────────────┤
│  Form Fields                        │
│  ├─ Display Name Input              │
│  ├─ Bio Textarea                    │
│  └─ Avatar URL Input                │
├─────────────────────────────────────┤
│  Success/Error Message (if any)     │
├─────────────────────────────────────┤
│  Actions                            │
│  ├─ Cancel Button                   │
│  └─ Save Button                     │
├─────────────────────────────────────┤
│  Footer                             │
│  └─ Profile URL Link                │
└─────────────────────────────────────┘
```

## Usage

### Accessing Profile Edit Page

Users can access their profile edit page at:

```
/profile
```

### Viewing Public Profiles

Public profiles (including bio) can be viewed at:

```
/[username]
```

### Editing Profile

1. Navigate to `/profile`
2. Edit display name, bio, or avatar URL
3. Click "Save Changes"
4. Profile updates automatically
5. Success message appears
6. Changes are reflected immediately

### Authentication

- Users must be logged in to edit their profile
- Authentication is handled via Supabase JWT tokens
- Unauthorized users are redirected to `/signin`

## Features in Detail

### 1. Avatar Upload

Currently supports URL-based avatars. Users can:

- Enter any valid image URL
- See preview in real-time
- Hover over avatar for visual feedback

**Future Enhancement:** Direct file upload to cloud storage (Supabase Storage, Cloudinary, etc.)

### 2. Bio Field

- Multi-line text support
- 500 character limit
- Real-time character count
- Auto-growing textarea (4-8 rows)
- Displayed on public profile pages

### 3. Display Name

- 50 character limit
- Real-time character count
- Displayed prominently on profile
- Falls back to username if not set

### 4. Form Validation

- Client-side validation
- Server-side validation
- Character limits enforced
- Type checking
- Empty string to null conversion

### 5. State Management

- Detects unsaved changes
- Disables save button when no changes
- Loading states during save
- Auto-refresh after successful update
- Success message auto-dismisses after 3 seconds

## Styling

### Design Principles

1. **No Cards**: Clean, open layout without card containers
2. **Hierarchy**: Clear visual hierarchy with typography
3. **Spacing**: Generous whitespace for better readability
4. **Responsiveness**: Works on all screen sizes
5. **Accessibility**: Proper labels and descriptions

### Color Scheme

- Uses HeroUI's theme tokens
- Adapts to light/dark mode
- Success messages: Green tones
- Error messages: Red tones
- Default text: Theme foreground

### Typography

- **Header**: 4xl font-bold
- **Labels**: Small font-medium
- **Input text**: Base size
- **Descriptions**: Extra-small text-default-400
- **Character count**: Extra-small text-default-400

## Error Handling

### Client-Side Errors

- Network errors
- Session expiration
- Validation errors
- Display in error message box

### Server-Side Errors

- Database connection issues
- Authorization failures
- Validation failures
- Returned with appropriate HTTP status codes

## Security

### Authentication

- JWT token verification on server
- Token sent in Authorization header
- User ID extracted from verified token
- No user can edit another user's profile

### Input Validation

- Server-side validation for all inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (React's built-in escaping)
- Character limits enforced

### Data Sanitization

- Trim whitespace
- Convert empty strings to null
- Type checking
- Length validation

## Performance

### Optimizations

1. **Efficient Updates**: Only update changed fields
2. **Indexed Queries**: Database queries use indexes
3. **Minimal Re-renders**: React state management
4. **Lazy Loading**: Components load on demand
5. **Auto-dismiss**: Messages clear automatically

### Database Indexes

```sql
-- Username lookups (availability checks)
CREATE INDEX idx_profiles_username ON profiles(username);

-- Slug lookups (profile page access)
CREATE UNIQUE INDEX idx_profiles_slug_unique ON profiles(slug);
```

## Testing

### Manual Testing Checklist

- [ ] Load profile edit page
- [ ] Edit display name
- [ ] Edit bio with multi-line text
- [ ] Add/change avatar URL
- [ ] Save changes
- [ ] Verify success message
- [ ] Check profile view page shows updates
- [ ] Test character limits (50 for name, 500 for bio)
- [ ] Test with empty fields
- [ ] Test with very long URLs
- [ ] Test cancel button
- [ ] Test without changes (save button disabled)
- [ ] Test on mobile devices
- [ ] Test in light and dark mode

### Edge Cases

- Very long display names (50+ chars)
- Very long bios (500+ chars)
- Invalid avatar URLs
- Empty fields
- Special characters
- Unicode characters
- Session expiration during edit
- Network failures during save

## Future Enhancements

### Planned Features

1. **Direct File Upload**: Upload avatars directly instead of URLs
2. **Image Cropping**: Built-in avatar cropper
3. **Social Links**: Add links to social media profiles
4. **Profile Themes**: Customizable profile colors
5. **Privacy Settings**: Control profile visibility
6. **Cover Photo**: Add banner/cover image
7. **Rich Text Bio**: Markdown or rich text support
8. **Profile Verification**: Verified badge system
9. **Profile Analytics**: View profile statistics
10. **Custom URLs**: Vanity URLs beyond username

### Technical Improvements

1. **Real-time Sync**: WebSocket for instant updates
2. **Image Optimization**: Automatic image compression
3. **CDN Integration**: Fast avatar delivery
4. **Undo/Redo**: Change history
5. **Auto-save**: Periodic automatic saves
6. **Conflict Resolution**: Handle concurrent edits
7. **Audit Log**: Track profile changes
8. **Rate Limiting**: Prevent abuse

## Troubleshooting

### Common Issues

**Issue**: Save button stays disabled

- **Solution**: Make a change to enable it

**Issue**: Avatar doesn't appear

- **Solution**: Check if URL is valid and accessible

**Issue**: "No session found" error

- **Solution**: Log out and log back in

**Issue**: Character count not updating

- **Solution**: Refresh the page

**Issue**: Changes not reflected on profile page

- **Solution**: Hard refresh (Ctrl+Shift+R)

### Debug Steps

1. Open browser console
2. Check for errors
3. Verify session is valid
4. Check network requests
5. Verify API responses
6. Check database state

## Support

For issues or questions:

1. Check this documentation
2. Review error messages
3. Check browser console
4. Verify authentication status
5. Contact support if needed

---

**Last Updated**: September 29, 2025
**Version**: 1.0.0
