# Connect Room Member Search API Documentation

## Overview
The Connect Room Member Search API allows members to search for other members within their connect rooms using various filters and sorting options. Members are always returned in role hierarchy order: owners first, then admins, then regular members.

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

### Search Members
**GET** `/connect-room/{room_id}/members/search`

Search for members within a specific connect room.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room_id` | integer | Yes | ID of the connect room |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (searches first_name, last_name, email, full name) |
| `role` | string | No | - | Filter by member role (owner, admin, member) |
| `joined_from` | string | No | - | Filter members who joined from this date (YYYY-MM-DD) |
| `joined_to` | string | No | - | Filter members who joined until this date (YYYY-MM-DD) |
| `is_verified` | boolean | No | - | Filter by user verification status (true, false) |
| `sort_by` | string | No | `joined_at` | Sort field (joined_at, first_name, last_name, role) |
| `sort_order` | string | No | `desc` | Sort order (asc, desc) |
| `page` | integer | No | `1` | Page number for pagination |
| `per_page` | integer | No | `10` | Items per page (max 50) |

#### Example Request
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/v1/connect-room/123/members/search?q=john&role=member&sort_by=joined_at&sort_order=desc"
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "members": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "role": "member",
        "is_verified": true,
        "profile_image": "https://s3.amazonaws.com/bucket/path/profile.jpg",
        "profile_image_thumbnail": "https://s3.amazonaws.com/bucket/path/profile_thumb.jpg",
        "joined_at": "2024-01-15T10:30:00.000000Z",
        "last_active_at": "2024-01-20T14:22:00.000000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "per_page": 10,
      "current_page": 1,
      "last_page": 3
    },
    "search_meta": {
      "query": "john",
      "total_results": 25,
      "filters_applied": {
        "role": "member"
      }
    }
  }
}
```

### List All Members
**GET** `/connect-room/{room_id}/members`

List all members in a connect room with optional filtering and sorting.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room_id` | integer | Yes | ID of the connect room |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `role` | string | No | - | Filter by member role (owner, admin, member) |
| `sort_by` | string | No | `joined_at` | Sort field (joined_at, first_name, last_name, role) |
| `sort_order` | string | No | `desc` | Sort order (asc, desc) |
| `page` | integer | No | `1` | Page number for pagination |
| `per_page` | integer | No | `10` | Items per page (max 50) |

#### Example Request
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/v1/connect-room/123/members?role=admin&sort_by=first_name&sort_order=asc"
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Members retrieved successfully",
  "data": {
    "members": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "role": "admin",
        "is_verified": true,
        "profile_image": "https://s3.amazonaws.com/bucket/path/profile.jpg",
        "profile_image_thumbnail": "https://s3.amazonaws.com/bucket/path/profile_thumb.jpg",
        "joined_at": "2024-01-15T10:30:00.000000Z",
        "last_active_at": "2024-01-20T14:22:00.000000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "per_page": 10,
      "current_page": 1,
      "last_page": 2
    }
  }
}
```

---

## Error Responses

### 403 Forbidden - Not a room member
```json
{
  "status": "error",
  "message": "You are not a member of this room"
}
```

### 422 Validation Error
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "q": ["The q field is required."],
    "role": ["The selected role is invalid."],
    "joined_to": ["The joined to must be a date after or equal to joined from."]
  }
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Room not found"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Failed to search room members"
}
```

---

## Response Fields

### Member Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique user identifier |
| `first_name` | string | User's first name |
| `last_name` | string | User's last name |
| `email` | string | User's email address |
| `phone` | string | User's phone number |
| `role` | string | Member role in the room (owner, admin, member) |
| `is_verified` | boolean | Whether the user account is verified |
| `profile_image` | string | Full URL to user's profile image |
| `profile_image_thumbnail` | string | Full URL to user's profile image thumbnail |
| `joined_at` | string | When the user joined the room (ISO 8601) |
| `last_active_at` | string | When the user was last active (ISO 8601) |

### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of members |
| `per_page` | integer | Number of items per page |
| `current_page` | integer | Current page number |
| `last_page` | integer | Last page number |

### Search Meta Object (Search endpoint only)
| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Original search query |
| `total_results` | integer | Total number of results found |
| `filters_applied` | object | Filters that were applied to the search |

---

## Usage Examples

### Basic Member Search
```javascript
fetch('/api/v1/connect-room/123/members/search?q=john', {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Advanced Search with Filters
```javascript
const params = new URLSearchParams({
  q: 'admin',
  role: 'admin',
  joined_from: '2024-01-01',
  is_verified: true,
  sort_by: 'joined_at',
  sort_order: 'desc',
  page: 1,
  per_page: 20
});

fetch(`/api/v1/connect-room/123/members/search?${params}`, {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Search by Role
```javascript
// Find all admins
const admins = await fetch('/api/v1/connect-room/123/members/search?q=&role=admin', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

### Search by Join Date Range
```javascript
// Find members who joined in the last month
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

const recentMembers = await fetch(`/api/v1/connect-room/123/members/search?q=&joined_from=${lastMonth.toISOString().split('T')[0]}`, {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

### Search Verified Members Only
```javascript
// Find verified members
const verifiedMembers = await fetch('/api/v1/connect-room/123/members/search?q=&is_verified=true', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

### List All Members with Pagination
```javascript
// Get second page of all members
const page2 = await fetch('/api/v1/connect-room/123/members?page=2&per_page=20', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

---

## Validation Rules

### Required Fields
- `q` (search query) - Must be provided and non-empty for search endpoint

### Field Validation
- `q`: Maximum 255 characters
- `role`: Must be one of: owner, admin, member
- `joined_from`: Must be a valid date in YYYY-MM-DD format
- `joined_to`: Must be a valid date in YYYY-MM-DD format and after or equal to joined_from
- `is_verified`: Must be a boolean value (true, false)
- `sort_by`: Must be one of: joined_at, first_name, last_name, role
- `sort_order`: Must be one of: asc, desc
- `page`: Must be a positive integer
- `per_page`: Must be between 1 and 50

---

## Search Features

### Text Search
The search query (`q` parameter) searches across:
- First name
- Last name
- Email address
- Full name (first name + last name combined)

### Role Filtering
Filter members by their role in the room:
- `owner`: Room owner
- `admin`: Room administrator
- `member`: Regular member

### Date Range Filtering
Filter members by when they joined the room:
- `joined_from`: Members who joined from this date onwards
- `joined_to`: Members who joined up to this date

### Verification Status
Filter members by their account verification status:
- `true`: Only verified users
- `false`: Only unverified users

### Sorting Options
Sort results by:
- `joined_at`: When they joined the room (default)
- `first_name`: Alphabetical by first name
- `last_name`: Alphabetical by last name
- `role`: By role (owner, admin, member)

**Note**: All sorting options prioritize role hierarchy: owners are always listed first, followed by admins, then regular members. Within each role group, the specified sort field is applied.

---

## Security & Privacy

### Access Control
- Only room members can search other members
- Users can only search within rooms they belong to
- Soft-deleted users are excluded from search results

### Data Privacy
- All user data is returned as stored in the database
- Profile images are served through secure S3 URLs
- Phone numbers and emails are included (consider privacy requirements)

---

## Rate Limiting
- No specific rate limits are currently enforced
- Recommended: Implement client-side throttling for search requests

---

## Error Codes
| Code | Description |
|------|-------------|
| 200 | Success |
| 403 | Forbidden - User is not a member of the room |
| 404 | Not Found - Room not found |
| 422 | Validation Error - Invalid request parameters |
| 500 | Internal Server Error - Server-side error |

---

## Notes
- Search is case-insensitive
- Results are paginated by default
- Profile image URLs may expire and need to be refreshed
- Soft-deleted members are excluded from search results
- The search endpoint requires a query parameter, while the list endpoint does not
- Full name search combines first_name and last_name for better results
