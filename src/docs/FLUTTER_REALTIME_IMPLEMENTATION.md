# Flutter Real-time Implementation Guide

This guide shows how to implement real-time event listening in your Flutter app for the Hebron Connect backend.

## 1. Dependencies

Add these dependencies to your `pubspec.yaml`:

```yaml
dependencies:
  pusher_channels_flutter: ^2.2.1
  flutter_local_notifications: ^16.3.2
  permission_handler: ^11.3.1
```

## 2. Real-time Service Class

Create a service class to handle real-time events:

```dart
// lib/services/realtime_service.dart
import 'dart:convert';
import 'package:pusher_channels_flutter/pusher_channels_flutter.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';

class RealtimeService {
  static final RealtimeService _instance = RealtimeService._internal();
  factory RealtimeService() => _instance;
  RealtimeService._internal();

  PusherChannelsFlutter? _pusher;
  final FlutterLocalNotificationsPlugin _notifications = 
      FlutterLocalNotificationsPlugin();
  
  bool _isConnected = false;
  final Map<String, Function(Map<String, dynamic>)> _eventHandlers = {};

  // Initialize the service
  Future<void> initialize() async {
    await _initializeNotifications();
    await _initializePusher();
  }

  // Initialize local notifications
  Future<void> _initializeNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings();
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _notifications.initialize(initSettings);
    
    // Request notification permissions
    await Permission.notification.request();
  }

  // Initialize Pusher connection
  Future<void> _initializePusher() async {
    try {
      _pusher = PusherChannelsFlutter.getInstance();
      
      await _pusher!.init(
        apiKey: "YOUR_PUSHER_APP_KEY",
        cluster: "YOUR_PUSHER_CLUSTER",
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
      print('Pusher initialization error: $e');
    }
  }

  // Connection state change handler
  void _onConnectionStateChange(String currentState, String previousState) {
    print('Connection state changed from $previousState to $currentState');
    _isConnected = currentState == 'connected';
  }

  // Error handler
  void _onError(String message, int? code, dynamic e) {
    print('Pusher error: $message (Code: $code)');
  }

  // Subscription success handler
  void _onSubscriptionSucceeded(String channelName, dynamic data) {
    print('Successfully subscribed to channel: $channelName');
  }

  // Subscription error handler
  void _onSubscriptionError(String message, dynamic e) {
    print('Subscription error: $message');
  }

  // Event handler
  void _onEvent(String eventName, Map<String, dynamic> eventData) {
    print('Received event: $eventName');
    print('Event data: $eventData');
    
    // Handle the event
    if (_eventHandlers.containsKey(eventName)) {
      _eventHandlers[eventName]!(eventData);
    }
  }

  // Member added handler
  void _onMemberAdded(String channelName, Map<String, dynamic> member) {
    print('Member added to $channelName: $member');
  }

  // Member removed handler
  void _onMemberRemoved(String channelName, Map<String, dynamic> member) {
    print('Member removed from $channelName: $member');
  }

  // Decryption failure handler
  void _onDecryptionFailure(String event, String reason) {
    print('Decryption failure for event $event: $reason');
  }

  // Subscribe to a connect room
  Future<void> subscribeToConnectRoom(int roomId, String userToken) async {
    if (_pusher == null || !_isConnected) {
      print('Pusher not connected');
      return;
    }

    try {
      // Subscribe to room members channel
      await _pusher!.subscribe(
        channelName: "private-connect-room.$roomId.members",
        onEvent: _onEvent,
        onSubscriptionSucceeded: (data) {
          print('Subscribed to room members channel for room $roomId');
        },
        onSubscriptionError: (error) {
          print('Failed to subscribe to room members channel: $error');
        },
      );

      // Subscribe to room admin channel (if user is admin/owner)
      await _pusher!.subscribe(
        channelName: "private-connect-room.$roomId.admin",
        onEvent: _onEvent,
        onSubscriptionSucceeded: (data) {
          print('Subscribed to room admin channel for room $roomId');
        },
        onSubscriptionError: (error) {
          print('Failed to subscribe to room admin channel: $error');
        },
      );

      // Subscribe to user-specific channel
      final userId = _getUserIdFromToken(userToken);
      if (userId != null) {
        await _pusher!.subscribe(
          channelName: "private-user.$userId",
          onEvent: _onEvent,
          onSubscriptionSucceeded: (data) {
            print('Subscribed to user channel for user $userId');
          },
          onSubscriptionError: (error) {
            print('Failed to subscribe to user channel: $error');
          },
        );
      }
    } catch (e) {
      print('Error subscribing to connect room: $e');
    }
  }

  // Unsubscribe from a connect room
  Future<void> unsubscribeFromConnectRoom(int roomId) async {
    if (_pusher == null) return;

    try {
      await _pusher!.unsubscribe(channelName: "private-connect-room.$roomId.members");
      await _pusher!.unsubscribe(channelName: "private-connect-room.$roomId.admin");
    } catch (e) {
      print('Error unsubscribing from connect room: $e');
    }
  }

  // Register event handlers
  void registerEventHandler(String eventName, Function(Map<String, dynamic>) handler) {
    _eventHandlers[eventName] = handler;
  }

  // Unregister event handler
  void unregisterEventHandler(String eventName) {
    _eventHandlers.remove(eventName);
  }

  // Show local notification
  Future<void> showNotification({
    required String title,
    required String body,
    Map<String, dynamic>? payload,
  }) async {
    const androidDetails = AndroidNotificationDetails(
      'connect_room_notifications',
      'Connect Room Notifications',
      channelDescription: 'Notifications for connect room activities',
      importance: Importance.high,
      priority: Priority.high,
    );
    
    const iosDetails = DarwinNotificationDetails();
    
    const notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _notifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      notificationDetails,
      payload: payload != null ? jsonEncode(payload) : null,
    );
  }

  // Get user ID from token (implement based on your auth system)
  String? _getUserIdFromToken(String token) {
    // Implement JWT token parsing to extract user ID
    // This is a placeholder - implement based on your JWT structure
    return null;
  }

  // Disconnect
  Future<void> disconnect() async {
    if (_pusher != null) {
      await _pusher!.disconnect();
      _isConnected = false;
    }
  }

  // Check if connected
  bool get isConnected => _isConnected;
}
```

## 3. Event Handler Implementation

Create a class to handle specific events:

```dart
// lib/services/connect_room_event_handler.dart
import 'package:flutter/material.dart';
import 'realtime_service.dart';

class ConnectRoomEventHandler {
  final RealtimeService _realtimeService = RealtimeService();

  void initializeEventHandlers(BuildContext context) {
    // Join request received (for admins)
    _realtimeService.registerEventHandler('join-request.received', (data) {
      _handleJoinRequestReceived(context, data);
    });

    // Join request status updated
    _realtimeService.registerEventHandler('join-request.status-updated', (data) {
      _handleJoinRequestStatusUpdated(context, data);
    });

    // Document added
    _realtimeService.registerEventHandler('document.added', (data) {
      _handleDocumentAdded(context, data);
    });

    // Member joined
    _realtimeService.registerEventHandler('member.joined', (data) {
      _handleMemberJoined(context, data);
    });

    // Activity added
    _realtimeService.registerEventHandler('activity.added', (data) {
      _handleActivityAdded(context, data);
    });

    // Activity updated
    _realtimeService.registerEventHandler('activity.updated', (data) {
      _handleActivityUpdated(context, data);
    });
  }

  void _handleJoinRequestReceived(BuildContext context, Map<String, dynamic> data) {
    final user = data['user'];
    final connectRoom = data['connect_room'];
    
    _realtimeService.showNotification(
      title: 'New Join Request',
      body: '${user['name']} wants to join ${connectRoom['name']}',
      payload: {
        'type': 'join_request',
        'room_id': connectRoom['id'],
        'user_id': user['id'],
      },
    );

    // Show in-app notification or update UI
    _showInAppNotification(
      context,
      'New Join Request',
      '${user['name']} wants to join ${connectRoom['name']}',
    );
  }

  void _handleJoinRequestStatusUpdated(BuildContext context, Map<String, dynamic> data) {
    final status = data['status'];
    final connectRoom = data['connect_room'];
    
    String message;
    if (status == 'approved') {
      message = 'Your request to join ${connectRoom['name']} has been approved!';
    } else {
      message = 'Your request to join ${connectRoom['name']} has been rejected.';
    }

    _realtimeService.showNotification(
      title: 'Join Request Update',
      body: message,
      payload: {
        'type': 'join_request_status',
        'room_id': connectRoom['id'],
        'status': status,
      },
    );
  }

  void _handleDocumentAdded(BuildContext context, Map<String, dynamic> data) {
    final document = data;
    final uploader = data['uploader'];
    final connectRoom = data['connect_room'];

    _realtimeService.showNotification(
      title: 'New Document',
      body: '${uploader['name']} uploaded "${document['title']}" to ${connectRoom['name']}',
      payload: {
        'type': 'document',
        'room_id': connectRoom['id'],
        'document_id': document['id'],
      },
    );

    _showInAppNotification(
      context,
      'New Document',
      '${uploader['name']} uploaded "${document['title']}"',
    );
  }

  void _handleMemberJoined(BuildContext context, Map<String, dynamic> data) {
    final user = data['user'];
    final connectRoom = data['connect_room'];

    _realtimeService.showNotification(
      title: 'New Member',
      body: '${user['name']} joined ${connectRoom['name']}',
      payload: {
        'type': 'member_joined',
        'room_id': connectRoom['id'],
        'user_id': user['id'],
      },
    );

    _showInAppNotification(
      context,
      'New Member',
      '${user['name']} joined ${connectRoom['name']}',
    );
  }

  void _handleActivityAdded(BuildContext context, Map<String, dynamic> data) {
    final activity = data['activity'];
    final user = data['user'];
    final connectRoom = data['connect_room'];

    String activityType = activity['type'];
    String title = '';
    String body = '';

    switch (activityType) {
      case 'announcement':
        title = 'New Announcement';
        body = '${user['name']} posted "${activity['title']}" in ${connectRoom['name']}';
        break;
      case 'event':
        title = 'New Event';
        body = '${user['name']} created "${activity['title']}" in ${connectRoom['name']}';
        break;
      case 'contribution':
        title = 'New Contribution';
        body = '${user['name']} created "${activity['title']}" in ${connectRoom['name']}';
        break;
    }

    _realtimeService.showNotification(
      title: title,
      body: body,
      payload: {
        'type': 'activity',
        'activity_type': activityType,
        'room_id': connectRoom['id'],
        'activity_id': activity['id'],
      },
    );

    _showInAppNotification(context, title, body);
  }

  void _handleActivityUpdated(BuildContext context, Map<String, dynamic> data) {
    final activity = data['activity'];
    final user = data['user'];
    final connectRoom = data['connect_room'];

    String activityType = activity['type'];
    String title = '';
    String body = '';

    switch (activityType) {
      case 'announcement':
        title = 'Announcement Updated';
        body = '${user['name']} updated "${activity['title']}" in ${connectRoom['name']}';
        break;
      case 'event':
        title = 'Event Updated';
        body = '${user['name']} updated "${activity['title']}" in ${connectRoom['name']}';
        break;
      case 'contribution':
        title = 'Contribution Updated';
        body = '${user['name']} updated "${activity['title']}" in ${connectRoom['name']}';
        break;
    }

    _realtimeService.showNotification(
      title: title,
      body: body,
      payload: {
        'type': 'activity_update',
        'activity_type': activityType,
        'room_id': connectRoom['id'],
        'activity_id': activity['id'],
      },
    );

    _showInAppNotification(context, title, body);
  }

  void _showInAppNotification(BuildContext context, String title, String message) {
    // Show a snackbar or custom in-app notification
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
            Text(message),
          ],
        ),
        duration: const Duration(seconds: 4),
        action: SnackBarAction(
          label: 'View',
          onPressed: () {
            // Navigate to relevant screen
          },
        ),
      ),
    );
  }
}
```

## 4. Integration in Main App

Integrate the real-time service in your main app:

```dart
// lib/main.dart
import 'package:flutter/material.dart';
import 'services/realtime_service.dart';
import 'services/connect_room_event_handler.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize real-time service
  await RealtimeService().initialize();
  
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Hebron Connect',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {
  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final RealtimeService _realtimeService = RealtimeService();
  final ConnectRoomEventHandler _eventHandler = ConnectRoomEventHandler();

  @override
  void initState() {
    super.initState();
    _eventHandler.initializeEventHandlers(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hebron Connect'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Connection Status: ${_realtimeService.isConnected ? "Connected" : "Disconnected"}'),
            ElevatedButton(
              onPressed: () {
                // Subscribe to a connect room
                _realtimeService.subscribeToConnectRoom(1, 'your_user_token');
              },
              child: Text('Subscribe to Room'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _realtimeService.disconnect();
    super.dispose();
  }
}
```

## 5. Usage in Connect Room Screen

```dart
// lib/screens/connect_room_screen.dart
import 'package:flutter/material.dart';
import '../services/realtime_service.dart';

class ConnectRoomScreen extends StatefulWidget {
  final int roomId;
  final String userToken;

  const ConnectRoomScreen({
    Key? key,
    required this.roomId,
    required this.userToken,
  }) : super(key: key);

  @override
  _ConnectRoomScreenState createState() => _ConnectRoomScreenState();
}

class _ConnectRoomScreenState extends State<ConnectRoomScreen> {
  final RealtimeService _realtimeService = RealtimeService();
  final List<Map<String, dynamic>> _activities = [];

  @override
  void initState() {
    super.initState();
    _subscribeToRoom();
    _setupEventHandlers();
  }

  void _subscribeToRoom() {
    _realtimeService.subscribeToConnectRoom(widget.roomId, widget.userToken);
  }

  void _setupEventHandlers() {
    // Handle new activities
    _realtimeService.registerEventHandler('activity.added', (data) {
      setState(() {
        _activities.insert(0, data);
      });
    });

    // Handle activity updates
    _realtimeService.registerEventHandler('activity.updated', (data) {
      setState(() {
        final index = _activities.indexWhere(
          (activity) => activity['activity']['id'] == data['activity']['id']
        );
        if (index != -1) {
          _activities[index] = data;
        }
      });
    });

    // Handle new documents
    _realtimeService.registerEventHandler('document.added', (data) {
      // Update documents list or show notification
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('New document: ${data['title']}'),
        ),
      );
    });

    // Handle new members
    _realtimeService.registerEventHandler('member.joined', (data) {
      // Update members list or show notification
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${data['user']['name']} joined the room'),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Connect Room'),
      ),
      body: ListView.builder(
        itemCount: _activities.length,
        itemBuilder: (context, index) {
          final activity = _activities[index]['activity'];
          final user = _activities[index]['user'];
          
          return ListTile(
            title: Text(activity['title']),
            subtitle: Text('By ${user['name']}'),
            trailing: Text(_formatDate(activity['created_at'])),
          );
        },
      ),
    );
  }

  String _formatDate(String dateString) {
    // Format date string for display
    return dateString;
  }

  @override
  void dispose() {
    _realtimeService.unsubscribeFromConnectRoom(widget.roomId);
    super.dispose();
  }
}
```

## 6. Environment Configuration

Create a configuration file for your Pusher settings:

```dart
// lib/config/app_config.dart
class AppConfig {
  static const String pusherAppKey = 'YOUR_PUSHER_APP_KEY';
  static const String pusherCluster = 'YOUR_PUSHER_CLUSTER';
  static const String apiBaseUrl = 'YOUR_API_BASE_URL';
}
```

## 7. Authentication Integration

Make sure to pass the user's authentication token when subscribing to private channels. The Laravel backend will authenticate the user based on this token.

## 8. Error Handling

Implement proper error handling for network issues, authentication failures, and other edge cases:

```dart
// Add to RealtimeService class
void _handleConnectionError(String error) {
  // Show user-friendly error message
  // Attempt to reconnect
  // Log error for debugging
}
```

This implementation provides a complete real-time solution for your Flutter app that will receive and handle all the events broadcasted from your Laravel backend.
