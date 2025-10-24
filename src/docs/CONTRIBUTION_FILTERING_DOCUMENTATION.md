# Connect Room Transaction Contribution Filtering

## Overview
Added the ability to filter user's connect room transactions by contribution, allowing users to view transactions related to specific contributions within a room.

## New Features

### 1. Filter Transactions by Contribution ID
**Endpoint**: `GET /api/v1/connect-room/{room}/user-transactions`

**New Parameter**:
- `contribution_id` (query, optional): Filter by specific contribution ID

**Example Usage**:
```
GET /api/v1/connect-room/123/user-transactions?contribution_id=456
```

### 2. Get Available Contributions for Filtering
**Endpoint**: `GET /api/v1/connect-room/{room}/contributions-for-filtering`

**Purpose**: Retrieve all contributions in a room to help users select which contribution to filter by.

**Response**: List of contributions with basic information (id, title, amount, type, deadline, etc.)

## Implementation Details

### Database Structure
The contribution information is stored in the `metadata` JSON field of the `hebron_connect_wallet_transactions` table:

```json
{
  "contribution_id": 456,
  "contribution_title": "Monthly Contribution",
  "contribution_type": "monthly",
  "deadline": "2024-12-31",
  "ptn": "MTN_PTN_123456",
  "trid": "TRID_789012",
  "receipt_number": "REC_345678",
  "phone_number": "+237123456789"
}
```

### Filtering Logic
The filtering is implemented using Laravel's JSON query capabilities:

```php
if ($request->has('contribution_id')) {
    $contributionId = $request->input('contribution_id');
    $query->whereJsonContains('metadata->contribution_id', (int) $contributionId);
}
```

### Enhanced Response Data
Transactions now include contribution information in the response:

```json
{
  "id": 1,
  "transaction_id": "HCTX_ABC123DEF456_1640995200",
  "transaction_type": "contribution_payment",
  "status": "completed",
  "amount": 5000.00,
  "currency": "XAF",
  "contribution": {
    "id": 456,
    "title": "Monthly Contribution",
    "type": "monthly",
    "deadline": "2024-12-31"
  },
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## API Endpoints

### 1. Get User Transactions with Contribution Filter
```
GET /api/v1/connect-room/{room}/user-transactions?contribution_id={contribution_id}
```

**Parameters**:
- `room` (path): Connect room ID
- `contribution_id` (query, optional): Filter by contribution ID
- `user_id` (query, optional): User ID (admin/owner only)
- `transaction_type` (query, optional): Filter by transaction type
- `status` (query, optional): Filter by status
- `date_from` (query, optional): Filter from date
- `date_to` (query, optional): Filter to date
- `page` (query, optional): Page number
- `per_page` (query, optional): Items per page

**Response**: Paginated list of transactions with contribution information

### 2. Get Contributions for Filtering
```
GET /api/v1/connect-room/{room}/contributions-for-filtering
```

**Parameters**:
- `room` (path): Connect room ID

**Response**: List of contributions in the room

## Usage Examples

### Filter Transactions by Specific Contribution
```javascript
// Get all transactions for contribution ID 456
const response = await fetch('/api/v1/connect-room/123/user-transactions?contribution_id=456', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
const data = await response.json();
```

### Get Available Contributions for Filtering
```javascript
// Get all contributions in the room
const response = await fetch('/api/v1/connect-room/123/contributions-for-filtering', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
const contributions = await response.json();

// Use contribution IDs for filtering
contributions.data.forEach(contribution => {
    console.log(`Contribution ${contribution.id}: ${contribution.title}`);
});
```

### Combined Filtering
```javascript
// Get completed contribution payments for a specific contribution
const response = await fetch('/api/v1/connect-room/123/user-transactions?contribution_id=456&transaction_type=contribution_payment&status=completed', {
    headers: {
        'Authorization': 'Bearer ' + token
    }
});
```

## Authorization

- **Users**: Can view their own transactions and filter by contributions
- **Room Admins/Owners**: Can view any user's transactions in their room
- **Room Members**: Can view contributions for filtering purposes

## Benefits

1. **Better Transaction Management**: Users can easily find transactions related to specific contributions
2. **Improved User Experience**: Clear filtering options make it easier to track payments
3. **Enhanced Reporting**: Room admins can generate reports for specific contributions
4. **Audit Trail**: Easy to trace all payments for a particular contribution
5. **Financial Transparency**: Members can see exactly which contributions they've paid for

## Technical Notes

- Uses JSON querying for efficient filtering of metadata
- Maintains backward compatibility with existing filtering options
- Includes proper validation and error handling
- Follows existing API patterns and authentication requirements
- Includes comprehensive OpenAPI documentation

## Future Enhancements

1. **Contribution Summary**: Add endpoint to get summary statistics for a contribution
2. **Payment Status**: Show payment status per contribution (paid, pending, overdue)
3. **Bulk Operations**: Allow filtering multiple contributions at once
4. **Export Functionality**: Export filtered transactions to CSV/Excel
5. **Advanced Analytics**: Contribution payment analytics and insights
