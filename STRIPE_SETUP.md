# Stripe Payment Method Setup

## Overview
The application now supports adding payment methods (credit/debit cards) to subscriptions using Stripe Elements.

## Configuration

### 1. Environment Variable
Create a `.env` file in the root directory with your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

**Where to find your Stripe keys:**
- Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
- Navigate to **Developers** → **API Keys**
- Copy the **Publishable key**
  - For testing: Use the key that starts with `pk_test_`
  - For production: Use the key that starts with `pk_live_`

**Note:** The application includes a default test key for development, but you should replace it with your own key for production use.

### 2. Test Cards
When testing in development mode, use Stripe's test card numbers:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Visa - Succeeds |
| `5555 5555 5555 4444` | Mastercard - Succeeds |
| `4000 0000 0000 0002` | Visa - Declined |

- **Expiry Date:** Any future date (e.g., 12/26)
- **CVC:** Any 3 digits (e.g., 123)
- **ZIP:** Any 5 digits (e.g., 12345)

More test cards: https://stripe.com/docs/testing#cards

## Features Implemented

### 1. Add Payment Method Dialog
- **Location:** Subscription Management page (`/room/:roomId/subscription-manage`)
- **Trigger:** Click the "Add Card" button in the Payment Methods section
- **Flow:**
  1. User clicks "Add Card"
  2. Dialog opens with Stripe Card Element
  3. User enters card details
  4. Card information is securely sent to Stripe (never touches your servers)
  5. Stripe attaches the payment method to the customer
  6. Payment method appears in the list

### 2. Payment Methods Display
- Shows all saved payment methods
- Displays card brand, last 4 digits, and expiry date
- Marks the default payment method with a green badge
- Allows setting a different card as default
- Shows "No payment methods on file" when empty

### 3. Security Features
- Card details are handled entirely by Stripe Elements
- Your application never sees or stores full card numbers
- PCI DSS compliant by default
- All data is encrypted in transit

## Components

### AddPaymentMethodDialog
**File:** `src/components/AddPaymentMethodDialog.tsx`

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback for dialog state changes
- `roomId: number` - The connect room ID
- `onSuccess: () => void` - Callback when payment method is added successfully

**Usage:**
```tsx
<AddPaymentMethodDialog
  open={isAddCardDialogOpen}
  onOpenChange={setIsAddCardDialogOpen}
  roomId={roomId}
  onSuccess={() => {
    fetchPaymentMethods();
    toast({ title: "Success", description: "Payment method added!" });
  }}
/>
```

## API Endpoints Used

### 1. Create Setup Intent
```
POST /api/v1/connect-rooms/{roomId}/subscription/payment-methods/setup-intent
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Setup intent created successfully",
  "data": {
    "client_secret": "seti_1234567890_secret_abcdefg",
    "setup_intent_id": "seti_1234567890"
  }
}
```

### 2. Get Payment Methods
```
GET /api/v1/connect-rooms/{roomId}/subscription/payment-methods
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment methods retrieved successfully",
  "data": {
    "payment_methods": [
      {
        "id": "pm_1234567890",
        "type": "card",
        "card": {
          "brand": "visa",
          "last4": "4242",
          "exp_month": 12,
          "exp_year": 2026
        },
        "created": "2025-10-25 14:00:00"
      }
    ],
    "customer_id": "cus_1234567890",
    "default_payment_method": "pm_1234567890"
  }
}
```

### 3. Set Default Payment Method
```
POST /api/v1/connect-rooms/{roomId}/subscription/payment-methods/{paymentMethodId}/set-default
Authorization: Bearer {token}
```

## Testing Checklist

- [ ] Environment variable is set with your Stripe publishable key
- [ ] User can click "Add Card" button
- [ ] Dialog opens with card input field
- [ ] User can enter Stripe test card (4242 4242 4242 4242)
- [ ] Card is validated by Stripe
- [ ] Success message appears
- [ ] Dialog closes automatically
- [ ] Payment method appears in the list
- [ ] Can set a card as default
- [ ] Console logs show the full flow (for debugging)
- [ ] Error handling works (try an invalid card)

## Troubleshooting

### Issue: "Stripe has not loaded yet"
**Solution:** Wait a few seconds and try again. Stripe.js is loading asynchronously.

### Issue: Card validation fails immediately
**Solution:** Check that you're using a valid Stripe test card number.

### Issue: Setup intent creation fails
**Solution:** 
- Check that the user has a subscription or the backend allows payment method setup
- Check the console logs for API error details
- Verify the room ID is correct

### Issue: Payment method doesn't appear after adding
**Solution:**
- Check the console logs for errors
- Verify the Stripe webhook is configured (if required by backend)
- Try refreshing the page

## Browser Console Logs

The implementation includes detailed console logging for debugging:

1. "Creating setup intent for room: [roomId]"
2. "Setup intent created: [setup_intent_id]"
3. "Confirming card setup with Stripe..."
4. "Payment method added successfully: [payment_method_id]"
5. "Fetching payment methods for room: [roomId]"
6. "Raw payment methods API response: [response]"
7. "Processed payment methods data: [data]"

## Next Steps

1. **Create a `.env` file** with your Stripe publishable key
2. **Test the flow** using Stripe test cards
3. **Remove console logs** in production (optional)
4. **Set up Stripe webhooks** for production use
5. **Configure production keys** when deploying

## Related Documentation

- Backend API: `src/docs/SUBSCRIPTION_MANAGEMENT_GUIDE.md`
- Stripe Elements: https://stripe.com/docs/stripe-js
- Stripe Setup Intents: https://stripe.com/docs/payments/setup-intents

