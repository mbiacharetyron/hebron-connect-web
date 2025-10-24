# Real-time Broadcasting Setup Guide

This guide provides complete instructions for setting up real-time broadcasting in your Hebron Connect Laravel backend and Flutter mobile app.

## Table of Contents
1. [Laravel Backend Setup](#laravel-backend-setup)
2. [Environment Configuration](#environment-configuration)
3. [Testing the Implementation](#testing-the-implementation)
4. [Flutter App Setup](#flutter-app-setup)
5. [Troubleshooting](#troubleshooting)

## Laravel Backend Setup

### 1. Install Required Packages

Run these commands in your Laravel project root:

```bash
composer require pusher/pusher-php-server
composer require laravel/echo
```

### 2. Environment Configuration

Add these variables to your `.env` file:

```env
# Broadcasting Configuration
BROADCAST_DRIVER=pusher

# Pusher Configuration
PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_SECRET=your_pusher_app_secret
PUSHER_APP_CLUSTER=your_pusher_cluster

# Optional: Custom Pusher host (for self-hosted Pusher)
# PUSHER_HOST=
# PUSHER_PORT=443
# PUSHER_SCHEME=https
```

### 3. Pusher Account Setup

1. Go to [Pusher.com](https://pusher.com) and create an account
2. Create a new app in your Pusher dashboard
3. Copy the App ID, Key, Secret, and Cluster from your app settings
4. Update your `.env` file with these values

### 4. Queue Configuration

Since broadcasting events are queued, make sure your queue is running:

```bash
# Start the queue worker
php artisan queue:work

# Or use supervisor for production
# See Laravel documentation for supervisor configuration
```

### 5. Broadcasting Routes

The broadcasting configuration is already set up in `config/broadcasting.php`. The events will be broadcasted to these channels:

- `private-connect-room.{roomId}.members` - For room members
- `private-connect-room.{roomId}.admin` - For room admins/owners
- `private-user.{userId}` - For specific user notifications

### 6. Authentication for Private Channels

Laravel automatically handles authentication for private channels using your existing API authentication. Make sure your Flutter app sends the authentication token when subscribing to private channels.

## Environment Configuration

### Laravel .env Example

```env
APP_NAME="Hebron Connect"
APP_ENV=local
APP_KEY=base64:your_app_key
APP_DEBUG=true
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hebron_connect
DB_USERNAME=root
DB_PASSWORD=

# Broadcasting
BROADCAST_DRIVER=pusher

# Pusher
PUSHER_APP_ID=1234567
PUSHER_APP_KEY=abcdef123456
PUSHER_APP_SECRET=your_secret_key
PUSHER_APP_CLUSTER=mt1

# Queue
QUEUE_CONNECTION=database
```

### Flutter Environment

Create a configuration file in your Flutter app:

```dart
// lib/config/app_config.dart
class AppConfig {
  // Pusher Configuration
  static const String pusherAppKey = 'abcdef123456';
  static const String pusherCluster = 'mt1';
  
  // API Configuration
  static const String apiBaseUrl = 'http://your-api-url.com/api/v1';
  static const String apiToken = 'your_api_token'; // Get from login
}
```

## Testing the Implementation

### 1. Test Broadcasting from Laravel

Create a test route to manually trigger events:

```php
// routes/web.php
Route::get('/test-broadcast/{roomId}', function ($roomId) {
    $room = \App\Models\ConnectRoom::find($roomId);
    $user = \App\Models\User::first();
    
    if ($room && $user) {
        // Test join request event
        broadcast(new \App\Events\ConnectRoomJoinRequestReceived(
            new \App\Models\ConnectRoomJoinRequest([
                'user_id' => $user->id,
                'connect_room_id' => $room->id,
                'status' => 'pending',
                'message' => 'Test join request'
            ]),
            $room
        ));
        
        return 'Broadcast sent!';
    }
    
    return 'Room or user not found';
});
```

### 2. Test with Pusher Debug Console

1. Go to your Pusher app dashboard
2. Navigate to the "Debug Console" tab
3. Subscribe to your channels and watch for events
4. Trigger events from your Laravel app
5. Verify events appear in the debug console

### 3. Test Flutter App

1. Run your Flutter app
2. Subscribe to a connect room
3. Trigger events from the Laravel backend
4. Verify notifications and UI updates in the Flutter app

## Flutter App Setup

### 1. Dependencies

Add to `pubspec.yaml`:

```yaml
dependencies:
  pusher_channels_flutter: ^2.2.1
  flutter_local_notifications: ^16.3.2
  permission_handler: ^11.3.1
  http: ^1.1.0
  shared_preferences: ^2.2.2
```

### 2. Android Permissions

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### 3. iOS Permissions

Add to `ios/Runner/Info.plist`:

```xml
<key>UIBackgroundModes</key>
<array>
    <string>fetch</string>
    <string>remote-notification</string>
</array>
```

### 4. Initialize in Main App

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'services/realtime_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize real-time service
  await RealtimeService().initialize();
  
  runApp(MyApp());
}
```

## Event Types and Data Structure

### Join Request Events

**Event:** `join-request.received`
**Channel:** `private-connect-room.{roomId}.admin`
**Data:**
```json
{
  "id": 1,
  "user_id": 123,
  "connect_room_id": 456,
  "status": "pending",
  "message": "I would like to join this room",
  "created_at": "2024-01-15T10:30:00Z",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "connect_room": {
    "id": 456,
    "name": "Tech Enthusiasts",
    "description": "A room for tech discussions"
  }
}
```

### Document Events

**Event:** `document.added`
**Channel:** `private-connect-room.{roomId}.members`
**Data:**
```json
{
  "id": 1,
  "title": "Meeting Notes",
  "description": "Notes from today's meeting",
  "file_path": "documents/meeting_notes.pdf",
  "file_size": 1024000,
  "file_type": "pdf",
  "connect_room_id": 456,
  "uploaded_by": 123,
  "created_at": "2024-01-15T10:30:00Z",
  "uploader": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "connect_room": {
    "id": 456,
    "name": "Tech Enthusiasts"
  }
}
```

### Activity Events

**Event:** `activity.added` / `activity.updated`
**Channel:** `private-connect-room.{roomId}.members`
**Data:**
```json
{
  "activity": {
    "type": "announcement",
    "id": 1,
    "title": "Important Update",
    "description": "Please read this important announcement",
    "is_pinned": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "connect_room": {
    "id": 456,
    "name": "Tech Enthusiasts"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Troubleshooting

### Common Issues

1. **Events not being received in Flutter**
   - Check if Pusher connection is established
   - Verify channel subscription
   - Check authentication token
   - Ensure queue worker is running

2. **Authentication errors**
   - Verify API token is valid
   - Check Laravel authentication middleware
   - Ensure user has permission to access the channel

3. **Queue not processing**
   - Start queue worker: `php artisan queue:work`
   - Check queue configuration in `.env`
   - Monitor queue logs

4. **Pusher connection issues**
   - Verify Pusher credentials in `.env`
   - Check network connectivity
   - Test with Pusher debug console

### Debug Commands

```bash
# Check queue status
php artisan queue:work --verbose

# Clear failed jobs
php artisan queue:flush

# Test broadcasting
php artisan tinker
>>> broadcast(new App\Events\ConnectRoomJoinRequestReceived($request, $room));

# Check logs
tail -f storage/logs/laravel.log
```

### Monitoring

1. **Laravel Logs**
   - Check `storage/logs/laravel.log` for broadcasting errors
   - Monitor queue processing logs

2. **Pusher Dashboard**
   - Monitor connection statistics
   - Check message delivery rates
   - Review error logs

3. **Flutter Debug Console**
   - Enable verbose logging in Pusher client
   - Check connection state changes
   - Monitor event reception

## Production Considerations

### 1. Queue Management

Use a process manager like Supervisor for production:

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/app/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/path/to/your/app/worker.log
stopwaitsecs=3600
```

### 2. Pusher Scaling

- Consider Pusher's pricing plans for production
- Monitor usage and scale accordingly
- Set up webhooks for delivery confirmations

### 3. Error Handling

- Implement retry mechanisms for failed broadcasts
- Set up monitoring and alerting
- Handle network disconnections gracefully

### 4. Security

- Use HTTPS in production
- Validate all broadcasted data
- Implement rate limiting for broadcast events
- Regularly rotate Pusher credentials

This setup provides a robust real-time communication system between your Laravel backend and Flutter mobile app, enabling instant notifications and updates for all connect room activities.
