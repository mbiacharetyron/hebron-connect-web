# Hebron Connect - Connect Rooms & Feed Quick Reference

## Base URL
```
https://api.hebronconnect.com/api/v1
```

## Authentication
All endpoints require Bearer Token:
```
Authorization: Bearer {your_access_token}
```

---

## Quick Links
- [Full Documentation](./CONNECT_ROOMS_AND_FEED_DOCUMENTATION.md)
- [Swagger UI](https://api.hebronconnect.com/api/docs)

---

## Endpoints Summary

### Get User's Rooms
```
GET /connect-rooms/my-rooms
```

### Get Room Feed
```
GET /connect-room/{room}/feed
```

---

## Get User's Connect Rooms

**Endpoint**: `GET /connect-rooms/my-rooms`

### Query Parameters

| Parameter | Type | Options | Default |
|-----------|------|---------|---------|
| `search` | string | Any text | - |
| `category_id` | integer | Category ID | - |
| `sort_by` | string | `name`, `created_at`, `updated_at`, `last_activity_at`, `member_count` | `last_activity_at` |
| `sort_order` | string | `asc`, `desc` | `desc` |
| `per_page` | integer | 1-50 | 10 |
| `page` | integer | Page number | 1 |

### Examples

**Get all rooms**:
```bash
GET /api/v1/connect-rooms/my-rooms
Authorization: Bearer {token}
```

**Search rooms**:
```bash
GET /api/v1/connect-rooms/my-rooms?search=tech
```

**Filter by category**:
```bash
GET /api/v1/connect-rooms/my-rooms?category_id=2
```

**Sort by member count**:
```bash
GET /api/v1/connect-rooms/my-rooms?sort_by=member_count&sort_order=desc
```

**Paginate results**:
```bash
GET /api/v1/connect-rooms/my-rooms?per_page=20&page=2
```

**Combined filters**:
```bash
GET /api/v1/connect-rooms/my-rooms?search=community&category_id=3&sort_by=last_activity_at&sort_order=desc&per_page=15
```

### Response (200 OK)

```json
{
  "status": "success",
  "message": "Rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": 1,
        "name": "Tech Innovators",
        "description": "Technology community",
        "join_code": "ABC123XYZ",
        "reference_number": "CR-0000001",
        "room_image": "https://...",
        "room_image_thumbnail": "https://...",
        "is_private": false,
        "currency": "XAF",
        "status": "active",
        "member_count": 25,
        "user_role": "admin",
        "wallet_balance": "50000.00",
        "category": {
          "id": 2,
          "name": "Technology"
        },
        "owner": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe",
          "email": "john@example.com"
        },
        "recent_announcements": [...],
        "upcoming_events": [...],
        "active_contributions": [...],
        "created_at": "2025-01-15T08:00:00.000000Z",
        "updated_at": "2025-10-24T15:30:00.000000Z",
        "last_activity_at": "2025-10-24T15:30:00.000000Z"
      }
    ],
    "pagination": {
      "total": 15,
      "per_page": 10,
      "current_page": 1,
      "last_page": 2,
      "from": 1,
      "to": 10
    }
  }
}
```

### Key Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Room ID |
| `name` | string | Room name |
| `join_code` | string | Code to join room |
| `reference_number` | string | Human-readable reference |
| `member_count` | integer | Number of members |
| `user_role` | string | `owner`, `admin`, `member` |
| `wallet_balance` | string | Room wallet balance |
| `last_activity_at` | string | Last activity timestamp |

---

## Get Room Feed

**Endpoint**: `GET /connect-room/{room}/feed`

### Path Parameters

| Parameter | Type | Required |
|-----------|------|----------|
| `room` | integer | Yes |

### Query Parameters

| Parameter | Type | Options | Default |
|-----------|------|---------|---------|
| `type` | string | `event`, `announcement`, `contribution` | All types |

### Examples

**Get all feed items**:
```bash
GET /api/v1/connect-room/1/feed
Authorization: Bearer {token}
```

**Get events only**:
```bash
GET /api/v1/connect-room/1/feed?type=event
```

**Get announcements only**:
```bash
GET /api/v1/connect-room/1/feed?type=announcement
```

**Get contributions only**:
```bash
GET /api/v1/connect-room/1/feed?type=contribution
```

### Response (200 OK)

```json
{
  "status": "success",
  "message": "Feed retrieved successfully",
  "data": {
    "feed": [
      {
        "type": "event",
        "id": 3,
        "title": "Monthly Meeting",
        "description": "Discussing Q4 goals",
        "start_date": "2025-10-28T14:00:00.000000Z",
        "end_date": "2025-10-28T17:00:00.000000Z",
        "location": "Conference Room A",
        "is_virtual": false,
        "meeting_link": null,
        "max_attendees": 50,
        "rsvp_count": 25,
        "image_url": "https://...",
        "creator": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2025-10-20T10:00:00.000000Z"
      },
      {
        "type": "announcement",
        "id": 5,
        "title": "Important Update",
        "description": "New partnership announcement",
        "is_pinned": true,
        "is_active": true,
        "views_count": 45,
        "creator": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2025-10-22T09:00:00.000000Z"
      },
      {
        "type": "contribution",
        "id": 7,
        "title": "Monthly Dues",
        "description": "Please pay by deadline",
        "amount": "5000.00",
        "currency": "XAF",
        "deadline": "2025-10-30",
        "status": "open",
        "total_collected": "75000.00",
        "total_expected": "125000.00",
        "paid_members_count": 15,
        "creator": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2025-10-15T08:00:00.000000Z"
      }
    ]
  }
}
```

### Feed Item Types

#### Event
```json
{
  "type": "event",
  "id": 3,
  "title": "Event Title",
  "start_date": "2025-10-28T14:00:00.000000Z",
  "end_date": "2025-10-28T17:00:00.000000Z",
  "location": "Location",
  "is_virtual": false,
  "rsvp_count": 25
}
```

#### Announcement
```json
{
  "type": "announcement",
  "id": 5,
  "title": "Announcement Title",
  "description": "Content",
  "is_pinned": true,
  "views_count": 45
}
```

#### Contribution
```json
{
  "type": "contribution",
  "id": 7,
  "title": "Contribution Title",
  "amount": "5000.00",
  "currency": "XAF",
  "deadline": "2025-10-30",
  "status": "open",
  "paid_members_count": 15
}
```

---

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | OK | Success |
| 401 | Unauthorized | Add Bearer token |
| 403 | Forbidden | Not a room member |
| 404 | Not Found | Invalid room ID |
| 422 | Validation Error | Check parameters |
| 500 | Server Error | Contact support |

---

## Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "code": 400
}
```

---

## User Roles

| Role | Description |
|------|-------------|
| `owner` | Room creator, full control |
| `admin` | Can manage members and content |
| `member` | Basic access, can participate |

---

## Sort Options

| Sort By | Description |
|---------|-------------|
| `name` | Alphabetical |
| `created_at` | Creation date |
| `updated_at` | Last update |
| `last_activity_at` | Last activity (default) |
| `member_count` | Number of members |

---

## Supported Currencies

- `XAF` - Central African CFA Franc
- `XOF` - West African CFA Franc
- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound
- `CAD` - Canadian Dollar
- `JPY` - Japanese Yen
- `CHF` - Swiss Franc
- `AUD` - Australian Dollar
- `CNY` - Chinese Yuan

---

## Quick Code Examples

### JavaScript

```javascript
// Get user's rooms
const response = await fetch(
  'https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?per_page=20',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }
);
const data = await response.json();
console.log(`Found ${data.data.pagination.total} rooms`);

// Get room feed
const feedResponse = await fetch(
  'https://api.hebronconnect.com/api/v1/connect-room/1/feed?type=event',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }
);
const feedData = await feedResponse.json();
console.log(`Found ${feedData.data.feed.length} events`);
```

### cURL

```bash
# Get user's rooms
curl -X GET "https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Get room feed
curl -X GET "https://api.hebronconnect.com/api/v1/connect-room/1/feed?type=event" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

---

## Best Practices

### ✅ DO
- Use pagination (per_page: 10-20)
- Cache room list (5-10 minutes)
- Cache feed data (2-5 minutes)
- Debounce search input (300-500ms)
- Use image thumbnails for lists
- Implement pull-to-refresh
- Handle offline scenarios
- Show loading indicators

### ❌ DON'T
- Load all rooms at once
- Use very large per_page (> 50)
- Search on every keystroke
- Ignore pagination metadata
- Load full-size images in lists
- Block UI during API calls
- Ignore network errors

---

## Common Use Cases

### 1. Display Active Rooms
```bash
GET /api/v1/connect-rooms/my-rooms?sort_by=last_activity_at&sort_order=desc
```

### 2. Search Tech Rooms
```bash
GET /api/v1/connect-rooms/my-rooms?search=technology&category_id=2
```

### 3. Get Popular Rooms
```bash
GET /api/v1/connect-rooms/my-rooms?sort_by=member_count&sort_order=desc
```

### 4. Get Upcoming Events
```bash
GET /api/v1/connect-room/1/feed?type=event
```

### 5. Get Important Announcements
```bash
GET /api/v1/connect-room/1/feed?type=announcement
```

### 6. Check Open Contributions
```bash
GET /api/v1/connect-room/1/feed?type=contribution
```

---

## Pagination Example

```javascript
let page = 1;
let hasMore = true;

async function loadMore() {
  const response = await fetch(
    `https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?page=${page}&per_page=20`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  
  // Append rooms to list
  appendRooms(data.data.rooms);
  
  // Check if more pages
  hasMore = data.data.pagination.current_page < data.data.pagination.last_page;
  page++;
}
```

---

## Search Example

```javascript
let searchTimeout;

function handleSearch(searchTerm) {
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    const response = await fetch(
      `https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?search=${searchTerm}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    displayResults(data.data.rooms);
  }, 300); // Debounce 300ms
}
```

---

## Filter Example

```javascript
async function filterRooms(filters) {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.categoryId) params.append('category_id', filters.categoryId);
  if (filters.sortBy) params.append('sort_by', filters.sortBy);
  if (filters.sortOrder) params.append('sort_order', filters.sortOrder);
  params.append('per_page', filters.perPage || 20);
  
  const response = await fetch(
    `https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
  
  return await response.json();
}

// Usage
const rooms = await filterRooms({
  search: 'tech',
  categoryId: 2,
  sortBy: 'member_count',
  sortOrder: 'desc',
  perPage: 20
});
```

---

## Response Time Expectations

| Endpoint | Expected Time | Cache Duration |
|----------|---------------|----------------|
| Get Rooms (paginated) | < 500ms | 5-10 minutes |
| Get Rooms (filtered) | < 800ms | 3-5 minutes |
| Get Feed | < 300ms | 2-5 minutes |

---

## Testing Tips

1. **Use Swagger UI**: https://api.hebronconnect.com/api/docs
2. **Test with cURL** first
3. **Verify authentication** token
4. **Check pagination** works correctly
5. **Test filters** individually
6. **Verify sorting** options
7. **Test error scenarios**

---

## Troubleshooting

### No rooms returned
- Check if user is member of any rooms
- Verify token is valid
- Check filters aren't too restrictive

### Feed is empty
- Verify user is room member
- Check room has activities
- Verify room ID is correct

### Pagination not working
- Check `page` and `per_page` parameters
- Verify `last_page` in response
- Ensure page number is valid

### Search returns nothing
- Check search term spelling
- Try broader search terms
- Verify rooms match search criteria

---

## Support

**Email**: support@hebronconnect.com  
**API Docs**: https://api.hebronconnect.com/api/docs

---

**Last Updated**: October 24, 2025

