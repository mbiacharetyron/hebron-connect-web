# Join Request Notifications Documentation

## Overview

This documentation covers the enhanced join request notification system for Hebron Connect. When users request to join a connect room, notifications are automatically sent to all admins and owners of the room. Additionally, when join requests are approved or rejected, notifications are sent to the requester.

## Table of Contents

1. [Features](#features)
2. [Notification Flow](#notification-flow)
3. [API Integration](#api-integration)
4. [Notification Types](#notification-types)
5. [Recipients](#recipients)
6. [Implementation Details](#implementation-details)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Features

### 🔔 Join Request Notifications
- **Real-time Alerts**: Instant notifications when someone requests to join
- **Multi-recipient**: Notifications sent to all admins and owners
- **Rich Information**: Includes requester details and room information
- **Action-oriented**: Direct links to manage join requests

### 📱 Status Update Notifications
- **Approval Notifications**: Notify requester when request is approved
- **Rejection Notifications**: Notify requester when request is rejected
- **Immediate Feedback**: Real-time status updates
- **Clear Messaging**: Clear indication of request outcome

### 🌐 Multi-channel Delivery
- **Push Notifications**: Real-time mobile notifications
- **Email Notifications**: Email alerts for admins and owners
- **Consistent Messaging**: Same information across all channels
- **Reliable Delivery**: Fallback mechanisms for failed deliveries

---

## Notification Flow

### Join Request Received Flow

```mermaid
graph TD
    A[User Submits Join Request] --> B[Create Join Request Record]
    B --> C[Get Room Admins & Owner]
    C --> D[Send Email Notifications]
    D --> E[Send Push Notifications]
    E --> F[Log Notification Results]
    F --> G[Return Success Response]
    
    D --> H[Email Service]
    E --> I[Firebase Service]
    H --> J[Admin/Owner Email]
    I --> K[Admin/Owner Device]
```

### Join Request Status Update Flow

```mermaid
graph TD
    A[Admin Approves/Rejects Request] --> B[Update Request Status]
    B --> C[Send Status Notification]
    C --> D[Push Notification to Requester]
    D --> E[Log Notification Results]
    E --> F[Return Success Response]
    
    C --> G[Firebase Service]
    G --> H[Requester Device]
```

---

## API Integration

### Join Request Creation

The existing join request endpoint now includes push notifications:

```http
POST /api/v1/connect-room/{room}/join-request
Content-Type: application/json
Authorization: Bearer {token}

{
    "answers": {
        "question_id_1": "Answer 1",
        "question_id_2": "Answer 2"
    }
}
```

**Response**: Same as before, but now includes push notifications to admins/owners.

### Join Request Approval

```http
POST /api/v1/connect-room/join-requests/{request}/approve
Authorization: Bearer {token}
```

**Response**: Same as before, but now includes push notification to requester.

### Join Request Rejection

```http
POST /api/v1/connect-room/join-requests/{request}/reject
Authorization: Bearer {token}
```

**Response**: Same as before, but now includes push notification to requester.

---

## Notification Types

### 1. Join Request Received (to Admins/Owners)

#### Push Notification
- **Title**: "New Join Request"
- **Body**: "{Requester Name} wants to join {Room Name}"
- **Data Payload**:
```json
{
    "type": "connect_room_join_request_received",
    "connect_room_id": "123",
    "connect_room_name": "Tech Enthusiasts",
    "join_request_id": "456",
    "requester_id": "789",
    "requester_name": "John Doe",
    "requester_message": "I would like to join this room",
    "timestamp": "1705312200",
    "action": "open_join_requests"
}
```

#### Email Notification
- **Subject**: "New Join Request for {Room Name}"
- **Content**: Includes requester details, room information, and direct link to manage requests

### 2. Join Request Approved (to Requester)

#### Push Notification
- **Title**: "Join Request Approved"
- **Body**: "Your request to join {Room Name} has been approved"
- **Data Payload**:
```json
{
    "type": "connect_room_join_request_status_updated",
    "connect_room_id": "123",
    "connect_room_name": "Tech Enthusiasts",
    "join_request_id": "456",
    "status": "approved",
    "timestamp": "1705312200",
    "action": "open_connect_room"
}
```

### 3. Join Request Rejected (to Requester)

#### Push Notification
- **Title**: "Join Request Declined"
- **Body**: "Your request to join {Room Name} has been declined"
- **Data Payload**:
```json
{
    "type": "connect_room_join_request_status_updated",
    "connect_room_id": "123",
    "connect_room_name": "Tech Enthusiasts",
    "join_request_id": "456",
    "status": "rejected",
    "timestamp": "1705312200",
    "action": "open_join_requests"
}
```

---

## Recipients

### Join Request Received Notifications

#### Primary Recipients
- **Room Owner**: The user who created the connect room
- **Room Admins**: All users with admin role in the room
- **Multiple Devices**: Each recipient receives notifications on all their active devices

#### Recipient Selection Logic
```php
// Get all admins and the owner
$adminIds = $connectRoom->admins->pluck('user_id')->toArray();
$ownerId = $connectRoom->owner_id;

// Combine admin IDs and owner ID, remove duplicates
$recipientIds = array_unique(array_merge($adminIds, [$ownerId]));
```

### Status Update Notifications

#### Primary Recipients
- **Requester**: The user who submitted the join request
- **Single Device**: Notifications sent to requester's active devices

---

## Implementation Details

### Enhanced ConnectRoomJoinRequestController

#### New Dependencies
```php
use App\Services\ConnectRoomNotificationService;

class ConnectRoomJoinRequestController extends Controller
{
    protected $notificationService;

    public function __construct(ConnectRoomNotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
}
```

#### Join Request Creation Enhancement
```php
// Send push notifications to admins and owners
try {
    $this->notificationService->sendJoinRequestReceivedNotification($joinRequest, $room);
    Log::info('Join request push notifications sent to admins and owners', [
        'request_id' => $joinRequest->id,
        'room_id' => $room->id,
        'user_id' => $user->id,
        'recipients_count' => $recipients->count()
    ]);
} catch (\Exception $e) {
    Log::error('Failed to send join request push notifications', [
        'request_id' => $joinRequest->id,
        'room_id' => $room->id,
        'user_id' => $user->id,
        'error' => $e->getMessage()
    ]);
}
```

#### Approval Enhancement
```php
// Send push notification to the requester
try {
    $connectRoom = ConnectRoom::find($request->connect_room_id);
    if ($connectRoom) {
        $this->notificationService->sendJoinRequestStatusUpdatedNotification($request, $connectRoom, 'approved');
        Log::info('Join request approval notification sent to requester', [
            'request_id' => $request->id,
            'requester_id' => $request->user_id
        ]);
    }
} catch (\Exception $e) {
    Log::error('Failed to send join request approval notification', [
        'request_id' => $request->id,
        'requester_id' => $request->user_id,
        'error' => $e->getMessage()
    ]);
}
```

### Enhanced ConnectRoomNotificationService

#### Improved Recipient Selection
```php
public function sendJoinRequestReceivedNotification(ConnectRoomJoinRequest $joinRequest, ConnectRoom $connectRoom)
{
    try {
        // Get all admins and the owner
        $adminIds = $connectRoom->admins->pluck('user_id')->toArray();
        $ownerId = $connectRoom->owner_id;
        
        // Combine admin IDs and owner ID, remove duplicates
        $recipientIds = array_unique(array_merge($adminIds, [$ownerId]));
        
        if (empty($recipientIds)) {
            Log::warning('No admins or owner found for connect room', [
                'connect_room_id' => $connectRoom->id
            ]);
            return;
        }

        $deviceTokens = $this->getDeviceTokensForUsers($recipientIds);
        // ... rest of the method
    }
}
```

---

## Testing

### Manual Testing

#### Test Join Request Notifications
```bash
# 1. Create a join request
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/123/join-request" \
  -H "Authorization: Bearer {requester_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
        "1": "I am interested in this room"
    }
  }'

# Expected: Push notifications sent to all admins and owners
```

#### Test Approval Notifications
```bash
# 2. Approve the request (as admin/owner)
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/join-requests/456/approve" \
  -H "Authorization: Bearer {admin_token}"

# Expected: Push notification sent to requester
```

#### Test Rejection Notifications
```bash
# 3. Reject a request (as admin/owner)
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/join-requests/456/reject" \
  -H "Authorization: Bearer {admin_token}"

# Expected: Push notification sent to requester
```

### Automated Testing

#### Unit Tests
```php
// Test join request notification to admins/owners
public function test_join_request_notification_to_admins()
{
    $room = ConnectRoom::factory()->create();
    $admin = User::factory()->create();
    $requester = User::factory()->create();
    
    // Add admin to room
    $room->admins()->create(['user_id' => $admin->id]);
    
    // Mock Firebase service
    $this->mock(FirebaseService::class, function ($mock) {
        $mock->shouldReceive('sendNotificationToMultipleDevices')
            ->once()
            ->andReturn(['successful' => [], 'failed' => []]);
    });
    
    // Create join request
    $joinRequest = ConnectRoomJoinRequest::create([
        'connect_room_id' => $room->id,
        'user_id' => $requester->id
    ]);
    
    // Test notification service
    $notificationService = app(ConnectRoomNotificationService::class);
    $result = $notificationService->sendJoinRequestReceivedNotification($joinRequest, $room);
    
    $this->assertNotNull($result);
}

// Test approval notification to requester
public function test_approval_notification_to_requester()
{
    $room = ConnectRoom::factory()->create();
    $requester = User::factory()->create();
    
    $joinRequest = ConnectRoomJoinRequest::create([
        'connect_room_id' => $room->id,
        'user_id' => $requester->id
    ]);
    
    // Mock Firebase service
    $this->mock(FirebaseService::class, function ($mock) {
        $mock->shouldReceive('sendNotificationToMultipleDevices')
            ->once()
            ->andReturn(['successful' => [], 'failed' => []]);
    });
    
    // Test notification service
    $notificationService = app(ConnectRoomNotificationService::class);
    $result = $notificationService->sendJoinRequestStatusUpdatedNotification($joinRequest, $room, 'approved');
    
    $this->assertNotNull($result);
}
```

#### Integration Tests
```php
// Test complete join request flow
public function test_complete_join_request_flow()
{
    $room = ConnectRoom::factory()->create();
    $admin = User::factory()->create();
    $requester = User::factory()->create();
    
    // Add admin to room
    $room->admins()->create(['user_id' => $admin->id]);
    
    // Mock Firebase service
    $this->mock(FirebaseService::class, function ($mock) {
        $mock->shouldReceive('sendNotificationToMultipleDevices')
            ->twice() // Once for join request, once for approval
            ->andReturn(['successful' => [], 'failed' => []]);
    });
    
    // 1. Create join request
    $response = $this->postJson("/api/v1/connect-room/{$room->id}/join-request", [], [
        'Authorization' => 'Bearer ' . $requester->createToken('test')->accessToken
    ]);
    
    $response->assertStatus(201);
    
    // 2. Approve request
    $joinRequest = ConnectRoomJoinRequest::where('connect_room_id', $room->id)
        ->where('user_id', $requester->id)
        ->first();
    
    $response = $this->postJson("/api/v1/connect-room/join-requests/{$joinRequest->id}/approve", [], [
        'Authorization' => 'Bearer ' . $admin->createToken('test')->accessToken
    ]);
    
    $response->assertStatus(200);
}
```

---

## Troubleshooting

### Common Issues

#### 1. Notifications Not Sent to Admins/Owners
**Symptoms**: Join request created but no notifications received
**Causes**:
- No admins assigned to room
- Room owner not found
- Invalid device tokens
- Firebase service issues

**Solutions**:
- Verify room has admins and owner
- Check device token validity
- Verify Firebase configuration
- Check application logs

#### 2. Status Update Notifications Not Sent
**Symptoms**: Request approved/rejected but requester not notified
**Causes**:
- Requester has no active devices
- Invalid requester device tokens
- Firebase service failures

**Solutions**:
- Check requester's device tokens
- Verify Firebase service status
- Check notification service logs

#### 3. Duplicate Notifications
**Symptoms**: Multiple notifications for same event
**Causes**:
- Race conditions in notification sending
- Multiple API calls
- Event listener duplication

**Solutions**:
- Implement notification deduplication
- Add request locking mechanisms
- Review event listener configuration

### Debugging

#### Enable Debug Logging
```php
// In config/logging.php
'channels' => [
    'join_request_notifications' => [
        'driver' => 'single',
        'path' => storage_path('logs/join_request_notifications.log'),
        'level' => 'debug',
    ],
],
```

#### Check Notification Logs
```bash
# Monitor join request notifications
tail -f storage/logs/join_request_notifications.log

# Monitor general application logs
tail -f storage/logs/laravel.log | grep "join request"
```

#### Verify Recipients
```php
// Check room admins and owner
$room = ConnectRoom::find($roomId);
$admins = $room->admins;
$owner = $room->owner;

echo "Admins: " . $admins->count() . "\n";
echo "Owner: " . ($owner ? $owner->name : 'None') . "\n";

// Check device tokens
foreach ($admins as $admin) {
    $tokens = $admin->user->activeDevices()->pluck('device_token');
    echo "Admin {$admin->user->name}: {$tokens->count()} devices\n";
}
```

#### Test Firebase Service
```php
// Test Firebase service directly
$firebaseService = app(FirebaseService::class);
$result = $firebaseService->sendNotification(
    'test_device_token',
    'Test Title',
    'Test Body',
    ['type' => 'test']
);

var_dump($result);
```

---

## Configuration

### Environment Variables

```env
# Firebase Configuration (required for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email

# Email Configuration (for email notifications)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@hebronconnect.com
MAIL_FROM_NAME="Hebron Connect"
```

### Service Configuration

```php
// config/services.php
'firebase' => [
    'project_id' => env('FIREBASE_PROJECT_ID'),
    'private_key_id' => env('FIREBASE_PRIVATE_KEY_ID'),
    'private_key' => env('FIREBASE_PRIVATE_KEY'),
    'client_email' => env('FIREBASE_CLIENT_EMAIL'),
    'client_id' => env('FIREBASE_CLIENT_ID'),
    'auth_uri' => env('FIREBASE_AUTH_URI'),
    'token_uri' => env('FIREBASE_TOKEN_URI'),
    'auth_provider_x509_cert_url' => env('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
    'client_x509_cert_url' => env('FIREBASE_CLIENT_X509_CERT_URL'),
],
```

---

## Best Practices

### 🔧 Development

1. **Error Handling**: Always wrap notification calls in try-catch blocks
2. **Logging**: Log all notification attempts and results
3. **Testing**: Test both success and failure scenarios
4. **Validation**: Validate recipient data before sending notifications
5. **Performance**: Use batch notifications for multiple recipients

### 🚀 Production

1. **Monitoring**: Monitor notification delivery rates
2. **Fallbacks**: Implement fallback mechanisms for failed notifications
3. **Rate Limiting**: Implement rate limiting for notification endpoints
4. **Analytics**: Track notification engagement metrics
5. **User Preferences**: Allow users to customize notification preferences

### 📱 Mobile App Integration

1. **Token Management**: Properly manage device tokens
2. **Background Handling**: Handle notifications when app is in background
3. **Deep Linking**: Implement deep linking for notification actions
4. **User Experience**: Provide clear feedback for notification actions
5. **Settings**: Allow users to manage notification preferences

---

## Changelog

### Version 1.0.0 (2025-01-15)
- Initial implementation of join request notifications
- Enhanced ConnectRoomJoinRequestController with notification service
- Push notifications to admins and owners for new join requests
- Push notifications to requesters for status updates
- Comprehensive error handling and logging
- Multi-recipient notification support
- Integration with existing email notification system

---

*Join Request Notifications Documentation v1.0.0 - January 2025*
