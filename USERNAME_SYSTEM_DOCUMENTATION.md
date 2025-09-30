# Username Selection System Documentation

## Overview

This document describes the comprehensive username selection system implemented for the Stataku Next.js application using Turso SQL database. The system provides real-time username availability checking with optimized performance through client-side caching, debouncing, and Bloom filter integration.

## Architecture

### Database Schema

The system uses a `profiles` table in Turso with the following schema:

```sql
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,                    -- References auth.users(id) from Supabase
  username TEXT UNIQUE NOT NULL,         -- The unique username
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for optimized username lookups
CREATE INDEX idx_profiles_username ON profiles(username);
```

### API Routes

#### 1. `/api/check-username` (POST)

**Purpose**: Check if a username is available in real-time.

**Request Body**:

```json
{
  "username": "string"
}
```

**Response**:

```json
{
  "available": boolean,
  "username": "string"
}
```

**Features**:

- Rate limiting: 30 requests per minute per IP
- Minimum username length validation (3+ characters)
- Optimized query using `SELECT 1 FROM profiles WHERE username = ? LIMIT 1`
- Automatic cleanup of expired rate limit entries

#### 2. `/api/create-username` (POST)

**Purpose**: Create a new username atomically.

**Request Body**:

```json
{
  "userId": "string",
  "username": "string"
}
```

**Response**:

```json
{
  "success": boolean,
  "username": "string",
  "message": "string"
}
```

**Features**:

- Atomic insert with conflict handling using `ON CONFLICT(username) DO NOTHING`
- Race condition protection
- Minimum username length validation
- Proper error handling for foreign key constraints

#### 3. `/api/get-profile` (POST)

**Purpose**: Retrieve user profile information.

**Request Body**:

```json
{
  "userId": "string"
}
```

**Response**:

```json
{
  "data": {
    "id": "string",
    "username": "string",
    "created_at": "string"
  },
  "error": null
}
```

### Frontend Components

#### 1. Bloom Filter (`lib/bloom-filter.ts`)

**Purpose**: Probabilistic data structure for efficient "might exist" checks.

**Features**:

- Configurable size and hash functions
- Add elements to the filter
- Check if element might exist (false positives possible, no false negatives)
- Fill ratio monitoring
- Memory-efficient bit array storage

**Usage**:

```typescript
const bloomFilter = new BloomFilter(1000, 3);
bloomFilter.add("username");
const mightExist = bloomFilter.mightContain("username");
```

#### 2. Username Cache (`lib/username-cache.ts`)

**Purpose**: Client-side caching with Bloom filter integration.

**Features**:

- 400ms debouncing as specified
- Client-side cache with configurable size limit
- Bloom filter integration to minimize API calls
- Automatic cache cleanup
- Statistics monitoring

**Usage**:

```typescript
const usernameChecker = new DebouncedUsernameChecker();
await usernameChecker.checkUsernameAvailability(
  "username",
  (username, available, loading) => {
    // Handle result
  },
);
```

#### 3. UsernameSelector Component (`components/UsernameSelector.tsx`)

**Purpose**: React component for username selection with live feedback.

**Features**:

- Real-time username availability checking
- Visual feedback with color-coded borders and icons
- Loading states and error handling
- Responsive design with HeroUI components
- Avatar generation based on username
- Development mode cache statistics

**Props**:

```typescript
interface UsernameSelectorProps {
  userId: string;
  onUsernameCreated: (username: string) => void;
  onCancel: () => void;
}
```

## Performance Optimizations

### 1. Debouncing

- **Implementation**: 400ms delay before API calls
- **Benefit**: Reduces API calls during rapid typing
- **Location**: `lib/username-cache.ts`

### 2. Client-Side Caching

- **Implementation**: In-memory Map with configurable size limit
- **Benefit**: Avoids repeated API calls for same usernames
- **Location**: `lib/username-cache.ts`

### 3. Bloom Filter

- **Implementation**: Probabilistic membership testing
- **Benefit**: Skips API calls for usernames that definitely don't exist
- **Location**: `lib/bloom-filter.ts`

### 4. Database Optimizations

- **LIMIT 1**: All queries use `LIMIT 1` to minimize read cost
- **Indexed Lookups**: Username column is indexed for fast lookups
- **Prepared Statements**: All queries use prepared statements

### 5. Rate Limiting

- **Implementation**: 30 requests per minute per IP
- **Benefit**: Prevents abuse and excessive database reads
- **Location**: `app/api/check-username/route.ts`

## Security Features

### 1. Input Validation

- Minimum username length (3+ characters)
- Type checking for all inputs
- SQL injection protection through prepared statements

### 2. Rate Limiting

- Per-IP rate limiting on check-username endpoint
- Automatic cleanup of expired entries
- Graceful handling of rate limit exceeded

### 3. Atomic Operations

- Username creation uses atomic inserts
- Race condition protection with `ON CONFLICT`
- Proper error handling for constraint violations

## Error Handling

### 1. API Level

- Comprehensive error responses with appropriate HTTP status codes
- Detailed error messages for debugging
- Graceful handling of database errors

### 2. Client Level

- Loading states during API calls
- Error states with user-friendly messages
- Fallback behavior for network failures

### 3. Database Level

- Foreign key constraint handling
- Unique constraint violation handling
- Connection error handling

## Usage Examples

### 1. Basic Username Checking

```typescript
import { usernameChecker } from "@/lib/username-cache";

// Check username availability
await usernameChecker.checkUsernameAvailability(
  "myusername",
  (username, available, loading) => {
    if (loading) {
      console.log("Checking...");
    } else if (available) {
      console.log("Username is available!");
    } else {
      console.log("Username is taken");
    }
  },
);
```

### 2. Creating a Username

```typescript
import { createUsername } from "@/lib/turso";

const result = await createUsername(userId, "myusername");
if (result.success) {
  console.log("Username created:", result.username);
} else {
  console.error("Error:", result.error);
}
```

### 3. Using the UsernameSelector Component

```tsx
import { UsernameSelector } from "@/components/UsernameSelector";

function MyPage() {
  const handleUsernameCreated = (username: string) => {
    console.log("Username created:", username);
    // Redirect to dashboard
  };

  const handleCancel = () => {
    // Handle cancellation
  };

  return (
    <UsernameSelector
      userId="user-id"
      onUsernameCreated={handleUsernameCreated}
      onCancel={handleCancel}
    />
  );
}
```

## Integration with Authentication Flow

### 1. Sign Up Flow

1. User signs up with email/password
2. Redirected to `/create-username` page
3. User selects username with real-time feedback
4. Username is created atomically
5. User is redirected to dashboard

### 2. Sign In Flow

1. User signs in with email/password
2. System checks if user has profile (username)
3. If no profile: redirect to `/create-username`
4. If profile exists: redirect to dashboard

### 3. OAuth Flow

1. User signs in with Google/Discord
2. System checks if user has profile (username)
3. If no profile: redirect to `/create-username`
4. If profile exists: redirect to dashboard

## Monitoring and Debugging

### 1. Development Mode

- Cache statistics displayed in UsernameSelector component
- Console logging for debugging
- Detailed error messages

### 2. Production Considerations

- Rate limiting prevents abuse
- Database indexes optimize queries
- Client-side caching reduces server load
- Bloom filter minimizes unnecessary API calls

## Future Enhancements

### 1. Advanced Caching

- Redis integration for distributed caching
- Cache warming strategies
- TTL-based cache expiration

### 2. Analytics

- Username availability metrics
- Popular username patterns
- Performance monitoring

### 3. Username Suggestions

- AI-powered username suggestions
- Username availability prediction
- Alternative username recommendations

## Conclusion

The username selection system provides a robust, performant, and user-friendly solution for username management in the Stataku application. With its combination of client-side optimizations, server-side security, and real-time feedback, it ensures a smooth user experience while maintaining data integrity and system performance.

The system is designed to scale with the application and can be easily extended with additional features as needed. All components are well-documented and follow React and Next.js best practices.
