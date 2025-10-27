# Browser Login Tracking and 15-Minute Token Expiration

## Overview

This feature tracks browser logins separately from mobile app logins and automatically expires browser tokens after 15 minutes of inactivity. The token expiration is automatically extended on each API request, providing a secure session management system for web-based access.

---

## Table of Contents

1. [Features](#features)
2. [How It Works](#how-it-works)
3. [Database Changes](#database-changes)
4. [API Usage](#api-usage)
5. [Implementation Details](#implementation-details)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)

---

## Features

### ✅ Automatic Login Source Detection
- Detects browser logins via User-Agent analysis
- Supports explicit `login_source` parameter
- Distinguishes between mobile, web, and browser logins

### ✅ 15-Minute Token Expiration for Browsers
- Browser tokens expire after 15 minutes
- Auto-extends on each API request (sliding expiration)
- Mobile app tokens never expire (existing behavior)

### ✅ Middleware Protection
- Automatic token expiration checking on all API requests
- Returns clear error message when session expires
- Logs all token expirations for security auditing

### ✅ Device Tracking
- Tracks all login sources in `user_devices` table
- Shows login source (mobile, web, browser)
- Displays token expiration time for browser logins

---

## How It Works

### Login Flow

```
1. User logs in via browser/web
   ↓
2. System detects login source (User-Agent or explicit parameter)
   ↓
3. If browser login:
   - Set token_expires_at = now() + 15 minutes
   - Set login_source = 'browser' or 'web'
   ↓
4. Token and device info saved to database
   ↓
5. Return token to client
```

### Request Flow (Middleware)

```
1. Client makes API request with token
   ↓
2. Middleware checks if it's a browser login
   ↓
3. If browser login:
   - Check if token_expires_at has passed
   - If expired: Revoke token, return 401 error
   - If valid: Extend expiration by 15 minutes
   ↓
4. Continue with request processing
```

---

## Database Changes

### Migration

**File:** `database/migrations/2025_10_27_065728_add_login_source_and_expires_at_to_user_devices_table.php`

**New Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `login_source` | string | `'mobile'`, `'web'`, or `'browser'` |
| `token_expires_at` | timestamp | Token expiration for browser logins |

**Indexes:**
- `login_source` - For filtering by login type
- `token_expires_at` - For efficient expiration checks

### Model Updates

**File:** `app/Models/UserDevices.php`

**New Methods:**
```php
isBrowserLogin()           // Check if device is browser login
isTokenExpired()           // Check if browser token has expired
setBrowserTokenExpiration() // Set 15-minute expiration
scopeBrowserLogins()       // Query only browser logins
scopeMobileLogins()        // Query only mobile logins
```

---

## API Usage

### Login with Browser Detection

**Endpoint:** `POST /api/v1/auth/login`

**Request with Auto-Detection:**
```json
{
  "login": "user@example.com",
  "password": "password123"
}
```

The system will automatically detect if the request is from a browser based on User-Agent.

**Request with Explicit Source:**
```json
{
  "login": "user@example.com",
  "password": "password123",
  "login_source": "browser",
  "device_id": "browser-unique-id",
  "device_name": "Chrome on Windows",
  "device_type": "web"
}
```

**Response:**
```json
{
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      ...
    }
  },
  "message": "Login successful",
  "status": 200
}
```

### Session Expiration Response

When a browser token expires (after 15 minutes of inactivity):

```json
{
  "success": false,
  "message": "Your session has expired. Please login again.",
  "error_code": "SESSION_EXPIRED"
}
```

**HTTP Status Code:** `401 Unauthorized`

---

## Implementation Details

### 1. Login Source Detection

**File:** `app/Http/Controllers/Api/V1/Auth/LoginController.php`

The `detectLoginSource()` method uses multiple strategies:

1. **Explicit Parameter:** Check if `login_source` is provided
2. **User-Agent Analysis:** Parse User-Agent for browser indicators
3. **Device Type:** Check `device_type` parameter
4. **Default:** Fall back to `'mobile'`

**Browser Indicators:**
- Mozilla, Chrome, Safari, Firefox, Edge, Opera, MSIE, Trident, Chromium

**Mobile Indicators (excluded):**
- Android, iPhone, iPad, iPod, Mobile

**Logic:**
```
If (browser indicators present) AND NOT (mobile indicators present):
    → login_source = 'browser'
Else if device_type = 'web' or 'browser':
    → login_source = 'browser'
Else:
    → login_source = 'mobile'
```

### 2. Token Expiration Management

**Initial Expiration (Login):**
```php
if (in_array($loginSource, ['web', 'browser'])) {
    $deviceData['token_expires_at'] = now()->addMinutes(15);
}
```

**Sliding Expiration (Middleware):**
```php
// On each valid request, extend expiration
$device->update([
    'token_expires_at' => now()->addMinutes(15),
    'last_active_at' => now()
]);
```

### 3. Middleware Logic

**File:** `app/Http/Middleware/CheckBrowserTokenExpiration.php`

```php
1. Check if user is authenticated
2. Get user's token and associated device
3. If device is browser login:
   a. Check if token_expires_at has passed
   b. If expired:
      - Revoke token
      - Deactivate device
      - Return 401 error
   c. If valid:
      - Extend expiration by 15 minutes
      - Update last_active_at
4. Continue request
```

**Registered in:** `bootstrap/app.php` (applied to all API routes)

---

## Testing

### Test Scenario 1: Browser Login

```bash
# 1. Login from browser (auto-detected)
curl -X POST https://api.hebronconnect.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0" \
  -d '{
    "login": "user@example.com",
    "password": "password123"
  }'

# 2. Make API request (token valid, extends expiration)
curl -X GET https://api.hebronconnect.com/api/v1/user/profile \
  -H "Authorization: Bearer {token}"

# 3. Wait 16 minutes without activity

# 4. Make API request (token expired)
curl -X GET https://api.hebronconnect.com/api/v1/user/profile \
  -H "Authorization: Bearer {token}"

# Expected: 401 error with SESSION_EXPIRED code
```

### Test Scenario 2: Explicit Browser Login

```bash
curl -X POST https://api.hebronconnect.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "user@example.com",
    "password": "password123",
    "login_source": "browser",
    "device_id": "browser-123",
    "device_name": "Chrome on macOS"
  }'
```

### Test Scenario 3: Mobile Login (No Expiration)

```bash
curl -X POST https://api.hebronconnect.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "User-Agent: MyApp/1.0 (iPhone; iOS 16.0)" \
  -d '{
    "login": "user@example.com",
    "password": "password123",
    "device_token": "fcm-token-here",
    "device_type": "ios"
  }'

# Token will NOT expire after 15 minutes
```

### Test Scenario 4: Sliding Expiration

```bash
# 1. Login from browser
# 2. Make request at minute 10 (extends to minute 25)
# 3. Make request at minute 20 (extends to minute 35)
# 4. Make request at minute 30 (extends to minute 45)
# Token never expires as long as user is active
```

### Database Verification

```sql
-- Check login sources
SELECT 
    id,
    user_id,
    device_name,
    login_source,
    token_expires_at,
    is_active,
    created_at
FROM user_devices
WHERE user_id = 1
ORDER BY created_at DESC;

-- Find expired browser sessions
SELECT *
FROM user_devices
WHERE login_source IN ('web', 'browser')
  AND token_expires_at < NOW()
  AND is_active = true;
```

---

## Security Considerations

### 1. Token Lifetime

**Browser/Web:**
- ✅ 15-minute sliding expiration
- ✅ Auto-extends on activity
- ✅ Secure for web applications

**Mobile:**
- ✅ No expiration (long-lived tokens)
- ✅ Suitable for mobile apps
- ✅ Can be manually revoked

### 2. Token Revocation

**Automatic:**
- Browser tokens expire after 15 minutes of inactivity
- Expired tokens are automatically revoked by middleware

**Manual:**
- Users can logout to revoke tokens
- Users can logout from all devices
- Admin can revoke specific device tokens

### 3. Logging

All token operations are logged:
```php
// Token expiration
Log::info('Browser token expired and revoked', [...]);

// Token extension
Log::debug('Browser token expiration extended', [...]);

// New browser login
Log::info('Created new device during login', [
    'login_source' => 'browser',
    'token_expires_at' => '2025-10-27 07:12:45'
]);
```

### 4. Best Practices

1. **Secure Transport:** Always use HTTPS for API requests
2. **Token Storage:** Store tokens securely in browser (httpOnly cookies or secure storage)
3. **Handle Expiration:** Implement proper error handling for `SESSION_EXPIRED`
4. **Re-authentication:** Redirect users to login when session expires
5. **Activity Tracking:** Monitor `last_active_at` for suspicious patterns

---

## Frontend Integration

### JavaScript/TypeScript Example

```typescript
// API client with session expiration handling
class ApiClient {
  async request(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    if (response.status === 401) {
      const data = await response.json();
      
      if (data.error_code === 'SESSION_EXPIRED') {
        // Session expired - redirect to login
        this.clearToken();
        window.location.href = '/login?reason=session_expired';
        return;
      }
    }

    return response.json();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  clearToken(): void {
    localStorage.removeItem('auth_token');
  }
}

// Usage
const api = new ApiClient();

try {
  const userData = await api.request('/api/v1/user/profile');
  console.log(userData);
} catch (error) {
  // Handle other errors
  console.error(error);
}
```

### React Example

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function useSessionExpiration() {
  const navigate = useNavigate();

  useEffect(() => {
    // Intercept fetch responses
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      if (response.status === 401) {
        const data = await response.clone().json();
        
        if (data.error_code === 'SESSION_EXPIRED') {
          localStorage.removeItem('auth_token');
          navigate('/login?reason=session_expired');
        }
      }
      
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate]);
}

// In your app
function App() {
  useSessionExpiration();
  
  return (
    <Router>
      {/* Your routes */}
    </Router>
  );
}
```

---

## Configuration

### Adjusting Expiration Time

To change the expiration time from 15 minutes to another value:

**1. LoginController.php** (lines 320, 356):
```php
// Change from:
$updateData['token_expires_at'] = now()->addMinutes(15);

// To (for 30 minutes):
$updateData['token_expires_at'] = now()->addMinutes(30);
```

**2. CheckBrowserTokenExpiration.php** (line 58):
```php
// Change from:
'token_expires_at' => now()->addMinutes(15),

// To (for 30 minutes):
'token_expires_at' => now()->addMinutes(30),
```

**Recommended:** Create a config value:
```php
// config/auth.php
'browser_token_lifetime' => env('BROWSER_TOKEN_LIFETIME', 15),

// Usage:
now()->addMinutes(config('auth.browser_token_lifetime'))
```

---

## Troubleshooting

### Issue: Token expires immediately

**Solution:** Check that middleware is properly registered in `bootstrap/app.php`

### Issue: Token never expires for browser

**Solution:** Verify `login_source` is set to `'browser'` or `'web'` in database

### Issue: False detection (mobile detected as browser)

**Solution:** Pass explicit `login_source` parameter in login request

### Issue: Token not extending on activity

**Solution:** Ensure middleware is running on API routes and `token_expires_at` is updating

---

## Database Migration Command

```bash
# Run the migration
php artisan migrate

# Rollback if needed
php artisan migrate:rollback
```

---

## Files Modified

1. **Migration:** `database/migrations/2025_10_27_065728_add_login_source_and_expires_at_to_user_devices_table.php`
2. **Model:** `app/Models/UserDevices.php`
3. **Controller:** `app/Http/Controllers/Api/V1/Auth/LoginController.php`
4. **Middleware:** `app/Http/Middleware/CheckBrowserTokenExpiration.php`
5. **Bootstrap:** `bootstrap/app.php`
6. **Documentation:** `docs/BROWSER_LOGIN_TRACKING_AND_TOKEN_EXPIRATION.md`

---

## Related Documentation

- [Authentication Documentation](./AUTHENTICATION_DOCUMENTATION.md)
- [Device Management](./AUTHENTICATION_INTEGRATION_GUIDE.md)

---

**Version:** 1.0  
**Date:** October 27, 2025  
**Status:** ✅ Production Ready

