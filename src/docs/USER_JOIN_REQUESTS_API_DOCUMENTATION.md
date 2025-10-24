# User Join Requests API Documentation

## Overview

This documentation covers the APIs for users to manage their own connect room join requests. Users can fetch their join requests and cancel pending requests.

## Table of Contents

1. [Authentication](#authentication)
2. [Get User's Join Requests](#get-users-join-requests)
3. [Cancel Join Request](#cancel-join-request)
4. [Response Formats](#response-formats)
5. [Error Handling](#error-handling)
6. [Examples](#examples)

---

## Authentication

All endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer {your_token}
```

---

## Get User's Join Requests

### Endpoint
```
GET /api/v1/user/join-requests
```

### Description
Retrieves all join requests made by the authenticated user with pagination support.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `status` | string | No | - | Filter by status: `pending`, `approved`, `rejected` |
| `per_page` | integer | No | 15 | Number of items per page (max: 100) |
| `page` | integer | No | 1 | Page number |

### Response

#### Success Response (200)
```json
{
    "status": "success",
    "message": "Join requests retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "connect_room_id": 5,
                "connect_room_name": "Tech Enthusiasts",
                "connect_room_description": "A room for tech lovers",
                "connect_room_is_private": true,
                "status": "pending",
                "message": "I would like to join this room",
                "created_at": "2025-01-15T10:30:00.000000Z",
                "updated_at": "2025-01-15T10:30:00.000000Z",
                "approved_at": null,
                "rejected_at": null
            },
            {
                "id": 2,
                "connect_room_id": 8,
                "connect_room_name": "Photography Club",
                "connect_room_description": "Share your best shots",
                "connect_room_is_private": false,
                "status": "approved",
                "message": "I love photography",
                "created_at": "2025-01-14T15:20:00.000000Z",
                "updated_at": "2025-01-14T16:45:00.000000Z",
                "approved_at": "2025-01-14T16:45:00.000000Z",
                "rejected_at": null
            }
        ],
        "current_page": 1,
        "last_page": 3,
        "per_page": 15,
        "total": 42
    }
}
```

#### Error Response (500)
```json
{
    "status": "error",
    "message": "Failed to retrieve join requests",
    "data": "Error details"
}
```

### Example Usage

#### Get all join requests
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/user/join-requests" \
  -H "Authorization: Bearer {token}"
```

#### Get only pending requests
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/user/join-requests?status=pending" \
  -H "Authorization: Bearer {token}"
```

#### Get with custom pagination
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/user/join-requests?per_page=10&page=2" \
  -H "Authorization: Bearer {token}"
```

---

## Cancel Join Request

### Endpoint
```
DELETE /api/v1/user/join-requests/{request_id}
```

### Description
Cancels a pending join request made by the authenticated user. Only pending requests can be cancelled.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `request_id` | integer | Yes | ID of the join request to cancel |

### Response

#### Success Response (200)
```json
{
    "status": "success",
    "message": "Join request cancelled successfully",
    "data": []
}
```

#### Error Responses

##### Request Not Found (404)
```json
{
    "status": "error",
    "message": "Join request not found",
    "data": null
}
```

##### Unauthorized (403)
```json
{
    "status": "error",
    "message": "You can only cancel your own join requests",
    "data": null
}
```

##### Bad Request (400)
```json
{
    "status": "error",
    "message": "Cannot cancel a request that has already been processed",
    "data": null
}
```

##### Server Error (500)
```json
{
    "status": "error",
    "message": "Failed to cancel join request",
    "data": "Error details"
}
```

### Example Usage

```bash
curl -X DELETE "https://api.hebronconnect.com/api/v1/user/join-requests/123" \
  -H "Authorization: Bearer {token}"
```

---

## Response Formats

### Standard Response Structure

All API responses follow this structure:

```json
{
    "status": "success|error",
    "message": "Human readable message",
    "data": {} // Response data or null for errors
}
```

### Pagination Structure

Paginated responses include additional metadata:

```json
{
    "status": "success",
    "message": "Join requests retrieved successfully",
    "data": {
        "data": [], // Array of items
        "current_page": 1,
        "last_page": 5,
        "per_page": 15,
        "total": 75
    }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters or business logic error |
| 401 | Unauthorized - Invalid or missing authentication token |
| 403 | Forbidden - User doesn't have permission for the action |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server-side error |

### Common Error Scenarios

1. **Authentication Required**: All endpoints require valid authentication
2. **Ownership Validation**: Users can only cancel their own join requests
3. **Status Validation**: Only pending requests can be cancelled
4. **Resource Not Found**: Request ID doesn't exist or belongs to another user

---

## Examples

### Complete Workflow Example

#### 1. Get all user's join requests
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/user/join-requests" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

Response:
```json
{
    "status": "success",
    "message": "Join requests retrieved successfully",
    "data": {
        "data": [
            {
                "id": 123,
                "connect_room_id": 5,
                "connect_room_name": "Tech Enthusiasts",
                "connect_room_description": "A room for tech lovers",
                "connect_room_is_private": true,
                "status": "pending",
                "message": "I would like to join this room",
                "created_at": "2025-01-15T10:30:00.000000Z",
                "updated_at": "2025-01-15T10:30:00.000000Z",
                "approved_at": null,
                "rejected_at": null
            }
        ],
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 1
    }
}
```

#### 2. Cancel a pending request
```bash
curl -X DELETE "https://api.hebronconnect.com/api/v1/user/join-requests/123" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

Response:
```json
{
    "status": "success",
    "message": "Join request cancelled successfully",
    "data": []
}
```

#### 3. Get only pending requests after cancellation
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/user/join-requests?status=pending" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

Response:
```json
{
    "status": "success",
    "message": "Join requests retrieved successfully",
    "data": {
        "data": [],
        "current_page": 1,
        "last_page": 1,
        "per_page": 15,
        "total": 0
    }
}
```

### JavaScript/Fetch Examples

#### Get User's Join Requests
```javascript
async function getUserJoinRequests(status = null, page = 1, perPage = 15) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page);
    params.append('per_page', perPage);
    
    const response = await fetch(`/api/v1/user/join-requests?${params}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
}

// Usage
const pendingRequests = await getUserJoinRequests('pending');
const allRequests = await getUserJoinRequests();
```

#### Cancel Join Request
```javascript
async function cancelJoinRequest(requestId) {
    const response = await fetch(`/api/v1/user/join-requests/${requestId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    return await response.json();
}

// Usage
const result = await cancelJoinRequest(123);
if (result.status === 'success') {
    console.log('Request cancelled successfully');
} else {
    console.error('Failed to cancel request:', result.message);
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

function useUserJoinRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchRequests = async (status = null) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            
            const response = await fetch(`/api/v1/user/join-requests?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setRequests(data.data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };
    
    const cancelRequest = async (requestId) => {
        try {
            const response = await fetch(`/api/v1/user/join-requests/${requestId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                setRequests(requests.filter(req => req.id !== requestId));
                return true;
            } else {
                setError(data.message);
                return false;
            }
        } catch (err) {
            setError('Failed to cancel request');
            return false;
        }
    };
    
    useEffect(() => {
        fetchRequests();
    }, []);
    
    return {
        requests,
        loading,
        error,
        fetchRequests,
        cancelRequest
    };
}

// Usage in component
function JoinRequestsList() {
    const { requests, loading, error, cancelRequest } = useUserJoinRequests();
    
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    
    return (
        <div>
            {requests.map(request => (
                <div key={request.id}>
                    <h3>{request.connect_room_name}</h3>
                    <p>Status: {request.status}</p>
                    {request.status === 'pending' && (
                        <button onClick={() => cancelRequest(request.id)}>
                            Cancel Request
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid authentication tokens
2. **Authorization**: Users can only access their own join requests
3. **Input Validation**: Request IDs are validated for existence and ownership
4. **Status Validation**: Only pending requests can be cancelled
5. **Soft Deletes**: Cancelled requests are soft deleted to maintain audit trail

---

## Rate Limiting

These endpoints are subject to the standard API rate limiting:
- 1000 requests per hour per authenticated user
- 100 requests per minute per authenticated user

---

## Changelog

### Version 1.0.0 (2025-01-15)
- Initial release
- Added `GET /api/v1/user/join-requests` endpoint
- Added `DELETE /api/v1/user/join-requests/{request}` endpoint
- Added pagination support
- Added status filtering
- Added comprehensive error handling

---

*User Join Requests API Documentation v1.0.0 - January 2025*
