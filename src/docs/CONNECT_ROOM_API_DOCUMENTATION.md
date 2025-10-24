# Connect Room API Documentation

## Overview
The Connect Room API provides comprehensive functionality for managing connect rooms, including creation, updates, member management, wallet operations, questions, and administrative functions.

## Base URL
```
https://your-api-domain.com/api/v1
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Endpoints

### 1. Create Connect Room
**POST** `/connect-room`

Create a new connect room with optional questions and room image.

#### Request Body
```json
{
  "name": "My Connect Room",
  "description": "A room for connecting people",
  "category_id": 1,
  "is_private": false,
  "max_members": 100,
  "room_image": "file_upload",
  "questions": [
    {
      "question": "What is your main interest in this room?",
      "type": "text",
      "is_required": true,
      "order": 0
    },
    {
      "question": "How did you hear about us?",
      "type": "single_choice",
      "options": ["Social Media", "Friend", "Website", "Other"],
      "is_required": true,
      "order": 1
    }
  ]
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Room name (max 255 characters) |
| `description` | string | Yes | Room description |
| `category_id` | integer | Yes | Valid category ID |
| `is_private` | boolean | No | Whether room is private (default: false) |
| `max_members` | integer | No | Maximum number of members |
| `room_image` | file | No | Room image (max 2MB, jpg/jpeg/png) |
| `questions` | array | No | Questions for new members (max 5) |

#### Question Object
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | Yes | Question text (max 500 characters) |
| `type` | string | Yes | Question type (text, single_choice, multiple_choice) |
| `options` | array | No | Required for choice types (min 2 options) |
| `is_required` | boolean | No | Whether question is required |
| `order` | integer | No | Display order |

#### Success Response (201)
```json
{
  "status": "success",
  "message": "Room created successfully",
  "data": {
    "room": {
      "id": 1,
      "name": "My Connect Room",
      "description": "A room for connecting people",
      "room_image": "https://s3.../rooms/1/original/image.jpg",
      "room_image_thumbnail": "https://s3.../rooms/1/thumbnail/image.jpg",
      "category_id": 1,
      "owner_id": 1,
      "join_code": "ABC123XYZ",
      "reference_number": "CR-0000001",
      "is_private": false,
      "max_members": 100,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "owner": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "questions": [
        {
          "id": 1,
          "question": "What is your main interest in this room?",
          "type": "text",
          "options": null,
          "is_required": true,
          "order": 0
        }
      ]
    }
  }
}
```

---

### 2. Update Connect Room
**PUT** `/connect-room/{room_id}`

Update connect room details. Only room owner can update.

#### Request Body
```json
{
  "name": "Updated Room Name",
  "description": "Updated description",
  "category_id": 2,
  "is_private": true,
  "max_members": 50,
  "room_image": "file_upload"
}
```

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | No | Room name (max 255 characters) |
| `description` | string | No | Room description |
| `category_id` | integer | No | Valid category ID |
| `is_private` | boolean | No | Whether room is private |
| `max_members` | integer | No | Maximum number of members |
| `room_image` | file | No | New room image (max 2MB, jpg/jpeg/png) |

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Room updated successfully",
  "data": {
    "room": {
      "id": 1,
      "name": "Updated Room Name",
      "description": "Updated description",
      "room_image": "https://s3.../rooms/1/original/new_image.jpg",
      "room_image_thumbnail": "https://s3.../rooms/1/thumbnail/new_image.jpg",
      "category_id": 2,
      "is_private": true,
      "max_members": 50,
      "updated_at": "2024-01-15T11:30:00Z"
    }
  }
}
```

---

### 3. Search Connect Rooms
**GET** `/connect-rooms/search`

Search for public connect rooms. Private rooms are included only when exact join code is provided.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term for name, description, or exact join code |
| `category_id` | integer | No | Filter by category ID |
| `sort_by` | string | No | Sort field (name, created_at, member_count) |
| `sort_order` | string | No | Sort order (asc, desc) |

#### Example Request
```bash
GET /api/v1/connect-rooms/search?search=tech&sort_by=member_count&sort_order=desc
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Rooms retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Tech Enthusiasts",
      "description": "A room for tech lovers",
      "join_code": "TECH123",
      "reference_number": "CR-0000001",
      "room_image": "https://s3.../room_image.jpg",
      "room_image_thumbnail": "https://s3.../room_thumb.jpg",
      "member_count": 150,
      "category": {
        "id": 1,
        "name": "Technology"
      },
      "owner": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 4. List User's Rooms
**GET** `/connect-rooms/my-rooms`

Get all rooms where the authenticated user is a member.

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search term for room name or description |
| `sort_by` | string | No | Sort field (name, created_at, updated_at, member_count) |
| `sort_order` | string | No | Sort order (asc, desc) |

#### Success Response (200)
```json
{
  "status": "success",
  "message": "User rooms retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "My Tech Room",
      "description": "Technology discussion room",
      "join_code": "TECH123",
      "reference_number": "CR-0000001",
      "room_image": "https://s3.../room_image.jpg",
      "member_count": 25,
      "category": {
        "id": 1,
        "name": "Technology"
      },
      "owner": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "wallet": {
        "available_balance": 1000.00,
        "locked_balance": 200.00,
        "currency": "USD",
        "is_active": true
      },
      "announcements": [...],
      "events": [...],
      "contributions": [...],
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 5. Get Room Wallet Balance
**GET** `/connect-room/{room_id}/wallet`

Get wallet balance for a room. Only accessible by room owner and admins.

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Wallet balance retrieved successfully",
  "data": {
    "wallet": {
      "id": 1,
      "available_balance": 1000.00,
      "locked_balance": 200.00,
      "total_balance": 1200.00,
      "currency": "USD",
      "is_active": true,
      "last_transaction_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 6. Get Room Questions
**GET** `/connect-room/{room_id}/questions`

Get all questions for a room.

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Questions retrieved successfully",
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What is your main interest in this room?",
        "type": "text",
        "options": null,
        "is_required": true,
        "order": 0,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### 7. Add Room Question
**POST** `/connect-room/{room_id}/questions`

Add a new question to the room. Only room owner can add questions.

#### Request Body
```json
{
  "question": "What is your experience level?",
  "type": "single_choice",
  "options": ["Beginner", "Intermediate", "Advanced"],
  "is_required": true,
  "order": 1
}
```

#### Success Response (201)
```json
{
  "status": "success",
  "message": "Question added successfully",
  "data": {
    "question": {
      "id": 2,
      "question": "What is your experience level?",
      "type": "single_choice",
      "options": ["Beginner", "Intermediate", "Advanced"],
      "is_required": true,
      "order": 1,
      "created_at": "2024-01-15T11:30:00Z"
    }
  }
}
```

---

### 8. Update Room Question
**PUT** `/connect-room/{room_id}/questions/{question_id}`

Update an existing question. Only room owner can update questions.

#### Request Body
```json
{
  "question": "Updated question text",
  "type": "multiple_choice",
  "options": ["Option 1", "Option 2", "Option 3"],
  "is_required": false,
  "order": 2
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Question updated successfully",
  "data": {
    "question": {
      "id": 2,
      "question": "Updated question text",
      "type": "multiple_choice",
      "options": ["Option 1", "Option 2", "Option 3"],
      "is_required": false,
      "order": 2,
      "updated_at": "2024-01-15T12:30:00Z"
    }
  }
}
```

---

### 9. Delete Room Question
**DELETE** `/connect-room/{room_id}/questions/{question_id}`

Delete a question from the room. Only room owner can delete questions.

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Question deleted successfully"
}
```

---

### 10. Remove Room Member
**DELETE** `/connect-room/{room_id}/member/{member_id}`

Remove a member from the room. Only room owner and admins can remove members.

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Member removed successfully"
}
```

---

### 11. Request Room Deletion
**POST** `/connect-room/{room_id}/delete-request`

Request deletion of the room. Only room owner can request deletion.

#### Request Body
```json
{
  "reason": "Room is no longer needed",
  "confirmation_code": "DELETE123"
}
```

#### Success Response (201)
```json
{
  "status": "success",
  "message": "Deletion request submitted successfully",
  "data": {
    "deletion_request": {
      "id": 1,
      "reason": "Room is no longer needed",
      "status": "pending",
      "confirmation_code": "DELETE123",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 12. Confirm Room Deletion
**POST** `/connect-room/{room_id}/delete-request/{request_id}/confirm`

Confirm room deletion with the confirmation code.

#### Request Body
```json
{
  "confirmation_code": "DELETE123"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Room deletion confirmed and processed"
}
```

---

### 13. Reject Room Deletion
**POST** `/connect-room/{room_id}/delete-request/{request_id}/reject`

Reject a room deletion request. Only room owner can reject.

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Room deletion request rejected"
}
```

---

### 14. Cancel Deletion Request
**DELETE** `/connect-room/{room_id}/delete-request/{request_id}`

Cancel a pending deletion request. Only room owner can cancel.

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Deletion request cancelled"
}
```

---

### 15. Assign Admin
**POST** `/connect-room/{room_id}/assign-admin`

Assign admin role to a room member. Only room owner can assign admins.

#### Request Body
```json
{
  "user_id": 123
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Admin assigned successfully",
  "data": {
    "member": {
      "id": 123,
      "user_id": 123,
      "role": "admin",
      "assigned_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 16. Remove Admin
**POST** `/connect-room/{room_id}/remove-admin`

Remove admin role from a room member. Only room owner can remove admins.

#### Request Body
```json
{
  "user_id": 123
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Admin role removed successfully",
  "data": {
    "member": {
      "id": 123,
      "user_id": 123,
      "role": "member",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 17. Transfer Ownership
**POST** `/connect-room/{room_id}/transfer-ownership`

Transfer room ownership to another member. Only room owner can transfer ownership.

#### Request Body
```json
{
  "new_owner_id": 123,
  "confirmation_code": "TRANSFER123"
}
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Ownership transferred successfully",
  "data": {
    "room": {
      "id": 1,
      "owner_id": 123,
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "new_owner": {
      "id": 123,
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Bad request"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "You are not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Room not found"
}
```

### 422 Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "name": ["The name field is required."],
    "category_id": ["The selected category id is invalid."]
  }
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## Validation Rules

### Room Creation/Update
- `name`: Required, string, max 255 characters
- `description`: Required, string
- `category_id`: Required, must exist in categories table
- `is_private`: Boolean
- `max_members`: Integer, min 1
- `room_image`: Image file, max 2MB, jpg/jpeg/png only

### Questions
- `question`: Required, string, max 500 characters
- `type`: Required, must be text, single_choice, or multiple_choice
- `options`: Required for choice types, array with min 2 items
- `is_required`: Boolean
- `order`: Integer, min 0

### Admin Management
- `user_id`: Required, must be valid user ID and room member
- `confirmation_code`: Required for ownership transfer

---

## Role-Based Access Control

### Owner Permissions
- Create, update, delete room
- Add, update, delete questions
- Assign/remove admins
- Transfer ownership
- Request room deletion
- Access wallet information
- Remove any member

### Admin Permissions
- Access wallet information
- Remove regular members (not other admins or owner)
- View all room data

### Member Permissions
- View room information
- View questions
- Basic room interaction

---

## File Upload Guidelines

### Room Images
- **Max size**: 2MB
- **Allowed formats**: JPG, JPEG, PNG
- **Storage**: AWS S3 with automatic thumbnail generation
- **URLs**: Full URLs provided in responses

### Image Processing
- Original image stored in `rooms/{room_id}/original/`
- Thumbnail generated and stored in `rooms/{room_id}/thumbnail/`
- Automatic resizing and optimization

---

## Rate Limiting
- No specific rate limits currently enforced
- Recommended: Implement client-side throttling for file uploads

---

## Notes
- All timestamps are in ISO 8601 format
- Room join codes are automatically generated (10 characters, uppercase)
- Reference numbers are auto-generated (CR-0000001 format)
- Soft-deleted rooms and members are excluded from results
- Wallet operations require owner or admin access
- Question types: text (free text), single_choice (one option), multiple_choice (multiple options)
- Room deletion requires confirmation code for security
- Ownership transfer requires confirmation code
- All file uploads are validated and processed securely
