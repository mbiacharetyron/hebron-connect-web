# New Device Login Notifications Documentation

## Overview

This documentation covers the new device login notification system implemented in Hebron Connect. When a user logs in from a new device, the system automatically sends notifications to their other active devices and email to alert them about the new login for security purposes.

## Table of Contents

1. [Features](#features)
2. [How It Works](#how-it-works)
3. [API Integration](#api-integration)
4. [Notification Types](#notification-types)
5. [Device Management](#device-management)
6. [Security Considerations](#security-considerations)
7. [Implementation Details](#implementation-details)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Features

### 🔐 Security Notifications
- **Real-time Alerts**: Instant notifications when logging in from a new device
- **Multi-channel Notifications**: Push notifications + email notifications
- **Device Information**: Includes device name, model, and login time
- **Language Support**: Notifications in English and French

### 📱 Device Tracking
- **Automatic Device Registration**: Devices are registered during login
- **Device History**: Track all devices used by a user
- **Active Device Management**: Monitor and manage active devices
- **Token Management**: Link device tokens to access tokens

### 🌐 Cross-Platform Support
- **iOS Support**: Full iOS device tracking and notifications
- **Android Support**: Full Android device tracking and notifications
- **Web Support**: Web browser device tracking
- **Unified API**: Same API works across all platforms

---

## How It Works

### Login Flow with Device Detection

```mermaid
graph TD
    A[User Login Request] --> B{Device Token Provided?}
    B -->|No| C[Login Without Device Tracking]
    B -->|Yes| D[Check Existing Device]
    D --> E{Device Exists?}
    E -->|Yes| F[Update Device Info]
    E -->|No| G[Create New Device]
    G --> H{Other Active Devices?}
    H -->|Yes| I[Send New Device Notifications]
    H -->|No| J[First Device - No Notifications]
    I --> K[Send Push Notifications]
    I --> L[Send Email Notification]
    F --> M[Complete Login]
    J --> M
    K --> M
    L --> M
    C --> M
```

### Device Detection Logic

1. **Login Request**: User provides credentials + optional device information
2. **Device Check**: System checks if device token already exists for user
3. **New Device Detection**: If device doesn't exist and user has other active devices
4. **Notification Trigger**: Send notifications to other active devices
5. **Device Registration**: Register new device in database

---

## API Integration

### Enhanced Login Endpoint

The login endpoint now accepts additional device parameters:

```http
POST /api/v1/auth/login
Content-Type: application/json
Authorization: Not required

{
    "login": "user@example.com",
    "password": "password123",
    "device_token": "device_token_here",
    "device_type": "android",
    "device_id": "unique-device-id",
    "device_name": "Samsung Galaxy S23",
    "device_model": "SM-S911B",
    "os_version": "13.0",
    "app_version": "1.0.0",
    "lang": "en"
}
```

### Device Token Update Endpoint

The existing device token update endpoint also triggers new device notifications:

```http
POST /api/v1/user/device-token
Content-Type: application/json
Authorization: Bearer {token}

{
    "device_token": "new_device_token",
    "device_type": "ios",
    "device_id": "unique-device-id",
    "device_name": "iPhone 14 Pro",
    "device_model": "iPhone15,2",
    "os_version": "16.0",
    "app_version": "1.0.0",
    "lang": "en"
}
```

---

## Notification Types

### Push Notifications

#### English Notification
- **Title**: "New Login Detected"
- **Body**: "A new login was detected from [Device Name] at [Time]"
- **Data Payload**:
```json
{
    "type": "new_device_login",
    "device_info": "iPhone 14 Pro",
    "device_type": "ios",
    "login_time": "2025-01-15T10:30:00.000Z",
    "timestamp": 1705312200,
    "action": "open_security_settings"
}
```

#### French Notification
- **Title**: "Nouvelle connexion détectée"
- **Body**: "Une nouvelle connexion a été détectée depuis [Device Name] à [Time]"
- **Data Payload**: Same as English

### Email Notifications

Users receive email notifications with:
- Device information
- Login time and location (if available)
- Security recommendations
- Link to manage devices

---

## Device Management

### Device Registration

Devices are automatically registered when:
1. User logs in with device information
2. User updates device token via API
3. User registers device token publicly

### Device Information Stored

```php
[
    'user_id' => 123,
    'device_token' => 'device_token_here',
    'device_type' => 'android',
    'device_id' => 'unique-device-id',
    'device_name' => 'Samsung Galaxy S23',
    'device_model' => 'SM-S911B',
    'os_version' => '13.0',
    'app_version' => '1.0.0',
    'access_token_id' => 'token_id',
    'is_active' => true,
    'last_active_at' => '2025-01-15T10:30:00.000Z'
]
```

### Device Status Management

- **Active Devices**: Devices with valid tokens and recent activity
- **Inactive Devices**: Devices that haven't been used recently
- **Device Cleanup**: Automatic cleanup of invalid tokens

---

## Security Considerations

### 🔒 Security Features

1. **Immediate Notifications**: Users are notified instantly about new logins
2. **Device Fingerprinting**: Track devices by multiple identifiers
3. **Token Validation**: Validate device tokens and access tokens
4. **Audit Trail**: Log all device registrations and notifications

### 🛡️ Privacy Protection

1. **Minimal Data Collection**: Only collect necessary device information
2. **Data Encryption**: Device tokens are stored securely
3. **Access Control**: Only users can manage their own devices
4. **Data Retention**: Automatic cleanup of old device data

### 🚨 Security Alerts

1. **Suspicious Activity**: Multiple new devices in short time
2. **Geographic Anomalies**: Logins from unusual locations
3. **Device Changes**: Frequent device switching
4. **Token Abuse**: Invalid or expired tokens

---

## Implementation Details

### Database Schema

#### UserDevices Table
```sql
CREATE TABLE user_devices (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    device_token VARCHAR(255) NOT NULL,
    device_type VARCHAR(50),
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_model VARCHAR(255),
    os_version VARCHAR(50),
    app_version VARCHAR(50),
    access_token_id VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_active_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_device_token (device_token),
    INDEX idx_access_token_id (access_token_id),
    INDEX idx_is_active (is_active)
);
```

### Service Classes

#### FirebaseService
- Handles push notification delivery
- Manages device token validation
- Provides error handling and retry logic

#### LoginController
- Enhanced with device registration logic
- Handles new device detection
- Triggers notification system

#### UserAccountController
- Existing device token update functionality
- Also triggers new device notifications
- Manages device lifecycle

### Event Flow

1. **Login Request** → LoginController
2. **Device Check** → UserDevices Model
3. **New Device Detection** → Notification Service
4. **Push Notifications** → FirebaseService
5. **Email Notifications** → Mail Service
6. **Device Registration** → Database

---

## Testing

### Manual Testing

#### Test New Device Login
```bash
# Login from first device
curl -X POST "https://api.hebronconnect.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test@example.com",
    "password": "password123",
    "device_token": "device_token_1",
    "device_type": "android",
    "device_name": "Samsung Galaxy S23"
  }'

# Login from second device (should trigger notifications)
curl -X POST "https://api.hebronconnect.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "test@example.com",
    "password": "password123",
    "device_token": "device_token_2",
    "device_type": "ios",
    "device_name": "iPhone 14 Pro"
  }'
```

#### Test Device Token Update
```bash
# Update device token (should trigger notifications if new device)
curl -X POST "https://api.hebronconnect.com/api/v1/user/device-token" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "device_token": "new_device_token",
    "device_type": "web",
    "device_name": "Chrome Browser"
  }'
```

### Automated Testing

#### Unit Tests
```php
// Test new device detection
public function test_new_device_detection()
{
    $user = User::factory()->create();
    
    // First device
    $this->postJson('/api/v1/auth/login', [
        'login' => $user->email,
        'password' => 'password',
        'device_token' => 'device_1'
    ]);
    
    // Second device should trigger notifications
    $response = $this->postJson('/api/v1/auth/login', [
        'login' => $user->email,
        'password' => 'password',
        'device_token' => 'device_2'
    ]);
    
    $this->assertTrue($response->successful());
    // Assert notifications were sent
}
```

#### Integration Tests
```php
// Test notification delivery
public function test_notification_delivery()
{
    // Mock Firebase service
    $this->mock(FirebaseService::class, function ($mock) {
        $mock->shouldReceive('sendNotification')
            ->once()
            ->with(
                'device_token',
                'New Login Detected',
                Mockery::type('string'),
                Mockery::type('array')
            );
    });
    
    // Trigger new device login
    // Assert notifications were sent
}
```

---

## Troubleshooting

### Common Issues

#### 1. Notifications Not Sent
**Symptoms**: New device login but no notifications received
**Causes**:
- Firebase service not configured
- Invalid device tokens
- Network connectivity issues
- Email service not configured

**Solutions**:
- Check Firebase configuration
- Verify device tokens are valid
- Check network connectivity
- Verify email service configuration

#### 2. Duplicate Notifications
**Symptoms**: Multiple notifications for same device
**Causes**:
- Race conditions in device registration
- Multiple login attempts
- Token refresh issues

**Solutions**:
- Implement proper locking mechanisms
- Add duplicate detection
- Optimize token refresh logic

#### 3. Device Not Recognized
**Symptoms**: Device treated as new every time
**Causes**:
- Device token changes frequently
- Device ID not consistent
- Database issues

**Solutions**:
- Use stable device identifiers
- Implement device fingerprinting
- Check database integrity

### Debugging

#### Enable Debug Logging
```php
// In config/logging.php
'channels' => [
    'device_notifications' => [
        'driver' => 'single',
        'path' => storage_path('logs/device_notifications.log'),
        'level' => 'debug',
    ],
],
```

#### Check Device Status
```php
// Get user's devices
$devices = UserDevices::where('user_id', $userId)
    ->where('is_active', true)
    ->get();

// Check device tokens
foreach ($devices as $device) {
    echo "Device: {$device->device_name} - Token: {$device->device_token}\n";
}
```

#### Monitor Notifications
```php
// Check notification logs
$logs = Log::channel('device_notifications')->get();

// Check Firebase responses
$firebaseLogs = Log::where('channel', 'firebase')->get();
```

---

## Configuration

### Environment Variables

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@hebronconnect.com
MAIL_FROM_NAME="Hebron Connect"
```

### Firebase Configuration

```php
// config/firebase.php
return [
    'project_id' => env('FIREBASE_PROJECT_ID'),
    'private_key_id' => env('FIREBASE_PRIVATE_KEY_ID'),
    'private_key' => env('FIREBASE_PRIVATE_KEY'),
    'client_email' => env('FIREBASE_CLIENT_EMAIL'),
    'client_id' => env('FIREBASE_CLIENT_ID'),
    'auth_uri' => env('FIREBASE_AUTH_URI'),
    'token_uri' => env('FIREBASE_TOKEN_URI'),
    'auth_provider_x509_cert_url' => env('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
    'client_x509_cert_url' => env('FIREBASE_CLIENT_X509_CERT_URL'),
];
```

---

## Best Practices

### 🔧 Development

1. **Always Test**: Test new device detection thoroughly
2. **Handle Errors**: Implement proper error handling
3. **Log Everything**: Log all device-related activities
4. **Validate Input**: Validate all device information
5. **Secure Storage**: Store device tokens securely

### 🚀 Production

1. **Monitor Performance**: Monitor notification delivery rates
2. **Rate Limiting**: Implement rate limiting for login attempts
3. **Device Cleanup**: Regularly clean up inactive devices
4. **Security Audits**: Regular security audits of device management
5. **User Education**: Educate users about device security

### 📱 Mobile App Integration

1. **Token Management**: Properly manage device tokens
2. **Background Refresh**: Handle token refresh in background
3. **Error Handling**: Handle notification errors gracefully
4. **User Experience**: Provide clear feedback to users
5. **Security Settings**: Allow users to manage their devices

---

## Changelog

### Version 1.0.0 (2025-01-15)
- Initial implementation of new device login notifications
- Enhanced login endpoint with device parameters
- Push notification integration with Firebase
- Email notification system
- Device management and tracking
- Multi-language support (English/French)
- Comprehensive logging and error handling

---

*New Device Login Notifications Documentation v1.0.0 - January 2025*
