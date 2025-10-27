# Browser Login Tracking - Quick Start Guide

## 🚀 Quick Implementation

### For Web/Browser Applications

**1. Login with Auto-Detection**

```javascript
// The system will automatically detect browser logins
const response = await fetch('https://api.hebronconnect.com/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    login: 'user@example.com',
    password: 'password123',
  }),
});

const data = await response.json();
const token = data.data.token;

// Store token
localStorage.setItem('auth_token', token);
```

**2. Make API Requests**

```javascript
const response = await fetch('https://api.hebronconnect.com/api/v1/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  },
});

// Token automatically extends by 15 minutes on each request
```

**3. Handle Session Expiration**

```javascript
const response = await fetch(url, { headers });

if (response.status === 401) {
  const data = await response.json();
  
  if (data.error_code === 'SESSION_EXPIRED') {
    // Clear token and redirect to login
    localStorage.removeItem('auth_token');
    window.location.href = '/login?reason=session_expired';
  }
}
```

---

## 📱 For Mobile Applications (No Change)

Mobile apps continue to work as before - tokens do NOT expire:

```dart
// Login
final response = await http.post(
  Uri.parse('$baseUrl/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'login': 'user@example.com',
    'password': 'password123',
    'device_token': fcmToken,
    'device_type': 'android',  // or 'ios'
  }),
);

// Tokens remain valid indefinitely (existing behavior)
```

---

## ⚙️ Explicit Browser Login

If auto-detection doesn't work, specify `login_source`:

```json
{
  "login": "user@example.com",
  "password": "password123",
  "login_source": "browser",
  "device_id": "unique-browser-id",
  "device_name": "Chrome on Windows"
}
```

---

## 🔐 Key Features

| Feature | Browser/Web | Mobile App |
|---------|-------------|------------|
| Token Expiration | 15 minutes (sliding) | Never |
| Auto-Extends | ✅ Yes | N/A |
| Device Tracking | ✅ Yes | ✅ Yes |
| Push Notifications | ❌ No | ✅ Yes |

---

## ⏱️ How Token Expiration Works

1. **Login:** Token expires in 15 minutes
2. **Activity at 10 min:** Token extends to 25 minutes
3. **Activity at 20 min:** Token extends to 35 minutes
4. **No activity for 15 min:** Token expires, user must re-login

---

## 🛠️ Deployment Checklist

- [ ] Run migration: `php artisan migrate`
- [ ] Clear config cache: `php artisan config:clear`
- [ ] Test browser login
- [ ] Test mobile login (ensure no regression)
- [ ] Verify session expiration after 15 minutes
- [ ] Test token auto-extension on activity

---

## 📊 Monitor Logins

```sql
-- Check all browser logins
SELECT 
    u.email,
    ud.device_name,
    ud.login_source,
    ud.token_expires_at,
    ud.is_active,
    ud.last_active_at
FROM user_devices ud
JOIN users u ON ud.user_id = u.id
WHERE ud.login_source IN ('web', 'browser')
ORDER BY ud.last_active_at DESC;
```

---

## ⚠️ Important Notes

1. **Browser tokens expire after 15 minutes** of inactivity
2. **Mobile tokens NEVER expire** (existing behavior preserved)
3. **Tokens auto-extend** on each API request
4. **Session expiration** returns specific `SESSION_EXPIRED` error code
5. **Middleware runs automatically** on all API routes

---

## 📚 Full Documentation

See [BROWSER_LOGIN_TRACKING_AND_TOKEN_EXPIRATION.md](./BROWSER_LOGIN_TRACKING_AND_TOKEN_EXPIRATION.md) for complete details.

---

**Quick Support:**
- Session expires too fast? Adjust in `LoginController.php` and `CheckBrowserTokenExpiration.php`
- Auto-detection not working? Pass explicit `login_source` parameter
- Token not extending? Check middleware is registered in `bootstrap/app.php`

