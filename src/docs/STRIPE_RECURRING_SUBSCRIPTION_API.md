# Stripe Recurring Subscription API - Complete Guide

**Version:** 2.0.0 (Recurring)  
**Last Updated:** October 25, 2025

---

## 🎉 What's New: Automatic Recurring Subscriptions

The system now supports **automatic recurring billing** through Stripe. When users subscribe, their card will be automatically charged at each billing cycle (monthly or annual).

### Key Changes from v1.0

| Feature | v1.0 (One-Time) | v2.0 (Recurring) |
|---------|-----------------|-------------------|
| Billing Type | One-time payment | Automatic recurring |
| Card Charges | Once only | Auto-charged each cycle |
| Subscription Mode | `payment` | `subscription` |
| Renewals | Manual | Automatic |
| Cancellation | Immediate | End of period |
| Stripe Objects | Checkout Session | Subscription + Customer |

---

## Table of Contents

1. [Overview](#overview)
2. [How It Works](#how-it-works)
3. [API Endpoints](#api-endpoints)
4. [Setup & Configuration](#setup--configuration)
5. [Integration Guide](#integration-guide)
6. [Webhook Events](#webhook-events)
7. [Code Examples](#code-examples)
8. [Subscription Management](#subscription-management)
9. [Testing](#testing)
10. [Migration from v1.0](#migration-from-v10)

---

## Overview

### Automatic Recurring Billing Flow

```
1. User subscribes to Pro/Enterprise plan
2. Stripe creates Customer + Subscription
3. Initial payment charged
4. Webhook creates RoomSubscription record
5. User's card automatically charged monthly/annually
6. Webhook updates subscription on renewals
7. Subscription continues until cancelled
```

### Key Features

- ✅ **Automatic Renewal** - Cards charged automatically each cycle
- ✅ **Stripe Prices** - Reusable price objects for consistency
- ✅ **Customer Management** - Stripe customer records for each user
- ✅ **Subscription Tracking** - Full lifecycle management
- ✅ **Failed Payment Handling** - Automatic retry logic
- ✅ **Cancellation Support** - Cancel anytime, active until period end
- ✅ **Promo Codes** - Support for Stripe promotion codes
- ✅ **Multi-Currency** - Automatic currency conversion

---

## How It Works

### 1. Subscription Creation

```
POST /connect-rooms/{room}/subscribe
{
  "plan_id": 2,
  "billing_cycle": "monthly"
}
                ↓
     Creates Stripe Checkout Session
          (mode: subscription)
                ↓
     User redirected to Stripe checkout
                ↓
        User completes payment
                ↓
    Stripe creates Customer + Subscription
```

### 2. Webhook Processing

```
Event: customer.subscription.created
                ↓
    Creates RoomSubscription record
         - stripe_subscription_id
         - stripe_customer_id
         - auto_renew = true
         - next_billing_date
                ↓
    Clears room grace period flags
                ↓
       Subscription is now ACTIVE
```

### 3. Automatic Renewals

```
    Billing date arrives
                ↓
Event: invoice.payment_succeeded
                ↓
    Updates RoomSubscription
         - amount_paid
         - next_billing_date
         - expires_at
                ↓
    Subscription renewed automatically
```

### 4. Cancellation

```
POST /connect-rooms/{room}/subscription/cancel
                ↓
    Cancels Stripe subscription
    (cancel_at_period_end = true)
                ↓
Event: customer.subscription.updated
                ↓
    Updates RoomSubscription
         - auto_renew = false
         - cancelled_at = now()
                ↓
    Remains active until period end
```

---

## API Endpoints

### Base URL
```
https://api.hebronconnect.com/api/v1
```

### 1. Create Recurring Subscription

**Endpoint:** `POST /connect-rooms/{room}/subscribe`

**Authentication:** Required (Bearer token)

**Request:**
```json
{
  "plan_id": 2,
  "billing_cycle": "annual",
  "success_url": "https://app.hebronconnect.com/subscription/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://app.hebronconnect.com/subscription/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stripe checkout session created successfully",
  "data": {
    "session_id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
    "session_url": "https://checkout.stripe.com/c/pay/cs_test_...",
    "expires_at": "2025-10-25 15:30:00",
    "plan_name": "Hebron Connect Pro Plan - Annual Subscription",
    "billing_cycle": "annual",
    "amount": "1.99",
    "currency": "USD"
  }
}
```

**What Happens:**
- ✅ Stripe Price created/reused for this plan + billing cycle
- ✅ Checkout session created in **subscription mode**
- ✅ User redirected to Stripe hosted checkout
- ✅ After payment, subscription automatically created

---

### 2. Get Active Subscription

**Endpoint:** `GET /connect-rooms/{room}/subscription`

**Response:**
```json
{
  "success": true,
  "message": "Subscription retrieved successfully",
  "data": {
    "id": 1,
    "plan_name": "Pro",
    "plan_slug": "pro",
    "status": "active",
    "auto_renew": true,
    "starts_at": "2025-10-25 14:00:00",
    "expires_at": "2026-10-25 14:00:00",
    "next_billing_date": "2026-10-25 14:00:00",
    "days_remaining": 365,
    "amount_paid": "19.99 USD",
    "payment_method": "stripe",
    "subscribed_by": {
      "id": 42,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**New Fields:**
- `auto_renew`: Whether subscription will auto-renew
- `next_billing_date`: When next charge occurs

---

### 3. Cancel Subscription

**Endpoint:** `POST /connect-rooms/{room}/subscription/cancel`

**Authentication:** Required (Bearer token)

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully. It will remain active until 2026-10-25 14:00:00",
  "data": {
    "cancelled_at": "2025-11-15 10:30:00",
    "remains_active_until": "2026-10-25 14:00:00",
    "auto_renew": false
  }
}
```

**Behavior:**
- ✅ Subscription cancelled in Stripe
- ✅ Remains active until end of current period
- ✅ No further charges
- ✅ User can still access Pro features until expiration

---

## Setup & Configuration

### 1. Environment Variables

```env
# Stripe API Keys
STRIPE_KEY=pk_test_your_publishable_key
STRIPE_SECRET=sk_test_your_secret_key

# Stripe Webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_WEBHOOK_TOLERANCE=300
```

### 2. Database Migration

Run the migration to add recurring subscription fields:

```bash
php artisan migrate
```

This adds:
- `stripe_subscription_id` - Stripe subscription ID
- `stripe_customer_id` - Stripe customer ID
- `next_billing_date` - Next charge date
- `auto_renew` - Auto-renewal flag

### 3. Stripe Webhook Configuration

**Required Webhook Events:**

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | Detects successful checkout |
| `customer.subscription.created` | Creates subscription record |
| `customer.subscription.updated` | Updates subscription (renewals, changes) |
| `customer.subscription.deleted` | Marks subscription as cancelled |
| `invoice.payment_succeeded` | Records successful renewal payment |
| `invoice.payment_failed` | Handles failed payments |

**Setup Steps:**

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://api.hebronconnect.com/api/v1/stripe/webhook`
3. Select ALL events listed above
4. Copy webhook signing secret to `.env`

---

## Integration Guide

### Frontend Integration

```typescript
// 1. Create checkout session
async function subscribeToRoom(roomId: number, planId: number, billingCycle: 'monthly' | 'annual') {
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
  }
}

// 2. Handle success redirect
async function handleSubscriptionSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');
  
  // Poll for subscription (webhook might take a few seconds)
  const subscription = await pollForSubscription(roomId, 30000);
  
  if (subscription && subscription.status === 'active') {
    showSuccessMessage('Subscription activated! Your card will be charged automatically each ' + subscription.billing_cycle);
  }
}

// 3. Display subscription status
async function showSubscriptionStatus(roomId: number) {
  const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    const sub = data.data;
    console.log(`Plan: ${sub.plan_name}`);
    console.log(`Status: ${sub.status}`);
    console.log(`Auto-renew: ${sub.auto_renew}`);
    console.log(`Next billing: ${sub.next_billing_date}`);
    console.log(`Amount: ${sub.amount_paid}`);
  }
}

// 4. Cancel subscription
async function cancelSubscription(roomId: number) {
  if (!confirm('Cancel subscription? You\'ll retain access until the end of your billing period.')) {
    return;
  }
  
  const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription/cancel`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const data = await response.json();
  
  if (data.success) {
    showMessage(`Subscription cancelled. Active until ${data.data.remains_active_until}`);
  }
}
```

---

## Webhook Events

### Event: `customer.subscription.created`

**When:** After successful checkout payment

**Action:** Creates `RoomSubscription` record

**Payload:**
```json
{
  "id": "sub_1234567890",
  "customer": "cus_1234567890",
  "status": "active",
  "current_period_start": 1730000000,
  "current_period_end": 1761536000,
  "metadata": {
    "room_id": "21",
    "plan_id": "2",
    "billing_cycle": "annual",
    "subscribed_by": "42"
  }
}
```

**Processing:**
```php
// Creates RoomSubscription
$subscription = new RoomSubscription();
$subscription->stripe_subscription_id = $stripeSubscription->id;
$subscription->stripe_customer_id = $stripeSubscription->customer;
$subscription->auto_renew = true;
$subscription->status = 'active';
// ... saves record
```

---

### Event: `customer.subscription.updated`

**When:** Subscription changes (renewal, modification, cancellation scheduled)

**Action:** Updates `RoomSubscription` details

**Common Updates:**
- Renewal: New `current_period_end`
- Cancellation scheduled: `cancel_at_period_end = true`
- Plan change: New `plan_id`

---

### Event: `customer.subscription.deleted`

**When:** Subscription immediately cancelled or expired

**Action:** Marks `RoomSubscription` as cancelled

---

### Event: `invoice.payment_succeeded`

**When:** Successful renewal payment

**Action:** Records payment and extends subscription

```php
$roomSubscription->amount_paid = $invoice->amount_paid;
$roomSubscription->status = 'active';
$roomSubscription->save();
```

---

### Event: `invoice.payment_failed`

**When:** Renewal payment fails

**Action:** Logs failure (Stripe auto-retries)

**Note:** Stripe will retry failed payments automatically. After all retries fail, the subscription is cancelled.

---

## Code Examples

### React Subscription Component

```tsx
import React, { useState, useEffect } from 'react';

interface Subscription {
  id: number;
  plan_name: string;
  status: string;
  auto_renew: boolean;
  next_billing_date: string;
  amount_paid: string;
  expires_at: string;
}

export function SubscriptionManager({ roomId, authToken }: Props) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [roomId]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription', error);
    }
  };

  const handleSubscribe = async (planId: number, billingCycle: 'monthly' | 'annual') => {
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
      alert('Failed to initiate subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel your subscription? You\'ll retain access until the end of your billing period.')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchSubscription(); // Refresh
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!subscription) {
    return (
      <div>
        <h2>No Active Subscription</h2>
        <button onClick={() => handleSubscribe(2, 'annual')} disabled={loading}>
          Subscribe to Pro (Annual)
        </button>
      </div>
    );
  }

  return (
    <div className="subscription-card">
      <h2>Current Subscription</h2>
      <p>Plan: {subscription.plan_name}</p>
      <p>Status: {subscription.status}</p>
      <p>Amount: {subscription.amount_paid}</p>
      <p>Auto-renew: {subscription.auto_renew ? 'Yes' : 'No'}</p>
      {subscription.auto_renew && (
        <p>Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}</p>
      )}
      
      {subscription.auto_renew && (
        <button onClick={handleCancel} disabled={loading}>
          Cancel Subscription
        </button>
      )}
    </div>
  );
}
```

---

## Subscription Management

### Subscription Lifecycle States

| Status | Description | Auto-Renew | Can Access Features |
|--------|-------------|------------|---------------------|
| `active` | Currently active | ✅ Yes | ✅ Yes |
| `suspended` | Payment past due | ⚠️ Paused | ❌ No |
| `expired` | Period ended, not renewed | ❌ No | ❌ No |
| `cancelled` | User cancelled | ❌ No | ✅ Until period end |

### Common Scenarios

#### 1. Normal Monthly Renewal

```
Day 0: User subscribes (monthly)
Day 30: invoice.payment_succeeded → Charged $1.99
Day 60: invoice.payment_succeeded → Charged $1.99
Day 90: invoice.payment_succeeded → Charged $1.99
... continues automatically ...
```

#### 2. User Cancels

```
Day 0: User subscribes (annual)
Day 100: User clicks "Cancel"
         → Stripe subscription cancelled (at period end)
         → auto_renew = false
         → Still active until Day 365
Day 365: Subscription expires, no charge
```

#### 3. Failed Payment

```
Day 30: Renewal attempted → Payment fails
Day 31: Stripe auto-retries → Payment fails
Day 33: Stripe auto-retries → Payment fails
Day 37: Stripe auto-retries → Payment fails
Day 37: Subscription cancelled by Stripe
        → customer.subscription.deleted
        → Status = 'cancelled'
```

---

## Testing

### Test with Stripe Test Mode

#### 1. Test Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Declined |
| `4000 0027 6000 3184` | Requires authentication (3D Secure) |

#### 2. Test Subscription Flow

```bash
# 1. Create subscription
curl -X POST https://api.hebronconnect.com/api/v1/connect-rooms/21/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": 2,
    "billing_cycle": "monthly",
    "success_url": "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url": "http://localhost:3000/cancel"
  }'

# 2. Complete payment on Stripe checkout

# 3. Verify subscription created
curl https://api.hebronconnect.com/api/v1/connect-rooms/21/subscription \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Cancel subscription
curl -X POST https://api.hebronconnect.com/api/v1/connect-rooms/21/subscription/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### 3. Test Webhooks Locally

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Listen for webhooks
stripe listen --forward-to localhost/api/v1/stripe/webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

#### 4. Test Clock (Skip Time)

Use Stripe's test clock feature to simulate subscription renewals:

1. Go to Stripe Dashboard → Developers → Test clocks
2. Create test clock
3. Advance time to trigger renewals
4. Verify invoices and subscription updates

---

## Migration from v1.0

If you have existing one-time subscriptions, they will continue to work but won't auto-renew. New subscriptions will automatically be recurring.

### Differences

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| Checkout Mode | `payment` | `subscription` |
| Stripe Object | Session only | Session + Subscription + Customer |
| Database Fields | `payment_reference` | `stripe_subscription_id`, `stripe_customer_id`, `auto_renew` |
| Renewal | Manual | Automatic |
| Cancellation | Immediate | At period end |

### For Existing Users

- Old subscriptions: Work as before, manual renewal required
- New subscriptions: Automatically recurring
- Both types supported simultaneously

---

## Troubleshooting

### Issue: Subscription not created after payment

**Check:**
1. Webhook endpoint configured in Stripe
2. Webhook secret in `.env` is correct
3. Check `storage/logs/laravel.log` for webhook errors
4. Verify `customer.subscription.created` event is enabled

**Solution:**
```bash
# View recent webhook attempts
stripe webhooks list --limit 5

# View specific event
stripe events retrieve evt_xxx
```

---

### Issue: Payment succeeds but subscription shows as pending

**Cause:** Webhook delay or failure

**Solution:**
- Wait 30-60 seconds for webhook processing
- Check webhook logs in Stripe Dashboard
- Manually trigger webhook:
  ```bash
  stripe events resend evt_xxx
  ```

---

### Issue: Card declined on renewal

**Behavior:** Stripe automatically retries failed payments

**Timeline:**
- Day 0: First attempt (failed)
- Day 1: Retry 1
- Day 3: Retry 2
- Day 5: Retry 3
- Day 7: Subscription cancelled

**User Action:** Update payment method in Stripe Customer Portal

---

## Summary

### ✅ What You Get

- **Automatic Billing:** Set it and forget it
- **Customer Management:** Stripe handles all payment details
- **Failed Payment Handling:** Automatic retries
- **Flexible Cancellation:** Cancel anytime, keep access until period end
- **Comprehensive Webhooks:** Full lifecycle tracking
- **Multi-Currency Support:** Works with all currencies
- **Promo Codes:** Built-in support for discounts

### 📊 Monitoring

**Key Metrics to Track:**
- Active subscriptions count
- Monthly recurring revenue (MRR)
- Churn rate
- Failed payment rate
- Cancellation reasons

**Stripe Dashboard:**
- View all subscriptions
- Track revenue
- Monitor failed payments
- Manage customers

---

## Support

**Logs:** `storage/logs/laravel.log`

**Stripe Dashboard:** https://dashboard.stripe.com

**Test Webhooks:** Use Stripe CLI

**Documentation:** This file

---

**Version:** 2.0.0 (Recurring Subscriptions)  
**Last Updated:** October 25, 2025  
**Next Review:** When adding new subscription features

