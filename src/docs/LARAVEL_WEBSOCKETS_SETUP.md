# Laravel WebSockets Setup Guide

This guide shows how to replace Pusher with Laravel WebSockets for a completely free real-time broadcasting solution.

## Step 1: Install Laravel WebSockets

```bash
# Install the package
composer require beyondcode/laravel-websockets

# Publish the migration
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrate"

# Run the migration
php artisan migrate

# Publish the config file
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
```

## Step 2: Update Environment Configuration

Update your `.env` file:

```env
# Broadcasting Configuration
BROADCAST_DRIVER=pusher

# Laravel WebSockets Configuration (FREE alternative to Pusher)
PUSHER_APP_ID=local
PUSHER_APP_KEY=local
PUSHER_APP_SECRET=local
PUSHER_APP_CLUSTER=mt1

# WebSocket Server Configuration
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http

# For production, use your server's IP
# PUSHER_HOST=your-server-ip
# PUSHER_SCHEME=https
```

## Step 3: Configure WebSockets

Update `config/websockets.php`:

```php
<?php

return [
    'apps' => [
        [
            'id' => env('PUSHER_APP_ID', 'local'),
            'name' => env('APP_NAME', 'Hebron Connect'),
            'key' => env('PUSHER_APP_KEY', 'local'),
            'secret' => env('PUSHER_APP_SECRET', 'local'),
            'path' => env('PUSHER_APP_PATH'),
            'capacity' => null,
            'enable_client_messages' => false,
            'enable_statistics' => true,
        ],
    ],

    'ssl' => [
        'local_cert' => env('PUSHER_APP_SSL_CERT', ''),
        'local_pk' => env('PUSHER_APP_SSL_KEY', ''),
        'passphrase' => env('PUSHER_APP_SSL_PASSPHRASE', ''),
        'verify_peer' => false,
    ],

    'statistics' => [
        'model' => \BeyondCode\LaravelWebSockets\Statistics\Models\WebSocketsStatisticsEntry::class,
    ],

    'maximum_request_size_in_kb' => 250,
];
```

## Step 4: Start the WebSocket Server

### Development (Local)

```bash
# Start the WebSocket server
php artisan websockets:serve

# The server will run on http://localhost:6001
```

### Production (Using Supervisor)

Create a supervisor configuration file:

```ini
# /etc/supervisor/conf.d/websockets.conf
[program:websockets]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/your/app/artisan websockets:serve --host=0.0.0.0 --port=6001
directory=/path/to/your/app
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=1
redirect_stderr=true
stdout_logfile=/path/to/your/app/storage/logs/websockets.log
stopwaitsecs=3600
```

Then run:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start websockets:*
```

## Step 5: Update Flutter App Configuration

Update your Flutter app to connect to your Laravel WebSocket server:

```dart
// lib/config/app_config.dart
class AppConfig {
  // Laravel WebSockets Configuration
  static const String pusherAppKey = 'local';
  static const String pusherCluster = 'mt1';
  static const String websocketHost = 'ws://your-server-ip:6001';
  
  // For production with SSL
  // static const String websocketHost = 'wss://your-domain.com:6001';
}
```

```dart
// lib/services/realtime_service.dart
import 'dart:convert';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import '../config/app_config.dart';

class RealtimeService {
  static final RealtimeService _instance = RealtimeService._internal();
  factory RealtimeService() => _instance;
  RealtimeService._internal();

  PusherChannelsFlutter? _pusher;
  bool _isConnected = false;
  final Map<String, Function(Map<String, dynamic>)> _eventHandlers = {};

  Future<void> initialize() async {
    await _initializePusher();
  }

  Future<void> _initializePusher() async {
    try {
      _pusher = PusherChannelsFlutter.getInstance();
      
      await _pusher!.init(
        apiKey: AppConfig.pusherAppKey,
        cluster: AppConfig.pusherCluster,
        hostEndPoint: AppConfig.websocketHost,
        onConnectionStateChange: _onConnectionStateChange,
        onError: _onError,
        onSubscriptionSucceeded: _onSubscriptionSucceeded,
        onSubscriptionError: _onSubscriptionError,
        onEvent: _onEvent,
        onDecryptionFailure: _onDecryptionFailure,
        onMemberAdded: _onMemberAdded,
        onMemberRemoved: _onMemberRemoved,
      );

      await _pusher!.connect();
    } catch (e) {
      print('WebSocket initialization error: $e');
    }
  }

  // ... rest of your existing methods remain the same
}
```

## Step 6: Test the Implementation

### 1. Test WebSocket Server

Visit `http://your-server:6001` in your browser to see the WebSocket dashboard.

### 2. Test Broadcasting

Create a test route:

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
        
        return 'Broadcast sent to WebSocket server!';
    }
    
    return 'Room or user not found';
});
```

### 3. Test Flutter App

1. Start your Flutter app
2. Subscribe to a connect room
3. Visit the test route in your browser
4. Verify the event is received in your Flutter app

## Step 7: Production Considerations

### 1. SSL/HTTPS Setup

For production, you'll want to use SSL:

```bash
# Generate SSL certificates (if self-signed)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Update .env
PUSHER_APP_SSL_CERT=/path/to/cert.pem
PUSHER_APP_SSL_KEY=/path/to/key.pem
PUSHER_SCHEME=https
```

### 2. Nginx Configuration

```nginx
# /etc/nginx/sites-available/your-site
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://127.0.0.1:6001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Firewall Configuration

```bash
# Allow WebSocket port
sudo ufw allow 6001

# Or if using Nginx proxy, only allow 443
sudo ufw allow 443
```

## Step 8: Monitoring and Logs

### 1. WebSocket Logs

```bash
# View WebSocket logs
tail -f storage/logs/websockets.log

# View Laravel logs
tail -f storage/logs/laravel.log
```

### 2. WebSocket Dashboard

Access the dashboard at `http://your-server:6001` to monitor:
- Active connections
- Message statistics
- Channel activity
- Connection errors

## Benefits of Laravel WebSockets

1. **Completely FREE** - No monthly costs
2. **Self-hosted** - Full control over your data
3. **Laravel Native** - Perfect integration with Laravel
4. **Same API** - Drop-in replacement for Pusher
5. **Scalable** - Can handle thousands of connections
6. **Dashboard** - Built-in monitoring and statistics
7. **SSL Support** - Secure connections for production

## Troubleshooting

### Common Issues

1. **WebSocket server not starting**
   ```bash
   # Check if port 6001 is available
   netstat -tulpn | grep 6001
   
   # Kill any process using the port
   sudo kill -9 $(lsof -t -i:6001)
   ```

2. **Flutter app can't connect**
   - Check server IP address
   - Verify firewall settings
   - Test connection in browser first

3. **Events not broadcasting**
   - Ensure queue worker is running
   - Check Laravel logs for errors
   - Verify WebSocket server is running

### Debug Commands

```bash
# Check WebSocket server status
php artisan websockets:serve --debug

# Test broadcasting
php artisan tinker
>>> broadcast(new App\Events\ConnectRoomJoinRequestReceived($request, $room));

# Check queue status
php artisan queue:work --verbose
```

This setup gives you a completely free, self-hosted real-time broadcasting solution that's perfect for your Hebron Connect app!
