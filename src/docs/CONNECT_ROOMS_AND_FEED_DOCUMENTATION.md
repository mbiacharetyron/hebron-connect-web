# Hebron Connect - Connect Rooms & Feed Documentation

## Table of Contents
1. [Overview](#overview)
2. [Get User's Connect Rooms](#get-users-connect-rooms)
3. [Get Room Feed](#get-room-feed)
4. [Room Data Structure](#room-data-structure)
5. [Feed Item Types](#feed-item-types)
6. [Filtering and Sorting](#filtering-and-sorting)
7. [Error Handling](#error-handling)
8. [Code Examples](#code-examples)
9. [Best Practices](#best-practices)

---

## Overview

The Connect Rooms & Feed API provides endpoints for retrieving:
- **User's Rooms**: All connect rooms where the authenticated user is a member
- **Room Feed**: Combined feed of room activities (events, announcements, contributions)

### Key Features
- **Pagination** support for large room lists
- **Advanced filtering** by category, search term
- **Flexible sorting** options (name, date, activity, member count)
- **Feed filtering** by activity type
- **Rich metadata** including member counts, roles, and activity timestamps

---

## Get User's Connect Rooms

Retrieve all connect rooms where the authenticated user is a member.

### Endpoint
```
GET /api/v1/connect-rooms/my-rooms
```

### Authentication
**Required**: Bearer Token

### Headers
```
Authorization: Bearer {your_access_token}
Content-Type: application/json
Accept: application/json
```

### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `search` | string | No | Search term for room name or description | - |
| `category_id` | integer | No | Filter by category ID | - |
| `sort_by` | string | No | Sort field: `name`, `created_at`, `updated_at`, `last_activity_at`, `member_count` | `last_activity_at` |
| `sort_order` | string | No | Sort order: `asc`, `desc` | `desc` |
| `per_page` | integer | No | Number of items per page | 10 |
| `page` | integer | No | Page number | 1 |

### Request Example

**Basic Request** (Get all user's rooms):
```bash
GET /api/v1/connect-rooms/my-rooms
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**With Search**:
```bash
GET /api/v1/connect-rooms/my-rooms?search=tech
```

**With Category Filter**:
```bash
GET /api/v1/connect-rooms/my-rooms?category_id=2
```

**With Sorting**:
```bash
GET /api/v1/connect-rooms/my-rooms?sort_by=member_count&sort_order=desc
```

**With Pagination**:
```bash
GET /api/v1/connect-rooms/my-rooms?per_page=20&page=2
```

**Combined Filters**:
```bash
GET /api/v1/connect-rooms/my-rooms?search=community&category_id=3&sort_by=last_activity_at&sort_order=desc&per_page=15&page=1
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
        "name": "Tech Innovators Group",
        "description": "A community for technology enthusiasts and innovators",
        "join_code": "ABC123XYZ",
        "reference_number": "CR-0000001",
        "room_image": "https://s3.amazonaws.com/bucket/rooms/CR-0000001/original/image.jpg",
        "room_image_thumbnail": "https://s3.amazonaws.com/bucket/rooms/CR-0000001/thumbnail/image.jpg",
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
        "recent_announcements": [
          {
            "id": 5,
            "title": "Important Update",
            "description": "We have some exciting news to share...",
            "is_pinned": true,
            "created_at": "2025-10-20T10:30:00.000000Z"
          }
        ],
        "upcoming_events": [
          {
            "id": 3,
            "title": "Monthly Meetup",
            "start_date": "2025-10-28T14:00:00.000000Z",
            "end_date": "2025-10-28T17:00:00.000000Z",
            "location": "Conference Room A"
          }
        ],
        "active_contributions": [
          {
            "id": 7,
            "title": "Monthly Dues",
            "amount": "5000.00",
            "currency": "XAF",
            "deadline": "2025-10-30",
            "status": "open"
          }
        ],
        "created_at": "2025-01-15T08:00:00.000000Z",
        "updated_at": "2025-10-24T15:30:00.000000Z",
        "last_activity_at": "2025-10-24T15:30:00.000000Z"
      },
      {
        "id": 2,
        "name": "Book Lovers Club",
        "description": "Discussing the best books and authors",
        "join_code": "XYZ789ABC",
        "reference_number": "CR-0000002",
        "room_image": null,
        "room_image_thumbnail": null,
        "is_private": true,
        "currency": "USD",
        "status": "active",
        "member_count": 12,
        "user_role": "member",
        "wallet_balance": "0.00",
        "category": {
          "id": 5,
          "name": "Literature"
        },
        "owner": {
          "id": 15,
          "first_name": "Jane",
          "last_name": "Smith",
          "email": "jane@example.com"
        },
        "recent_announcements": [],
        "upcoming_events": [],
        "active_contributions": [],
        "created_at": "2025-03-10T12:00:00.000000Z",
        "updated_at": "2025-10-22T09:15:00.000000Z",
        "last_activity_at": "2025-10-22T09:15:00.000000Z"
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

### Response Fields

#### Room Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique room identifier |
| `name` | string | Room name |
| `description` | string | Room description |
| `join_code` | string | Unique code for joining the room |
| `reference_number` | string | Human-readable reference (e.g., CR-0000001) |
| `room_image` | string\|null | Full URL to room image |
| `room_image_thumbnail` | string\|null | Full URL to room thumbnail |
| `is_private` | boolean | Whether room is private |
| `currency` | string | Room currency code (XAF, USD, EUR, etc.) |
| `status` | string | Room status: `active`, `inactive`, `deleted` |
| `member_count` | integer | Total number of members |
| `user_role` | string | User's role in room: `owner`, `admin`, `member` |
| `wallet_balance` | string | Room wallet balance (decimal) |
| `category` | object | Room category information |
| `owner` | object | Room owner information |
| `recent_announcements` | array | Latest 5 announcements |
| `upcoming_events` | array | Next 5 upcoming events |
| `active_contributions` | array | Current open contributions |
| `created_at` | string | Room creation timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |
| `last_activity_at` | string | Last activity timestamp (ISO 8601) |

#### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `total` | integer | Total number of rooms |
| `per_page` | integer | Items per page |
| `current_page` | integer | Current page number |
| `last_page` | integer | Last page number |
| `from` | integer | First item number on page |
| `to` | integer | Last item number on page |

### Sort Options Explained

| Sort By | Description | Example Use Case |
|---------|-------------|------------------|
| `name` | Alphabetical by room name | Finding rooms alphabetically |
| `created_at` | By creation date | See oldest or newest rooms first |
| `updated_at` | By last update | See recently updated rooms |
| `last_activity_at` | By last activity | **Default** - See most/least active rooms |
| `member_count` | By number of members | Find largest/smallest rooms |

**Last Activity** includes:
- New announcements
- New events
- New contributions
- Member joins/leaves
- Room updates

### Error Responses

#### Unauthorized (401)
```json
{
  "message": "Unauthenticated.",
  "status": 401
}
```
**Cause**: Missing or invalid authentication token  
**Solution**: Include valid Bearer token in Authorization header

#### Validation Error (422)
```json
{
  "status": "error",
  "message": "The given data was invalid.",
  "errors": {
    "sort_by": ["The selected sort_by is invalid."],
    "per_page": ["The per_page must be an integer."]
  },
  "code": 422
}
```
**Cause**: Invalid query parameters  
**Solution**: Check parameter values against allowed options

#### Internal Server Error (500)
```json
{
  "status": "error",
  "message": "Failed to retrieve rooms",
  "code": 500
}
```
**Cause**: Server-side error  
**Solution**: Contact support if error persists

---

## Get Room Feed

Retrieve a combined feed of room activities including events, announcements, and contributions.

### Endpoint
```
GET /api/v1/connect-room/{room}/feed
```

### Authentication
**Required**: Bearer Token

### Headers
```
Authorization: Bearer {your_access_token}
Content-Type: application/json
Accept: application/json
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | Room ID |

### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `type` | string | No | Filter by type: `event`, `announcement`, `contribution` | All types |

### Request Examples

**Get All Feed Items**:
```bash
GET /api/v1/connect-room/1/feed
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

**Filter by Events Only**:
```bash
GET /api/v1/connect-room/1/feed?type=event
```

**Filter by Announcements Only**:
```bash
GET /api/v1/connect-room/1/feed?type=announcement
```

**Filter by Contributions Only**:
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
        "title": "Monthly Team Meeting",
        "description": "Discussing Q4 goals and achievements",
        "start_date": "2025-10-28T14:00:00.000000Z",
        "end_date": "2025-10-28T17:00:00.000000Z",
        "location": "Conference Room A",
        "is_virtual": false,
        "meeting_link": null,
        "max_attendees": 50,
        "rsvp_count": 25,
        "image_url": "https://s3.amazonaws.com/bucket/events/3/image.jpg",
        "is_active": true,
        "creator": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2025-10-20T10:00:00.000000Z",
        "updated_at": "2025-10-23T15:30:00.000000Z"
      },
      {
        "type": "announcement",
        "id": 5,
        "title": "Important Update",
        "description": "We are pleased to announce our new partnership...",
        "is_pinned": true,
        "is_active": true,
        "views_count": 45,
        "creator": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2025-10-22T09:00:00.000000Z",
        "updated_at": "2025-10-22T09:00:00.000000Z"
      },
      {
        "type": "contribution",
        "id": 7,
        "title": "Monthly Membership Dues",
        "description": "Please pay your monthly dues by the deadline",
        "amount": "5000.00",
        "currency": "XAF",
        "deadline": "2025-10-30",
        "status": "open",
        "total_collected": "75000.00",
        "total_expected": "125000.00",
        "paid_members_count": 15,
        "is_active": true,
        "creator": {
          "id": 10,
          "first_name": "John",
          "last_name": "Doe"
        },
        "created_at": "2025-10-15T08:00:00.000000Z",
        "updated_at": "2025-10-24T12:00:00.000000Z"
      }
    ]
  }
}
```

### Feed Item Structures

#### Event Item

```json
{
  "type": "event",
  "id": 3,
  "title": "Event Title",
  "description": "Event description",
  "start_date": "2025-10-28T14:00:00.000000Z",
  "end_date": "2025-10-28T17:00:00.000000Z",
  "location": "Location name",
  "is_virtual": false,
  "meeting_link": null,
  "max_attendees": 50,
  "rsvp_count": 25,
  "image_url": "https://...",
  "is_active": true,
  "creator": {
    "id": 10,
    "first_name": "John",
    "last_name": "Doe"
  },
  "created_at": "2025-10-20T10:00:00.000000Z",
  "updated_at": "2025-10-23T15:30:00.000000Z"
}
```

**Event Fields**:
- `type`: Always `"event"`
- `start_date`: Event start timestamp
- `end_date`: Event end timestamp
- `location`: Physical location or description
- `is_virtual`: Whether event is online
- `meeting_link`: Video conference link (if virtual)
- `max_attendees`: Maximum number of attendees (null = unlimited)
- `rsvp_count`: Number of confirmed attendees
- `image_url`: Event banner image

#### Announcement Item

```json
{
  "type": "announcement",
  "id": 5,
  "title": "Announcement Title",
  "description": "Announcement content",
  "is_pinned": true,
  "is_active": true,
  "views_count": 45,
  "creator": {
    "id": 10,
    "first_name": "John",
    "last_name": "Doe"
  },
  "created_at": "2025-10-22T09:00:00.000000Z",
  "updated_at": "2025-10-22T09:00:00.000000Z"
}
```

**Announcement Fields**:
- `type`: Always `"announcement"`
- `is_pinned`: Whether announcement is pinned to top
- `views_count`: Number of views
- **Note**: Pinned announcements appear first

#### Contribution Item

```json
{
  "type": "contribution",
  "id": 7,
  "title": "Contribution Title",
  "description": "Contribution description",
  "amount": "5000.00",
  "currency": "XAF",
  "deadline": "2025-10-30",
  "status": "open",
  "total_collected": "75000.00",
  "total_expected": "125000.00",
  "paid_members_count": 15,
  "is_active": true,
  "creator": {
    "id": 10,
    "first_name": "John",
    "last_name": "Doe"
  },
  "created_at": "2025-10-15T08:00:00.000000Z",
  "updated_at": "2025-10-24T12:00:00.000000Z"
}
```

**Contribution Fields**:
- `type`: Always `"contribution"`
- `amount`: Required contribution amount per member
- `currency`: Currency code
- `deadline`: Contribution deadline date
- `status`: `open`, `closed`, `completed`
- `total_collected`: Amount collected so far
- `total_expected`: Expected total amount
- `paid_members_count`: Number of members who paid

### Feed Sorting Logic

The feed is automatically sorted by relevance:

1. **Events**: Sorted by `start_date` (earliest upcoming first)
2. **Announcements**: Pinned announcements first, then by `created_at` (newest first)
3. **Contributions**: Sorted by `deadline` (soonest deadline first)

All items are then combined and sorted by their primary sort field.

### Error Responses

#### Forbidden (403)
```json
{
  "status": "error",
  "message": "You are not a member of this room",
  "code": 403
}
```
**Cause**: User is not a member of the room  
**Solution**: Join the room first before accessing the feed

#### Not Found (404)
```json
{
  "status": "error",
  "message": "Room not found",
  "code": 404
}
```
**Cause**: Invalid room ID  
**Solution**: Verify room ID is correct

#### Unauthorized (401)
```json
{
  "message": "Unauthenticated.",
  "status": 401
}
```
**Cause**: Missing or invalid authentication token  
**Solution**: Include valid Bearer token

#### Internal Server Error (500)
```json
{
  "status": "error",
  "message": "Failed to retrieve room feed",
  "code": 500
}
```
**Cause**: Server-side error  
**Solution**: Contact support if error persists

---

## Room Data Structure

### Complete Room Object

```json
{
  "id": 1,
  "name": "Room Name",
  "description": "Room description",
  "join_code": "ABC123XYZ",
  "reference_number": "CR-0000001",
  "room_image": "https://s3.amazonaws.com/bucket/rooms/CR-0000001/original/image.jpg",
  "room_image_thumbnail": "https://s3.amazonaws.com/bucket/rooms/CR-0000001/thumbnail/image.jpg",
  "is_private": false,
  "currency": "XAF",
  "status": "active",
  "member_count": 25,
  "user_role": "admin",
  "wallet_balance": "50000.00",
  "category": {
    "id": 2,
    "name": "Technology",
    "description": "Technology and innovation",
    "icon": "tech-icon.png"
  },
  "owner": {
    "id": 10,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "profile_image": "https://..."
  },
  "recent_announcements": [...],
  "upcoming_events": [...],
  "active_contributions": [...],
  "created_at": "2025-01-15T08:00:00.000000Z",
  "updated_at": "2025-10-24T15:30:00.000000Z",
  "last_activity_at": "2025-10-24T15:30:00.000000Z"
}
```

### User Roles

| Role | Permissions | Description |
|------|-------------|-------------|
| `owner` | Full control | Room creator with all permissions |
| `admin` | Most permissions | Can manage members, create content, moderate |
| `member` | Basic access | Can view content, participate, contribute |

### Room Status

| Status | Description |
|--------|-------------|
| `active` | Room is operational |
| `inactive` | Room is temporarily disabled |
| `deleted` | Room has been deleted |

### Currency Codes

Supported currencies:
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

## Feed Item Types

### Event
Represents scheduled events for the room.

**Key Features**:
- Virtual or physical events
- RSVP tracking
- Capacity management
- Event images

**Use Cases**:
- Meetings
- Workshops
- Social gatherings
- Webinars

### Announcement
Important room-wide notifications.

**Key Features**:
- Pin to top
- View tracking
- Rich text content

**Use Cases**:
- Important updates
- Policy changes
- News and announcements
- Urgent notifications

### Contribution
Financial contributions from members.

**Key Features**:
- Deadline tracking
- Payment status
- Progress monitoring
- Multiple currency support

**Use Cases**:
- Membership dues
- Fundraising
- Project funding
- Event costs

---

## Filtering and Sorting

### Search Functionality

The search parameter (`search`) searches across:
- Room name
- Room description

**Example**:
```bash
GET /api/v1/connect-rooms/my-rooms?search=technology
```

This will match rooms with "technology" in name or description.

### Category Filtering

Filter rooms by category:
```bash
GET /api/v1/connect-rooms/my-rooms?category_id=2
```

**Common Categories**:
- Technology
- Business
- Education
- Sports
- Community
- Social

### Advanced Filtering Examples

**Find active tech rooms sorted by members**:
```bash
GET /api/v1/connect-rooms/my-rooms?category_id=2&sort_by=member_count&sort_order=desc
```

**Find recently active rooms**:
```bash
GET /api/v1/connect-rooms/my-rooms?sort_by=last_activity_at&sort_order=desc&per_page=20
```

**Search and paginate**:
```bash
GET /api/v1/connect-rooms/my-rooms?search=community&per_page=15&page=2
```

---

## Error Handling

### Standard Error Response

```json
{
  "status": "error",
  "message": "Error description",
  "errors": { /* field-specific errors */ },
  "code": 400
}
```

### Common HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Request successful |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Not authorized for action |
| 404 | Not Found | Room doesn't exist |
| 422 | Validation Error | Invalid parameters |
| 500 | Server Error | Internal server error |

### Error Handling Best Practices

1. **Always check status code**
2. **Parse error messages** for user display
3. **Handle network failures** gracefully
4. **Implement retry logic** for 500 errors
5. **Cache room data** to reduce API calls

---

## Code Examples

### JavaScript/TypeScript

```typescript
// Room Service
class RoomService {
  private baseUrl = 'https://api.hebronconnect.com/api/v1';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Get user's rooms
  async getUserRooms(options?: {
    search?: string;
    categoryId?: number;
    sortBy?: string;
    sortOrder?: string;
    perPage?: number;
    page?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    
    if (options?.search) params.append('search', options.search);
    if (options?.categoryId) params.append('category_id', options.categoryId.toString());
    if (options?.sortBy) params.append('sort_by', options.sortBy);
    if (options?.sortOrder) params.append('sort_order', options.sortOrder);
    if (options?.perPage) params.append('per_page', options.perPage.toString());
    if (options?.page) params.append('page', options.page.toString());

    const url = `${this.baseUrl}/connect-rooms/my-rooms?${params}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch rooms: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get room feed
  async getRoomFeed(roomId: number, type?: 'event' | 'announcement' | 'contribution'): Promise<any> {
    const params = type ? `?type=${type}` : '';
    const url = `${this.baseUrl}/connect-room/${roomId}/feed${params}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Usage
const roomService = new RoomService('your_token_here');

// Get user's rooms
const rooms = await roomService.getUserRooms({
  search: 'tech',
  sortBy: 'last_activity_at',
  sortOrder: 'desc',
  perPage: 20
});

console.log(`Found ${rooms.data.pagination.total} rooms`);
rooms.data.rooms.forEach(room => {
  console.log(`${room.name} - ${room.member_count} members`);
});

// Get room feed
const feed = await roomService.getRoomFeed(1, 'event');
console.log(`Found ${feed.data.feed.length} events`);
```

### React Native Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, ActivityIndicator } from 'react-native';

interface Room {
  id: number;
  name: string;
  description: string;
  member_count: number;
  user_role: string;
}

const MyRoomsScreen = ({ token }: { token: string }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadRooms = async (pageNum: number) => {
    try {
      const response = await fetch(
        `https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?page=${pageNum}&per_page=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();
      
      if (pageNum === 1) {
        setRooms(data.data.rooms);
      } else {
        setRooms(prev => [...prev, ...data.data.rooms]);
      }

      setHasMore(data.data.pagination.current_page < data.data.pagination.last_page);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      loadRooms(page + 1);
    }
  };

  const renderRoom = ({ item }: { item: Room }) => (
    <View style={{ padding: 16, borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.name}</Text>
      <Text style={{ color: 'gray' }}>{item.description}</Text>
      <Text>{item.member_count} members • Role: {item.user_role}</Text>
    </View>
  );

  if (loading && page === 1) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <FlatList
      data={rooms}
      renderItem={renderRoom}
      keyExtractor={item => item.id.toString()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={loading ? <ActivityIndicator /> : null}
    />
  );
};

export default MyRoomsScreen;
```

### Flutter/Dart Example

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class Room {
  final int id;
  final String name;
  final String description;
  final int memberCount;
  final String userRole;
  
  Room({
    required this.id,
    required this.name,
    required this.description,
    required this.memberCount,
    required this.userRole,
  });
  
  factory Room.fromJson(Map<String, dynamic> json) {
    return Room(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      memberCount: json['member_count'],
      userRole: json['user_role'],
    );
  }
}

class RoomService {
  final String baseUrl = 'https://api.hebronconnect.com/api/v1';
  final String token;
  
  RoomService(this.token);
  
  Future<List<Room>> getUserRooms({
    String? search,
    int? categoryId,
    String sortBy = 'last_activity_at',
    String sortOrder = 'desc',
    int perPage = 20,
    int page = 1,
  }) async {
    final params = {
      'sort_by': sortBy,
      'sort_order': sortOrder,
      'per_page': perPage.toString(),
      'page': page.toString(),
    };
    
    if (search != null) params['search'] = search;
    if (categoryId != null) params['category_id'] = categoryId.toString();
    
    final uri = Uri.parse('$baseUrl/connect-rooms/my-rooms')
        .replace(queryParameters: params);
    
    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List roomsJson = data['data']['rooms'];
      return roomsJson.map((json) => Room.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load rooms');
    }
  }
  
  Future<List<dynamic>> getRoomFeed(int roomId, {String? type}) async {
    final params = type != null ? {'type': type} : <String, String>{};
    final uri = Uri.parse('$baseUrl/connect-room/$roomId/feed')
        .replace(queryParameters: params);
    
    final response = await http.get(
      uri,
      headers: {
        'Authorization': 'Bearer $token',
        'Accept': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['data']['feed'];
    } else {
      throw Exception('Failed to load feed');
    }
  }
}

// Usage
void main() async {
  final service = RoomService('your_token_here');
  
  // Get user's rooms
  final rooms = await service.getUserRooms(
    search: 'tech',
    sortBy: 'member_count',
    sortOrder: 'desc',
  );
  
  print('Found ${rooms.length} rooms');
  for (var room in rooms) {
    print('${room.name} - ${room.memberCount} members');
  }
  
  // Get room feed
  final feed = await service.getRoomFeed(1, type: 'event');
  print('Found ${feed.length} events');
}
```

### Swift/iOS Example

```swift
import Foundation

struct Room: Codable {
    let id: Int
    let name: String
    let description: String
    let memberCount: Int
    let userRole: String
    
    enum CodingKeys: String, CodingKey {
        case id, name, description
        case memberCount = "member_count"
        case userRole = "user_role"
    }
}

struct RoomsResponse: Codable {
    let status: String
    let message: String
    let data: RoomsData
    
    struct RoomsData: Codable {
        let rooms: [Room]
        let pagination: Pagination
    }
    
    struct Pagination: Codable {
        let total: Int
        let perPage: Int
        let currentPage: Int
        let lastPage: Int
        
        enum CodingKeys: String, CodingKey {
            case total
            case perPage = "per_page"
            case currentPage = "current_page"
            case lastPage = "last_page"
        }
    }
}

class RoomService {
    private let baseURL = "https://api.hebronconnect.com/api/v1"
    private let token: String
    
    init(token: String) {
        self.token = token
    }
    
    func getUserRooms(
        search: String? = nil,
        categoryId: Int? = nil,
        sortBy: String = "last_activity_at",
        sortOrder: String = "desc",
        perPage: Int = 20,
        page: Int = 1,
        completion: @escaping (Result<RoomsResponse, Error>) -> Void
    ) {
        var components = URLComponents(string: "\(baseURL)/connect-rooms/my-rooms")!
        
        var queryItems: [URLQueryItem] = [
            URLQueryItem(name: "sort_by", value: sortBy),
            URLQueryItem(name: "sort_order", value: sortOrder),
            URLQueryItem(name: "per_page", value: "\(perPage)"),
            URLQueryItem(name: "page", value: "\(page)")
        ]
        
        if let search = search {
            queryItems.append(URLQueryItem(name: "search", value: search))
        }
        
        if let categoryId = categoryId {
            queryItems.append(URLQueryItem(name: "category_id", value: "\(categoryId)"))
        }
        
        components.queryItems = queryItems
        
        var request = URLRequest(url: components.url!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data"])))
                return
            }
            
            do {
                let response = try JSONDecoder().decode(RoomsResponse.self, from: data)
                completion(.success(response))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
    
    func getRoomFeed(roomId: Int, type: String? = nil, completion: @escaping (Result<[String: Any], Error>) -> Void) {
        var components = URLComponents(string: "\(baseURL)/connect-room/\(roomId)/feed")!
        
        if let type = type {
            components.queryItems = [URLQueryItem(name: "type", value: type)]
        }
        
        var request = URLRequest(url: components.url!)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            
            guard let data = data else {
                completion(.failure(NSError(domain: "", code: -1, userInfo: [NSLocalizedDescriptionKey: "No data"])))
                return
            }
            
            do {
                let json = try JSONSerialization.jsonObject(with: data) as! [String: Any]
                completion(.success(json))
            } catch {
                completion(.failure(error))
            }
        }.resume()
    }
}

// Usage
let service = RoomService(token: "your_token_here")

service.getUserRooms(search: "tech", sortBy: "member_count", sortOrder: "desc") { result in
    switch result {
    case .success(let response):
        print("Found \(response.data.pagination.total) rooms")
        for room in response.data.rooms {
            print("\(room.name) - \(room.memberCount) members")
        }
    case .failure(let error):
        print("Error: \(error)")
    }
}
```

---

## Best Practices

### 1. Pagination

**✅ DO**:
- Use pagination for lists of rooms
- Start with reasonable `per_page` (10-20)
- Implement infinite scroll/load more
- Cache loaded pages
- Show page numbers for navigation

**❌ DON'T**:
- Load all rooms at once
- Use very large `per_page` values (> 50)
- Ignore pagination metadata

### 2. Caching

**✅ DO**:
- Cache room list data (5-10 minutes)
- Cache feed data (2-5 minutes)
- Implement cache invalidation on updates
- Use ETags if available
- Store images locally

**❌ DON'T**:
- Cache indefinitely
- Ignore cache expiration
- Cache sensitive data insecurely

### 3. Search & Filtering

**✅ DO**:
- Debounce search input (300-500ms)
- Show loading indicators
- Clear filters button
- Save user's filter preferences
- Show active filter count

**❌ DON'T**:
- Search on every keystroke
- Hide applied filters
- Make filters hard to clear

### 4. Performance

**✅ DO**:
- Use image thumbnails for lists
- Lazy load images
- Implement pull-to-refresh
- Show skeleton screens
- Handle offline scenarios

**❌ DON'T**:
- Load full-size images in lists
- Block UI during API calls
- Ignore network errors

### 5. User Experience

**✅ DO**:
- Show room activity status
- Display user's role prominently
- Highlight pinned announcements
- Show upcoming event count
- Indicate unread content

**❌ DON'T**:
- Hide important metadata
- Make navigation confusing
- Ignore accessibility

### 6. Error Handling

**✅ DO**:
- Show user-friendly error messages
- Implement retry mechanisms
- Log errors for debugging
- Handle 403 errors (show "Join Room" button)
- Provide offline mode

**❌ DON'T**:
- Show technical error messages
- Fail silently
- Ignore network state

### 7. Feed Management

**✅ DO**:
- Group similar feed items
- Show type indicators (icons/badges)
- Implement filters for feed types
- Sort by relevance/date
- Show item timestamps

**❌ DON'T**:
- Mix all types without indication
- Hide feed item types
- Ignore sorting options

### 8. Real-time Updates

**✅ DO**:
- Implement pull-to-refresh
- Show "new content" indicators
- Auto-refresh feed periodically
- Use WebSockets/SSE for real-time (if available)

**❌ DON'T**:
- Auto-refresh too frequently
- Interrupt user while reading
- Miss important updates

---

## Common Use Cases

### Use Case 1: Display User's Active Rooms

```typescript
// Get user's rooms sorted by recent activity
const response = await fetch(
  'https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?sort_by=last_activity_at&sort_order=desc&per_page=20',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }
);

const data = await response.json();

// Display rooms with activity indicators
data.data.rooms.forEach(room => {
  const hasNewActivity = isRecent(room.last_activity_at); // Within last 24 hours
  const hasOpenContributions = room.active_contributions.length > 0;
  const hasUpcomingEvents = room.upcoming_events.length > 0;
  
  displayRoom(room, { hasNewActivity, hasOpenContributions, hasUpcomingEvents });
});
```

### Use Case 2: Search Rooms by Category

```typescript
// Find all tech-related rooms
const response = await fetch(
  'https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?category_id=2&sort_by=member_count&sort_order=desc',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }
);
```

### Use Case 3: Display Room Feed with Filters

```typescript
// Get only upcoming events
const eventsResponse = await fetch(
  'https://api.hebronconnect.com/api/v1/connect-room/1/feed?type=event',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }
);

const events = await eventsResponse.json();

// Display in calendar view
events.data.feed.forEach(event => {
  addToCalendar(event);
});
```

### Use Case 4: Room Dashboard

```typescript
// Load room with all details
const roomResponse = await fetch(
  'https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms?per_page=1&search=specific-room',
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  }
);

const room = roomResponse.data.rooms[0];

// Display dashboard with:
// - Member count
// - Wallet balance
// - Recent announcements (top 3)
// - Next event
// - Open contributions
```

---

## API Base URL

**Production**: `https://api.hebronconnect.com`

**All endpoints are prefixed with**: `/api/v1`

**Example Full URLs**:
- `https://api.hebronconnect.com/api/v1/connect-rooms/my-rooms`
- `https://api.hebronconnect.com/api/v1/connect-room/1/feed`

---

## Rate Limiting

While not explicitly documented, consider implementing:
- Maximum 100 requests per minute per user
- Cache responses to reduce API calls
- Use pagination to avoid large data transfers

---

## Support

For API support or questions, contact:
- **Email**: support@hebronconnect.com
- **API Documentation**: https://api.hebronconnect.com/api/docs

---

## Changelog

### Version 1.0.0 (Current)
- Get user's connect rooms with filtering and sorting
- Get room feed with type filtering
- Pagination support
- Search functionality
- Category filtering
- Activity tracking
- Rich metadata (wallet, members, roles)

---

**Last Updated**: October 24, 2025

