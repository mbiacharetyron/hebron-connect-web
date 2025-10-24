# List Paid Members API Documentation

## Overview
The `listPaidMembers` API endpoint retrieves a list of all members who have successfully paid for a specific contribution in a connect room. This endpoint provides detailed information about payment transactions, member details, and contribution summary statistics. **The API automatically converts all transaction amounts to the contribution's currency for consistent reporting.**

## Endpoint Details

### Basic Information
- **URL**: `/api/v1/connect-room/{room}/contribution/{contribution}/paid-members`
- **Method**: `GET`
- **Authentication**: Bearer Token Required
- **Content-Type**: `application/json`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |
| `contribution` | integer | Yes | ID of the contribution |

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number for pagination |
| `per_page` | integer | No | 15 | Number of items per page (max: 100) |

## Request Example

```bash
GET /api/v1/connect-room/123/contribution/456/paid-members?page=1&per_page=20
Authorization: Bearer your_access_token_here
```

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Paid members retrieved successfully",
  "data": {
    "summary": {
      "total_paid": 50000.00,
      "currency": "XAF",
      "total_members": 10,
      "paid_members": 5,
      "total_payments": 8,
      "target_amount_per_member": 10000,
      "deadline": "2024-03-17T00:00:00.000000Z",
      "is_active": true
    },
    "paid_members": {
      "current_page": 1,
      "per_page": 15,
      "total": 5,
      "data": [
        {
          "id": 1,
          "total_amount": 10000.00,
          "currency": "XAF",
          "payment_count": 1,
          "first_payment": "2024-03-15T10:30:00.000000Z",
          "last_payment": "2024-03-15T10:30:00.000000Z",
          "payment_methods": ["MTN_MOMO"],
          "conversion_info": null,
          "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "237612345678",
            "profile_image": "https://example.com/photo.jpg"
          }
        },
        {
          "id": 2,
          "total_amount": 15000.00,
          "currency": "XAF",
          "payment_count": 2,
          "first_payment": "2024-03-14T09:15:00.000000Z",
          "last_payment": "2024-03-16T14:20:00.000000Z",
          "payment_methods": ["ORANGE_MOMO", "MTN_MOMO"],
          "conversion_info": {
            "original_amount": 25.0,
            "original_currency": "USD",
            "converted_amount": 15000.00,
            "converted_currency": "XAF",
            "exchange_rate": 600.0
          },
          "user": {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "237698765432",
            "profile_image": "https://example.com/jane.jpg"
          }
        }
      ]
    }
  }
}
```

### Response Fields Description

#### Summary Object
| Field | Type | Description |
|-------|------|-------------|
| `total_paid` | number | Total amount paid by all members for this contribution (converted to contribution currency, rounded to 2 decimal places) |
| `currency` | string | The contribution's currency (all amounts are converted to this currency) |
| `total_members` | integer | Total number of members in the room |
| `paid_members` | integer | Number of members who have made payments |
| `total_payments` | integer | Total number of payment transactions |
| `target_amount_per_member` | number | Expected contribution amount per member |
| `deadline` | string | Contribution deadline (ISO 8601 format) |
| `is_active` | boolean | Whether the contribution is still active |

#### Paid Members Object
| Field | Type | Description |
|-------|------|-------------|
| `current_page` | integer | Current page number |
| `per_page` | integer | Number of items per page |
| `total` | integer | Total number of paid members |
| `data` | array | Array of paid member objects |

#### Paid Member Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `total_amount` | number | Total amount paid by this user (converted to contribution currency, rounded to 2 decimal places) |
| `currency` | string | The contribution's currency (all amounts are converted to this currency) |
| `payment_count` | integer | Number of payments made by this user |
| `first_payment` | string | Date of first payment (ISO 8601 format) |
| `last_payment` | string | Date of last payment (ISO 8601 format) |
| `payment_methods` | array | List of payment methods used |
| `conversion_info` | object\|null | Currency conversion details (null if no conversion was needed) |
| `user` | object | User information object |

#### Conversion Info Object
| Field | Type | Description |
|-------|------|-------------|
| `original_amount` | number | The original transaction amount in the transaction's currency |
| `original_currency` | string | The currency of the original transaction |
| `converted_amount` | number | The converted amount in the contribution's currency (rounded to 2 decimal places) |
| `converted_currency` | string | The contribution's currency |
| `exchange_rate` | number | The exchange rate used for conversion |

#### User Object
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | User ID |
| `name` | string | Full name (first_name + last_name) |
| `email` | string | User's email address |
| `phone` | string | User's phone number |
| `profile_image` | string | URL to user's profile image |

## Error Responses

### 403 Forbidden - Unauthorized Access
```json
{
  "success": false,
  "message": "Unauthorized. Only room members can view paid members.",
  "data": null
}
```

### 404 Not Found - Room or Contribution Not Found
```json
{
  "success": false,
  "message": "Room or contribution not found",
  "data": null
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to retrieve paid members: [error details]",
  "data": null
}
```

## Authentication & Authorization

### Required Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Authorization Rules
- User must be authenticated with a valid bearer token
- User must be a member of the specified connect room
- Only room members can view paid member information

## Business Logic

### Data Aggregation
- The API aggregates payment data by user, summing all completed transactions
- Multiple payments from the same user are combined into a single entry
- Payment methods are collected and displayed as an array

### Currency Conversion
- **Automatic Conversion**: All transaction amounts are automatically converted to the contribution's currency
- **Exchange Rate Service**: Uses real-time exchange rates from exchangerate-api.com with 1-hour caching
- **Fallback Rates**: If the exchange rate API is unavailable, fallback rates are used
- **Amount Rounding**: All converted amounts are rounded to 2 decimal places for consistency
- **Conversion Details**: When conversion occurs, the `conversion_info` object provides:
  - Original amount and currency
  - Converted amount and currency (rounded to 2 decimal places)
  - Exchange rate used
- **No Conversion**: If transaction currency matches contribution currency, `conversion_info` is `null`

### Filtering
- Only transactions with `STATUS_COMPLETED` are included
- Results are ordered by the most recent payment date (descending)

### Pagination
- Results are paginated for performance
- Default page size is 15 items
- Maximum page size is 100 items

## Usage Examples

### JavaScript/Fetch
```javascript
const response = await fetch('/api/v1/connect-room/123/contribution/456/paid-members?page=1&per_page=20', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer your_access_token',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### cURL
```bash
curl -X GET \
  'https://api.hebronconnect.com/api/v1/connect-room/123/contribution/456/paid-members?page=1&per_page=20' \
  -H 'Authorization: Bearer your_access_token' \
  -H 'Content-Type: application/json'
```

### PHP/Laravel
```php
$response = Http::withHeaders([
    'Authorization' => 'Bearer ' . $accessToken,
    'Content-Type' => 'application/json'
])->get('/api/v1/connect-room/123/contribution/456/paid-members', [
    'page' => 1,
    'per_page' => 20
]);

$data = $response->json();
```

## Related Endpoints

- `GET /api/v1/connect-room/{room}/contribution` - List all contributions
- `GET /api/v1/connect-room/{room}/contribution/{contribution}` - Get contribution details
- `POST /api/v1/connect-room/{room}/contribution/{contribution}/pay` - Make a payment

## Currency Conversion Examples

### Example 1: No Conversion Needed
```json
{
  "id": 1,
  "total_amount": 10000,
  "currency": "XAF",
  "conversion_info": null,
  "user": { ... }
}
```
*Transaction was made in XAF, contribution is in XAF - no conversion needed*

### Example 2: USD to XAF Conversion
```json
{
  "id": 2,
  "total_amount": 15000.00,
  "currency": "XAF",
  "conversion_info": {
    "original_amount": 25.0,
    "original_currency": "USD",
    "converted_amount": 15000.00,
    "converted_currency": "XAF",
    "exchange_rate": 600.0
  },
  "user": { ... }
}
```
*Transaction was made in USD ($25), converted to XAF (15,000.00 XAF) at rate 600*

### Example 3: EUR to XAF Conversion
```json
{
  "id": 3,
  "total_amount": 21000.00,
  "currency": "XAF",
  "conversion_info": {
    "original_amount": 30.0,
    "original_currency": "EUR",
    "converted_amount": 21000.00,
    "converted_currency": "XAF",
    "exchange_rate": 700.0
  },
  "user": { ... }
}
```
*Transaction was made in EUR (€30), converted to XAF (21,000.00 XAF) at rate 700*

## Notes

1. **Performance**: The endpoint uses database aggregation for efficient data retrieval
2. **Security**: Only room members can access this information
3. **Real-time**: Data reflects the current state of payments at the time of request
4. **Currency**: All amounts are returned in the contribution's currency with automatic conversion
5. **Exchange Rates**: Real-time rates with 1-hour caching and fallback rates for reliability
6. **Profile Images**: URLs are full S3 URLs when available

## Version History

- **v1.0** - Initial implementation with basic paid member listing
- **v1.1** - Added payment aggregation and summary statistics
- **v1.2** - Enhanced user information and payment method tracking
- **v1.3** - Added automatic currency conversion with exchange rate service

---

*Last Updated: [Current Date]*
*API Version: v1*
