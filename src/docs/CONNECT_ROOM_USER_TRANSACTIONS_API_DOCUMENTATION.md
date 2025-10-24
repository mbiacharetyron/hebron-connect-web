# Connect Room User Transactions API Documentation

## Overview

The Connect Room User Transactions API provides endpoints to retrieve and manage user transactions within connect rooms. This API allows users to view their own transaction history and enables room administrators to view transactions for any user in their room.

## Base URL

```
https://api.hebronconnect.com/api/v1
```

## Authentication

All endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer {your_token}
```

## Endpoints

### List User Transactions for Connect Room

Retrieve a paginated list of transactions for a specific user within a connect room.

#### Endpoint

```
GET /connect-room/{room}/user-transactions
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | The ID of the connect room |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `user_id` | integer | No | Current user ID | User ID to get transactions for (admin/owner only) |
| `transaction_type` | string | No | - | Filter by transaction type |
| `status` | string | No | - | Filter by transaction status |
| `date_from` | date | No | - | Filter transactions from date (YYYY-MM-DD) |
| `date_to` | date | No | - | Filter transactions to date (YYYY-MM-DD) |
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 20 | Number of items per page (max 100) |

#### Transaction Types

| Value | Description |
|-------|-------------|
| `contribution_payment` | Payment for room contributions |
| `contribution_refund` | Refund for contribution payments |
| `event_payment` | Payment for room events |
| `event_refund` | Refund for event payments |
| `announcement_payment` | Payment for announcements |
| `announcement_refund` | Refund for announcement payments |
| `wallet_top_up` | Wallet top-up transactions |
| `wallet_withdrawal` | Wallet withdrawal transactions |
| `merchant_payment` | Merchant payment transactions |
| `admin_adjustment` | Administrative adjustments |
| `system_fee` | System fee transactions |
| `other` | Other transaction types |

#### Transaction Statuses

| Value | Description |
|-------|-------------|
| `pending` | Transaction is pending processing |
| `completed` | Transaction completed successfully |
| `failed` | Transaction failed |
| `cancelled` | Transaction was cancelled |
| `refunded` | Transaction was refunded |

#### Authorization Rules

- **Regular Users**: Can only view their own transactions
- **Room Admins**: Can view transactions for any user in their room
- **Room Owners**: Can view transactions for any user in their room
- **Non-members**: Cannot view any transactions

#### Request Examples

```bash
# Get current user's transactions
curl -X GET "https://api.hebronconnect.com/api/v1/connect-room/123/user-transactions" \
  -H "Authorization: Bearer your_token_here"

# Get specific user's transactions (admin/owner only)
curl -X GET "https://api.hebronconnect.com/api/v1/connect-room/123/user-transactions?user_id=456" \
  -H "Authorization: Bearer your_token_here"

# Filter by transaction type and status
curl -X GET "https://api.hebronconnect.com/api/v1/connect-room/123/user-transactions?transaction_type=contribution_payment&status=completed" \
  -H "Authorization: Bearer your_token_here"

# Filter by date range with pagination
curl -X GET "https://api.hebronconnect.com/api/v1/connect-room/123/user-transactions?date_from=2024-01-01&date_to=2024-12-31&page=2&per_page=50" \
  -H "Authorization: Bearer your_token_here"
```

#### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": {
    "transactions": [
      {
        "id": 1,
        "transaction_id": "HCTX_ABC123DEF456_1640995200",
        "transaction_type": "contribution_payment",
        "transaction_type_label": "Contribution Payment",
        "status": "completed",
        "status_label": "Completed",
        "amount": 5000.00,
        "currency": "XAF",
        "formatted_amount": "5,000.00 XAF",
        "merchant_amount": 4800.00,
        "formatted_merchant_amount": "4,800.00 XAF",
        "payment_method": "mobile_money",
        "payment_reference": "MTN123456789",
        "description": "Contribution payment for event",
        "notes": "Additional notes",
        "processed_at": "2024-01-01T12:00:00Z",
        "created_at": "2024-01-01T12:00:00Z",
        "user": {
          "id": 123,
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 100,
      "last_page": 5,
      "from": 1,
      "to": 20
    }
  }
}
```

#### Error Responses

##### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized"
}
```

##### 403 Forbidden

```json
{
  "success": false,
  "message": "You are not authorized to view transactions for this room"
}
```

##### 404 Not Found

```json
{
  "success": false,
  "message": "Connect room not found"
}
```

##### 422 Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "transaction_type": ["The selected transaction type is invalid."],
    "date_from": ["The date from must be a date before or equal to date to."]
  }
}
```

##### 500 Internal Server Error

```json
{
  "success": false,
  "message": "An error occurred while retrieving transactions"
}
```

## Data Models

### Transaction Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique transaction ID |
| `transaction_id` | string | Unique transaction identifier |
| `transaction_type` | string | Type of transaction |
| `transaction_type_label` | string | Human-readable transaction type |
| `status` | string | Transaction status |
| `status_label` | string | Human-readable status |
| `amount` | float | Transaction amount |
| `currency` | string | Currency code (e.g., XAF) |
| `formatted_amount` | string | Formatted amount with currency |
| `merchant_amount` | float | Amount received by merchant |
| `formatted_merchant_amount` | string | Formatted merchant amount |
| `payment_method` | string | Payment method used |
| `payment_reference` | string | Payment reference number |
| `description` | string | Transaction description |
| `notes` | string | Additional notes |
| `processed_at` | string | ISO 8601 timestamp when processed |
| `created_at` | string | ISO 8601 timestamp when created |
| `user` | object | User information (see User Object) |

### User Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `name` | string | User's full name |
| `email` | string | User's email address |

### Pagination Object

| Field | Type | Description |
|-------|------|-------------|
| `current_page` | integer | Current page number |
| `per_page` | integer | Items per page |
| `total` | integer | Total number of items |
| `last_page` | integer | Last page number |
| `from` | integer | First item number on current page |
| `to` | integer | Last item number on current page |

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Rate Limit**: 100 requests per minute per user
- **Headers**: Rate limit information is included in response headers
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Time when the rate limit resets

## Error Handling

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid request parameters |
| `401` | Unauthorized - Invalid or missing authentication token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource not found |
| `422` | Unprocessable Entity - Validation errors |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error - Server error |

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

## Best Practices

### 1. Authentication
- Always include the Bearer token in the Authorization header
- Handle token expiration gracefully
- Implement token refresh when needed

### 2. Pagination
- Use appropriate page sizes (recommended: 20-50 items)
- Implement infinite scroll or "Load More" functionality
- Cache pagination results when possible

### 3. Filtering
- Use date filters to limit data retrieval
- Combine multiple filters for better performance
- Cache filtered results when appropriate

### 4. Error Handling
- Always check the response status code
- Display user-friendly error messages
- Implement retry logic for transient errors

### 5. Performance
- Use appropriate page sizes to balance performance and user experience
- Implement client-side caching for frequently accessed data
- Use date filters to limit data retrieval

## SDK Examples

### JavaScript/TypeScript

```typescript
class ConnectRoomTransactionsAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async getUserTransactions(
    roomId: number,
    options: {
      userId?: number;
      transactionType?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      perPage?: number;
    } = {}
  ) {
    const params = new URLSearchParams();
    
    if (options.userId) params.append('user_id', options.userId.toString());
    if (options.transactionType) params.append('transaction_type', options.transactionType);
    if (options.status) params.append('status', options.status);
    if (options.dateFrom) params.append('date_from', options.dateFrom);
    if (options.dateTo) params.append('date_to', options.dateTo);
    if (options.page) params.append('page', options.page.toString());
    if (options.perPage) params.append('per_page', options.perPage.toString());

    const response = await fetch(
      `${this.baseURL}/connect-room/${roomId}/user-transactions?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }
}

// Usage
const api = new ConnectRoomTransactionsAPI('https://api.hebronconnect.com/api/v1', 'your_token');

// Get user transactions
const transactions = await api.getUserTransactions(123, {
  transactionType: 'contribution_payment',
  status: 'completed',
  page: 1,
  perPage: 20
});
```

### PHP

```php
<?php

class ConnectRoomTransactionsAPI
{
    private $baseURL;
    private $token;

    public function __construct($baseURL, $token)
    {
        $this->baseURL = $baseURL;
        $this->token = $token;
    }

    public function getUserTransactions($roomId, $options = [])
    {
        $params = http_build_query($options);
        $url = "{$this->baseURL}/connect-room/{$roomId}/user-transactions?{$params}";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer {$this->token}",
            "Content-Type: application/json"
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("HTTP error! status: {$httpCode}");
        }

        return json_decode($response, true);
    }
}

// Usage
$api = new ConnectRoomTransactionsAPI('https://api.hebronconnect.com/api/v1', 'your_token');

$transactions = $api->getUserTransactions(123, [
    'transaction_type' => 'contribution_payment',
    'status' => 'completed',
    'page' => 1,
    'per_page' => 20
]);
```

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial release
- Added GET endpoint for listing user transactions
- Implemented authentication and authorization
- Added filtering and pagination support
- Complete OpenAPI documentation

## Support

For API support and questions:

- **Email**: support@hebronconnect.com
- **Documentation**: https://docs.hebronconnect.com
- **Status Page**: https://status.hebronconnect.com

## License

This API documentation is proprietary to Hebron Connect. Unauthorized reproduction or distribution is prohibited.
