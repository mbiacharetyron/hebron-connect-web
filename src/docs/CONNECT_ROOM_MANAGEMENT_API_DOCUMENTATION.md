# Connect Room Management API Documentation

This document provides comprehensive API documentation for managing events, contributions, and announcements within connect rooms.

## Table of Contents

1. [Events Management](#events-management)
2. [Contributions Management](#contributions-management)
3. [Announcements Management](#announcements-management)
4. [Common Response Formats](#common-response-formats)
5. [Error Handling](#error-handling)
6. [Authentication](#authentication)

---

## Events Management

Events allow room owners and admins to schedule and manage activities within connect rooms.

### 1. List Events

**GET** `/api/v1/connect-room/{room}/events`

Get all events for a specific connect room with filtering and pagination options.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for pagination (default: 1) |
| `per_page` | integer | No | Number of items per page (default: 10) |
| `start_date` | string | No | Filter events after this date (ISO 8601 format) |
| `end_date` | string | No | Filter events before this date (ISO 8601 format) |
| `status` | string | No | Filter by event status: `upcoming`, `past`, `all` (default: `upcoming`) |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Events retrieved successfully",
  "data": {
    "events": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "title": "Team Meeting",
          "description": "Weekly team sync meeting",
          "start_date": "2024-03-20T10:00:00Z",
          "end_date": "2024-03-20T11:00:00Z",
          "location": "Conference Room A",
          "is_online": false,
          "meeting_link": "https://meet.google.com/xxx-yyyy-zzz",
          "created_at": "2024-03-15T09:00:00Z",
          "creator": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe"
          }
        }
      ],
      "first_page_url": "http://api.example.com/api/v1/connect-room/1/events?page=1",
      "from": 1,
      "last_page": 3,
      "last_page_url": "http://api.example.com/api/v1/connect-room/1/events?page=3",
      "next_page_url": "http://api.example.com/api/v1/connect-room/1/events?page=2",
      "path": "http://api.example.com/api/v1/connect-room/1/events",
      "per_page": 10,
      "prev_page_url": null,
      "to": 10,
      "total": 25
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a member of the room
- **404 Not Found**: Connect room not found

---

### 2. Create Event

**POST** `/api/v1/connect-room/{room}/event`

Create a new event in a connect room. Only room owners and admins can create events.

#### Request Body

```json
{
  "title": "Team Meeting",
  "description": "Weekly team sync meeting",
  "start_date": "2024-03-20T10:00:00Z",
  "end_date": "2024-03-20T11:00:00Z",
  "location": "Conference Room A",
  "is_online": false,
  "meeting_link": "https://meet.google.com/xxx-yyyy-zzz"
}
```

#### Required Fields

- `title` (string, max 255 characters)
- `description` (string)
- `start_date` (ISO 8601 datetime, must be in the future)

#### Optional Fields

- `end_date` (ISO 8601 datetime, must be after start_date)
- `location` (string, max 255 characters)
- `is_online` (boolean)
- `meeting_link` (string)
- `image` (file upload - images only, max 2MB)

#### Success Response (201)

```json
{
  "status": "success",
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": 1,
      "title": "Team Meeting",
      "description": "Weekly team sync meeting",
      "start_date": "2024-03-20T10:00:00Z",
      "end_date": "2024-03-20T11:00:00Z",
      "location": "Conference Room A",
      "is_online": false,
      "meeting_link": "https://meet.google.com/xxx-yyyy-zzz",
      "created_at": "2024-03-15T09:00:00Z",
      "creator": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      }
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can create events
- **404 Not Found**: Connect room not found
- **422 Validation Error**: Invalid input data

---

### 3. Get Event Details

**GET** `/api/v1/connect-room/{room}/event/{event}`

Get detailed information about a specific event.

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Event details retrieved successfully",
  "data": {
    "event": {
      "id": 1,
      "title": "Team Meeting",
      "description": "Weekly team sync meeting",
      "start_date": "2024-03-20T10:00:00Z",
      "end_date": "2024-03-20T11:00:00Z",
      "location": "Conference Room A",
      "is_online": false,
      "meeting_link": "https://meet.google.com/xxx-yyyy-zzz",
      "created_at": "2024-03-15T09:00:00Z",
      "updated_at": "2024-03-16T14:30:00Z",
      "creator": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "last_updated_by": {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith"
      }
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a member of the room
- **404 Not Found**: Event not found

---

### 4. Update Event

**PUT** `/api/v1/connect-room/{room}/event/{event}`

Update an existing event. Only the event creator or room admins can update events.

#### Request Body

```json
{
  "title": "Updated Team Meeting",
  "description": "Updated weekly team sync meeting",
  "start_date": "2024-03-21T10:00:00Z",
  "end_date": "2024-03-21T11:00:00Z",
  "location": "Conference Room B",
  "is_online": true,
  "meeting_link": "https://meet.google.com/xxx-yyyy-zzz"
}
```

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Event updated successfully",
  "data": {
    "event": {
      "id": 1,
      "title": "Updated Team Meeting",
      "description": "Updated weekly team sync meeting",
      "start_date": "2024-03-21T10:00:00Z",
      "end_date": "2024-03-21T11:00:00Z",
      "location": "Conference Room B",
      "is_online": true,
      "meeting_link": "https://meet.google.com/xxx-yyyy-zzz",
      "created_at": "2024-03-15T09:00:00Z",
      "updated_at": "2024-03-16T15:45:00Z",
      "creator": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "last_updated_by": {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith"
      }
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: Only event creator or room admins can update events
- **404 Not Found**: Event not found
- **422 Validation Error**: Invalid input data

---

### 5. Delete Event

**DELETE** `/api/v1/connect-room/{room}/event/{event}`

Delete an event. Only the event creator or room owners can delete events.

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Event deleted successfully"
}
```

#### Error Responses

- **403 Forbidden**: Only event creator or room owners can delete events
- **404 Not Found**: Event not found

---

## Contributions Management

Contributions allow room owners and admins to create financial obligations for room members.

### 1. Create Contribution

**POST** `/api/v1/connect-room/{room}/contribution`

Create a new contribution for a connect room. Only room owners and admins can create contributions.

#### Request Body

```json
{
  "title": "Monthly Contribution",
  "amount": 100.00,
  "currency": "USD",
  "contribution_type": "monthly",
  "description": "Monthly contribution for March",
  "deadline": "2024-03-17",
  "notes": "Additional notes about the contribution"
}
```

#### Required Fields

- `title` (string, max 255 characters)
- `currency` (string, 3 characters - ISO currency code)
- `contribution_type` (string)
- `deadline` (date in YYYY-MM-DD format)

#### Optional Fields

- `amount` (number, minimum 0)
- `description` (string, max 1000 characters)
- `notes` (string, max 1000 characters)

#### Success Response (201)

```json
{
  "message": "Contribution created successfully",
  "data": {
    "id": 1,
    "title": "Monthly Contribution",
    "amount": 100.00,
    "currency": "USD",
    "contribution_type": "monthly",
    "description": "Monthly contribution for March",
    "deadline": "2024-03-17",
    "status": "open",
    "notes": "Additional notes about the contribution",
    "created_at": "2024-03-15T09:00:00Z",
    "updated_at": "2024-03-15T09:00:00Z"
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can create contributions
- **404 Not Found**: Room not found
- **422 Validation Error**: Invalid input data

---

### 2. List Contributions

**GET** `/api/v1/connect-room/{room}/contributions`

Get all contributions for a connect room with filtering and pagination options.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: `open`, `closed` |
| `type` | string | No | Filter by contribution type |
| `start_date` | string | No | Filter by start date (YYYY-MM-DD) |
| `end_date` | string | No | Filter by end date (YYYY-MM-DD) |
| `per_page` | integer | No | Number of items per page (default: 15) |

#### Success Response (200)

```json
{
  "message": "Contributions retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Monthly Contribution",
      "amount": 100.00,
      "currency": "USD",
      "contribution_type": "monthly",
      "description": "Monthly contribution for March",
      "deadline": "2024-03-17",
      "status": "open",
      "notes": "Additional notes",
      "created_at": "2024-03-15T09:00:00Z",
      "updated_at": "2024-03-15T09:00:00Z",
      "creator": {
        "id": 1,
        "name": "John Doe"
      }
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 50
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a room member
- **404 Not Found**: Room not found

---

### 3. Get Contribution Details

**GET** `/api/v1/connect-room/{room}/contribution/{contribution}`

Get detailed information about a specific contribution.

#### Success Response (200)

```json
{
  "message": "Contribution details retrieved successfully",
  "data": {
    "id": 1,
    "title": "Monthly Contribution",
    "amount": 100.00,
    "currency": "USD",
    "contribution_type": "monthly",
    "description": "Monthly contribution for March",
    "deadline": "2024-03-17",
    "status": "open",
    "notes": "Additional notes",
    "created_at": "2024-03-15T09:00:00Z",
    "updated_at": "2024-03-15T09:00:00Z",
    "creator": {
      "id": 1,
      "name": "John Doe"
    },
    "last_updater": {
      "id": 1,
      "name": "John Doe"
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a room member
- **404 Not Found**: Room or contribution not found

---

### 4. Update Contribution

**PUT** `/api/v1/connect-room/{room}/contribution/{contribution}`

Update an existing contribution. Only room owners and admins can update contributions.

#### Request Body

```json
{
  "title": "Updated Monthly Contribution",
  "amount": 150.00,
  "currency": "USD",
  "contribution_type": "monthly",
  "description": "Updated monthly contribution for March",
  "deadline": "2024-03-20",
  "status": "open",
  "notes": "Updated notes"
}
```

#### Success Response (200)

```json
{
  "message": "Contribution updated successfully",
  "data": {
    "id": 1,
    "title": "Updated Monthly Contribution",
    "amount": 150.00,
    "currency": "USD",
    "contribution_type": "monthly",
    "description": "Updated monthly contribution for March",
    "deadline": "2024-03-20",
    "status": "open",
    "notes": "Updated notes",
    "updated_at": "2024-03-16T14:30:00Z",
    "updater": {
      "id": 1,
      "name": "John Doe"
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can update contributions
- **404 Not Found**: Room or contribution not found
- **422 Validation Error**: Invalid input data

---

### 5. Delete Contribution

**DELETE** `/api/v1/connect-room/{room}/contribution/{contribution}`

Delete a contribution. Only room owners and admins can delete contributions.

#### Success Response (200)

```json
{
  "message": "Contribution deleted successfully"
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can delete contributions
- **404 Not Found**: Room or contribution not found

---

### 6. List Paid Members

**GET** `/api/v1/connect-room/{room}/contribution/{contribution}/paid-members`

Get a list of all members who have paid for a specific contribution.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for pagination (default: 1) |
| `per_page` | integer | No | Number of items per page (default: 15) |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Paid members retrieved successfully",
  "data": {
    "summary": {
      "total_paid": 50000,
      "total_members": 10,
      "paid_members": 5,
      "total_payments": 8,
      "target_amount": 100000,
      "deadline": "2024-03-17T23:59:59Z",
      "is_active": true
    },
    "paid_members": {
      "current_page": 1,
      "per_page": 15,
      "total": 5,
      "data": [
        {
          "id": 1,
          "total_amount": 10000,
          "payment_count": 1,
          "first_payment": "2024-03-15T10:00:00Z",
          "last_payment": "2024-03-15T10:00:00Z",
          "payment_methods": ["MTN_MOMO"],
          "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "237612345678",
            "profile_image": "https://example.com/photo.jpg"
          }
        }
      ]
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a room member
- **404 Not Found**: Room or contribution not found

---

## Announcements Management

Announcements allow room owners and admins to share important information with room members.

### 1. Create Announcement

**POST** `/api/v1/connect-room/{room}/announcement`

Create a new announcement in a connect room. Only room owners and admins can create announcements.

#### Request Body

```json
{
  "title": "Important Update",
  "description": "This is an important announcement for all members.",
  "is_pinned": false
}
```

#### Required Fields

- `title` (string, max 255 characters)
- `description` (string)

#### Optional Fields

- `is_pinned` (boolean, default: false)
- `file` (file upload - various formats, max 10MB)

#### Success Response (201)

```json
{
  "status": "success",
  "message": "Announcement created successfully",
  "data": {
    "announcement": {
      "id": 1,
      "title": "Important Update",
      "description": "This is an important announcement for all members.",
      "is_pinned": false,
      "created_at": "2024-03-15T09:00:00Z",
      "creator": {
        "id": 1,
        "name": "John Doe"
      },
      "file": "https://s3.amazonaws.com/bucket/production/rooms/1/announcements/files/announcement_123.pdf"
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can create announcements
- **404 Not Found**: Room not found
- **422 Validation Error**: Invalid input data

---

### 2. List Announcements

**GET** `/api/v1/connect-room/{room}/announcements`

Get all announcements for a connect room with pagination and sorting options.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number for pagination (default: 1) |
| `per_page` | integer | No | Number of items per page (default: 10) |
| `sort_by` | string | No | Sort field: `created_at`, `is_pinned` (default: `created_at`) |
| `sort_order` | string | No | Sort order: `asc`, `desc` (default: `desc`) |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Announcements retrieved successfully",
  "data": {
    "announcements": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "title": "Important Update",
          "description": "This is an important announcement.",
          "is_pinned": true,
          "pinned_at": "2024-03-15T09:00:00Z",
          "created_at": "2024-03-15T09:00:00Z",
          "creator": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe"
          },
          "file": "https://s3.amazonaws.com/bucket/production/rooms/1/announcements/files/announcement_123.pdf"
        }
      ],
      "first_page_url": "http://api.example.com/api/v1/connect-room/1/announcements?page=1",
      "from": 1,
      "last_page": 2,
      "last_page_url": "http://api.example.com/api/v1/connect-room/1/announcements?page=2",
      "next_page_url": "http://api.example.com/api/v1/connect-room/1/announcements?page=2",
      "path": "http://api.example.com/api/v1/connect-room/1/announcements",
      "per_page": 10,
      "prev_page_url": null,
      "to": 10,
      "total": 15
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a member of the room
- **404 Not Found**: Room not found

---

### 3. Get Announcement Details

**GET** `/api/v1/connect-room/{room}/announcement/{announcement}`

Get detailed information about a specific announcement.

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Announcement details retrieved successfully",
  "data": {
    "announcement": {
      "id": 1,
      "title": "Important Update",
      "description": "This is an important announcement.",
      "is_pinned": true,
      "pinned_at": "2024-03-15T09:00:00Z",
      "created_at": "2024-03-15T09:00:00Z",
      "updated_at": "2024-03-16T14:30:00Z",
      "creator": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "file": "https://s3.amazonaws.com/bucket/production/rooms/1/announcements/files/announcement_123.pdf"
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: User is not a member of the room
- **404 Not Found**: Announcement not found

---

### 4. Update Announcement

**PUT** `/api/v1/connect-room/{room}/announcement/{announcement}`

Update an existing announcement. Only room owners and admins can update announcements.

#### Request Body

```json
{
  "title": "Updated Important Notice",
  "description": "This is an updated announcement.",
  "is_pinned": true
}
```

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Announcement updated successfully",
  "data": {
    "announcement": {
      "id": 1,
      "title": "Updated Important Notice",
      "description": "This is an updated announcement.",
      "is_pinned": true,
      "pinned_at": "2024-03-16T15:45:00Z",
      "created_at": "2024-03-15T09:00:00Z",
      "updated_at": "2024-03-16T15:45:00Z",
      "creator": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
      },
      "last_updated_by": {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "file": "https://s3.amazonaws.com/bucket/production/rooms/1/announcements/files/announcement_123.pdf"
    }
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can update announcements
- **404 Not Found**: Announcement not found
- **422 Validation Error**: Invalid input data

---

### 5. Delete Announcement

**DELETE** `/api/v1/connect-room/{room}/announcement/{announcement}`

Delete an announcement. Only room owners and admins can delete announcements.

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Announcement deleted successfully"
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can delete announcements
- **404 Not Found**: Announcement not found

---

## Common Response Formats

### Success Response Format

All successful API responses follow this format:

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Format

All error responses follow this format:

```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    // Validation errors (if applicable)
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

### Common Error Messages

- **Authentication Required**: `"Authentication required"`
- **Insufficient Permissions**: `"You don't have permission to perform this action"`
- **Resource Not Found**: `"Resource not found"`
- **Validation Error**: `"The given data was invalid"`
- **Server Error**: `"An internal server error occurred"`

---

## Authentication

All API endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer {your-token}
```

### Permission Levels

1. **Room Members**: Can view events, contributions, and announcements
2. **Room Admins**: Can create, update, and delete events, contributions, and announcements
3. **Room Owners**: Full access to all room management features

### Role-Based Access Control

- **Events**: Only owners and admins can create/update/delete
- **Contributions**: Only owners and admins can create/update/delete
- **Announcements**: Only owners and admins can create/update/delete
- **Viewing**: All room members can view all content

---

## File Upload Guidelines

### Supported File Types

**Events:**
- Images: JPEG, PNG, JPG
- Maximum size: 2MB

**Announcements:**
- Images: JPEG, PNG, JPG, GIF
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Archives: ZIP, RAR
- Maximum size: 10MB

### File Storage

All uploaded files are stored on AWS S3 and accessible via public URLs. File URLs are automatically generated and included in API responses.

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **File uploads**: 10 uploads per hour per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default varies by endpoint)

Pagination metadata is included in list responses:

```json
{
  "current_page": 1,
  "per_page": 10,
  "total": 100,
  "last_page": 10,
  "from": 1,
  "to": 10,
  "first_page_url": "...",
  "last_page_url": "...",
  "next_page_url": "...",
  "prev_page_url": null
}
```

---

## Examples

### Complete Event Management Flow

```bash
# 1. Create an event
curl -X POST "https://api.example.com/api/v1/connect-room/1/event" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "start_date": "2024-03-20T10:00:00Z",
    "end_date": "2024-03-20T11:00:00Z",
    "location": "Conference Room A"
  }'

# 2. List events
curl -X GET "https://api.example.com/api/v1/connect-room/1/events?status=upcoming" \
  -H "Authorization: Bearer {token}"

# 3. Update event
curl -X PUT "https://api.example.com/api/v1/connect-room/1/event/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Team Meeting",
    "location": "Conference Room B"
  }'

# 4. Delete event
curl -X DELETE "https://api.example.com/api/v1/connect-room/1/event/1" \
  -H "Authorization: Bearer {token}"
```

### Complete Contribution Management Flow

```bash
# 1. Create a contribution
curl -X POST "https://api.example.com/api/v1/connect-room/1/contribution" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Monthly Contribution",
    "amount": 100.00,
    "currency": "USD",
    "contribution_type": "monthly",
    "deadline": "2024-03-17"
  }'

# 2. List contributions
curl -X GET "https://api.example.com/api/v1/connect-room/1/contributions?status=open" \
  -H "Authorization: Bearer {token}"

# 3. Get paid members
curl -X GET "https://api.example.com/api/v1/connect-room/1/contribution/1/paid-members" \
  -H "Authorization: Bearer {token}"
```

### Complete Announcement Management Flow

```bash
# 1. Create an announcement
curl -X POST "https://api.example.com/api/v1/connect-room/1/announcement" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Important Update",
    "description": "This is an important announcement.",
    "is_pinned": true
  }'

# 2. List announcements
curl -X GET "https://api.example.com/api/v1/connect-room/1/announcements?sort_by=is_pinned&sort_order=desc" \
  -H "Authorization: Bearer {token}"

# 3. Update announcement
curl -X PUT "https://api.example.com/api/v1/connect-room/1/announcement/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Important Notice",
    "is_pinned": false
  }'
```

---

This documentation provides comprehensive coverage of all events, contributions, and announcements management APIs. For additional support or questions, please contact the development team.
