# Connect Room Currency Specification Implementation

## Overview
This implementation adds currency specification functionality to connect room creation, ensuring that all contributions created within a room use the room's specified currency as the default.

## Changes Made

### 1. Database Migration
- **File**: `database/migrations/2025_10_10_050340_add_currency_to_connect_rooms_table.php`
- **Change**: Added `currency` field to `connect_rooms` table
- **Type**: `string(3)` with default value `'XAF'`

### 2. ConnectRoom Model
- **File**: `app/Models/ConnectRoom.php`
- **Change**: Added `currency` to the `$fillable` array

### 3. ConnectRoomController
- **File**: `app/Http/Controllers/Api/V1/ConnectRoomController.php`
- **Changes**:
  - Added currency validation in the `create` method
  - Added currency parameter to room creation logic
  - Updated API documentation to include currency parameter
  - Added currency to response data

### 4. CreateConnectRoomWallet Listener
- **File**: `app/Listeners/CreateConnectRoomWallet.php`
- **Change**: Updated to use the room's currency when creating the wallet

### 5. ConnectRoomContributionController
- **File**: `app/Http/Controllers/Api/V1/ConnectRoomContributionController.php`
- **Changes**:
  - Made currency parameter optional in contribution creation
  - Updated validation to use room's currency as default
  - Updated API documentation to reflect optional currency parameter

### 6. ConnectRoomController Update Method
- **File**: `app/Http/Controllers/Api/V1/ConnectRoomController.php`
- **Changes**:
  - Added currency validation to the update method
  - Added currency to the updateData array
  - Added logic to update wallet currency when room currency is changed
  - Updated API documentation to include currency parameter in update request
  - Added currency to response documentation

## API Usage

### Creating a Connect Room with Currency
```json
POST /api/v1/connect-rooms
{
    "name": "My Connect Room",
    "description": "A room for connecting people",
    "category_id": 1,
    "currency": "USD"
}
```

### Updating a Connect Room Currency
```json
PUT /api/v1/connect-room/{room_id}
{
    "name": "Updated Room Name",
    "description": "Updated room description",
    "currency": "EUR"
}
```

**Supported Currencies**: USD, EUR, XAF, XOF, CAD, GBP, JPY, CHF, AUD, CNY

### Creating a Contribution (Currency Optional)
```json
POST /api/v1/connect-room/{room_id}/contributions
{
    "title": "Monthly Contribution",
    "amount": 100.00,
    "contribution_type": "monthly",
    "deadline": "2024-12-31",
    "currency": "USD"  // Optional - uses room's currency if not provided
}
```

## Behavior

1. **Room Creation**: 
   - If no currency is specified, defaults to `XAF`
   - If currency is specified, validates against supported currencies
   - Room's wallet is created with the same currency

2. **Room Update**:
   - Currency can be updated by room owners and admins
   - When currency is updated, the room's wallet currency is automatically updated
   - Validates against supported currencies
   - Logs currency changes for audit purposes

3. **Contribution Creation**:
   - If no currency is specified, uses the room's currency
   - If currency is specified, validates against supported currencies
   - Allows different currency than room's default if needed

4. **Validation**:
   - Currency must be exactly 3 characters
   - Must be one of the supported currencies
   - Proper error messages for invalid currencies

## Database Schema

### connect_rooms table
```sql
ALTER TABLE connect_rooms ADD COLUMN currency VARCHAR(3) DEFAULT 'XAF';
```

### connect_room_wallets table
- Already has currency field
- Now uses room's currency when created

### connect_room_contributions table
- Already has currency field
- Now defaults to room's currency if not specified

## Testing

The implementation has been tested manually and all functionality works as expected:
- Room creation with default currency (XAF)
- Room creation with specified currency
- Wallet creation with room's currency
- Contribution creation with room's currency as default
- Contribution creation with specified currency
- Proper validation of currency format and supported currencies

## Migration Status

The migration has been successfully applied to the database:
```
2025_10_10_050340_add_currency_to_connect_rooms_table .................................................... [34] Ran
```
