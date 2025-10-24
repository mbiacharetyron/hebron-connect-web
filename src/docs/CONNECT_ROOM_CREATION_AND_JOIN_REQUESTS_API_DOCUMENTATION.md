# Connect Room Creation and Join Requests API Documentation

This document provides comprehensive documentation for creating connect rooms and managing join requests in the Hebron Connect Backend API.

## Table of Contents

1. [Authentication](#authentication)
2. [Connect Room Creation](#connect-room-creation)
3. [Join Request Management](#join-request-management)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

---

## Authentication

All API endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer {your_access_token}
```

---

## Connect Room Creation

### Create a New Connect Room

Creates a new connect room with optional questions for new members.

**Endpoint:** `POST /api/v1/connect-room`

**Authentication:** Required

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Room name (max 255 characters) |
| `description` | string | Yes | Room description |
| `category_id` | integer | Yes | ID of the room category |
| `is_private` | boolean | No | Whether the room is private (default: false) |
| `max_members` | integer | No | Maximum number of members (default: 100) |
| `room_image` | file | No | Room image file (max 2MB, jpg/jpeg/png) |
| `questions` | array | No | Questions for new members (max 5) |

**Questions Array Structure:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | string | Yes | The question text |
| `type` | string | Yes | Question type: `text`, `single_choice`, `multiple_choice` |
| `options` | array | No | Required for choice types - array of options |
| `is_required` | boolean | No | Whether the question is required (default: true) |
| `order` | integer | No | Display order (default: 0) |

**Example Request:**

```json
{
  "name": "Tech Enthusiasts Hub",
  "description": "A community for technology enthusiasts to share ideas and collaborate",
  "category_id": 1,
  "is_private": false,
  "max_members": 50,
  "questions": [
    {
      "question": "What is your main interest in this room?",
      "type": "single_choice",
      "options": ["Web Development", "Mobile Development", "AI/ML", "DevOps"],
      "is_required": true,
      "order": 0
    },
    {
      "question": "How many years of experience do you have?",
      "type": "single_choice",
      "options": ["0-1 years", "2-3 years", "4-5 years", "5+ years"],
      "is_required": true,
      "order": 1
    },
    {
      "question": "Tell us about yourself",
      "type": "text",
      "is_required": false,
      "order": 2
    }
  ]
}
```

**Success Response (201):**

```json
{
  "status": "success",
  "message": "Room created successfully",
  "data": {
    "room": {
      "id": 1,
      "name": "Tech Enthusiasts Hub",
      "description": "A community for technology enthusiasts to share ideas and collaborate",
      "room_image": "https://s3.amazonaws.com/bucket/production/rooms/1/original/image.jpg",
      "room_image_thumbnail": "https://s3.amazonaws.com/bucket/production/rooms/1/thumbnail/image.jpg",
      "category_id": 1,
      "owner_id": 1,
      "join_code": "ABC123XYZ",
      "reference_number": "CR-0000001",
      "is_private": false,
      "max_members": 50,
      "member_count": 1,
      "created_at": "2024-03-20T15:30:00Z",
      "updated_at": "2024-03-20T15:30:00Z",
      "owner": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com"
      },
      "questions": [
        {
          "id": 1,
          "question": "What is your main interest in this room?",
          "type": "single_choice",
          "options": ["Web Development", "Mobile Development", "AI/ML", "DevOps"],
          "is_required": true,
          "order": 0
        },
        {
          "id": 2,
          "question": "How many years of experience do you have?",
          "type": "single_choice",
          "options": ["0-1 years", "2-3 years", "4-5 years", "5+ years"],
          "is_required": true,
          "order": 1
        },
        {
          "id": 3,
          "question": "Tell us about yourself",
          "type": "text",
          "options": null,
          "is_required": false,
          "order": 2
        }
      ]
    }
  }
}
```

**Error Responses:**

- **412 Validation Error:**
```json
{
  "status": "error",
  "message": "Validation Error: The name field is required"
}
```

- **500 Server Error:**
```json
{
  "status": "error",
  "message": "Failed to create room"
}
```

---

## Join Request Management

### Send Join Request

Sends a request to join a connect room. If the room has questions, answers must be provided.

**Endpoint:** `POST /api/v1/connect-room/{room}/join-request`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `answers` | object | No | Answers to room questions (required if room has questions) |

**Answers Object Structure:**
- Key: Question ID (string)
- Value: Answer (string for text, string for single choice, array for multiple choice)

**Example Request:**

```json
{
  "answers": {
    "1": "Web Development",
    "2": "2-3 years",
    "3": "I'm a passionate developer with experience in React and Node.js"
  }
}
```

**Success Response (201):**

```json
{
  "status": "success",
  "message": "Join request sent successfully",
  "data": {}
}
```

**Error Responses:**

- **400 Bad Request:**
```json
{
  "status": "error",
  "message": "You are already a member of this room"
}
```

```json
{
  "status": "error",
  "message": "You already have a pending request for this room"
}
```

```json
{
  "status": "error",
  "message": "All required questions must be answered"
}
```

### List Join Requests

Lists all pending join requests for a connect room. Only accessible by room owners and admins.

**Endpoint:** `GET /api/v1/connect-room/{room}/join-requests`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for pagination (default: 1) |
| `per_page` | integer | No | Items per page (default: 10, max: 100) |
| `status` | string | No | Filter by status: `pending`, `approved`, `rejected` |

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Join requests retrieved successfully",
  "data": {
    "join_requests": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "connect_room_id": 1,
          "user_id": 2,
          "status": "pending",
          "created_at": "2024-03-20T16:00:00Z",
          "updated_at": "2024-03-20T16:00:00Z",
          "user": {
            "id": 2,
            "first_name": "Jane",
            "last_name": "Smith",
            "email": "jane.smith@example.com",
            "profile_image": "https://s3.amazonaws.com/bucket/production/users/2/profile.jpg"
          },
          "answers": [
            {
              "id": 1,
              "question_id": 1,
              "answer": "Web Development",
              "question": {
                "id": 1,
                "question": "What is your main interest in this room?",
                "type": "single_choice"
              }
            },
            {
              "id": 2,
              "question_id": 2,
              "answer": "2-3 years",
              "question": {
                "id": 2,
                "question": "How many years of experience do you have?",
                "type": "single_choice"
              }
            }
          ]
        }
      ],
      "first_page_url": "http://api.example.com/api/v1/connect-room/1/join-requests?page=1",
      "from": 1,
      "last_page": 1,
      "last_page_url": "http://api.example.com/api/v1/connect-room/1/join-requests?page=1",
      "next_page_url": null,
      "path": "http://api.example.com/api/v1/connect-room/1/join-requests",
      "per_page": 10,
      "prev_page_url": null,
      "to": 1,
      "total": 1
    }
  }
}
```

### Approve Join Request

Approves a join request and adds the user as a member of the room.

**Endpoint:** `POST /api/v1/connect-room/join-requests/{request}/approve`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | integer | Yes | ID of the join request |

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Join request approved successfully",
  "data": {}
}
```

**Error Responses:**

- **403 Forbidden:**
```json
{
  "status": "error",
  "message": "You do not have permission to approve this request"
}
```

- **404 Not Found:**
```json
{
  "status": "error",
  "message": "Join request not found"
}
```

### Reject Join Request

Rejects a join request.

**Endpoint:** `POST /api/v1/connect-room/join-requests/{request}/reject`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request` | integer | Yes | ID of the join request |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | No | Reason for rejection |

**Example Request:**

```json
{
  "reason": "Does not meet the room requirements"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Join request rejected successfully",
  "data": {}
}
```

**Error Responses:**

- **403 Forbidden:**
```json
{
  "status": "error",
  "message": "You do not have permission to reject this request"
}
```

- **404 Not Found:**
```json
{
  "status": "error",
  "message": "Join request not found"
}
```

---

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 412 | Validation Error - Request validation failed |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

---

## Examples

### Complete Flow Example

1. **Create a Connect Room:**
```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Photography Club",
    "description": "A community for photography enthusiasts",
    "category_id": 2,
    "is_private": true,
    "max_members": 30,
    "questions": [
      {
        "question": "What type of photography interests you most?",
        "type": "single_choice",
        "options": ["Portrait", "Landscape", "Street", "Wildlife"],
        "is_required": true,
        "order": 0
      }
    ]
  }'
```

2. **Send Join Request:**
```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/1/join-request" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "1": "Portrait"
    }
  }'
```

3. **List Join Requests (as room owner/admin):**
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/connect-room/1/join-requests" \
  -H "Authorization: Bearer {access_token}"
```

4. **Approve Join Request:**
```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/join-requests/1/approve" \
  -H "Authorization: Bearer {access_token}"
```

### File Upload Example

When creating a room with an image:

```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room" \
  -H "Authorization: Bearer {access_token}" \
  -F "name=My Room" \
  -F "description=Room description" \
  -F "category_id=1" \
  -F "room_image=@/path/to/image.jpg" \
  -F "questions[0][question]=What is your interest?" \
  -F "questions[0][type]=text" \
  -F "questions[0][is_required]=true" \
  -F "questions[0][order]=0"
```

---

## Notes

1. **Room Creation:**
   - The creator automatically becomes the room owner and first member
   - A unique join code is generated for each room
   - A reference number is assigned for tracking
   - Room images are automatically resized and thumbnails are created

2. **Join Requests:**
   - Users can only have one pending request per room
   - All required questions must be answered
   - Email notifications are sent to room owners and admins
   - Approved requests are automatically deleted after processing

3. **Permissions:**
   - Only room owners and admins can view and manage join requests
   - Users cannot join rooms they're already members of
   - Private rooms require approval for all join requests

4. **File Uploads:**
   - Room images are stored on AWS S3
   - Maximum file size: 2MB
   - Supported formats: JPG, JPEG, PNG
   - Images are automatically optimized and thumbnails are generated

5. **Questions:**
   - Maximum 5 questions per room
   - Question types: text, single_choice, multiple_choice
   - Options are required for choice-type questions
   - Questions can be marked as required or optional
