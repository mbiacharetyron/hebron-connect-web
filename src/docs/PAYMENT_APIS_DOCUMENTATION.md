# Payment APIs Documentation

This document provides comprehensive documentation for the payment APIs in the Hebron Connect Backend system, including contribution payments, fee structures, and transaction management.

## Table of Contents

1. [Authentication](#authentication)
2. [Payment Methods](#payment-methods)
3. [Fee Structure](#fee-structure)
4. [Rate APIs](#rate-apis)
5. [Contribution Payment API](#contribution-payment-api)
6. [Transaction Management](#transaction-management)
7. [Error Handling](#error-handling)
8. [Examples](#examples)

---

## Authentication

All payment API endpoints require authentication using Bearer token in the Authorization header:

```
Authorization: Bearer {your_access_token}
```

---

## Payment Methods

The system supports the following payment methods:

### **MTN Mobile Money**
- **Method**: `MTN`
- **Phone Validation**: MTN Cameroon numbers (650, 651, 652, 653, 654, 68x, 67x, 4673312345x)
- **Processing**: Via Maviance S3P API

### **Orange Money**
- **Method**: `ORANGE`
- **Phone Validation**: Orange Cameroon numbers (655, 656, 657, 658, 659, 69x)
- **Processing**: Via Maviance S3P API

---

## Fee Structure

The payment system implements a dual-fee structure:

### **App Fee**
- **Rate Source**: `wallet_deposit_fee_maviance` from rates table
- **Purpose**: Application-level fees
- **Calculation**: Percentage of original amount
- **Tracking**: Stored in `app_fee_amount` column

### **Merchant Fee**
- **Rate Source**: `wallet_withdrawal_fee` from rates table
- **Purpose**: Payment provider fees (MTN/Orange)
- **Calculation**: Percentage of original amount
- **Tracking**: Stored in `merchant_fee_amount` column

### **Total Payment Calculation**
```
Total Withdrawn = Original Amount + App Fee + Merchant Fee
Room Credit = Original Amount (fees are not credited to room)
```

---

## Rate APIs

### 6.1 Get Withdrawal Fee Rate

**Endpoint:** `GET /api/v1/rates/withdrawal-fee`

**Description:** Retrieve the withdrawal fee rate from the rates table.

**Authentication:** Not required (Public endpoint)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lang` | string | No | Language preference (en/fr). Default: en |

**Response:**
```json
{
    "status": "success",
    "message": "Withdrawal fee rate retrieved successfully.",
    "data": {
        "name": "wallet_withdrawal_fee",
        "rate": 2.5,
        "description": "Wallet withdrawal fee in percentage."
    }
}
```

**Error Responses:**
- `404`: Rate not found
- `500`: Server error

### 6.2 Get Deposit Fee Rate

**Endpoint:** `GET /api/v1/rates/deposit-fee`

**Description:** Retrieve the deposit fee rate from the rates table.

**Authentication:** Not required (Public endpoint)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lang` | string | No | Language preference (en/fr). Default: en |

**Response:**
```json
{
    "status": "success",
    "message": "Deposit fee rate retrieved successfully.",
    "data": {
        "name": "wallet_deposit_fee_maviance",
        "rate": 1.5,
        "description": "Wallet deposit fee in percentage."
    }
}
```

**Error Responses:**
- `404`: Rate not found
- `500`: Server error

### 6.3 Get All Rates

**Endpoint:** `GET /api/v1/rates/all`

**Description:** Retrieve all rates from the rates table.

**Authentication:** Not required (Public endpoint)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lang` | string | No | Language preference (en/fr). Default: en |

**Response:**
```json
{
    "status": "success",
    "message": "All rates retrieved successfully.",
    "data": [
        {
            "id": 1,
            "name": "wallet_withdrawal_fee",
            "rate": 2.5,
            "description": "Wallet withdrawal fee in percentage.",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        },
        {
            "id": 2,
            "name": "wallet_deposit_fee_maviance",
            "rate": 1.5,
            "description": "Wallet deposit fee in percentage.",
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z"
        }
    ]
}
```

**Error Responses:**
- `500`: Server error

### 6.4 Rate API Examples

#### **Get Withdrawal Fee Rate**
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/rates/withdrawal-fee" \
  -H "Content-Type: application/json"
```

#### **Get Deposit Fee Rate**
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/rates/deposit-fee" \
  -H "Content-Type: application/json"
```

#### **Get All Rates**
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/rates/all" \
  -H "Content-Type: application/json"
```

#### **Get Rates with French Language**
```bash
curl -X GET "https://api.hebronconnect.com/api/v1/rates/withdrawal-fee?lang=fr" \
  -H "Content-Type: application/json"
```

---

## Contribution Payment API

### Initialize Contribution Payment

Creates a payment transaction for a connect room contribution.

**Endpoint:** `POST /api/v1/connect-room/{room}/contribution/{contribution}/pay`

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |
| `contribution` | integer | Yes | ID of the contribution |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Payment amount (min: 100) |
| `currency` | string | Yes | Currency code (must match contribution currency) |
| `payment_method` | string | Yes | Payment method: `MTN` or `ORANGE` |
| `phone_number` | string | No | Collection phone number (optional) |

**Phone Number Validation:**

#### **MTN Numbers**
- Format: `(237)?((650|651|652|653|654)[0-9]{6}$|(68[0-9]{7})$|(67[0-9]{7})$|(4673312345[0-9]{1})$)`
- Examples: `237650123456`, `650123456`, `681234567`

#### **Orange Numbers**
- Format: `(237)?((655|656|657|658|659)[0-9]{6}$|(69[0-9]{7})$)`
- Examples: `237655123456`, `655123456`, `691234567`

**Example Request:**

```json
{
  "amount": 1000,
  "currency": "XAF",
  "payment_method": "MTN",
  "phone_number": "237650123456"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "message": "Payment initiated, please confirm on your device",
  "data": {
    "id": 1,
    "transaction_id": "CONTRIB-1-1-20240320153000",
    "room_id": 1,
    "user_id": 1,
    "contribution_id": 1,
    "amount": 1000,
    "currency": "XAF",
    "payment_method": "MTN_MOMO",
    "status": "pending",
    "ptn": "MTN123456789",
    "trid": "TXN987654321",
    "receipt_number": "RCP123456789",
    "created_at": "2024-03-20T15:30:00Z",
    "updated_at": "2024-03-20T15:30:00Z"
  }
}
```

**Error Responses:**

- **400 Bad Request:**
```json
{
  "status": "error",
  "message": "You are already a member of this room"
}
```

- **403 Forbidden:**
```json
{
  "status": "error",
  "message": "You are not a member of this room"
}
```

- **412 Validation Error:**
```json
{
  "status": "error",
  "message": "Validation Error: The phone number must be a valid MTN Cameroon number"
}
```

---

## Transaction Management

### Transaction Status Flow

```
pending → completed/failed
```

### Transaction Types

| Type | Description |
|------|-------------|
| `CONTRIBUTION_PAYMENT` | Payment for room contribution |
| `WALLET_TOPUP` | Wallet balance top-up |
| `MERCHANT_PAYMENT` | Payment to merchant |
| `REFUND` | Transaction refund |

### Transaction Statuses

| Status | Description |
|--------|-------------|
| `pending` | Transaction initiated, awaiting confirmation |
| `completed` | Transaction successfully processed |
| `failed` | Transaction failed |
| `cancelled` | Transaction cancelled |

---

## Fee Calculation Examples

### **Example 1: MTN Payment**
```json
{
  "original_amount": 1000,
  "app_fee_rate": 1.1,
  "merchant_fee_rate": 2.5,
  "calculations": {
    "app_fee": 11.00,
    "merchant_fee": 25.00,
    "total_fees": 36.00,
    "total_withdrawn": 1036.00,
    "room_credit": 1000.00
  }
}
```

### **Example 2: Orange Payment**
```json
{
  "original_amount": 5000,
  "app_fee_rate": 1.1,
  "merchant_fee_rate": 2.5,
  "calculations": {
    "app_fee": 55.00,
    "merchant_fee": 125.00,
    "total_fees": 180.00,
    "total_withdrawn": 5180.00,
    "room_credit": 5000.00
  }
}
```

---

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 412 | Validation Error - Request validation failed |
| 500 | Internal Server Error - Server error |

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "data": null
}
```

### Validation Errors

#### **Phone Number Validation**
```json
{
  "status": "error",
  "message": "Validation Error: The phone number must be a valid MTN Cameroon number (9 digits after +237)."
}
```

#### **Currency Mismatch**
```json
{
  "status": "error",
  "message": "The contribution currency does not match the currency in the request"
}
```

#### **Insufficient Amount**
```json
{
  "status": "error",
  "message": "Validation Error: The minimum deposit amount is 100 XAF."
}
```

---

## Examples

### Complete Payment Flow

#### **1. Initialize MTN Payment**
```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/1/contribution/1/pay" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "XAF",
    "payment_method": "MTN",
    "phone_number": "237650123456"
  }'
```

#### **2. Initialize Orange Payment**
```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/1/contribution/1/pay" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "currency": "XAF",
    "payment_method": "ORANGE",
    "phone_number": "237655123456"
  }'
```

### **Payment Without Collection Phone**
```bash
curl -X POST "https://api.hebronconnect.com/api/v1/connect-room/1/contribution/1/pay" \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "XAF",
    "payment_method": "MTN"
  }'
```

---

## Transaction Logging

### **Fee Calculation Logs**
```json
{
  "level": "info",
  "message": "Fee calculation for contribution payment",
  "context": {
    "original_amount": 1000,
    "app_fee_amount": 11,
    "merchant_fee_amount": 25,
    "total_to_withdraw": 1036,
    "payment_method": "MTN"
  }
}
```

### **Transaction Creation Logs**
```json
{
  "level": "info",
  "message": "Wallet transaction created for contribution payment",
  "context": {
    "contribution_id": 1,
    "wallet_transaction_id": "TXN123456789",
    "total_amount_withdrawn": 1036,
    "amount_credited_to_room": 1000,
    "merchant_fee_amount": 25,
    "app_fee_amount": 11,
    "payment_method": "MTN_MOMO",
    "original_amount": 1000,
    "fee_percentage": 1.1
  }
}
```

---

## Security Considerations

### **Phone Number Validation**
- Strict validation for MTN and Orange numbers
- Format validation based on Cameroon mobile number patterns
- Prevents invalid phone number submissions

### **Currency Validation**
- Payment currency must match contribution currency
- Prevents currency mismatch errors
- Ensures consistent transaction processing

### **Amount Validation**
- Minimum amount validation (100 XAF)
- Prevents micro-transactions
- Ensures meaningful payment amounts

### **User Authorization**
- Room membership validation
- Contribution access validation
- Prevents unauthorized payments

---

## Rate Configuration

### **App Fee Rate**
- **Rate Name**: `wallet_deposit_fee_maviance`
- **Purpose**: Application-level fees
- **Configuration**: Managed via rates table
- **Default**: 1.1% (configurable)

### **Merchant Fee Rate**
- **Rate Name**: `wallet_withdrawal_fee`
- **Purpose**: Payment provider fees
- **Configuration**: Managed via rates table
- **Default**: 2.5% (configurable)

### **Rate Management**
```sql
-- Update app fee rate
UPDATE rates SET rate = 1.5 WHERE name = 'wallet_deposit_fee_maviance';

-- Update merchant fee rate
UPDATE rates SET rate = 3.0 WHERE name = 'wallet_withdrawal_fee';
```

---

## Database Schema

### **Transaction Table Structure**
```sql
CREATE TABLE hebron_connect_wallet_transactions (
    id BIGINT PRIMARY KEY,
    transaction_id VARCHAR(255) UNIQUE,
    connect_room_id BIGINT,
    user_id BIGINT,
    transaction_type VARCHAR(50),
    status VARCHAR(20),
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    amount_before DECIMAL(10,2),
    amount_after DECIMAL(10,2),
    merchant_amount DECIMAL(10,2),
    merchant_fee_amount DECIMAL(10,2),
    app_fee_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    description TEXT,
    metadata JSON,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Monitoring and Analytics

### **Key Metrics**
- **Transaction Volume**: Total number of transactions
- **Payment Success Rate**: Percentage of successful payments
- **Fee Revenue**: Total fees collected (app + merchant)
- **Average Transaction Value**: Mean transaction amount
- **Payment Method Distribution**: MTN vs Orange usage

### **Logging Requirements**
- All payment transactions are logged
- Fee calculations are tracked
- Error conditions are recorded
- Performance metrics are monitored

---

## Troubleshooting

### **Common Issues**

#### **1. Phone Number Validation Errors**
- **Issue**: Invalid phone number format
- **Solution**: Use correct MTN/Orange number format
- **Example**: Use `237650123456` instead of `650123456`

#### **2. Currency Mismatch**
- **Issue**: Payment currency doesn't match contribution
- **Solution**: Ensure currency codes match exactly
- **Example**: Use `XAF`` not `XAF ` (with space)

#### **3. Insufficient Amount**
- **Issue**: Amount below minimum threshold
- **Solution**: Use amount >= 100 XAF
- **Example**: Use `100` instead of `50`

#### **4. Room Access Denied**
- **Issue**: User not a room member
- **Solution**: Join the room before making payments
- **Check**: Verify room membership status

### **Debug Information**
- Check transaction logs for detailed error information
- Verify rate configuration in database
- Confirm user permissions and room access
- Validate payment method and phone number format

---

## Support

For technical support or questions about the payment APIs:

1. **Check Logs**: Review application logs for detailed error information
2. **Validate Input**: Ensure all request parameters are correct
3. **Test Environment**: Use test environment for development
4. **Rate Configuration**: Verify rate settings in database
5. **Documentation**: Refer to this documentation for API usage

---

## Changelog

### **Version 2.0.0**
- ✅ Added dual-fee structure (app + merchant fees)
- ✅ Enhanced fee calculation methods
- ✅ Improved transaction logging
- ✅ Updated database schema
- ✅ Enhanced error handling

### **Version 1.0.0**
- ✅ Initial payment API implementation
- ✅ MTN and Orange payment support
- ✅ Basic fee calculation
- ✅ Transaction management
