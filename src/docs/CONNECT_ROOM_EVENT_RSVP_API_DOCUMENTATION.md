# Connect Room Event RSVP API Documentation

## Overview

The Connect Room Event RSVP API allows members of connect rooms to respond to events with their attendance status. Users can RSVP as "attending", "not attending", or "maybe", and can include additional guests and personal notes.

## Base URL
```
https://your-domain.com/api/v1
```

## Authentication
All endpoints require Bearer token authentication. Include the token in the Authorization header:
```
Authorization: Bearer {your_token}
```

## Endpoints

### 1. RSVP to an Event

**POST** `/connect-room-events/{event}/rsvp`

Create or update your RSVP response for a specific event.

#### Parameters
- `event` (path, required): The ID of the event to RSVP to

#### Request Body
```json
{
  "status": "attending",           // Required: "attending", "not_attending", or "maybe"
  "notes": "Looking forward to it!", // Optional: Personal notes (max 500 characters)
  "guest_count": 1                 // Optional: Number of additional guests (0-10)
}
```

#### Response
**Success (200)**
```json
{
  "status": "success",
  "message": "RSVP successful",
  "data": {
    "id": 1,
    "status": "attending",
    "notes": "Looking forward to it!",
    "guest_count": 1,
    "created_at": "2025-01-08T17:30:00.000000Z",
    "updated_at": "2025-01-08T17:30:00.000000Z"
  }
}
```

**Error Responses**
- `403 Forbidden`: User is not a member of the room
- `404 Not Found`: Event not found
- `422 Unprocessable Entity`: Validation error

#### Example Usage
```bash
curl -X POST "https://your-domain.com/api/v1/connect-room-events/123/rsvp" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Looking forward to the team meeting!",
    "guest_count": 1
  }'
```

---

### 2. Get Your RSVP for an Event

**GET** `/connect-room-events/{event}/rsvp`

Retrieve your current RSVP status for a specific event.

#### Parameters
- `event` (path, required): The ID of the event

#### Response
**Success (200)**
```json
{
  "status": "success",
  "message": "RSVP retrieved successfully",
  "data": {
    "id": 1,
    "status": "attending",
    "notes": "Looking forward to it!",
    "guest_count": 1,
    "created_at": "2025-01-08T17:30:00.000000Z",
    "updated_at": "2025-01-08T17:30:00.000000Z"
  }
}
```

**Error Responses**
- `404 Not Found`: RSVP not found (user hasn't RSVP'd yet)

#### Example Usage
```bash
curl -X GET "https://your-domain.com/api/v1/connect-room-events/123/rsvp" \
  -H "Authorization: Bearer your_token_here"
```

---

### 3. Get All RSVPs for an Event

**GET** `/connect-room-events/{event}/rsvps`

Retrieve all RSVP responses for a specific event, including user details and summary counts.

#### Parameters
- `event` (path, required): The ID of the event
- `status` (query, optional): Filter by RSVP status ("attending", "not_attending", "maybe")

#### Response
**Success (200)**
```json
{
  "status": "success",
  "message": "RSVPs retrieved successfully",
  "data": {
    "rsvps": [
      {
        "id": 1,
        "status": "attending",
        "notes": "Looking forward to it!",
        "guest_count": 1,
        "created_at": "2025-01-08T17:30:00.000000Z",
        "updated_at": "2025-01-08T17:30:00.000000Z",
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      {
        "id": 2,
        "status": "not_attending",
        "notes": "Sorry, can't make it this time",
        "guest_count": 0,
        "created_at": "2025-01-08T18:00:00.000000Z",
        "updated_at": "2025-01-08T18:00:00.000000Z",
        "user": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "counts": {
      "attending": 5,
      "not_attending": 2,
      "maybe": 1,
      "total": 8
    }
  }
}
```

#### Example Usage
```bash
# Get all RSVPs
curl -X GET "https://your-domain.com/api/v1/connect-room-events/123/rsvps" \
  -H "Authorization: Bearer your_token_here"

# Filter by status
curl -X GET "https://your-domain.com/api/v1/connect-room-events/123/rsvps?status=attending" \
  -H "Authorization: Bearer your_token_here"
```

---

### 4. Remove Your RSVP

**DELETE** `/connect-room-events/{event}/rsvp`

Remove your RSVP response for a specific event.

#### Parameters
- `event` (path, required): The ID of the event

#### Response
**Success (200)**
```json
{
  "status": "success",
  "message": "RSVP deleted successfully"
}
```

**Error Responses**
- `404 Not Found`: RSVP not found (user hasn't RSVP'd yet)

#### Example Usage
```bash
curl -X DELETE "https://your-domain.com/api/v1/connect-room-events/123/rsvp" \
  -H "Authorization: Bearer your_token_here"
```

---

## Enhanced Event Endpoints

The existing event endpoints have been enhanced to include RSVP information:

### 5. List Events (Enhanced)

**GET** `/connect-room/{room}/events`

Now includes RSVP information for each event.

#### Response Enhancement
```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "events": {
      "data": [
        {
          "id": 1,
          "title": "Team Meeting",
          "description": "Weekly team sync",
          "start_date": "2025-01-10T10:00:00.000000Z",
          "end_date": "2025-01-10T11:00:00.000000Z",
          "location": "Conference Room A",
          "rsvp_counts": {
            "attending": 5,
            "not_attending": 2,
            "maybe": 1,
            "total": 8
          },
          "total_guest_count": 7,
          "user_rsvp": {
            "status": "attending",
            "notes": "Looking forward to it!",
            "guest_count": 1,
            "created_at": "2025-01-08T17:30:00.000000Z",
            "updated_at": "2025-01-08T17:30:00.000000Z"
          }
        }
      ]
    }
  }
}
```

### 6. Get Event Details (Enhanced)

**GET** `/connect-room/{room}/event/{event}`

Now includes RSVP information for the specific event.

#### Response Enhancement
Same RSVP fields as listed above are included in the individual event response.

---

## Data Models

### RSVP Status Values
- `attending`: User will attend the event
- `not_attending`: User will not attend the event
- `maybe`: User is unsure about attendance

### RSVP Object Structure
```json
{
  "id": 1,                    // RSVP ID
  "status": "attending",      // RSVP status
  "notes": "Looking forward to it!", // Optional user notes
  "guest_count": 1,           // Number of additional guests (0-10)
  "created_at": "2025-01-08T17:30:00.000000Z",
  "updated_at": "2025-01-08T17:30:00.000000Z"
}
```

### RSVP Counts Structure
```json
{
  "attending": 5,      // Number of users attending
  "not_attending": 2,  // Number of users not attending
  "maybe": 1,          // Number of users who maybe attending
  "total": 8           // Total number of RSVPs
}
```

---

## Business Rules

### Access Control
- Only members of the connect room can RSVP to events
- Users can only have one RSVP per event
- Users can update their RSVP status at any time

### Validation Rules
- `status` is required and must be one of: "attending", "not_attending", "maybe"
- `notes` is optional, max 500 characters
- `guest_count` is optional, must be between 0 and 10

### Activity Tracking
- All RSVP actions (create, update, delete) update the room's `last_activity_at` timestamp
- This affects the room's position when sorted by last activity

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation Error: The status field is required",
  "errors": {
    "status": ["The status field is required."]
  }
}
```

#### 403 Forbidden
```json
{
  "status": "error",
  "message": "You must be a member of this room to RSVP to events"
}
```

#### 404 Not Found
```json
{
  "status": "error",
  "message": "Event not found"
}
```

#### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Failed to RSVP",
  "error": "Database connection error"
}
```

---

## Integration Examples

### Frontend Integration

#### React/JavaScript Example
```javascript
// RSVP to an event
const rsvpToEvent = async (eventId, status, notes = '', guestCount = 0) => {
  try {
    const response = await fetch(`/api/v1/connect-room-events/${eventId}/rsvp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        notes,
        guest_count: guestCount
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('RSVP failed:', error);
    throw error;
  }
};

// Get RSVP counts for an event
const getRsvpCounts = async (eventId) => {
  try {
    const response = await fetch(`/api/v1/connect-room-events/${eventId}/rsvps`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    return data.data.counts;
  } catch (error) {
    console.error('Failed to get RSVP counts:', error);
    throw error;
  }
};
```

#### Flutter/Dart Example
```dart
// RSVP to an event
Future<Map<String, dynamic>> rsvpToEvent(int eventId, String status, {String? notes, int guestCount = 0}) async {
  try {
    final response = await http.post(
      Uri.parse('$baseUrl/api/v1/connect-room-events/$eventId/rsvp'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'status': status,
        'notes': notes,
        'guest_count': guestCount,
      }),
    );
    
    return jsonDecode(response.body);
  } catch (e) {
    throw Exception('RSVP failed: $e');
  }
}
```

---

## Testing

### Test Scenarios

1. **Create RSVP**
   - RSVP as attending with notes and guest count
   - Verify response includes all provided data

2. **Update RSVP**
   - Change status from attending to not_attending
   - Verify old RSVP is updated, not duplicated

3. **Get RSVP**
   - Retrieve your RSVP for an event
   - Verify all fields are returned correctly

4. **List RSVPs**
   - Get all RSVPs for an event
   - Verify counts are accurate
   - Test filtering by status

5. **Delete RSVP**
   - Remove your RSVP
   - Verify it's deleted and can't be retrieved

6. **Access Control**
   - Try to RSVP to an event in a room you're not a member of
   - Verify 403 Forbidden response

7. **Validation**
   - Try to RSVP with invalid status
   - Try to RSVP with guest_count > 10
   - Verify appropriate validation errors

### Sample Test Data
```json
{
  "valid_rsvp": {
    "status": "attending",
    "notes": "Looking forward to the event!",
    "guest_count": 1
  },
  "invalid_status": {
    "status": "invalid_status",
    "notes": "This should fail",
    "guest_count": 0
  },
  "excessive_guests": {
    "status": "attending",
    "notes": "Too many guests",
    "guest_count": 15
  }
}
```

---

## Changelog

### Version 1.0.0 (2025-01-08)
- Initial release of RSVP functionality
- Support for attending, not_attending, and maybe statuses
- Guest count support (0-10 additional guests)
- Personal notes support (max 500 characters)
- Integration with existing event endpoints
- Activity tracking integration
- Comprehensive API documentation

---

## Support

For technical support or questions about the RSVP API, please contact the development team or refer to the main API documentation.

---

*Last updated: January 8, 2025*
