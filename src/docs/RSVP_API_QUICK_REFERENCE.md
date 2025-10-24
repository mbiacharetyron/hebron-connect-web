# RSVP API Quick Reference

## 🚀 Quick Start

### Base URL
```
/api/v1/connect-room-events/{event_id}/rsvp
```

### Authentication
```
Authorization: Bearer {token}
```

---

## 📋 Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/connect-room-events/{event}/rsvp` | RSVP to an event |
| `GET` | `/connect-room-events/{event}/rsvp` | Get your RSVP |
| `GET` | `/connect-room-events/{event}/rsvps` | Get all RSVPs |
| `DELETE` | `/connect-room-events/{event}/rsvp` | Remove your RSVP |

---

## 🎯 RSVP Status Values

```json
{
  "attending": "User will attend",
  "not_attending": "User will not attend", 
  "maybe": "User is unsure"
}
```

---

## 📝 Request Examples

### RSVP to Event
```bash
POST /api/v1/connect-room-events/123/rsvp
Content-Type: application/json

{
  "status": "attending",
  "notes": "Looking forward to it!",
  "guest_count": 1
}
```

### Get Your RSVP
```bash
GET /api/v1/connect-room-events/123/rsvp
```

### Get All RSVPs
```bash
GET /api/v1/connect-room-events/123/rsvps
GET /api/v1/connect-room-events/123/rsvps?status=attending
```

### Remove RSVP
```bash
DELETE /api/v1/connect-room-events/123/rsvp
```

---

## 📊 Response Examples

### RSVP Response
```json
{
  "status": "success",
  "message": "RSVP successful",
  "data": {
    "id": 1,
    "status": "attending",
    "notes": "Looking forward to it!",
    "guest_count": 1,
    "created_at": "2025-01-08T17:30:00Z",
    "updated_at": "2025-01-08T17:30:00Z"
  }
}
```

### RSVP List Response
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
        "user": {
          "id": 1,
          "name": "John Doe",
          "email": "john@example.com"
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

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid data |
| `403` | Forbidden - Not a room member |
| `404` | Not Found - Event/RSVP not found |
| `422` | Validation Error |
| `500` | Internal Server Error |

---

## 🔧 Validation Rules

| Field | Required | Type | Constraints |
|-------|----------|------|-------------|
| `status` | ✅ | string | "attending", "not_attending", "maybe" |
| `notes` | ❌ | string | Max 500 characters |
| `guest_count` | ❌ | integer | 0-10 |

---

## 🎨 Frontend Integration

### JavaScript/React
```javascript
// RSVP to event
const rsvp = await fetch(`/api/v1/connect-room-events/${eventId}/rsvp`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'attending',
    notes: 'Looking forward to it!',
    guest_count: 1
  })
});
```

### Flutter/Dart
```dart
final response = await http.post(
  Uri.parse('$baseUrl/api/v1/connect-room-events/$eventId/rsvp'),
  headers: {
    'Authorization': 'Bearer $token',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'status': 'attending',
    'notes': 'Looking forward to it!',
    'guest_count': 1,
  }),
);
```

---

## 🔄 Enhanced Event Endpoints

Events now include RSVP information:

```json
{
  "id": 1,
  "title": "Team Meeting",
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
    "guest_count": 1
  }
}
```

---

## 📱 Mobile App Integration

### iOS Swift
```swift
func rsvpToEvent(eventId: Int, status: String, notes: String?, guestCount: Int) async throws {
    let url = URL(string: "\(baseURL)/api/v1/connect-room-events/\(eventId)/rsvp")!
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    
    let body = [
        "status": status,
        "notes": notes ?? "",
        "guest_count": guestCount
    ]
    
    request.httpBody = try JSONSerialization.data(withJSONObject: body)
    
    let (_, response) = try await URLSession.shared.data(for: request)
    // Handle response
}
```

### Android Kotlin
```kotlin
suspend fun rsvpToEvent(eventId: Int, status: String, notes: String?, guestCount: Int) {
    val url = "$baseURL/api/v1/connect-room-events/$eventId/rsvp"
    val requestBody = JSONObject().apply {
        put("status", status)
        put("notes", notes ?: "")
        put("guest_count", guestCount)
    }
    
    val request = Request.Builder()
        .url(url)
        .post(requestBody.toString().toRequestBody("application/json".toMediaType()))
        .addHeader("Authorization", "Bearer $token")
        .build()
    
    // Execute request
}
```

---

## 🧪 Testing Checklist

- [ ] RSVP with all status types
- [ ] Update existing RSVP
- [ ] RSVP with notes and guest count
- [ ] Get your RSVP
- [ ] Get all RSVPs
- [ ] Filter RSVPs by status
- [ ] Delete RSVP
- [ ] Access control (non-member)
- [ ] Validation errors
- [ ] Enhanced event responses

---

## 📞 Support

For questions or issues:
- Check the full documentation: `CONNECT_ROOM_EVENT_RSVP_API_DOCUMENTATION.md`
- Contact the development team
- Review error responses for troubleshooting

---

*Quick Reference v1.0 - January 8, 2025*
