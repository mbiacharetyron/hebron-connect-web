# Document Search API - Quick Reference

## Endpoint
```
GET /api/v1/connect-room/{room_id}/documents/search
```

## Authentication
```javascript
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
}
```

## Required Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (searches title, description, file_name) |

## Optional Filters
| Parameter | Type | Description |
|-----------|------|-------------|
| `file_type` | string | Filter by file type (pdf, doc, docx, xls, xlsx, txt) |
| `uploaded_by` | integer | Filter by uploader user ID |
| `date_from` | string | Filter from date (YYYY-MM-DD) |
| `date_to` | string | Filter to date (YYYY-MM-DD) |
| `size_min` | integer | Minimum file size in bytes |
| `size_max` | integer | Maximum file size in bytes |
| `sort_by` | string | Sort field (created_at, title, file_size, file_name) |
| `sort_order` | string | Sort order (asc, desc) |
| `page` | integer | Page number (default: 1) |
| `per_page` | integer | Items per page (max: 50, default: 10) |

## Example Requests

### Basic Search
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/v1/connect-room/123/documents/search?q=meeting"
```

### Advanced Search
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://api.example.com/api/v1/connect-room/123/documents/search?q=report&file_type=pdf&date_from=2024-01-01&sort_by=created_at&sort_order=desc"
```

### JavaScript Fetch
```javascript
const searchDocuments = async (roomId, query, filters = {}) => {
  const params = new URLSearchParams({
    q: query,
    ...filters
  });

  const response = await fetch(
    `/api/v1/connect-room/${roomId}/documents/search?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );

  return response.json();
};

// Usage
const results = await searchDocuments(123, 'meeting', {
  file_type: 'pdf',
  per_page: 20
});
```

### Axios Example
```javascript
import axios from 'axios';

const searchDocuments = async (roomId, filters) => {
  const response = await axios.get(
    `/api/v1/connect-room/${roomId}/documents/search`,
    {
      params: filters,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  );
  return response.data;
};
```

## Response Structure
```json
{
  "status": "success",
  "message": "Search completed successfully",
  "data": {
    "documents": [
      {
        "id": 1,
        "title": "Meeting Minutes",
        "description": "Team meeting notes",
        "file_name": "meeting.pdf",
        "file_url": "https://s3.../meeting.pdf",
        "file_type": "pdf",
        "file_size": 1024,
        "formatted_file_size": "1 KB",
        "mime_type": "application/pdf",
        "created_at": "2024-01-15T10:30:00Z",
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

## Error Responses

### 403 Forbidden
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
    "q": ["The q field is required."]
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

## Common Use Cases

### 1. Search by File Type
```javascript
// Find all PDF documents
const pdfDocs = await searchDocuments(123, '', { file_type: 'pdf' });
```

### 2. Search by Date Range
```javascript
// Find documents from last month
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);

const recentDocs = await searchDocuments(123, '', {
  date_from: lastMonth.toISOString().split('T')[0]
});
```

### 3. Search by Uploader
```javascript
// Find documents uploaded by specific user
const userDocs = await searchDocuments(123, '', {
  uploaded_by: 456
});
```

### 4. Search with Size Filter
```javascript
// Find large files (>1MB)
const largeFiles = await searchDocuments(123, '', {
  size_min: 1048576 // 1MB in bytes
});
```

### 5. Paginated Search
```javascript
// Get second page of results
const page2 = await searchDocuments(123, 'report', {
  page: 2,
  per_page: 20
});
```

## File Type Icons
```javascript
const getFileIcon = (fileType) => {
  const icons = {
    pdf: 'fas fa-file-pdf text-red-500',
    doc: 'fas fa-file-word text-blue-500',
    docx: 'fas fa-file-word text-blue-500',
    xls: 'fas fa-file-excel text-green-500',
    xlsx: 'fas fa-file-excel text-green-500',
    txt: 'fas fa-file-alt text-gray-500'
  };
  return icons[fileType] || 'fas fa-file text-gray-500';
};
```

## Utility Functions

### Format File Size
```javascript
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

### Format Date
```javascript
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
```

## Performance Tips

1. **Debounce search input** - Wait 300-500ms after user stops typing
2. **Cache results** - Store recent searches in memory/localStorage
3. **Use pagination** - Don't load all results at once
4. **Implement infinite scroll** - Load more results as user scrolls
5. **Optimize images** - Use appropriate file type icons

## Testing

### Test Search Function
```javascript
const testSearch = async () => {
  try {
    const results = await searchDocuments(123, 'test');
    console.log('Search successful:', results.data.documents.length, 'results');
  } catch (error) {
    console.error('Search failed:', error.response?.data?.message);
  }
};
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check if user is a room member |
| 422 Validation Error | Validate required `q` parameter |
| Empty results | Check search query and filters |
| Slow response | Implement pagination and debouncing |
| Network errors | Add retry logic and error handling |
