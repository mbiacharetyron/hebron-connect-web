# Subscription Plans API Documentation

## Overview

The Subscription Plans API provides public access to retrieve connect room subscription plans. These endpoints are **publicly accessible** and do not require authentication, allowing unauthenticated users to view available subscription options before signing up.

## Base URL

```
https://api.hebronconnect.com/api/v1
```

## Authentication

**No authentication required** - All subscription plans endpoints are publicly accessible.

## Endpoints

### 1. Get All Active Subscription Plans

Retrieve all active subscription plans with full details.

**Endpoint:** `GET /subscription-plans`

**Authentication:** Not required

**Request:**
```http
GET /api/v1/subscription-plans
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription plans retrieved successfully",
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "Pro Plan",
        "slug": "pro-plan",
        "description": "Professional plan with advanced features for growing communities",
        "price": "9999.00",
        "formatted_price": "9,999.00 XAF",
        "currency": "XAF",
        "billing_cycle_days": 30,
        "billing_cycle": "Monthly",
        "features": [
          "Unlimited contributions",
          "Advanced analytics",
          "Priority support",
          "Custom branding",
          "Export data"
        ],
        "max_members_per_room": 100,
        "is_popular": true,
        "allows_unlimited_members": false,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
      },
      {
        "id": 2,
        "name": "Enterprise Plan",
        "slug": "enterprise-plan",
        "description": "Enterprise plan with unlimited everything",
        "price": "49999.00",
        "formatted_price": "49,999.00 XAF",
        "currency": "XAF",
        "billing_cycle_days": 30,
        "billing_cycle": "Monthly",
        "features": [
          "Unlimited rooms",
          "Unlimited members",
          "Advanced analytics",
          "24/7 Priority support",
          "Custom branding",
          "API access",
          "Dedicated account manager"
        ],
        "max_members_per_room": null,
        "is_popular": false,
        "allows_unlimited_members": true,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
      }
    ]
  }
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to retrieve subscription plans"
}
```

---

### 2. Get Specific Subscription Plan by ID

Retrieve details of a specific subscription plan.

**Endpoint:** `GET /subscription-plans/{id}`

**Authentication:** Not required

**Path Parameters:**
- `id` (integer, required) - The subscription plan ID

**Request:**
```http
GET /api/v1/subscription-plans/1
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription plan retrieved successfully",
  "data": {
    "plan": {
      "id": 1,
      "name": "Pro Plan",
      "slug": "pro-plan",
      "description": "Professional plan with advanced features for growing communities",
      "price": "9999.00",
      "formatted_price": "9,999.00 XAF",
      "currency": "XAF",
      "billing_cycle_days": 30,
      "billing_cycle": "Monthly",
      "features": [
        "Unlimited contributions",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
        "Export data"
      ],
      "max_members_per_room": 100,
      "is_popular": true,
      "allows_unlimited_members": false,
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Subscription plan not found"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to retrieve subscription plan"
}
```

---

### 3. Get Subscription Plan by Slug

Retrieve a subscription plan using its slug identifier.

**Endpoint:** `GET /subscription-plans/slug/{slug}`

**Authentication:** Not required

**Path Parameters:**
- `slug` (string, required) - The subscription plan slug (e.g., "pro-plan")

**Request:**
```http
GET /api/v1/subscription-plans/slug/pro-plan
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Subscription plan retrieved successfully",
  "data": {
    "plan": {
      "id": 1,
      "name": "Pro Plan",
      "slug": "pro-plan",
      "description": "Professional plan with advanced features",
      "price": "9999.00",
      "formatted_price": "9,999.00 XAF",
      "currency": "XAF",
      "billing_cycle_days": 30,
      "billing_cycle": "Monthly",
      "features": [
        "Unlimited contributions",
        "Advanced analytics"
      ],
      "max_members_per_room": 100,
      "is_popular": true,
      "allows_unlimited_members": false,
      "created_at": "2024-01-01T00:00:00.000000Z",
      "updated_at": "2024-01-01T00:00:00.000000Z"
    }
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Subscription plan not found"
}
```

---

### 4. Get Popular Subscription Plans

Retrieve only the popular/featured subscription plans.

**Endpoint:** `GET /subscription-plans/popular`

**Authentication:** Not required

**Request:**
```http
GET /api/v1/subscription-plans/popular
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Popular subscription plans retrieved successfully",
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "Pro Plan",
        "slug": "pro-plan",
        "description": "Professional plan with advanced features",
        "price": "9999.00",
        "formatted_price": "9,999.00 XAF",
        "currency": "XAF",
        "billing_cycle_days": 30,
        "billing_cycle": "Monthly",
        "features": [
          "Unlimited contributions",
          "Advanced analytics"
        ],
        "max_members_per_room": 100,
        "is_popular": true,
        "allows_unlimited_members": false,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z"
      }
    ]
  }
}
```

---

## Data Models

### Subscription Plan Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique identifier for the plan |
| `name` | string | Plan name |
| `slug` | string | URL-friendly identifier |
| `description` | string | Detailed plan description |
| `price` | string | Plan price (decimal format) |
| `formatted_price` | string | Formatted price with currency |
| `currency` | string | Currency code (e.g., XAF, USD) |
| `billing_cycle_days` | integer | Number of days in billing cycle |
| `billing_cycle` | string | Human-readable billing cycle (e.g., "Monthly") |
| `features` | array | List of plan features |
| `max_members_per_room` | integer\|null | Maximum members per room (null = unlimited) |
| `is_popular` | boolean | Whether plan is marked as popular |
| `allows_unlimited_members` | boolean | Computed: true if max_members_per_room is null |
| `created_at` | timestamp | Plan creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

### Billing Cycle Values

| Days | Display Value |
|------|---------------|
| 7 | Weekly |
| 30 | Monthly |
| 365 | Yearly |
| Other | `{days} days` |

## Use Cases

### 1. Display Pricing Page
```javascript
// Fetch all plans for pricing page
fetch('https://api.hebronconnect.com/api/v1/subscription-plans')
  .then(response => response.json())
  .then(data => {
    const plans = data.data.plans;
    // Display plans to user
  });
```

### 2. Show Popular Plans
```javascript
// Fetch only popular plans for homepage
fetch('https://api.hebronconnect.com/api/v1/subscription-plans/popular')
  .then(response => response.json())
  .then(data => {
    const popularPlans = data.data.plans;
    // Display featured plans
  });
```

### 3. Plan Details Page
```javascript
// Fetch specific plan by slug
fetch('https://api.hebronconnect.com/api/v1/subscription-plans/slug/pro-plan')
  .then(response => response.json())
  .then(data => {
    const plan = data.data.plan;
    // Display plan details
  });
```

## Error Handling

### Common Error Responses

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 404 | Plan not found |
| 500 | Server error |

### Error Response Format
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Best Practices

### 1. Caching
- Cache subscription plans on the client side
- Update cache periodically (e.g., every hour)
- Plans don't change frequently

### 2. Error Handling
```javascript
async function getSubscriptionPlans() {
  try {
    const response = await fetch('/api/v1/subscription-plans');
    
    if (!response.ok) {
      throw new Error('Failed to fetch plans');
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message);
    }
    
    return data.data.plans;
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}
```

### 3. Display Formatting
```javascript
function displayPlan(plan) {
  return {
    title: plan.name,
    price: plan.formatted_price,
    period: plan.billing_cycle,
    features: plan.features,
    badge: plan.is_popular ? 'Popular' : null,
    limits: {
      members: plan.allows_unlimited_members ? 'Unlimited' : plan.max_members_per_room
    }
  };
}
```

## Integration Examples

### React/React Native
```jsx
import React, { useState, useEffect } from 'react';

function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.hebronconnect.com/api/v1/subscription-plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data.data.plans);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {plans.map(plan => (
        <div key={plan.id}>
          <h3>{plan.name}</h3>
          <p>{plan.formatted_price}</p>
          <ul>
            {plan.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### Flutter
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<List<SubscriptionPlan>> fetchSubscriptionPlans() async {
  final response = await http.get(
    Uri.parse('https://api.hebronconnect.com/api/v1/subscription-plans'),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final plans = data['data']['plans'] as List;
    return plans.map((json) => SubscriptionPlan.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load subscription plans');
  }
}

class SubscriptionPlan {
  final int id;
  final String name;
  final String description;
  final String formattedPrice;
  final List<String> features;

  SubscriptionPlan.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        name = json['name'],
        description = json['description'],
        formattedPrice = json['formatted_price'],
        features = List<String>.from(json['features']);
}
```

## Testing

### cURL Examples

**Get all plans:**
```bash
curl -X GET https://api.hebronconnect.com/api/v1/subscription-plans
```

**Get plan by ID:**
```bash
curl -X GET https://api.hebronconnect.com/api/v1/subscription-plans/1
```

**Get plan by slug:**
```bash
curl -X GET https://api.hebronconnect.com/api/v1/subscription-plans/slug/pro-plan
```

**Get popular plans:**
```bash
curl -X GET https://api.hebronconnect.com/api/v1/subscription-plans/popular
```

## Notes

- All endpoints are publicly accessible (no authentication required)
- Only active plans (`is_active = true`) are returned
- Plans are ordered by `sort_order` and `price`
- Prices are returned as strings to preserve decimal precision
- `null` values for `max_rooms` or `max_members_per_room` indicate unlimited
- All timestamps are in ISO 8601 format (UTC)

## Support

For API support or questions, contact the development team or refer to the main API documentation.
