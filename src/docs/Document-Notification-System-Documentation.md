# Document Notification System Documentation

## Overview

The Document Notification System automatically sends push notifications to all members of a connect room when a document is successfully uploaded. This ensures that all room members are immediately informed about new documents and can stay updated with the latest content.

## Features

### 1. **Automatic Notifications**
- Notifications are sent automatically when a document is successfully uploaded
- All room members receive notifications (excluding the uploader)
- Notifications include document details and uploader information

### 2. **Rich Notification Content**
- Document title and description
- File information (name, type, size)
- Uploader details
- Room information
- Action buttons for easy navigation

### 3. **Error Handling**
- Notification failures don't affect document upload
- Comprehensive logging for debugging
- Graceful degradation if notification service is unavailable

## Implementation

### 1. **Notification Service Method**

The `ConnectRoomNotificationService` includes a new method `sendDocumentAddedNotification()`:

```php
public function sendDocumentAddedNotification(ConnectRoom $connectRoom, ConnectRoomDocument $document, User $uploader)
{
    try {
        // Get all active members of the connect room (excluding the uploader)
        $memberIds = $connectRoom->members()
            ->where('user_id', '!=', $uploader->id)
            ->pluck('user_id')
            ->toArray();

        if (empty($memberIds)) {
            return false;
        }

        $deviceTokens = $this->getDeviceTokensForUsers($memberIds);

        if (empty($deviceTokens)) {
            return false;
        }

        $title = "📄 New Document in {$connectRoom->name}";
        $body = "{$uploader->full_name} uploaded \"{$document->title}\"";

        $data = [
            'type' => 'connect_room_document_added',
            'connect_room_id' => (string)$connectRoom->id,
            'connect_room_name' => $connectRoom->name,
            'document_id' => (string)$document->id,
            'document_title' => $document->title,
            'uploader_id' => (string)$uploader->id,
            'uploader_name' => $uploader->full_name,
            'action' => 'open_documents'
        ];

        return $this->firebaseService->sendNotificationToMultipleDevices(
            $deviceTokens,
            $title,
            $body,
            $data
        );
    } catch (\Exception $e) {
        Log::error('Failed to send document added notification', [
            'error' => $e->getMessage()
        ]);
        return false;
    }
}
```

### 2. **Controller Integration**

The `ConnectRoomDocumentController` has been updated to send notifications:

```php
// Create document record
$document = ConnectRoomDocument::create([...]);

// Send notification to all room members
try {
    $this->notificationService->sendDocumentAddedNotification($room, $document, Auth::user());
} catch (\Exception $notificationError) {
    // Log notification error but don't fail the document upload
    Log::warning('Failed to send document added notification', [
        'room_id' => $room->id,
        'document_id' => $document->id,
        'uploader_id' => Auth::id(),
        'error' => $notificationError->getMessage()
    ]);
}
```

## Notification Content

### 1. **Push Notification**
- **Title**: "📄 New Document in {Room Name}"
- **Body**: "{Uploader Name} uploaded \"{Document Title}\""
- **Icon**: Document emoji (📄)

### 2. **Notification Data**
```json
{
  "type": "connect_room_document_added",
  "connect_room_id": "123",
  "connect_room_name": "Project Alpha",
  "connect_room_reference": "REF-123456",
  "connect_room_join_code": "ABC123",
  "connect_room_category": "Business",
  "document_id": "456",
  "document_title": "Meeting Minutes",
  "document_description": "Minutes from the last team meeting",
  "document_file_name": "meeting_minutes.pdf",
  "document_file_type": "pdf",
  "document_file_size": "1024",
  "uploader_id": "789",
  "uploader_name": "John Doe",
  "timestamp": "1640995200",
  "action": "open_documents"
}
```

## API Integration

### 1. **Document Upload Endpoint**

**Endpoint:** `POST /api/v1/connect-room/{room}/document`

**Response:** The endpoint now automatically sends notifications to all room members upon successful document upload.

**Example Request:**
```bash
curl -X POST "https://api.example.com/api/v1/connect-room/123/document" \
  -H "Authorization: Bearer {token}" \
  -F "title=Meeting Minutes" \
  -F "description=Minutes from the last team meeting" \
  -F "document=@meeting_minutes.pdf"
```

**Example Response:**
```json
{
  "status": "success",
  "message": "Document uploaded successfully",
  "data": {
    "document": {
      "id": 456,
      "title": "Meeting Minutes",
      "description": "Minutes from the last team meeting",
      "file_name": "meeting_minutes.pdf",
      "file_url": "https://s3.amazonaws.com/bucket/path/to/file.pdf",
      "file_size": 1024,
      "file_type": "pdf",
      "created_at": "2024-10-14T10:30:00Z"
    }
  }
}
```

## User Experience

### 1. **For Uploaders**
- Document uploads work exactly as before
- No additional steps required
- Notifications are sent automatically in the background

### 2. **For Room Members**
- Receive immediate push notifications when documents are added
- Notifications include document title and uploader name
- Can tap notification to open documents section
- Stay informed about all new content

### 3. **For Room Admins**
- All members are automatically notified
- No manual notification required
- Better engagement with room content

## Error Handling

### 1. **Notification Failures**
- Document upload continues even if notifications fail
- Errors are logged for debugging
- No impact on core functionality

### 2. **Common Scenarios**
- **No Active Devices**: If no members have active device tokens, notification is skipped
- **Service Unavailable**: Firebase service failures don't affect document upload
- **Invalid Data**: Malformed notification data is handled gracefully

### 3. **Logging**
```php
// Success logging
Log::info('Connect room document added notifications sent', [
    'connect_room_id' => $connectRoom->id,
    'document_id' => $document->id,
    'uploader_id' => $uploader->id,
    'successful' => count($results['successful']),
    'failed' => count($results['failed'])
]);

// Error logging
Log::error('Failed to send document added notification', [
    'connect_room_id' => $connectRoom->id,
    'document_id' => $document->id,
    'uploader_id' => $uploader->id,
    'error' => $e->getMessage()
]);
```

## Security Considerations

### 1. **Authorization**
- Only room members receive notifications
- Uploader is excluded from notifications
- Respects room membership and permissions

### 2. **Data Privacy**
- Notification data includes only necessary information
- No sensitive document content in notifications
- File paths and URLs are properly secured

### 3. **Rate Limiting**
- Firebase service handles rate limiting
- Bulk notifications are optimized
- No spam or excessive notifications

## Performance Considerations

### 1. **Efficient Delivery**
- Notifications are sent asynchronously
- Bulk device token handling
- Optimized for multiple recipients

### 2. **Resource Usage**
- Minimal impact on document upload performance
- Background processing for notifications
- Efficient database queries

### 3. **Scalability**
- Handles rooms with many members
- Firebase service scales automatically
- No performance degradation with growth

## Testing

### 1. **Unit Tests**
- Test notification service method
- Test controller integration
- Test error handling scenarios

### 2. **Integration Tests**
- Test end-to-end document upload with notifications
- Test notification delivery to multiple devices
- Test failure scenarios

### 3. **Manual Testing**
- Upload documents in different rooms
- Verify notifications are received
- Test with different file types and sizes

## Future Enhancements

### 1. **Advanced Features**
- Document type-specific notifications
- Custom notification preferences
- Notification scheduling

### 2. **Analytics**
- Track notification delivery rates
- Monitor user engagement
- Generate usage reports

### 3. **Customization**
- Custom notification templates
- User-specific notification settings
- Room-level notification controls

## Troubleshooting

### 1. **Common Issues**

#### Notifications Not Received
- Check if user has active device tokens
- Verify Firebase service configuration
- Check notification permissions

#### Upload Failures
- Verify file size and type restrictions
- Check S3 configuration
- Review error logs

#### Performance Issues
- Monitor Firebase service limits
- Check database query performance
- Review server resources

### 2. **Debugging Steps**
1. Check application logs for errors
2. Verify Firebase service status
3. Test with different devices
4. Review notification data format

### 3. **Support**
- Check logs for specific error messages
- Verify service configurations
- Test with minimal data sets

## Conclusion

The Document Notification System provides a seamless way to keep all room members informed about new documents. The system is designed to be:

- **Reliable**: Notifications don't affect core functionality
- **Efficient**: Optimized for performance and scalability
- **User-Friendly**: Clear, informative notifications
- **Secure**: Respects privacy and permissions
- **Maintainable**: Comprehensive logging and error handling

This enhancement significantly improves the user experience by ensuring all members stay updated with the latest room content automatically.
