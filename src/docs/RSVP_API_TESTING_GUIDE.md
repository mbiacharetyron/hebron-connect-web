# RSVP API Testing Guide

## 🧪 Overview

This guide provides comprehensive testing scenarios and examples for the Connect Room Event RSVP API. Use this to ensure your implementation works correctly and handles all edge cases.

## 📋 Prerequisites

1. **Authentication Token**: Valid Bearer token for a user who is a member of a connect room
2. **Test Data**: 
   - At least one connect room with events
   - User should be a member of the room
   - At least one active event in the room

## 🔧 Setup

### Environment Variables
```bash
BASE_URL=https://your-domain.com/api/v1
AUTH_TOKEN=your_bearer_token_here
EVENT_ID=1
ROOM_ID=1
```

### Test User Requirements
- User must be authenticated
- User must be a member of the connect room
- Room must have at least one active event

---

## 🎯 Test Scenarios

### 1. Basic RSVP Operations

#### 1.1 Create RSVP - Attending
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Looking forward to the event!",
    "guest_count": 1
  }'
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "RSVP successful",
  "data": {
    "id": 1,
    "status": "attending",
    "notes": "Looking forward to the event!",
    "guest_count": 1,
    "created_at": "2025-01-08T17:30:00.000000Z",
    "updated_at": "2025-01-08T17:30:00.000000Z"
  }
}
```

#### 1.2 Create RSVP - Not Attending
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "not_attending",
    "notes": "Sorry, can'\''t make it this time",
    "guest_count": 0
  }'
```

#### 1.3 Create RSVP - Maybe
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "maybe",
    "notes": "I'\''ll confirm closer to the date",
    "guest_count": 0
  }'
```

### 2. Retrieve RSVP Operations

#### 2.1 Get Your RSVP
```bash
curl -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "RSVP retrieved successfully",
  "data": {
    "id": 1,
    "status": "attending",
    "notes": "Looking forward to the event!",
    "guest_count": 1,
    "created_at": "2025-01-08T17:30:00.000000Z",
    "updated_at": "2025-01-08T17:30:00.000000Z"
  }
}
```

#### 2.2 Get All RSVPs
```bash
curl -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvps" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "RSVPs retrieved successfully",
  "data": {
    "rsvps": [
      {
        "id": 1,
        "status": "attending",
        "notes": "Looking forward to the event!",
        "guest_count": 1,
        "created_at": "2025-01-08T17:30:00.000000Z",
        "updated_at": "2025-01-08T17:30:00.000000Z",
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

#### 2.3 Filter RSVPs by Status
```bash
# Get only attending RSVPs
curl -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvps?status=attending" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Get only not attending RSVPs
curl -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvps?status=not_attending" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Get only maybe RSVPs
curl -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvps?status=maybe" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### 3. Update RSVP Operations

#### 3.1 Update RSVP Status
```bash
# Change from attending to not_attending
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "not_attending",
    "notes": "Something came up, can'\''t make it",
    "guest_count": 0
  }'
```

#### 3.2 Update Guest Count
```bash
# Increase guest count
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Bringing my spouse",
    "guest_count": 1
  }'
```

### 4. Delete RSVP Operations

#### 4.1 Remove RSVP
```bash
curl -X DELETE "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response:**
```json
{
  "status": "success",
  "message": "RSVP deleted successfully"
}
```

### 5. Enhanced Event Endpoints

#### 5.1 Get Events with RSVP Data
```bash
curl -X GET "$BASE_URL/connect-room/$ROOM_ID/events" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

**Expected Response Enhancement:**
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

#### 5.2 Get Individual Event with RSVP Data
```bash
curl -X GET "$BASE_URL/connect-room/$ROOM_ID/event/$EVENT_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## ❌ Error Testing

### 1. Validation Errors

#### 1.1 Invalid Status
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "invalid_status",
    "notes": "This should fail",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation Error: The selected status is invalid.",
  "errors": {
    "status": ["The selected status is invalid."]
  }
}
```

#### 1.2 Missing Required Field
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Missing status field",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation Error: The status field is required.",
  "errors": {
    "status": ["The status field is required."]
  }
}
```

#### 1.3 Excessive Guest Count
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Too many guests",
    "guest_count": 15
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation Error: The guest count may not be greater than 10.",
  "errors": {
    "guest_count": ["The guest count may not be greater than 10."]
  }
}
```

#### 1.4 Long Notes
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "'"$(printf 'A%.0s' {1..600})"'",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Validation Error: The notes may not be greater than 500 characters.",
  "errors": {
    "notes": ["The notes may not be greater than 500 characters."]
  }
}
```

### 2. Access Control Errors

#### 2.1 Non-Member Access
```bash
# Use a token for a user who is NOT a member of the room
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $NON_MEMBER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "This should fail",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "You must be a member of this room to RSVP to events"
}
```

#### 2.2 Invalid Event ID
```bash
curl -X POST "$BASE_URL/connect-room-events/99999/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "This should fail",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "status": "error",
  "message": "Event not found"
}
```

### 3. Authentication Errors

#### 3.1 Missing Token
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "This should fail",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "message": "Unauthenticated."
}
```

#### 3.2 Invalid Token
```bash
curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "This should fail",
    "guest_count": 0
  }'
```

**Expected Response:**
```json
{
  "message": "Unauthenticated."
}
```

---

## 🔄 Integration Testing

### 1. Complete RSVP Workflow

```bash
#!/bin/bash

# 1. Create RSVP
echo "Creating RSVP..."
RSVP_RESPONSE=$(curl -s -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Looking forward to it!",
    "guest_count": 1
  }')

echo "RSVP Created: $RSVP_RESPONSE"

# 2. Get your RSVP
echo "Getting your RSVP..."
GET_RSVP_RESPONSE=$(curl -s -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN")

echo "Your RSVP: $GET_RSVP_RESPONSE"

# 3. Get all RSVPs
echo "Getting all RSVPs..."
ALL_RSVPS_RESPONSE=$(curl -s -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvps" \
  -H "Authorization: Bearer $AUTH_TOKEN")

echo "All RSVPs: $ALL_RSVPS_RESPONSE"

# 4. Update RSVP
echo "Updating RSVP..."
UPDATE_RSVP_RESPONSE=$(curl -s -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "not_attending",
    "notes": "Something came up",
    "guest_count": 0
  }')

echo "RSVP Updated: $UPDATE_RSVP_RESPONSE"

# 5. Delete RSVP
echo "Deleting RSVP..."
DELETE_RSVP_RESPONSE=$(curl -s -X DELETE "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN")

echo "RSVP Deleted: $DELETE_RSVP_RESPONSE"
```

### 2. Activity Tracking Test

```bash
#!/bin/bash

# 1. Get room's last activity before RSVP
echo "Getting room activity before RSVP..."
BEFORE_ACTIVITY=$(curl -s -X GET "$BASE_URL/connect-rooms/my-rooms?sort_by=last_activity_at" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data.data[0].last_activity_at')

echo "Activity before: $BEFORE_ACTIVITY"

# 2. Create RSVP
echo "Creating RSVP..."
curl -s -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Testing activity tracking",
    "guest_count": 0
  }' > /dev/null

# 3. Wait a moment for activity to update
sleep 2

# 4. Get room's last activity after RSVP
echo "Getting room activity after RSVP..."
AFTER_ACTIVITY=$(curl -s -X GET "$BASE_URL/connect-rooms/my-rooms?sort_by=last_activity_at" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.data.data[0].last_activity_at')

echo "Activity after: $AFTER_ACTIVITY"

# 5. Compare timestamps
if [ "$BEFORE_ACTIVITY" != "$AFTER_ACTIVITY" ]; then
  echo "✅ Activity tracking working correctly!"
else
  echo "❌ Activity tracking not working!"
fi
```

---

## 📊 Performance Testing

### 1. Load Testing with Multiple RSVPs

```bash
#!/bin/bash

# Create multiple RSVPs concurrently
for i in {1..10}; do
  curl -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"status\": \"attending\",
      \"notes\": \"Load test RSVP $i\",
      \"guest_count\": 0
    }" &
done

wait
echo "All RSVPs created"
```

### 2. Response Time Testing

```bash
#!/bin/bash

echo "Testing response times..."

# Test RSVP creation
echo "RSVP Creation:"
time curl -s -X POST "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "attending",
    "notes": "Performance test",
    "guest_count": 0
  }' > /dev/null

# Test RSVP retrieval
echo "RSVP Retrieval:"
time curl -s -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvp" \
  -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null

# Test RSVP list
echo "RSVP List:"
time curl -s -X GET "$BASE_URL/connect-room-events/$EVENT_ID/rsvps" \
  -H "Authorization: Bearer $AUTH_TOKEN" > /dev/null
```

---

## ✅ Test Checklist

### Functional Testing
- [ ] Create RSVP with all status types (attending, not_attending, maybe)
- [ ] Create RSVP with notes and guest count
- [ ] Update existing RSVP
- [ ] Get your RSVP
- [ ] Get all RSVPs
- [ ] Filter RSVPs by status
- [ ] Delete RSVP
- [ ] Enhanced event responses include RSVP data

### Error Handling
- [ ] Invalid status validation
- [ ] Missing required fields
- [ ] Excessive guest count
- [ ] Long notes validation
- [ ] Non-member access control
- [ ] Invalid event ID
- [ ] Missing authentication
- [ ] Invalid authentication

### Integration Testing
- [ ] Complete RSVP workflow
- [ ] Activity tracking updates
- [ ] Room activity sorting affected
- [ ] Event listing includes RSVP data
- [ ] Individual event includes RSVP data

### Performance Testing
- [ ] Response times under 500ms
- [ ] Concurrent RSVP creation
- [ ] Large RSVP lists (100+ responses)
- [ ] Database performance with many RSVPs

---

## 🐛 Common Issues & Solutions

### Issue: 403 Forbidden
**Cause**: User is not a member of the room
**Solution**: Ensure user is added as a member of the connect room

### Issue: 404 Not Found
**Cause**: Event doesn't exist or is inactive
**Solution**: Verify event ID and ensure event is active

### Issue: Validation Errors
**Cause**: Invalid request data
**Solution**: Check request body against validation rules

### Issue: Activity Not Updating
**Cause**: Observer not registered or database issue
**Solution**: Verify observer is registered in AppServiceProvider

---

## 📞 Support

If you encounter issues during testing:
1. Check the error response for specific details
2. Verify your authentication token is valid
3. Ensure you're a member of the connect room
4. Check that the event exists and is active
5. Review the validation rules for request data

For additional support, refer to the main API documentation or contact the development team.

---

*Testing Guide v1.0 - January 8, 2025*
