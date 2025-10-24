# Hebron Connect Authentication - Quick Reference

## Base URL
```
https://api.hebronconnect.com/api/v1
```

## Authentication Method
**OAuth2 Bearer Token** via Laravel Passport

```
Authorization: Bearer {your_access_token}
```

---

## Quick Links
- [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md)
- [Swagger UI](https://api.hebronconnect.com/api/docs)

---

## Endpoints Summary

### Public Endpoints (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/check-availability` | Check if phone/email available |
| POST | `/auth/send-otp` | Send OTP for verification |
| POST | `/auth/verify-otp` | Verify OTP code |
| POST | `/auth/register` | Complete registration |
| POST | `/auth/login` | User login |
| POST | `/auth/forgot-password` | Request password reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |

### Protected Endpoints (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/logout` | Logout from current device |
| POST | `/auth/logout-all-devices` | Logout from all devices |
| GET | `/auth/profile` | Get user profile |
| POST | `/auth/profile` | Update user profile |
| POST | `/auth/change-password` | Change password |

---

## Registration Flow (Step-by-Step)

### 1. Check Availability
```bash
POST /api/v1/auth/check-availability
Content-Type: application/json

{
  "phone": "+237123456789",
  "email": "john@example.com"
}
```

### 2. Send OTP
```bash
POST /api/v1/auth/send-otp
Content-Type: application/json

{
  "identifier": "+237123456789",
  "type": "phone"
}
```

### 3. Verify OTP
```bash
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "otp": "123456",
  "identifier": "+237123456789",
  "type": "phone"
}

# Response includes verification_token
```

### 4. Complete Registration
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+237123456789",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "identifier_type": "phone"
}

# Response includes access_token
```

---

## Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "login": "john@example.com",
  "password": "SecurePass123!",
  "device_token": "fcm_token_here",
  "device_type": "android",
  "device_id": "unique-device-id",
  "device_name": "Samsung Galaxy S21",
  "device_model": "SM-G991B",
  "os_version": "13",
  "app_version": "1.0.0",
  "lang": "en"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "user": { ... }
  }
}
```

---

## Making Authenticated Requests

All protected endpoints require the Bearer token:

```bash
GET /api/v1/auth/profile
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
Content-Type: application/json
Accept: application/json
```

---

## Password Reset Flow

### 1. Request OTP
```bash
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "contact": "john@example.com"
}
```

### 2. Reset Password
```bash
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "contact": "john@example.com",
  "otp": "123456",
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

---

## Change Password (Authenticated)

```bash
POST /api/v1/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "OldSecurePass123!",
  "new_password": "NewSecurePass123!",
  "new_password_confirmation": "NewSecurePass123!"
}
```

---

## Profile Management

### Get Profile
```bash
GET /api/v1/auth/profile
Authorization: Bearer {token}
```

### Update Profile
```bash
POST /api/v1/auth/profile
Authorization: Bearer {token}
Content-Type: multipart/form-data

first_name: John
last_name: Doe
profile_image: [binary file]
```

---

## Logout

### Logout Current Device
```bash
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### Logout All Devices
```bash
POST /api/v1/auth/logout-all-devices
Authorization: Bearer {token}
```

---

## Common HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Invalid/missing token |
| 403 | Forbidden | Account not verified |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable | Validation errors |
| 500 | Server Error | Internal error |

---

## Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "code": 400
}
```

---

## OTP Details

- **Format**: 6-digit numeric code
- **Validity**: 15 minutes
- **Delivery**: 
  - Phone: SMS (Cameroon: +237) + WhatsApp (all)
  - Email: AWS SES

---

## Device Management

**Device Information** (optional on login):
- `device_token`: FCM token for push notifications
- `device_type`: ios, android, or web
- `device_id`: Unique device identifier
- `device_name`: User-friendly name
- `device_model`: Device model
- `os_version`: OS version
- `app_version`: App version
- `lang`: Language preference (en/fr)

**New Device Notifications**:
- Push notification to other devices
- Email notification to user
- Security alert with device info

---

## Password Requirements

- Minimum 8 characters
- Must include confirmation
- Cannot match current password (for change password)
- **Recommended**: Mix of uppercase, lowercase, numbers, special characters

---

## Profile Image Requirements

- **Max Size**: 2MB
- **Formats**: JPG, JPEG, PNG
- **Processing**: 
  - Original: 800x800 (80% quality)
  - Thumbnail: 200x200 (80% quality)
- **Storage**: AWS S3

---

## Language Support

Set `lang` parameter in login:
- `en`: English (default)
- `fr`: French

Affects:
- OTP messages
- Push notifications
- Email notifications

---

## Testing with cURL

### Login Example
```bash
curl -X POST https://api.hebronconnect.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "login": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile Example
```bash
curl -X GET https://api.hebronconnect.com/api/v1/auth/profile \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci..." \
  -H "Accept: application/json"
```

---

## Important Notes

1. **Token Storage**: Store tokens securely (encrypted storage, keychain)
2. **Token Lifetime**: Managed by Laravel Passport (check config)
3. **SSL Required**: All requests must use HTTPS
4. **Rate Limiting**: OTP requests are rate-limited
5. **Device Tracking**: Login with device info for security features
6. **New Device Alerts**: Users receive notifications for new device logins

---

## Common Errors & Solutions

### "Unauthenticated"
**Cause**: Missing or invalid token  
**Solution**: Include valid Bearer token in Authorization header

### "Invalid credentials"
**Cause**: Wrong email/phone or password  
**Solution**: Verify credentials and retry

### "Please verify your account"
**Cause**: Account not verified  
**Solution**: Complete OTP verification process

### "Invalid or expired OTP"
**Cause**: OTP expired (>15 mins) or incorrect  
**Solution**: Request new OTP

### "The email has already been taken"
**Cause**: Email already registered  
**Solution**: Use different email or login instead

---

## Security Best Practices

✅ **DO**:
- Use HTTPS for all requests
- Store tokens securely
- Validate SSL certificates
- Implement request timeouts
- Handle errors gracefully
- Clear tokens on logout

❌ **DON'T**:
- Log sensitive data
- Store passwords locally
- Share tokens between users
- Ignore SSL certificate errors
- Make unlimited retry attempts

---

## Support

**Email**: support@hebronconnect.com  
**API Docs**: https://api.hebronconnect.com/api/docs

---

**Last Updated**: October 24, 2025

