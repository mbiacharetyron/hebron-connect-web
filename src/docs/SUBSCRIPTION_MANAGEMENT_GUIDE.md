# Subscription Management - Complete Guide

**Version:** 2.1.0  
**Last Updated:** October 25, 2025

---

## Overview

This guide covers all subscription management features including:
- ✅ Upgrade/Downgrade Plans
- ✅ Switch Billing Cycles (Monthly ↔ Annual)
- ✅ Payment Method Management
- ✅ Pause/Resume Subscriptions  
- ✅ Cancel Subscriptions

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Upgrade/Downgrade Plans](#upgradedowngrade-plans)
3. [Switch Billing Cycles](#switch-billing-cycles)
4. [Payment Method Management](#payment-method-management)
5. [Pause/Resume Subscription](#pauseresume-subscription)
6. [Cancel Subscription](#cancel-subscription)
7. [Code Examples](#code-examples)
8. [Proration Explained](#proration-explained)

---

## Quick Reference

### All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `PUT` | `/connect-rooms/{room}/subscription` | Update plan/billing cycle |
| `POST` | `/connect-rooms/{room}/subscription/pause` | Pause subscription |
| `POST` | `/connect-rooms/{room}/subscription/resume` | Resume subscription |
| `POST` | `/connect-rooms/{room}/subscription/cancel` | Cancel subscription |
| `GET` | `/connect-rooms/{room}/subscription/payment-methods` | List payment methods |
| `POST` | `/connect-rooms/{room}/subscription/payment-methods/setup-intent` | Get setup intent for new card |
| `POST` | `/connect-rooms/{room}/subscription/payment-methods/{pm}/set-default` | Set default payment method |

---

## Upgrade/Downgrade Plans

### Upgrade: Pro → Enterprise

**Request:**
```http
PUT /api/v1/connect-rooms/21/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "new_plan_id": 3,
  "proration_behavior": "create_prorations"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "old_plan": "Pro",
    "new_plan": "Enterprise",
    "old_billing_cycle": "monthly",
    "new_billing_cycle": "monthly",
    "prorated_amount": 10.00,
    "next_billing_date": "2025-11-25 14:00:00",
    "amount": "19.99",
    "currency": "USD"
  }
}
```

**What Happens:**
1. ✅ Immediate upgrade to Enterprise features
2. ✅ Prorated charge for price difference
3. ✅ Unused Pro time credited
4. ✅ Next billing date remains same

---

### Downgrade: Enterprise → Pro

**Request:**
```http
PUT /api/v1/connect-rooms/21/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "new_plan_id": 2,
  "proration_behavior": "none"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "old_plan": "Enterprise",
    "new_plan": "Pro",
    "old_billing_cycle": "annual",
    "new_billing_cycle": "annual",
    "prorated_amount": 0,
    "next_billing_date": "2026-10-25 14:00:00",
    "amount": "19.99",
    "currency": "USD"
  }
}
```

**What Happens:**
1. ✅ Downgrade scheduled for end of period
2. ✅ No immediate charge/credit
3. ✅ Continue using Enterprise until period ends
4. ✅ Then switch to Pro

---

## Switch Billing Cycles

### Monthly → Annual (Save Money!)

**Request:**
```http
PUT /api/v1/connect-rooms/21/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "new_billing_cycle": "annual",
  "proration_behavior": "create_prorations"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "old_plan": "Pro",
    "new_plan": "Pro",
    "old_billing_cycle": "monthly",
    "new_billing_cycle": "annual",
    "prorated_amount": 18.00,
    "next_billing_date": "2026-10-25 14:00:00",
    "amount": "19.99",
    "currency": "USD"
  }
}
```

**Benefits:**
- ✅ Immediate switch to annual pricing
- ✅ Save money with annual discount
- ✅ Unused monthly time credited
- ✅ Next billing in 12 months

---

### Annual → Monthly

**Request:**
```http
PUT /api/v1/connect-rooms/21/subscription
Authorization: Bearer {token}
Content-Type: application/json

{
  "new_billing_cycle": "monthly",
  "proration_behavior": "create_prorations"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription updated successfully",
  "data": {
    "old_plan": "Pro",
    "new_plan": "Pro",
    "old_billing_cycle": "annual",
    "new_billing_cycle": "monthly",
    "prorated_amount": -8.50,
    "next_billing_date": "2025-11-25 14:00:00",
    "amount": "1.99",
    "currency": "USD"
  }
}
```

**What Happens:**
- ✅ Switch to monthly billing
- ✅ Credit for unused annual time
- ✅ Next billing in 1 month

---

## Payment Method Management

### 1. List Payment Methods

**Request:**
```http
GET /api/v1/connect-rooms/21/subscription/payment-methods
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
      },
      {
        "id": "pm_0987654321",
        "type": "card",
        "card": {
          "brand": "mastercard",
          "last4": "5555",
          "exp_month": 8,
          "exp_year": 2027
        },
        "created": "2025-09-15 10:30:00"
      }
    ],
    "customer_id": "cus_1234567890"
  }
}
```

---

### 2. Add New Payment Method

#### Step 1: Get Setup Intent

**Request:**
```http
POST /api/v1/connect-rooms/21/subscription/payment-methods/setup-intent
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

#### Step 2: Use Client Secret with Stripe.js

```javascript
// Frontend: Add payment method using Stripe Elements
const stripe = Stripe('pk_test_your_publishable_key');
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

async function handleSubmit(event) {
  event.preventDefault();
  
  // Get client secret from API
  const response = await fetch('/api/v1/connect-rooms/21/subscription/payment-methods/setup-intent', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  const { data } = await response.json();
  
  // Confirm setup with Stripe
  const { setupIntent, error } = await stripe.confirmCardSetup(data.client_secret, {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'John Doe'
      }
    }
  });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Payment method added:', setupIntent.payment_method);
    // Payment method is now attached to customer
  }
}
```

---

### 3. Set Default Payment Method

**Request:**
```http
POST /api/v1/connect-rooms/21/subscription/payment-methods/pm_1234567890/set-default
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Default payment method set successfully",
  "data": {
    "payment_method_id": "pm_1234567890"
  }
}
```

**Result:**
- ✅ Future renewals use this card
- ✅ All new subscriptions use this card
- ✅ Other cards remain available

---

## Pause/Resume Subscription

### Pause Subscription

**Request:**
```http
POST /api/v1/connect-rooms/21/subscription/pause
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription paused successfully. No charges will occur while paused.",
  "data": {
    "status": "suspended",
    "paused_at": "2025-10-25 14:00:00"
  }
}
```

**What Happens:**
- ✅ Billing stopped immediately
- ✅ No charges while paused
- ✅ Can resume anytime
- ✅ Access may be restricted

**Use Cases:**
- Temporary business closure
- Seasonal businesses
- Taking a break

---

### Resume Subscription

**Request:**
```http
POST /api/v1/connect-rooms/21/subscription/resume
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription resumed successfully. Billing will restart.",
  "data": {
    "status": "active",
    "resumed_at": "2025-11-15 10:30:00",
    "next_billing_date": "2025-12-15 10:30:00"
  }
}
```

**What Happens:**
- ✅ Billing restarts
- ✅ Next charge on next_billing_date
- ✅ Full access restored

---

## Cancel Subscription

**Request:**
```http
POST /api/v1/connect-rooms/21/subscription/cancel
Authorization: Bearer {token}
```

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

**What Happens:**
- ✅ No future charges
- ✅ Access until period ends
- ✅ Can reactivate before period ends
- ✅ After period ends, subscription expires

---

## Code Examples

### React: Subscription Management Component

```tsx
import React, { useState } from 'react';

interface Props {
  roomId: number;
  authToken: string;
  subscription: any;
}

export function SubscriptionManager({ roomId, authToken, subscription }: Props) {
  const [loading, setLoading] = useState(false);

  // Upgrade to Enterprise
  const handleUpgrade = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_plan_id: 3, // Enterprise
          proration_behavior: 'create_prorations'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Upgraded! Prorated amount: $${data.data.prorated_amount}`);
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to upgrade');
    } finally {
      setLoading(false);
    }
  };

  // Switch to Annual
  const handleSwitchToAnnual = async () => {
    if (!confirm('Switch to annual billing? You\'ll save money!')) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_billing_cycle: 'annual',
          proration_behavior: 'create_prorations'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Switched to annual billing!');
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to switch billing cycle');
    } finally {
      setLoading(false);
    }
  };

  // Pause Subscription
  const handlePause = async () => {
    if (!confirm('Pause subscription? Billing will stop.')) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription/pause`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Subscription paused!');
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to pause subscription');
    } finally {
      setLoading(false);
    }
  };

  // Resume Subscription
  const handleResume = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`/api/v1/connect-rooms/${roomId}/subscription/resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Subscription resumed!');
        window.location.reload();
      }
    } catch (error) {
      alert('Failed to resume subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscription-manager">
      <h2>Manage Subscription</h2>
      
      <div className="current-plan">
        <p>Plan: {subscription.plan_name}</p>
        <p>Billing: {subscription.billing_cycle}</p>
        <p>Status: {subscription.status}</p>
      </div>
      
      <div className="actions">
        {subscription.plan_slug === 'pro' && (
          <button onClick={handleUpgrade} disabled={loading}>
            Upgrade to Enterprise
          </button>
        )}
        
        {subscription.billing_cycle === 'monthly' && (
          <button onClick={handleSwitchToAnnual} disabled={loading}>
            Switch to Annual (Save Money!)
          </button>
        )}
        
        {subscription.status === 'active' && (
          <button onClick={handlePause} disabled={loading}>
            Pause Subscription
          </button>
        )}
        
        {subscription.status === 'suspended' && (
          <button onClick={handleResume} disabled={loading}>
            Resume Subscription
          </button>
        )}
      </div>
    </div>
  );
}
```

---

### Payment Method Management Component

```tsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key');

function AddPaymentMethodForm({ roomId, authToken, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    setProcessing(true);
    
    try {
      // Get setup intent
      const response = await fetch(
        `/api/v1/connect-rooms/${roomId}/subscription/payment-methods/setup-intent`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${authToken}` }
        }
      );
      
      const { data } = await response.json();
      
      // Confirm with Stripe
      const cardElement = elements.getElement(CardElement);
      const { setupIntent, error } = await stripe.confirmCardSetup(data.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name' // Get from form
          }
        }
      });
      
      if (error) {
        alert(error.message);
      } else {
        alert('Payment method added successfully!');
        onSuccess();
      }
    } catch (error) {
      alert('Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={processing || !stripe}>
        {processing ? 'Adding...' : 'Add Payment Method'}
      </button>
    </form>
  );
}

export function PaymentMethodManager({ roomId, authToken }: Props) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const response = await fetch(
      `/api/v1/connect-rooms/${roomId}/subscription/payment-methods`,
      {
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      setPaymentMethods(data.data.payment_methods);
    }
  };

  const handleSetDefault = async (paymentMethodId) => {
    const response = await fetch(
      `/api/v1/connect-rooms/${roomId}/subscription/payment-methods/${paymentMethodId}/set-default`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` }
      }
    );
    
    const data = await response.json();
    
    if (data.success) {
      alert('Default payment method updated!');
      fetchPaymentMethods();
    }
  };

  return (
    <div className="payment-methods">
      <h2>Payment Methods</h2>
      
      <div className="payment-methods-list">
        {paymentMethods.map(pm => (
          <div key={pm.id} className="payment-method-card">
            <div>
              <strong>{pm.card.brand.toUpperCase()}</strong> •••• {pm.card.last4}
            </div>
            <div>
              Expires: {pm.card.exp_month}/{pm.card.exp_year}
            </div>
            <button onClick={() => handleSetDefault(pm.id)}>
              Set as Default
            </button>
          </div>
        ))}
      </div>
      
      <button onClick={() => setShowAddForm(!showAddForm)}>
        Add New Card
      </button>
      
      {showAddForm && (
        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            roomId={roomId}
            authToken={authToken}
            onSuccess={() => {
              setShowAddForm(false);
              fetchPaymentMethods();
            }}
          />
        </Elements>
      )}
    </div>
  );
}
```

---

## Proration Explained

### What is Proration?

Proration ensures fair billing when changing plans mid-cycle.

### Proration Behaviors

| Behavior | Description | When to Use |
|----------|-------------|-------------|
| `create_prorations` | Credits unused time, charges for new plan | Most upgrades/downgrades |
| `none` | No immediate charge/credit. Change at renewal | Downgrades |
| `always_invoice` | Immediately invoice proration | Need immediate billing |

### Example: Upgrade from Pro ($1.99/month) to Enterprise ($9.99/month)

**Scenario:**
- Current plan: Pro Monthly ($1.99)
- 15 days into 30-day billing cycle
- Upgrading to: Enterprise Monthly ($9.99)

**Calculation:**
1. Unused Pro time: 15 days × ($1.99 / 30) = **$0.995 credit**
2. New Enterprise charge: 15 days × ($9.99 / 30) = **$4.995**
3. **Prorated amount: $4.995 - $0.995 = $4.00**

**Result:**
- ✅ Charged $4.00 now
- ✅ Next billing in 15 days for full $9.99
- ✅ Immediate Enterprise access

---

## Best Practices

### 1. Always Show Proration Amount

```tsx
const confirmUpgrade = (proratedAmount) => {
  return confirm(
    `Upgrade to Enterprise?\n` +
    `You'll be charged $${proratedAmount.toFixed(2)} now.\n` +
    `Then $9.99 per month.`
  );
};
```

### 2. Explain Savings for Annual

```tsx
const showAnnualSavings = (monthly_price, annual_price) => {
  const monthlyCost = monthly_price * 12;
  const savings = monthlyCost - annual_price;
  const percentage = (savings / monthlyCost * 100).toFixed(0);
  
  return (
    <div>
      <p>Monthly: ${monthly_price}/month (${monthlyCost}/year)</p>
      <p>Annual: ${annual_price}/year</p>
      <strong>Save ${savings} ({percentage}%)</strong>
    </div>
  );
};
```

### 3. Handle Paused State

```tsx
if (subscription.status === 'suspended') {
  return (
    <div className="alert">
      Subscription is paused. Resume to continue using Pro features.
      <button onClick={handleResume}>Resume Now</button>
    </div>
  );
}
```

---

## Summary

### What Users Can Do

| Action | Endpoint | Proration | Immediate Effect |
|--------|----------|-----------|------------------|
| Upgrade | `PUT /subscription` | Yes | ✅ Immediate |
| Downgrade | `PUT /subscription` | Optional | ⏰ At renewal |
| Switch to Annual | `PUT /subscription` | Yes | ✅ Immediate |
| Switch to Monthly | `PUT /subscription` | Yes | ✅ Immediate |
| Add Payment Method | `POST /payment-methods/setup-intent` | No | N/A |
| Set Default Card | `POST /payment-methods/{pm}/set-default` | No | ✅ Next renewal |
| Pause | `POST /subscription/pause` | No | ✅ Immediate |
| Resume | `POST /subscription/resume` | No | ✅ Immediate |
| Cancel | `POST /subscription/cancel` | No | ⏰ At period end |

---

**Version:** 2.1.0  
**Last Updated:** October 25, 2025  
**Full API Documentation:** See `STRIPE_RECURRING_SUBSCRIPTION_API.md`

