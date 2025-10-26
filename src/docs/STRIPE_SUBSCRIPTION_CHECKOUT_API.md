# Stripe Subscription Checkout API - Documentation

**Version:** 1.0.0  
**Last Updated:** October 24, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Setup & Configuration](#setup--configuration)
4. [Integration Flow](#integration-flow)
5. [Code Examples](#code-examples)
6. [Webhook Handling](#webhook-handling)
7. [Testing](#testing)
8. [Error Handling](#error-handling)

---

## Overview

The Stripe Subscription Checkout API allows Connect Room owners or admins to subscribe their rooms to Pro or Enterprise plans using Stripe as the payment gateway.

### Key Features

- ✅ **Stripe Checkout Integration** - Secure hosted checkout page
- ✅ **Owner/Admin Authorization** - Only owners or admins can subscribe
- ✅ **Monthly & Annual Billing** - Flexible billing cycles
- ✅ **Currency Support** - Multiple currency support with conversion
- ✅ **Automatic Subscription Management** - Auto-creation on successful payment
- ✅ **Grace Period Management** - Clears grace period locks on subscription
- ✅ **Webhook Integration** - Automatic subscription activation

### Workflow

```
1. Room owner/admin initiates subscription
2. API creates Stripe checkout session
3. User redirected to Stripe hosted checkout
4. User completes payment
5. Stripe webhook notifies backend
6. System creates active subscription
7. Room grace period/locks cleared
8. User redirected to success URL
```

---

## API Endpoints

### Base URL
```
https://api.hebronconnect.com/api/v1
```

### 1. Create Subscription Checkout Session

**Endpoint:** `POST /connect-rooms/{room}/subscribe`

**Authentication:** Required (Bearer token)

**Authorization:** Room owner or admin only

**Request Body:**
```json
{
  "plan_id": 2,
  "billing_cycle": "annual",
  "success_url": "https://app.hebronconnect.com/subscription/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://app.hebronconnect.com/subscription/cancel"
}
```

**Request Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `plan_id` | integer | Yes | Subscription plan ID (Pro or Enterprise, not Basic) |
| `billing_cycle` | string | Yes | `monthly` or `annual` |
| `success_url` | string (URL) | Yes | Redirect URL after successful payment. Include `{CHECKOUT_SESSION_ID}` placeholder |
| `cancel_url` | string (URL) | Yes | Redirect URL if payment is cancelled |

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Stripe checkout session created successfully",
  "data": {
    "session_id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "session_url": "https://checkout.stripe.com/c/pay/cs_test_a1b2c3d4e5f6g7h8i9j0",
    "expires_at": "2025-10-24 15:30:00",
    "plan_name": "Pro",
    "billing_cycle": "annual",
    "amount": "50000.00",
    "currency": "XAF"
  }
}
```

**Error Responses:**

```json
// 400 - Room already has active subscription
{
  "success": false,
  "message": "Room already has an active subscription",
  "data": {
    "current_subscription": {
      "plan_name": "Pro",
      "expires_at": "2026-10-24 14:00:00",
      "days_remaining": 365
    }
  }
}

// 400 - Cannot subscribe to Basic plan
{
  "success": false,
  "message": "Cannot create checkout for Basic (free) plan"
}

// 403 - Not owner or admin
{
  "success": false,
  "message": "Only room owners or admins can subscribe"
}

// 404 - Room not found
{
  "success": false,
  "message": "Connect room not found"
}
```

---

### 2. Get Room Subscription

**Endpoint:** `GET /connect-rooms/{room}/subscription`

**Authentication:** Required (Bearer token)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "id": 1,
    "plan_name": "Pro",
    "plan_slug": "pro",
    "status": "active",
    "starts_at": "2025-10-24 14:00:00",
    "expires_at": "2026-10-24 14:00:00",
    "days_remaining": 365,
    "amount_paid": "50,000.00 XAF",
    "payment_method": "stripe",
    "subscribed_by": {
      "id": 42,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "No active subscription found for this room"
}
```

---

## Setup & Configuration

### 1. Environment Variables

Add these to your `.env` file:

```env
# Stripe Keys
STRIPE_KEY=pk_test_your_publishable_key
STRIPE_SECRET=sk_test_your_secret_key

# Stripe Webhook
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_WEBHOOK_TOLERANCE=300
```

### 2. Stripe Webhook Setup

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.hebronconnect.com/api/v1/stripe/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook signing secret to `.env`

### 3. Database Migration

Run the migration (already exists):

```bash
php artisan migrate
```

This creates the `room_subscriptions` table with fields:
- `id`, `connect_room_id`, `subscription_plan_id`, `subscribed_by`
- `status`, `starts_at`, `expires_at`, `cancelled_at`
- `amount_paid`, `currency`, `payment_method`, `payment_reference`
- `metadata`, `timestamps`

---

## Integration Flow

### Step 1: Create Checkout Session

```typescript
// Frontend: Initiate subscription
async function subscribeRoom(roomId: number, planId: number, billingCycle: string) {
  const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      plan_id: planId,
      billing_cycle: billingCycle,
      success_url: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/subscription/cancel`
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Redirect to Stripe checkout
    window.location.href = data.data.session_url;
  } else {
    console.error('Failed to create checkout:', data.message);
  }
}
```

### Step 2: Handle Success Redirect

```typescript
// Success page handler
async function handleSubscriptionSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  if (!sessionId) {
    console.error('No session ID provided');
    return;
  }
  
  // Poll for subscription activation (webhook might be delayed)
  const subscription = await pollForSubscription(roomId, 30000); // 30 seconds
  
  if (subscription) {
    showSuccessMessage('Subscription activated!');
  } else {
    showWarningMessage('Payment received. Subscription will be activated shortly.');
  }
}

async function pollForSubscription(roomId: number, timeout: number) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      
      if (data.success && data.data.status === 'active') {
        return data.data;
      }
    } catch (error) {
      console.error('Error polling subscription:', error);
    }
    
    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  return null;
}
```

### Step 3: Webhook Processes Payment

The webhook automatically:
1. Receives `checkout.session.completed` event
2. Validates payment status
3. Creates `RoomSubscription` record
4. Sets subscription start and end dates
5. Clears room grace period flags
6. Unlocks financial features

---

## Code Examples

### React Component

```tsx
import React, { useState } from 'react';
import { SubscriptionPlan } from './types';

interface Props {
  roomId: number;
  plans: SubscriptionPlan[];
  authToken: string;
}

export function SubscriptionUpgrade({ roomId, plans, authToken }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId: number) => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          success_url: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/subscription/cancel`
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.session_url;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to initiate subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-upgrade">
      <div className="billing-toggle">
        <button 
          className={billingCycle === 'monthly' ? 'active' : ''}
          onClick={() => setBillingCycle('monthly')}
        >
          Monthly
        </button>
        <button 
          className={billingCycle === 'annual' ? 'active' : ''}
          onClick={() => setBillingCycle('annual')}
        >
          Annual
        </button>
      </div>
      
      <div className="plans-grid">
        {plans.filter(p => p.slug !== 'basic').map(plan => {
          const price = billingCycle === 'monthly' 
            ? plan.monthly_price 
            : plan.annual_price;
          
          return (
            <div key={plan.id} className="plan-card">
              <h3>{plan.name}</h3>
              <div className="price">
                {plan.formatted_monthly_price}
                {billingCycle === 'annual' && (
                  <span className="savings">
                    Save {plan.annual_savings_percentage}%
                  </span>
                )}
              </div>
              <ul className="features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className="subscribe-btn"
              >
                {loading ? 'Loading...' : 'Subscribe'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### React Native

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { WebView } from 'react-native-webview';

export function SubscriptionScreen({ route }) {
  const { roomId, authToken } = route.params;
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const initiateSubscription = async (planId, billingCycle) => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.hebronconnect.com/api/v1/connect-rooms/${roomId}/subscribe`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            plan_id: planId,
            billing_cycle: billingCycle,
            success_url: 'hebronconnect://subscription/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'hebronconnect://subscription/cancel'
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        setCheckoutUrl(data.data.session_url);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to initiate subscription');
    } finally {
      setLoading(false);
    }
  };

  if (checkoutUrl) {
    return (
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={(navState) => {
          // Handle success/cancel redirects
          if (navState.url.includes('subscription/success')) {
            const sessionId = new URL(navState.url).searchParams.get('session_id');
            handleSubscriptionSuccess(sessionId);
          } else if (navState.url.includes('subscription/cancel')) {
            setCheckoutUrl(null);
          }
        }}
      />
    );
  }

  return (
    <View>
      {/* Render subscription plans */}
      <TouchableOpacity
        onPress={() => initiateSubscription(2, 'annual')}
        disabled={loading}
      >
        <Text>Subscribe to Pro (Annual)</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Webhook Handling

### Event: `checkout.session.completed`

**Webhook URL:** `POST /api/v1/stripe/webhook`

**Event Payload:**
```json
{
  "id": "evt_1234567890",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1b2c3d4e5f6",
      "payment_status": "paid",
      "customer_details": {
        "email": "user@example.com"
      },
      "amount_total": 50000,
      "currency": "xaf",
      "metadata": {
        "room_id": "21",
        "plan_id": "2",
        "billing_cycle": "annual",
        "subscribed_by": "42"
      }
    }
  }
}
```

**Processing Steps:**

1. **Verify Signature**
   ```php
   $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
   ```

2. **Check Payment Status**
   ```php
   if ($session->payment_status !== 'paid') {
       return; // Ignore unpaid sessions
   }
   ```

3. **Validate Subscription Metadata**
   ```php
   if (!isset($metadata->room_id) || !isset($metadata->plan_id)) {
       return; // Not a subscription checkout
   }
   ```

4. **Create Subscription Record**
   ```php
   $subscription = new RoomSubscription();
   $subscription->connect_room_id = $metadata->room_id;
   $subscription->subscription_plan_id = $metadata->plan_id;
   $subscription->status = 'active';
   $subscription->starts_at = now();
   $subscription->expires_at = $billingCycle === 'monthly' 
       ? now()->addMonth() 
       : now()->addYear();
   $subscription->save();
   ```

5. **Clear Room Grace Period**
   ```php
   $room->grace_period_active = false;
   $room->financial_features_locked = false;
   $room->save();
   ```

**Webhook Logs:**

Check `storage/logs/laravel.log` for:
```
[INFO] Stripe webhook received { event_type: checkout.session.completed }
[INFO] Processing checkout session completed { session_id: cs_test_... }
[INFO] Room subscription created successfully { subscription_id: 1, room_id: 21 }
[INFO] Room grace period and locks cleared { room_id: 21 }
```

---

## Testing

### Manual Testing with Stripe Test Mode

1. **Use Test API Keys**
   ```env
   STRIPE_KEY=pk_test_...
   STRIPE_SECRET=sk_test_...
   ```

2. **Test Card Numbers**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Authentication Required: `4000 0027 6000 3184`

3. **Test Workflow**
   ```bash
   # 1. Create checkout session
   curl -X POST http://localhost/api/v1/connect-rooms/21/subscribe \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "plan_id": 2,
       "billing_cycle": "annual",
       "success_url": "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
       "cancel_url": "http://localhost:3000/cancel"
     }'
   
   # 2. Open session_url in browser
   # 3. Complete payment with test card
   # 4. Verify subscription created
   curl http://localhost/api/v1/connect-rooms/21/subscription \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Test Webhook Locally

Use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost/api/v1/stripe/webhook

# Trigger test event
stripe trigger checkout.session.completed
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | User is not owner/admin | Check user permissions |
| 400 Active Subscription | Room already subscribed | Cancel existing subscription first |
| 400 Basic Plan | Trying to checkout Basic plan | Only Pro/Enterprise allowed |
| 404 Room Not Found | Invalid room ID | Verify room exists |
| 500 Stripe Error | Stripe API failure | Check API keys and logs |

### Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

### Handling Failed Webhooks

If webhook fails:
1. Stripe will retry automatically (up to 3 days)
2. Check webhook logs in Stripe Dashboard
3. Manually verify subscription in database
4. Create subscription manually if needed

---

## Security Considerations

### 1. Authentication
- ✅ All endpoints require valid bearer token
- ✅ Only room owners/admins can subscribe

### 2. Webhook Verification
- ✅ Signature verification prevents spoofing
- ✅ Idempotency prevents duplicate subscriptions

### 3. Payment Security
- ✅ Stripe handles all sensitive payment data
- ✅ No card details touch your server
- ✅ PCI compliance handled by Stripe

### 4. Data Validation
- ✅ Plan and room existence validated
- ✅ Metadata checked before processing
- ✅ Transaction wrapped in database transaction

---

## Summary

### Implementation Checklist

- [x] Database migration (`room_subscriptions` table)
- [x] RoomSubscription model with relationships
- [x] StripeService subscription methods
- [x] RoomSubscriptionController with checkout API
- [x] Webhook handler for `checkout.session.completed`
- [x] API routes protected with authentication
- [x] Comprehensive error handling
- [x] Logging for monitoring
- [x] Documentation complete

### API Endpoints

- ✅ `POST /connect-rooms/{room}/subscribe` - Create checkout session
- ✅ `GET /connect-rooms/{room}/subscription` - Get active subscription
- ✅ `POST /stripe/webhook` - Handle Stripe webhooks

### Features

- ✅ Stripe Checkout integration
- ✅ Monthly & Annual billing
- ✅ Automatic subscription creation
- ✅ Grace period management
- ✅ Multi-currency support
- ✅ Comprehensive logging

---

**For Support:**  
Check logs in `storage/logs/laravel.log`  
Test webhooks with Stripe CLI  
Contact: Backend Development Team

**Version:** 1.0.0  
**Last Updated:** October 24, 2025

