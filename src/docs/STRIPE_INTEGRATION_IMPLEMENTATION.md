# Stripe Integration Implementation for Hebron Connect

## Overview

This document outlines the complete Stripe payment integration implementation for the Hebron Connect backend, based on the existing Stripe implementation in the h-cab backend.

## Features Implemented

### 1. Stripe Service (`app/Services/StripeService.php`)
- **createPaymentIntent()**: Creates Stripe payment intents for contribution payments
- **retrievePaymentIntent()**: Retrieves payment intent details from Stripe
- **confirmPaymentIntent()**: Confirms payment intents
- Automatic currency conversion (XAF to USD)
- Comprehensive error handling and logging

### 2. Stripe Webhook Controller (`app/Http/Controllers/Api/V1/StripeWebhookController.php`)
- **handleWebhook()**: Main webhook handler for Stripe events
- **handlePaymentIntentCreated()**: Processes payment intent creation events
- **handlePaymentIntentSucceeded()**: Processes successful payment events
- **handlePaymentIntentFailed()**: Processes failed payment events
- Automatic room wallet crediting
- Contribution payment status updates
- Duplicate payment prevention

### 3. Stripe Payment APIs in ConnectRoomContributionController
- **stripeDeposit()**: Creates payment intents for contribution payments
- **confirmStripePayment()**: Confirms payments and credits room wallets
- Room membership validation
- Contribution ownership validation
- Currency conversion support

### 4. Database Changes
- Added `stripe_payment_intent_id` column to `connect_room_transactions` table
- Migration: `2025_10_15_184028_add_stripe_payment_intent_id_to_connect_room_transactions_table.php`
- Updated `ConnectRoomTransaction` model with new fillable field

### 5. Configuration
- Added Stripe configuration to `config/services.php`
- Environment variables for Stripe keys and webhook secrets
- Exchange rate service configuration

## API Endpoints

### 1. Create Payment Intent
**POST** `/api/v1/stripe-deposit`

**Request Body:**
```json
{
    "amount": 1000,
    "deposit_amount": 950,
    "room_id": 1,
    "contribution_id": 1,
    "currency": "XAF"
}
```

**Response:**
```json
{
    "message": "Payment intent created successfully.",
    "data": {
        "payment_intent_id": "pi_1234567890",
        "client_secret": "pi_1234567890_secret_abc123",
        "amount": 1000,
        "currency": "XAF",
        "stripe_amount": 1.78,
        "stripe_currency": "usd",
        "exchange_rate": 560.52,
        "conversion_performed": true
    }
}
```

### 2. Confirm Payment
**POST** `/api/v1/stripe-confirm`

**Request Body:**
```json
{
    "payment_intent_id": "pi_1234567890"
}
```

**Response:**
```json
{
    "message": "Payment confirmed and room wallet credited successfully.",
    "data": {
        "transaction": {
            "id": 123,
            "amount": 1000,
            "status": "completed",
            "payment_method": "STRIPE_CARD"
        },
        "room_wallet_balance": 1500.75,
        "stripe_amount": 1.78,
        "stripe_currency": "usd",
        "original_amount": 1000,
        "original_currency": "XAF"
    }
}
```

### 3. Webhook Endpoint
**POST** `/api/v1/stripe/webhook`

Handles Stripe webhook events automatically:
- `payment_intent.created`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

## Environment Variables

Add the following to your `.env` file:

```env
# Stripe Configuration
STRIPE_SECRET=sk_test_your_stripe_secret_key
STRIPE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_WEBHOOK_TOLERANCE=300

# Exchange Rate Configuration
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
EXCHANGE_RATE_BASE_URL=https://api.exchangerate-api.com/v4/latest/USD
EXCHANGE_RATE_CACHE_DURATION=3600
```

## Installation Steps

### 1. Install Stripe PHP SDK
```bash
composer require stripe/stripe-php
```

### 2. Run Database Migration
```bash
php artisan migrate
```

### 3. Configure Stripe Dashboard
1. Go to your Stripe Dashboard
2. Navigate to Developers > Webhooks
3. Add endpoint: `https://yourapp.com/api/v1/stripe/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret and add it to your `.env` file

## Implementation Flow

### Frontend Implementation
1. **Create Payment Intent:**
   ```javascript
   const response = await fetch('/api/v1/stripe-deposit', {
       method: 'POST',
       headers: {
           'Authorization': 'Bearer ' + token,
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({
           amount: 1000,
           deposit_amount: 950,
           room_id: 1,
           contribution_id: 1,
           currency: 'XAF'
       })
   });
   
   const { data } = await response.json();
   ```

2. **Process Payment with Stripe:**
   ```javascript
   // Initialize Stripe
   const stripe = Stripe('your_publishable_key');
   
   // Confirm payment
   const result = await stripe.confirmPayment({
       clientSecret: data.client_secret,
       confirmParams: {
           return_url: 'https://yourapp.com/payment-success',
       }
   });
   
   if (result.error) {
       // Handle error
       console.error(result.error);
   } else {
       // Payment successful
       await confirmPayment(data.payment_intent_id);
   }
   ```

3. **Confirm Payment:**
   ```javascript
   const confirmResponse = await fetch('/api/v1/stripe-confirm', {
       method: 'POST',
       headers: {
           'Authorization': 'Bearer ' + token,
           'Content-Type': 'application/json'
       },
       body: JSON.stringify({
           payment_intent_id: data.payment_intent_id
       })
   });
   ```

## Security Features

1. **Webhook Verification:** All webhook requests are verified using Stripe's signature
2. **Idempotency:** Duplicate payments are prevented by checking existing transactions
3. **Transaction Isolation:** Database transactions ensure data consistency
4. **Logging:** All payment events are logged for audit purposes
5. **Room Membership Validation:** Only room members can make payments
6. **Contribution Ownership Validation:** Payments can only be made for valid contributions

## Error Handling

Common error responses:
- `400`: Validation errors (invalid amount, currency, etc.)
- `401`: Unauthorized (invalid or missing token)
- `403`: Forbidden (not a room member)
- `404`: Not found (room, contribution, or user not found)
- `500`: Server errors (Stripe API errors, database errors)

## Testing

For testing, use Stripe's test card numbers:
- **Success:** `4242424242424242`
- **Decline:** `4000000000000002`
- **Insufficient Funds:** `4000000000009995`

## Key Differences from h-cab Implementation

1. **Room-based Payments:** Payments are made to room wallets instead of user wallets
2. **Contribution Integration:** Payments are tied to specific contributions
3. **Room Membership Validation:** Only room members can make payments
4. **Contribution Status Updates:** Payment status is updated in contribution records
5. **XAF Currency Standard:** All room wallets use XAF currency with automatic conversion
6. **Dual Amount System:** Supports both `amount` (charged to card) and `deposit_amount` (credited to wallet)

## Support

For issues or questions, check the application logs or contact the development team.

## Files Modified/Created

### New Files:
- `app/Services/StripeService.php`
- `app/Http/Controllers/Api/V1/StripeWebhookController.php`
- `database/migrations/2025_10_15_184028_add_stripe_payment_intent_id_to_connect_room_transactions_table.php`
- `docs/STRIPE_INTEGRATION_IMPLEMENTATION.md`

### Modified Files:
- `app/Http/Controllers/Api/V1/ConnectRoomContributionController.php` (added Stripe methods)
- `app/Models/ConnectRoomTransaction.php` (added stripe_payment_intent_id field)
- `config/services.php` (added Stripe configuration)
- `routes/api.php` (added Stripe routes)
- `composer.json` (added Stripe dependency)

## Next Steps

1. Install the Stripe PHP SDK: `composer require stripe/stripe-php`
2. Configure environment variables
3. Set up Stripe webhook endpoint
4. Test the implementation with test cards
5. Deploy to production with live Stripe keys
