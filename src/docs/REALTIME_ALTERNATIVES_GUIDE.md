# Real-time Broadcasting Alternatives Guide

Since Pusher can be expensive, here are several cost-effective alternatives for implementing real-time broadcasting in your Hebron Connect app.

## Table of Contents
1. [Free/Open Source Alternatives](#freeopen-source-alternatives)
2. [Low-Cost Commercial Alternatives](#low-cost-commercial-alternatives)
3. [Self-Hosted Solutions](#self-hosted-solutions)
4. [Implementation Examples](#implementation-examples)
5. [Cost Comparison](#cost-comparison)

## Free/Open Source Alternatives

### 1. Laravel WebSockets (Recommended for Laravel)

**Cost**: Completely FREE
**Best for**: Laravel applications (perfect for your use case)

Laravel WebSockets is a drop-in Pusher replacement that uses native WebSockets.

#### Setup:

```bash
# Install Laravel WebSockets
composer require beyondcode/laravel-websockets

# Publish configuration
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrate"

# Run migrations
php artisan migrate

# Publish config
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="config"
```

#### Configuration:

Update your `.env`:
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=local
PUSHER_APP_KEY=local
PUSHER_APP_SECRET=local
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

#### Start WebSocket Server:

```bash
php artisan websockets:serve
```

#### Flutter Implementation:

```dart
// Use the same Pusher client with local configuration
await _pusher!.init(
  apiKey: "local",
  cluster: "mt1",
  hostEndPoint: "ws://your-server-ip:6001",
  // ... rest of configuration
);
```

### 2. Socket.IO with Laravel

**Cost**: FREE
**Best for**: Custom WebSocket implementation

#### Laravel Backend Setup:

```bash
# Install Socket.IO server
npm install socket.io

# Install Laravel Socket.IO package
composer require pusher/pusher-php-server
```

#### Node.js Socket.IO Server:

```javascript
// socket-server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JWT token here
  if (token) {
    socket.userId = getUserIdFromToken(token);
    next();
  } else {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);
  
  // Join room channels
  socket.on('join-room', (roomId) => {
    socket.join(`room-${roomId}`);
    socket.join(`room-${roomId}-admin`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// Function to broadcast events from Laravel
function broadcastToRoom(roomId, event, data) {
  io.to(`room-${roomId}`).emit(event, data);
}

function broadcastToRoomAdmins(roomId, event, data) {
  io.to(`room-${roomId}-admin`).emit(event, data);
}

server.listen(3000, () => {
  console.log('Socket.IO server running on port 3000');
});
```

#### Laravel Integration:

```php
// app/Services/SocketIOService.php
<?php

namespace App\Services;

use GuzzleHttp\Client;

class SocketIOService
{
    private $client;
    private $socketUrl;

    public function __construct()
    {
        $this->client = new Client();
        $this->socketUrl = env('SOCKET_IO_URL', 'http://localhost:3000');
    }

    public function broadcastToRoom($roomId, $event, $data)
    {
        try {
            $this->client->post($this->socketUrl . '/broadcast', [
                'json' => [
                    'room' => "room-{$roomId}",
                    'event' => $event,
                    'data' => $data
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Socket.IO broadcast failed: ' . $e->getMessage());
        }
    }

    public function broadcastToRoomAdmins($roomId, $event, $data)
    {
        try {
            $this->client->post($this->socketUrl . '/broadcast', [
                'json' => [
                    'room' => "room-{$roomId}-admin",
                    'event' => $event,
                    'data' => $data
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Socket.IO broadcast failed: ' . $e->getMessage());
        }
    }
}
```

### 3. Server-Sent Events (SSE)

**Cost**: FREE
**Best for**: One-way communication (server to client)

#### Laravel Implementation:

```php
// routes/web.php
Route::get('/events/{roomId}', function ($roomId) {
    return response()->stream(function () use ($roomId) {
        while (true) {
            // Check for new events in database
            $events = \App\Models\BroadcastEvent::where('room_id', $roomId)
                ->where('created_at', '>', now()->subSeconds(5))
                ->get();
            
            foreach ($events as $event) {
                echo "data: " . json_encode($event->data) . "\n\n";
            }
            
            ob_flush();
            flush();
            sleep(1);
        }
    }, 200, [
        'Content-Type' => 'text/event-stream',
        'Cache-Control' => 'no-cache',
        'Connection' => 'keep-alive',
    ]);
});
```

#### Flutter Implementation:

```dart
// lib/services/sse_service.dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class SSEService {
  StreamController<Map<String, dynamic>> _eventController = 
      StreamController<Map<String, dynamic>>.broadcast();
  
  StreamSubscription? _subscription;
  
  Stream<Map<String, dynamic>> get eventStream => _eventController.stream;
  
  void connectToRoom(int roomId, String token) {
    final uri = Uri.parse('$baseUrl/events/$roomId');
    
    _subscription = http.get(uri, headers: {
      'Authorization': 'Bearer $token',
      'Accept': 'text/event-stream',
    }).asStream().listen((response) {
      if (response.statusCode == 200) {
        final lines = utf8.decode(response.bodyBytes).split('\n');
        for (String line in lines) {
          if (line.startsWith('data: ')) {
            final data = jsonDecode(line.substring(6));
            _eventController.add(data);
          }
        }
      }
    });
  }
  
  void disconnect() {
    _subscription?.cancel();
  }
}
```

## Low-Cost Commercial Alternatives

### 1. Ably

**Cost**: Free tier (3M messages/month), then $49/month
**Features**: More generous free tier than Pusher

#### Setup:

```bash
composer require ably/ably-php
```

#### Configuration:

```env
BROADCAST_DRIVER=ably
ABLY_KEY=your_ably_key
```

### 2. Centrifugo

**Cost**: Free for up to 100 concurrent connections
**Features**: Self-hosted or cloud options

#### Docker Setup:

```yaml
# docker-compose.yml
version: '3'
services:
  centrifugo:
    image: centrifugo/centrifugo:latest
    ports:
      - "8000:8000"
    environment:
      CENTRIFUGO_API_KEY: your_api_key
      CENTRIFUGO_SECRET: your_secret
    command: centrifugo --config=config.json
```

### 3. Firebase Realtime Database

**Cost**: Free tier (1GB storage, 10GB transfer/month)
**Features**: Google's real-time database

#### Laravel Integration:

```bash
composer require kreait/firebase-php
```

## Self-Hosted Solutions

### 1. Redis with Laravel Broadcasting

**Cost**: FREE (if you have a server)
**Setup**: Use Redis as broadcasting driver

```env
BROADCAST_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### 2. Custom WebSocket Server with Ratchet

**Cost**: FREE
**Best for**: Full control over WebSocket implementation

#### Installation:

```bash
composer require ratchet/pawl
```

#### WebSocket Server:

```php
// websocket-server.php
<?php

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\WebSocket\ConnectRoomHandler;

require __DIR__ . '/vendor/autoload.php';

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new ConnectRoomHandler()
        )
    ),
    8080
);

$server->run();
```

## Implementation Examples

### Laravel WebSockets Implementation

Update your existing events to work with Laravel WebSockets:

```php
// app/Events/ConnectRoomJoinRequestReceived.php
<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\ConnectRoomJoinRequest;
use App\Models\ConnectRoom;

class ConnectRoomJoinRequestReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $joinRequest;
    public $connectRoom;

    public function __construct(ConnectRoomJoinRequest $joinRequest, ConnectRoom $connectRoom)
    {
        $this->joinRequest = $joinRequest;
        $this->connectRoom = $connectRoom;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('connect-room.' . $this->connectRoom->id . '.admin'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'join-request.received';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->joinRequest->id,
            'user_id' => $this->joinRequest->user_id,
            'connect_room_id' => $this->joinRequest->connect_room_id,
            'status' => $this->joinRequest->status,
            'message' => $this->joinRequest->message,
            'created_at' => $this->joinRequest->created_at,
            'user' => [
                'id' => $this->joinRequest->user->id,
                'name' => $this->joinRequest->user->name,
                'email' => $this->joinRequest->user->email,
                'phone' => $this->joinRequest->user->phone,
            ],
            'connect_room' => [
                'id' => $this->connectRoom->id,
                'name' => $this->connectRoom->name,
                'description' => $this->connectRoom->description,
            ],
        ];
    }
}
```

### Flutter Implementation for Laravel WebSockets

```dart
// lib/services/laravel_websocket_service.dart
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;

class LaravelWebSocketService {
  WebSocketChannel? _channel;
  bool _isConnected = false;
  final Map<String, Function(Map<String, dynamic>)> _eventHandlers = {};

  Future<void> connect(String serverUrl, String token) async {
    try {
      final uri = Uri.parse('$serverUrl?token=$token');
      _channel = WebSocketChannel.connect(uri);
      
      _channel!.stream.listen(
        (data) {
          final message = jsonDecode(data);
          _handleMessage(message);
        },
        onError: (error) {
          print('WebSocket error: $error');
          _isConnected = false;
        },
        onDone: () {
          print('WebSocket connection closed');
          _isConnected = false;
        },
      );
      
      _isConnected = true;
    } catch (e) {
      print('Failed to connect to WebSocket: $e');
    }
  }

  void _handleMessage(Map<String, dynamic> message) {
    if (message['event'] != null && _eventHandlers.containsKey(message['event'])) {
      _eventHandlers[message['event']]!(message['data']);
    }
  }

  void subscribeToChannel(String channelName) {
    if (_channel != null && _isConnected) {
      _channel!.sink.add(jsonEncode({
        'event': 'pusher:subscribe',
        'data': {'channel': channelName}
      }));
    }
  }

  void registerEventHandler(String eventName, Function(Map<String, dynamic>) handler) {
    _eventHandlers[eventName] = handler;
  }

  void disconnect() {
    _channel?.sink.close(status.goingAway);
    _isConnected = false;
  }

  bool get isConnected => _isConnected;
}
```

## Cost Comparison

| Solution | Free Tier | Paid Plans | Best For |
|----------|-----------|------------|----------|
| **Laravel WebSockets** | Unlimited | $0 | Laravel apps, self-hosted |
| **Socket.IO** | Unlimited | $0 | Custom implementations |
| **Server-Sent Events** | Unlimited | $0 | Simple one-way communication |
| **Ably** | 3M messages/month | $49/month | Commercial apps |
| **Centrifugo** | 100 connections | $99/month | High-performance apps |
| **Firebase** | 1GB storage | Pay-as-you-go | Google ecosystem |
| **Pusher** | 200K messages/month | $49/month | Quick setup |

## Recommendation

For your Hebron Connect app, I recommend **Laravel WebSockets** because:

1. **Completely FREE** - No monthly costs
2. **Perfect Laravel Integration** - Drop-in replacement for Pusher
3. **Same API** - Your existing code works with minimal changes
4. **Self-hosted** - Full control over your data
5. **Scalable** - Can handle thousands of concurrent connections

The setup is straightforward, and you can use the exact same Flutter implementation with just a configuration change.

Would you like me to help you implement Laravel WebSockets or any other alternative?
