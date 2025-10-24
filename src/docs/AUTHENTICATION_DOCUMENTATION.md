# Hebron Connect Authentication Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication Flow](#authentication-flow)
3. [Authentication Endpoints](#authentication-endpoints)
4. [Security Configuration](#security-configuration)
5. [Device Management](#device-management)
6. [Password Management](#password-management)
7. [Profile Management](#profile-management)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)

---

## Overview

Hebron Connect uses **Laravel Passport** for OAuth2 authentication. The API implements a token-based authentication system with the following features:

- **OAuth2 Bearer Token Authentication** via Laravel Passport
- **OTP-based verification** for phone and email
- **Device tracking and management** for security
- **Multi-channel OTP delivery** (Email, SMS, WhatsApp)
- **Session management** (logout from single device or all devices)
- **Password reset** via OTP
- **Profile image management** with AWS S3 storage

### Key Technologies
- **Laravel Passport**: OAuth2 authentication provider
- **Twilio**: SMS and WhatsApp OTP delivery
- **AWS SES**: Email delivery
- **AWS S3**: Profile image storage
- **Firebase Cloud Messaging (FCM)**: Push notifications for security alerts

---

## Authentication Flow

### Registration Flow

```
1. Check Availability
   POST /api/v1/auth/check-availability
   ↓
2. Send OTP (Phone or Email)
   POST /api/v1/auth/send-otp
   ↓
3. Verify OTP
   POST /api/v1/auth/verify-otp
   ↓
4. Complete Registration
   POST /api/v1/auth/register
   ↓
5. Receive Access Token
```

### Login Flow

```
1. Login with Credentials
   POST /api/v1/auth/login
   ↓
2. Receive Access Token
   ↓
3. Include Token in Subsequent Requests
   Header: Authorization: Bearer {token}
```

### Password Reset Flow

```
1. Request Password Reset
   POST /api/v1/auth/forgot-password
   ↓
2. Receive OTP (Email or SMS)
   ↓
3. Verify OTP and Set New Password
   POST /api/v1/auth/reset-password
```

---

## Authentication Endpoints

### 1. Check Availability

**Endpoint**: `POST /api/v1/auth/check-availability`

**Description**: Check if phone number and email are available for registration.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "phone": "+237123456789",
  "email": "john@example.com"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Phone and email are available",
  "data": {
    "phone": "+237123456789",
    "email": "john@example.com"
  }
}
```

**Error Response** (422):
```json
{
  "status": "error",
  "message": "Phone number is already taken",
  "errors": {
    "phone": ["This phone number is already registered"]
  }
}
```

---

### 2. Send OTP

**Endpoint**: `POST /api/v1/auth/send-otp`

**Description**: Send OTP to phone number or email for verification before registration.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "identifier": "+237123456789",
  "type": "phone"
}
```

OR

```json
{
  "identifier": "john@example.com",
  "type": "email"
}
```

**Parameters**:
- `identifier` (required): Phone number or email address
- `type` (required): Either "phone" or "email"

**Success Response** (200):
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "identifier": "+237123456789",
    "type": "phone"
  }
}
```

**OTP Delivery Channels**:
- **Phone**: 
  - SMS via Twilio (Cameroon numbers: +237)
  - WhatsApp via Twilio (all numbers)
- **Email**: AWS SES

**OTP Details**:
- **Format**: 6-digit numeric code
- **Validity**: 15 minutes
- **Storage**: Database table `verifications`

---

### 3. Verify OTP

**Endpoint**: `POST /api/v1/auth/verify-otp`

**Description**: Verify the OTP sent to phone or email.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "otp": "123456",
  "identifier": "+237123456789",
  "type": "phone"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Verification successful",
  "data": {
    "verification_token": "a1b2c3d4e5f6..."
  }
}
```

**Error Response** (400):
```json
{
  "status": "error",
  "message": "Invalid OTP"
}
```

**Note**: The `verification_token` is required for the registration step.

---

### 4. Register

**Endpoint**: `POST /api/v1/auth/register`

**Description**: Complete user registration after OTP verification.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+237123456789",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "identifier_type": "phone"
}
```

**Parameters**:
- `first_name` (required, string, max: 255)
- `last_name` (required, string, max: 255)
- `email` (required, unique, valid email)
- `phone` (required, unique, E.164 format)
- `password` (required, min: 8, must match confirmation)
- `password_confirmation` (required)
- `identifier_type` (required, enum: "phone" or "email")

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+237123456789",
      "is_verified": true,
      "profile_image": null,
      "profile_image_thumbnail": null,
      "created_at": "2025-10-24T10:00:00.000000Z",
      "updated_at": "2025-10-24T10:00:00.000000Z"
    }
  }
}
```

**Error Response** (400):
```json
{
  "status": "error",
  "message": "Invalid or expired verification token"
}
```

---

### 5. Login

**Endpoint**: `POST /api/v1/auth/login`

**Description**: Authenticate user with email/phone and password.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "login": "john@example.com",
  "password": "SecurePass123!",
  "device_token": "fcm_device_token_here",
  "device_type": "android",
  "device_id": "unique-device-identifier",
  "device_name": "Samsung Galaxy S21",
  "device_model": "SM-G991B",
  "os_version": "13",
  "app_version": "1.0.0",
  "lang": "en"
}
```

**Parameters**:
- `login` (required): Email or phone number
- `password` (required)
- `device_token` (optional): FCM token for push notifications
- `device_type` (optional): "ios", "android", or "web"
- `device_id` (optional): Unique device identifier
- `device_name` (optional): Device display name
- `device_model` (optional): Device model identifier
- `os_version` (optional): Operating system version
- `app_version` (optional): Application version
- `lang` (optional): Language preference ("en" or "fr")

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+237123456789",
      "is_verified": true,
      "profile_image": "https://s3.amazonaws.com/bucket/path/to/image.jpg",
      "profile_image_thumbnail": "https://s3.amazonaws.com/bucket/path/to/thumbnail.jpg",
      "created_at": "2025-10-24T10:00:00.000000Z",
      "updated_at": "2025-10-24T10:00:00.000000Z"
    }
  }
}
```

**Error Responses**:

- **Invalid Credentials** (401):
```json
{
  "status": "error",
  "message": "Invalid credentials"
}
```

- **Account Not Verified** (403):
```json
{
  "status": "error",
  "message": "Please verify your account before logging in"
}
```

**Login Field Detection**:
- The system automatically detects whether the `login` field contains an email or phone number
- Email: Validated using PHP's `filter_var()` with `FILTER_VALIDATE_EMAIL`
- Phone: Assumed if not a valid email format

---

### 6. Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Description**: Logout user from current device and revoke access token.

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer {your_access_token}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Successfully logged out"
}
```

**What Happens on Logout**:
1. Access token is revoked
2. Device record is deleted from database
3. Device token (FCM) is removed
4. User will need to login again on this device

---

### 7. Logout from All Devices

**Endpoint**: `POST /api/v1/auth/logout-all-devices`

**Description**: Logout user from all devices and revoke all access tokens.

**Authentication**: Required (Bearer Token)

**Headers**:
```
Authorization: Bearer {your_access_token}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Successfully logged out from all devices",
  "data": {
    "devices_logged_out": 3
  }
}
```

**What Happens**:
1. All access tokens are revoked
2. All device records are deleted
3. All device tokens (FCM) are removed
4. User will need to login again on all devices

---

## Security Configuration

### Laravel Passport

Hebron Connect uses **Laravel Passport** for OAuth2 authentication.

**Configuration File**: `config/auth.php`

```php
'guards' => [
    'web' => [
        'driver' => 'session',
        'provider' => 'users',
    ],
    
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],
```

### Token Configuration

**Token Type**: OAuth2 Bearer Token

**Token Format**:
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

**Token Storage**:
- Tokens are stored in the `oauth_access_tokens` table
- Token expiration is managed by Passport configuration

**Token Scopes**: 
- Default scope: All API endpoints (unless explicitly restricted)

### API Security Headers

All authenticated requests must include:

```
Authorization: Bearer {your_access_token}
Content-Type: application/json
Accept: application/json
```

### CORS Configuration

CORS settings are configured in `config/cors.php` to allow cross-origin requests from authorized domains.

---

## Device Management

Hebron Connect tracks user devices for security and push notification purposes.

### Device Registration

When a user logs in with device information, the system:

1. **Checks for existing device**: If device token exists for the user, updates it
2. **Creates new device record**: If device token is new
3. **Sends security alerts**: If login is from a new device

**Device Data Stored**:
- `device_token`: FCM token for push notifications
- `device_type`: ios, android, or web
- `device_id`: Unique device identifier
- `device_name`: User-friendly device name
- `device_model`: Device model identifier
- `os_version`: Operating system version
- `app_version`: Application version
- `access_token_id`: Associated OAuth token
- `is_active`: Device status
- `last_active_at`: Last activity timestamp

### New Device Login Notifications

When a user logs in from a new device:

1. **Push Notification**: Sent to all other active devices
2. **Email Notification**: Sent to user's registered email

**Push Notification Format** (English):
```
Title: New Login Detected
Body: A new login was detected from Samsung Galaxy S21 at 14:30
```

**Push Notification Format** (French):
```
Title: Nouvelle connexion détectée
Body: Une nouvelle connexion a été détectée depuis Samsung Galaxy S21 à 14:30
```

**Notification Data Payload**:
```json
{
  "type": "new_device_login",
  "device_info": "Samsung Galaxy S21",
  "device_type": "android",
  "login_time": "2025-10-24T14:30:00+00:00",
  "timestamp": 1729782600,
  "action": "open_security_settings"
}
```

### Device Cleanup

Devices are automatically removed from the database when:
- User logs out from that device
- User logs out from all devices
- Access token is revoked

---

## Password Management

### Forgot Password

**Endpoint**: `POST /api/v1/auth/forgot-password`

**Description**: Request a password reset OTP.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "contact": "john@example.com"
}
```

OR

```json
{
  "contact": "+237123456789"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "OTP sent successfully",
  "data": {
    "contact": "john@example.com",
    "type": "email"
  }
}
```

**Error Response** (404):
```json
{
  "status": "error",
  "message": "User not found"
}
```

**OTP Details**:
- **Format**: 6-digit numeric code
- **Validity**: 15 minutes
- **Storage**: Database table `phone_verifications`

---

### Reset Password

**Endpoint**: `POST /api/v1/auth/reset-password`

**Description**: Reset password using OTP received.

**Authentication**: None (Public)

**Request Body**:
```json
{
  "contact": "john@example.com",
  "otp": "123456",
  "password": "NewSecurePass123!",
  "password_confirmation": "NewSecurePass123!"
}
```

**Parameters**:
- `contact` (required): Email or phone number
- `otp` (required, 6 digits)
- `password` (required, min: 8 characters)
- `password_confirmation` (required, must match password)

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Password reset successfully"
}
```

**Error Responses**:

- **Invalid OTP** (404):
```json
{
  "status": "error",
  "message": "Invalid or expired OTP"
}
```

- **User Not Found** (404):
```json
{
  "status": "error",
  "message": "User not found"
}
```

---

### Change Password (Authenticated)

**Endpoint**: `POST /api/v1/auth/change-password`

**Description**: Change password for authenticated user (requires current password).

**Authentication**: Required (Bearer Token)

**Request Body**:
```json
{
  "current_password": "OldSecurePass123!",
  "new_password": "NewSecurePass123!",
  "new_password_confirmation": "NewSecurePass123!"
}
```

**Parameters**:
- `current_password` (required)
- `new_password` (required, min: 8, must be different from current)
- `new_password_confirmation` (required, must match new_password)

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

**Error Response** (401):
```json
{
  "status": "error",
  "message": "Current password is incorrect"
}
```

---

## Profile Management

### Get User Profile

**Endpoint**: `GET /api/v1/auth/profile`

**Description**: Retrieve authenticated user's profile.

**Authentication**: Required (Bearer Token)

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+237123456789",
      "role": "user",
      "is_admin": false,
      "is_verified": true,
      "profile_image": "https://s3.amazonaws.com/bucket/path/to/image.jpg",
      "profile_image_thumbnail": "https://s3.amazonaws.com/bucket/path/to/thumbnail.jpg",
      "email_verified_at": "2025-10-24T10:00:00.000000Z",
      "phone_verified_at": "2025-10-24T10:00:00.000000Z",
      "created_at": "2025-10-24T10:00:00.000000Z",
      "updated_at": "2025-10-24T10:00:00.000000Z"
    }
  }
}
```

---

### Update User Profile

**Endpoint**: `POST /api/v1/auth/profile`

**Description**: Update authenticated user's profile details.

**Authentication**: Required (Bearer Token)

**Content-Type**: `multipart/form-data` (if uploading profile image)

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "profile_image": "[binary file]"
}
```

**Parameters**:
- `first_name` (optional, string, max: 255)
- `last_name` (optional, string, max: 255)
- `profile_image` (optional, image file: jpg/jpeg/png, max: 2MB)

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+237123456789",
      "profile_image": "https://s3.amazonaws.com/bucket/local/users/1/profile/original/profile_abc123.jpg",
      "profile_image_thumbnail": "https://s3.amazonaws.com/bucket/local/users/1/profile/thumbnail/profile_abc123.jpg",
      "created_at": "2025-10-24T10:00:00.000000Z",
      "updated_at": "2025-10-24T10:05:00.000000Z"
    }
  }
}
```

**Profile Image Processing**:
1. **Original Image**:
   - Resized to max 800x800 (maintains aspect ratio)
   - Converted to JPEG format
   - Quality: 80%
   - Stored in S3: `{env}/users/{userId}/profile/original/`

2. **Thumbnail**:
   - Resized to 200x200 (maintains aspect ratio)
   - Converted to JPEG format
   - Quality: 80%
   - Stored in S3: `{env}/users/{userId}/profile/thumbnail/`

**Note**: When uploading a new profile image, the old images are automatically deleted from S3.

---

## Error Handling

### Standard Error Response Format

All error responses follow this format:

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

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input or validation error |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | User lacks permission or account not verified |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server-side error |

### Common Error Scenarios

#### Invalid Token
```json
{
  "message": "Unauthenticated.",
  "status": 401
}
```

**Solution**: Include valid Bearer token in Authorization header.

---

#### Expired Token
```json
{
  "message": "Token has expired",
  "status": 401
}
```

**Solution**: Re-authenticate user to get a new token.

---

#### Account Not Verified
```json
{
  "status": "error",
  "message": "Please verify your account before logging in",
  "code": 403
}
```

**Solution**: Complete OTP verification process.

---

#### Invalid Credentials
```json
{
  "status": "error",
  "message": "Invalid credentials",
  "code": 401
}
```

**Solution**: Check login (email/phone) and password.

---

#### Validation Errors
```json
{
  "status": "error",
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."],
    "password": ["The password must be at least 8 characters."]
  },
  "code": 422
}
```

**Solution**: Fix validation issues and retry.

---

## Best Practices

### 1. Token Management

**DO**:
- Store tokens securely (encrypted storage, keychain, secure storage)
- Include token in all authenticated requests
- Implement automatic token refresh mechanism
- Clear tokens on logout

**DON'T**:
- Store tokens in plain text
- Share tokens between users
- Log tokens in application logs
- Store tokens in localStorage (web apps should use httpOnly cookies)

---

### 2. Password Security

**Requirements**:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, and special characters (recommended)
- Different from current password (for change password)
- Must match confirmation field

**DO**:
- Enforce strong password policies on client side
- Use password strength indicators
- Implement password history (prevent reuse)
- Clear password fields after errors

**DON'T**:
- Display passwords in plain text
- Store passwords locally
- Log passwords in any form

---

### 3. Device Management

**DO**:
- Send device information on every login
- Implement device name/model detection
- Include app version for analytics
- Update device token when FCM token refreshes

**DON'T**:
- Hardcode device information
- Send fake device data
- Ignore new device notifications

---

### 4. OTP Security

**DO**:
- Implement rate limiting on OTP requests
- Clear OTP input fields after verification
- Show OTP expiration countdown
- Provide resend option (with throttling)

**DON'T**:
- Store OTPs locally
- Allow unlimited OTP attempts
- Pre-fill OTP from SMS (security risk)
- Display OTPs in screenshots

---

### 5. API Request Best Practices

**DO**:
- Set proper Content-Type headers
- Include Accept header for JSON responses
- Implement request timeouts
- Handle network errors gracefully
- Implement retry logic with exponential backoff

**DON'T**:
- Make unnecessary API calls
- Send sensitive data in URL parameters
- Ignore SSL certificate validation
- Make synchronous blocking requests

---

### 6. Error Handling

**DO**:
- Parse error responses properly
- Display user-friendly error messages
- Log errors for debugging
- Implement global error handlers
- Handle network connectivity issues

**DON'T**:
- Display raw error messages to users
- Ignore validation errors
- Retry failed requests infinitely
- Suppress important error information

---

### 7. Profile Images

**DO**:
- Validate image size before upload (< 2MB)
- Support JPEG, PNG formats
- Show upload progress
- Use thumbnail URLs for list views
- Cache images appropriately

**DON'T**:
- Upload uncompressed images
- Ignore image processing errors
- Hardcode S3 URLs
- Display broken image links

---

### 8. Multi-Language Support

**DO**:
- Send user's language preference in `lang` parameter
- Support "en" and "fr" languages
- Store language preference
- Update language for OTP messages and notifications

**Languages Supported**:
- `en`: English (default)
- `fr`: French

---

### 9. Testing

**DO**:
- Test all authentication flows
- Test token expiration scenarios
- Test network failure scenarios
- Test OTP delivery failures
- Implement automated tests

**DON'T**:
- Test with production data
- Share test credentials
- Skip edge cases
- Ignore error scenarios

---

### 10. Security Checklist

- [ ] Implement SSL/TLS for all API calls
- [ ] Validate SSL certificates
- [ ] Store tokens in secure storage
- [ ] Implement biometric authentication (optional)
- [ ] Clear sensitive data on logout
- [ ] Implement certificate pinning (recommended)
- [ ] Enable security notifications
- [ ] Implement session timeout
- [ ] Log security events
- [ ] Handle new device logins appropriately

---

## API Base URL

**Production**: `https://api.hebronconnect.com`

**All endpoints are prefixed with**: `/api/v1`

**Example Full URL**: `https://api.hebronconnect.com/api/v1/auth/login`

---

## Swagger Documentation

Interactive API documentation is available at:

**URL**: `https://api.hebronconnect.com/api/docs`

The Swagger UI provides:
- Interactive API testing
- Request/response examples
- Authentication testing
- Schema definitions

---

## Support

For API support or questions, contact:
- **Email**: support@hebronconnect.com

---

## Changelog

### Version 1.0.0 (Current)
- OAuth2 Bearer Token authentication via Laravel Passport
- OTP-based registration and verification
- Multi-channel OTP delivery (Email, SMS, WhatsApp)
- Device tracking and management
- New device login notifications
- Password reset via OTP
- Profile management with image upload
- Multi-language support (English, French)
- Logout from single device or all devices

---

**Last Updated**: October 24, 2025

