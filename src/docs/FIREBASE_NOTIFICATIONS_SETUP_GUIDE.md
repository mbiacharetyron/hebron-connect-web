# Hebron Connect Firebase Notifications Setup Guide

## Overview

This guide explains how Firebase notifications have been set up in the Hebron Connect backend to send push notifications for various connect room events. The system is based on the comprehensive Firebase notification implementation from the h-cab-backend project.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Configuration](#configuration)
3. [Services](#services)
4. [Event Listeners](#event-listeners)
5. [Notification Types](#notification-types)
6. [Testing](#testing)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile Apps   │    │   Web Dashboard  │    │  Admin Panel    │
│                 │    │                  │    │                 │
│ • iOS App       │    │ • User Interface │    │ • Notification  │
│ • Android App   │    │ • Real-time      │    │   Management    │
│ • FCM Tokens    │    │   Updates        │    │ • Analytics     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │ Hebron Connect      │
                    │ Backend             │
                    │                     │
                    │ • FirebaseService   │
                    │ • ConnectRoom       │
                    │   NotificationService│
                    │ • Event Listeners   │
                    │ • Error Handling    │
                    └─────────────────────┘
                                 │
                    ┌─────────────────────┐
                    │   Firebase Cloud    │
                    │   Messaging (FCM)   │
                    │                     │
                    │ • Push Delivery     │
                    │ • Token Validation  │
                    │ • Analytics         │
                    └─────────────────────┘
```

### Data Flow

1. **User Registration**: Device tokens are registered when users log in
2. **Event Trigger**: Connect room events trigger notifications
3. **Event Listener**: Event listeners process the events
4. **Notification Service**: ConnectRoomNotificationService sends notifications
5. **Firebase Service**: FirebaseService handles FCM communication
6. **Error Handling**: Invalid tokens are automatically cleaned up

---

## Configuration

### Environment Variables

Add these environment variables to your `.env` file:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-hebron-connect-project-id
FIREBASE_CREDENTIALS=storage/app/hebron-connect.json
GOOGLE_APPLICATION_CREDENTIALS=storage/app/hebron-connect.json

# Optional Firebase Settings
FIREBASE_HTTP_CLIENT_TIMEOUT=30
FIREBASE_HTTP_CLIENT_PROXY=
FIREBASE_CACHE_STORE=file
FIREBASE_HTTP_LOG_CHANNEL=firebase
```

### Service Account Setup

1. **Download Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file

2. **Place Service Account File**:
   ```bash
   # Place in storage/app/ directory
   storage/app/hebron-connect.json
   ```

3. **Set Environment Variables**:
   ```bash
   FIREBASE_PROJECT_ID=your-hebron-connect-project-id
   FIREBASE_CREDENTIALS=storage/app/hebron-connect.json
   ```

### Firebase Configuration File

The system uses `config/firebase.php` for advanced configuration:

```php
<?php
return [
    'default' => env('FIREBASE_PROJECT', 'app'),
    
    'projects' => [
        'app' => [
            'credentials' => env('FIREBASE_CREDENTIALS'),
            'http_client_options' => [
                'timeout' => env('FIREBASE_HTTP_CLIENT_TIMEOUT', 30),
                'proxy' => env('FIREBASE_HTTP_CLIENT_PROXY'),
            ],
            'cache_store' => env('FIREBASE_CACHE_STORE', 'file'),
            'logging' => [
                'http_log_channel' => env('FIREBASE_HTTP_LOG_CHANNEL'),
            ],
        ],
    ],
];
```

---

## Services

### 1. FirebaseService

**Location**: `app/Services/FirebaseService.php`

**Core Methods**:

#### sendNotification()
Send notification to a single device.

```php
public function sendNotification($deviceToken, $title, $body, $data = [])
```

#### sendNotificationToMultipleDevices()
Send notification to multiple devices with error handling.

```php
public function sendNotificationToMultipleDevices($deviceTokens, $title, $body, $data = [])
```

#### sendNotificationGracefully()
Send notification without throwing exceptions.

```php
public function sendNotificationGracefully($deviceToken, $title, $body, $data = [])
```

#### handleInvalidDeviceTokens()
Automatically deactivate devices with invalid tokens.

```php
public function handleInvalidDeviceTokens($failedTokens)
```

### 2. ConnectRoomNotificationService

**Location**: `app/Services/ConnectRoomNotificationService.php`

**Core Methods**:

#### sendMemberJoinedNotification()
Send notification when a new member joins a connect room.

```php
public function sendMemberJoinedNotification(ConnectRoom $connectRoom, User $newMember)
```

#### sendActivityAddedNotification()
Send notification when a new activity is added to a connect room.

```php
public function sendActivityAddedNotification(ConnectRoom $connectRoom, array $activity, User $activityCreator)
```

#### sendAnnouncementCreatedNotification()
Send notification when a new announcement is created.

```php
public function sendAnnouncementCreatedNotification(ConnectRoom $connectRoom, array $announcement, User $creator)
```

#### sendContributionCreatedNotification()
Send notification when a new contribution is created.

```php
public function sendContributionCreatedNotification(ConnectRoom $connectRoom, array $contribution, User $creator)
```

#### sendEventCreatedNotification()
Send notification when a new event is created.

```php
public function sendEventCreatedNotification(ConnectRoom $connectRoom, array $event, User $creator)
```

#### sendJoinRequestReceivedNotification()
Send notification when a join request is received for a connect room.

```php
public function sendJoinRequestReceivedNotification(ConnectRoomJoinRequest $joinRequest, ConnectRoom $connectRoom)
```

#### sendJoinRequestStatusUpdatedNotification()
Send notification when a join request status is updated.

```php
public function sendJoinRequestStatusUpdatedNotification(ConnectRoomJoinRequest $joinRequest, ConnectRoom $connectRoom, string $status)
```

#### sendConnectRoomUpdatedNotification()
Send notification when a connect room is updated.

```php
public function sendConnectRoomUpdatedNotification(ConnectRoom $connectRoom, User $updater, array $changes = [])
```

---

## Event Listeners

### 1. SendConnectRoomMemberJoinedNotification

**Location**: `app/Listeners/SendConnectRoomMemberJoinedNotification.php`

Listens to `ConnectRoomMemberJoined` events and sends notifications to all room members.

### 2. SendConnectRoomActivityAddedNotification

**Location**: `app/Listeners/SendConnectRoomActivityAddedNotification.php`

Listens to `ConnectRoomActivityAdded` events and sends notifications to all room members.

### 3. SendConnectRoomJoinRequestReceivedNotification

**Location**: `app/Listeners/SendConnectRoomJoinRequestReceivedNotification.php`

Listens to `ConnectRoomJoinRequestReceived` events and sends notifications to room admins.

### 4. SendConnectRoomJoinRequestStatusUpdatedNotification

**Location**: `app/Listeners/SendConnectRoomJoinRequestStatusUpdatedNotification.php`

Listens to `ConnectRoomJoinRequestStatusUpdated` events and sends notifications to the requester.

### Event Registration

All event listeners are registered in `app/Providers/EventServiceProvider.php`:

```php
protected $listen = [
    ConnectRoomMemberJoined::class => [
        SendConnectRoomMemberJoinedNotification::class,
    ],
    ConnectRoomActivityAdded::class => [
        SendConnectRoomActivityAddedNotification::class,
    ],
    ConnectRoomJoinRequestReceived::class => [
        SendConnectRoomJoinRequestReceivedNotification::class,
    ],
    ConnectRoomJoinRequestStatusUpdated::class => [
        SendConnectRoomJoinRequestStatusUpdatedNotification::class,
    ],
];
```

---

## Notification Types

### 1. Member Joined Notifications

**Trigger**: When a new member joins a connect room
**Recipients**: All existing room members (excluding the new member)
**Data Payload**:
```php
[
    'type' => 'connect_room_member_joined',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'new_member_id' => '456',
    'new_member_name' => 'John Doe',
    'timestamp' => '1640995200',
    'action' => 'open_connect_room'
]
```

### 2. Activity Added Notifications

**Trigger**: When a new activity is added to a connect room
**Recipients**: All room members (excluding the activity creator)

#### Announcement Created
**Title**: "New Announcement"
**Body**: "John Doe posted an announcement: Meeting Tomorrow"
**Data Payload**:
```php
[
    'type' => 'connect_room_activity_added',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'activity_creator_id' => '456',
    'activity_creator_name' => 'John Doe',
    'activity_type' => 'announcement',
    'activity_title' => 'Meeting Tomorrow',
    'activity_id' => '789',
    'timestamp' => '1640995200',
    'action' => 'open_announcement'
]
```

#### Contribution Created
**Title**: "New Contribution Request"
**Body**: "John Doe created a contribution: Fundraising for Project"
**Data Payload**:
```php
[
    'type' => 'connect_room_activity_added',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'activity_creator_id' => '456',
    'activity_creator_name' => 'John Doe',
    'activity_type' => 'contribution',
    'activity_title' => 'Fundraising for Project',
    'activity_id' => '789',
    'timestamp' => '1640995200',
    'action' => 'open_contribution'
]
```

#### Event Created
**Title**: "New Event"
**Body**: "John Doe created an event: Community Meeting"
**Data Payload**:
```php
[
    'type' => 'connect_room_activity_added',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'activity_creator_id' => '456',
    'activity_creator_name' => 'John Doe',
    'activity_type' => 'event',
    'activity_title' => 'Community Meeting',
    'activity_id' => '789',
    'timestamp' => '1640995200',
    'action' => 'open_event'
]
```

### 3. Join Request Received Notifications

**Trigger**: When a join request is received for a connect room
**Recipients**: Room admins/creators
**Data Payload**:
```php
[
    'type' => 'connect_room_join_request_received',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'join_request_id' => '789',
    'requester_id' => '456',
    'requester_name' => 'John Doe',
    'requester_message' => 'I would like to join this room',
    'timestamp' => '1640995200',
    'action' => 'open_join_requests'
]
```

### 4. Join Request Status Updated Notifications

**Trigger**: When a join request status is updated (approved/declined)
**Recipients**: The requester
**Data Payload**:
```php
[
    'type' => 'connect_room_join_request_status_updated',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'join_request_id' => '789',
    'status' => 'approved',
    'timestamp' => '1640995200',
    'action' => 'open_connect_room'
]
```

### 5. Connect Room Updated Notifications

**Trigger**: When a connect room is updated
**Recipients**: All room members (excluding the updater)
**Data Payload**:
```php
[
    'type' => 'connect_room_updated',
    'connect_room_id' => '123',
    'connect_room_name' => 'Room Name',
    'updater_id' => '456',
    'updater_name' => 'John Doe',
    'changes' => '{"name":"Updated Room Name"}',
    'timestamp' => '1640995200',
    'action' => 'open_connect_room'
]
```

---

## Testing

### Test Notification Controller

**Location**: `app/Http/Controllers/Api/V1/TestNotificationController.php`

The test controller provides endpoints to test the notification system:

#### Send Single Notification
```http
POST /api/v1/test/notifications/single
```

**Request Body**:
```json
{
  "title": "Test Notification",
  "body": "This is a test notification",
  "device_token": "FCM_TOKEN_HERE",
  "data": {
    "type": "test",
    "action": "open_app"
  }
}
```

#### Send Multiple Notifications
```http
POST /api/v1/test/notifications/multiple
```

**Request Body**:
```json
{
  "title": "Test Notification",
  "body": "This is a test notification",
  "device_tokens": [
    "FCM_TOKEN_1",
    "FCM_TOKEN_2",
    "FCM_TOKEN_3"
  ],
  "data": {
    "type": "test",
    "action": "open_app"
  }
}
```

#### Send Connect Room Test Notification
```http
POST /api/v1/test/notifications/connect-room
```

**Request Body**:
```json
{
  "user_id": 1,
  "connect_room_id": 1,
  "notification_type": "member_joined"
}
```

**Available notification types**:
- `member_joined`
- `activity_added`
- `announcement_created`
- `contribution_created`
- `event_created`
- `join_request_received`
- `join_request_status_updated`
- `room_updated`

#### Get User Device Tokens
```http
GET /api/v1/test/notifications/user-device-tokens/{user_id}
```

---

## API Endpoints

### Test Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/test/notifications/single` | Send notification to single device |
| POST | `/api/v1/test/notifications/multiple` | Send notification to multiple devices |
| POST | `/api/v1/test/notifications/connect-room` | Send connect room test notification |
| GET | `/api/v1/test/notifications/user-device-tokens/{user_id}` | Get user's device tokens |

### Device Token Registration

Device tokens are automatically registered when users log in through the existing authentication system. The `UserDevices` model handles device token management.

---

## Troubleshooting

### Common Issues

#### 1. Invalid Registration Token

**Symptoms**:
- 400 Bad Request errors
- "Invalid FCM registration token" messages

**Solutions**:
```php
// Check token format
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $deviceToken)) {
    throw new \InvalidArgumentException('Invalid token format');
}

// Validate token length
if (strlen($deviceToken) < 100) {
    throw new \InvalidArgumentException('Token too short');
}
```

#### 2. Firebase Configuration Issues

**Symptoms**:
- 401 Unauthorized errors
- 403 Forbidden errors

**Solutions**:
```bash
# Check service account file
ls -la storage/app/hebron-connect.json

# Verify environment variables
php artisan tinker
>>> env('FIREBASE_PROJECT_ID')
>>> env('FIREBASE_CREDENTIALS')

# Test Firebase connection
php artisan tinker
>>> $firebase = app(\App\Services\FirebaseService::class);
>>> $firebase->sendNotification('test_token', 'Test', 'Test message');
```

#### 3. High Failure Rates

**Symptoms**:
- Many failed notifications
- Poor delivery rates

**Solutions**:
```php
// Implement token refresh mechanism
public function refreshDeviceTokens()
{
    $staleTokens = UserDevices::where('last_active_at', '<', now()->subDays(30))
        ->where('is_active', true)
        ->get();
    
    foreach ($staleTokens as $device) {
        // Test token validity
        try {
            $this->firebaseService->sendNotification(
                $device->device_token,
                'Token Test',
                'Testing token validity'
            );
        } catch (\Exception $e) {
            // Mark as inactive if test fails
            $device->update(['is_active' => false]);
        }
    }
}
```

### Debug Commands

#### Test Firebase Connection
```bash
php artisan tinker
>>> $firebase = app(\App\Services\FirebaseService::class);
>>> $firebase->sendNotification('test_token', 'Test', 'Test message');
```

#### Check Device Tokens
```sql
-- Check active devices
SELECT COUNT(*) as active_devices FROM user_devices WHERE is_active = 1;

-- Check device types
SELECT device_type, COUNT(*) as count FROM user_devices WHERE is_active = 1 GROUP BY device_type;

-- Check recent devices
SELECT COUNT(*) as recent_devices FROM user_devices WHERE last_active_at >= DATE_SUB(NOW(), INTERVAL 7 DAY);
```

#### Monitor Notification Logs
```bash
# Check recent notification logs
tail -f storage/logs/laravel.log | grep "FCM"

# Check error logs
tail -f storage/logs/laravel.log | grep "Failed to send notification"
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_user_devices_active ON user_devices(is_active);
CREATE INDEX idx_user_devices_user_active ON user_devices(user_id, is_active);
```

#### 2. Caching
```php
// Cache active device tokens
public function getActiveDeviceTokens($userId)
{
    return Cache::remember("user_devices_{$userId}", 300, function() use ($userId) {
        return UserDevices::where('user_id', $userId)
            ->where('is_active', true)
            ->pluck('device_token')
            ->toArray();
    });
}
```

#### 3. Queue Processing
```php
// Use queues for large notification batches
dispatch(new SendBulkNotifications($deviceTokens, $title, $body, $data));

// In the job class
class SendBulkNotifications implements ShouldQueue
{
    public function handle()
    {
        $firebaseService = app(FirebaseService::class);
        
        $results = $firebaseService->sendNotificationToMultipleDevices(
            $this->deviceTokens,
            $this->title,
            $this->body,
            $this->data
        );
        
        // Log results
        $this->logResults($results);
    }
}
```

---

## Security Considerations

### 1. Token Security
- Never log full device tokens
- Validate token format before sending
- Implement token rotation mechanism
- Monitor for token abuse

### 2. Content Security
- Sanitize notification content
- Validate data payload
- Implement content filtering
- Monitor for spam patterns

### 3. Rate Limiting
- Implement user-level rate limits
- Add IP-based rate limiting
- Monitor for abuse patterns
- Implement automatic blocking

### 4. Privacy Compliance
- Respect user notification preferences
- Implement opt-out mechanisms
- Log minimal necessary data
- Comply with GDPR/CCPA requirements

---

## Integration with Existing Events

The notification system is automatically integrated with existing connect room events:

1. **ConnectRoomMemberJoined** - Triggers member joined notifications
2. **ConnectRoomActivityAdded** - Triggers activity added notifications
3. **ConnectRoomJoinRequestReceived** - Triggers join request received notifications
4. **ConnectRoomJoinRequestStatusUpdated** - Triggers join request status updated notifications

No changes are required to existing event dispatching code. The notifications will be sent automatically when these events are fired.

---

*Firebase Notifications Setup Guide v1.0 - January 2025*
