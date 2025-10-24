# Document Search API Documentation

## Overview
The Document Search API allows members to search for documents within connect rooms using various filters and sorting options.

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

### Search Documents
**GET** `/connect-room/{room_id}/documents/search`

Search for documents within a specific connect room.

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room_id` | integer | Yes | ID of the connect room |

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Search query (searches title, description, file_name) |
| `file_type` | string | No | - | Filter by file type (pdf, doc, docx, xls, xlsx, txt) |
| `uploaded_by` | integer | No | - | Filter by uploader user ID |
| `date_from` | string | No | - | Filter from date (YYYY-MM-DD) |
| `date_to` | string | No | - | Filter to date (YYYY-MM-DD) |
| `size_min` | integer | No | - | Minimum file size in bytes |
| `size_max` | integer | No | - | Maximum file size in bytes |
| `sort_by` | string | No | `created_at` | Sort field (created_at, title, file_size, file_name) |
| `sort_order` | string | No | `desc` | Sort order (asc, desc) |
| `page` | integer | No | `1` | Page number for pagination |
| `per_page` | integer | No | `10` | Items per page (max 50) |

#### Example Request
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/v1/connect-room/123/documents/search?q=meeting&file_type=pdf&sort_by=created_at&sort_order=desc"
```

#### Success Response (200)
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "documents": [
      {
        "id": 1,
        "title": "Meeting Minutes January",
        "description": "Monthly team meeting notes",
        "file_name": "meeting_jan.pdf",
        "file_url": "https://s3.amazonaws.com/bucket/path/meeting_jan.pdf",
        "file_type": "pdf",
        "file_size": 1024,
        "formatted_file_size": "1 KB",
        "mime_type": "application/pdf",
        "is_private": false,
        "is_active": true,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "uploader": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe"
        }
      }
    ],
    "pagination": {
      "total": 25,
      "per_page": 10,
      "current_page": 1,
      "last_page": 3
    },
    "search_meta": {
      "query": "meeting",
      "total_results": 25,
      "filters_applied": {
        "file_type": "pdf"
      }
    }
  }
}
```

#### Error Responses

**403 Forbidden - Not a room member**
```json
{
  "status": "error",
  "message": "You are not a member of this room"
}
```

**422 Validation Error**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "q": ["The q field is required."],
    "date_to": ["The date to must be a date after or equal to date from."]
  }
}
```

**404 Not Found**
```json
{
  "status": "error",
  "message": "Room not found"
}
```

**500 Internal Server Error**
```json
{
  "status": "error",
  "message": "Failed to search room documents"
}
```

---

## Response Fields

### Document Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique document identifier |
| `title` | string | Document title |
| `description` | string | Document description |
| `file_name` | string | Original filename |
| `file_url` | string | Direct download URL |
| `file_type` | string | File extension (pdf, doc, docx, etc.) |
| `file_size` | integer | File size in bytes |
| `formatted_file_size` | string | Human-readable file size |
| `mime_type` | string | MIME type of the file |
| `is_private` | boolean | Whether document is private |
| `is_active` | boolean | Whether document is active |
| `created_at` | string | Upload timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |
| `uploader` | object | User who uploaded the document |

### Uploader Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `first_name` | string | User's first name |
| `last_name` | string | User's last name |


### Pagination Object
| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of documents |
| `per_page` | integer | Number of items per page |
| `current_page` | integer | Current page number |
| `last_page` | integer | Last page number |

### Search Meta Object
| Field | Type | Description |
|-------|------|-------------|
| `query` | string | Original search query |
| `total_results` | integer | Total number of results found |
| `filters_applied` | object | Filters that were applied to the search |

---

## Usage Examples

### Basic Search
```javascript
fetch('/api/v1/connect-room/123/documents/search?q=meeting', {
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
  q: 'report',
  file_type: 'pdf',
  date_from: '2024-01-01',
  date_to: '2024-12-31',
  size_min: 1024,
  size_max: 10485760,
  sort_by: 'created_at',
  sort_order: 'desc',
  page: 1,
  per_page: 20
});

fetch(`/api/v1/connect-room/123/documents/search?${params}`, {
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Search by File Type
```javascript
// Find all PDF documents
const pdfDocs = await fetch('/api/v1/connect-room/123/documents/search?q=&file_type=pdf', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

### Search by Date Range
```javascript
// Find documents from last month
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

const recentDocs = await fetch(`/api/v1/connect-room/123/documents/search?q=&date_from=${lastMonth.toISOString().split('T')[0]}`, {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

### Search with Pagination
```javascript
// Get second page of results
const page2 = await fetch('/api/v1/connect-room/123/documents/search?q=document&page=2&per_page=20', {
  headers: { 'Authorization': 'Bearer YOUR_ACCESS_TOKEN' }
});
```

---

## Validation Rules

### Required Fields
- `q` (search query) - Must be provided and non-empty

### Field Validation
- `q`: Maximum 255 characters
- `file_type`: Must be one of: pdf, doc, docx, xls, xlsx, txt
- `uploaded_by`: Must be a valid user ID
- `date_from`: Must be a valid date in YYYY-MM-DD format
- `date_to`: Must be a valid date in YYYY-MM-DD format and after or equal to date_from
- `size_min`: Must be a non-negative integer
- `size_max`: Must be a non-negative integer and greater than or equal to size_min
- `sort_by`: Must be one of: created_at, title, file_size, file_name
- `sort_order`: Must be one of: asc, desc
- `page`: Must be a positive integer
- `per_page`: Must be between 1 and 50

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
- Only room members can search documents
- Search is case-insensitive
- Results are paginated by default
- File URLs are signed and may expire
- Soft-deleted documents are excluded from search results
