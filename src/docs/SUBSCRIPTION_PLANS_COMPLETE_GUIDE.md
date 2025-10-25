# Subscription Plans - Complete Guide

**Version:** 1.1.0  
**Last Updated:** October 24, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Monthly & Annual Pricing](#monthly--annual-pricing)
4. [Currency Conversion](#currency-conversion)
5. [Dual Currency Display](#dual-currency-display)
6. [Authentication & Access](#authentication--access)
7. [Response Structure](#response-structure)
8. [Code Examples](#code-examples)
9. [Testing](#testing)
10. [Implementation Details](#implementation-details)

---

## Overview

The Subscription Plans API provides access to Hebron Connect room subscription plans with advanced features including:

- ✅ **Public Access** - No authentication required for basic plan retrieval
- ✅ **Monthly & Annual Pricing** - Dual pricing with automatic savings calculation
- ✅ **Currency Conversion** - Automatic conversion to room's currency (when authenticated)
- ✅ **Dual Currency Display** - Shows both converted and original prices
- ✅ **Flexible Authentication** - Supports both authenticated and unauthenticated requests

### Key Features

| Feature | Description |
|---------|-------------|
| Public Endpoints | Anyone can view plans without authentication |
| Authenticated Features | Currency conversion for room members |
| Monthly/Annual Pricing | Two billing options with savings calculation |
| Currency-Specific Rounding | XAF: whole numbers, Others: 2 decimals |
| Dual Currency Display | Shows both room currency and original currency |

---

## API Endpoints

### Base URL
```
https://api.hebronconnect.com/api/v1
```

### Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/subscription-plans` | Get all active plans | Optional* |
| GET | `/subscription-plans/{id}` | Get plan by ID | Optional* |
| GET | `/subscription-plans/slug/{slug}` | Get plan by slug | Optional* |
| GET | `/subscription-plans/popular` | Get popular plans | Optional* |

*Optional: Authentication enables currency conversion when `room_id` is provided

---

### 1. Get All Subscription Plans

**Endpoint:** `GET /subscription-plans`

**Query Parameters:**
- `room_id` (optional, integer) - Connect Room ID for currency conversion (requires authentication)

**Request Examples:**

```bash
# Basic request (no auth)
curl https://api.hebronconnect.com/api/v1/subscription-plans

# With currency conversion (authenticated)
curl -H "Authorization: Bearer {token}" \
     https://api.hebronconnect.com/api/v1/subscription-plans?room_id=21
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
        "name": "Basic",
        "slug": "basic",
        "description": "Free plan for small groups",
        "monthly_price": "0",
        "annual_price": "0",
        "formatted_monthly_price": "0 XAF",
        "formatted_annual_price": "0 XAF",
        "currency": "XAF",
        "was_converted": false,
        "annual_savings_percentage": 0.0,
        "annual_savings_amount": "0",
        "features": [
          "Up to 50 members",
          "Basic contributions",
          "Email support"
        ],
        "max_members_per_room": 50,
        "is_popular": false,
        "allows_unlimited_members": false
      },
      {
        "id": 2,
        "name": "Pro",
        "slug": "pro",
        "description": "Professional plan with advanced features",
        "monthly_price": "5000",
        "annual_price": "50000",
        "formatted_monthly_price": "5,000 XAF",
        "formatted_annual_price": "50,000 XAF",
        "currency": "XAF",
        "was_converted": true,
        "original_prices": {
          "monthly_price": "8.33",
          "annual_price": "83.33",
          "formatted_monthly_price": "8.33 USD",
          "formatted_annual_price": "83.33 USD",
          "currency": "USD"
        },
        "annual_savings_percentage": 16.67,
        "annual_savings_amount": "10000",
        "features": [
          "Up to 500 members",
          "Advanced analytics",
          "Priority support",
          "Custom branding"
        ],
        "max_members_per_room": 500,
        "is_popular": true,
        "allows_unlimited_members": false
      }
    ],
    "converted_currency": "XAF"
  }
}
```

---

### 2. Get Specific Plan by ID

**Endpoint:** `GET /subscription-plans/{id}`

**Path Parameters:**
- `id` (integer, required) - Subscription plan ID

**Query Parameters:**
- `room_id` (optional, integer) - Connect Room ID for currency conversion

**Example:**
```bash
curl -H "Authorization: Bearer {token}" \
     https://api.hebronconnect.com/api/v1/subscription-plans/2?room_id=21
```

---

### 3. Get Plan by Slug

**Endpoint:** `GET /subscription-plans/slug/{slug}`

**Path Parameters:**
- `slug` (string, required) - Plan slug (e.g., "pro", "enterprise")

**Example:**
```bash
curl https://api.hebronconnect.com/api/v1/subscription-plans/slug/pro
```

---

### 4. Get Popular Plans

**Endpoint:** `GET /subscription-plans/popular`

**Query Parameters:**
- `room_id` (optional, integer) - Connect Room ID for currency conversion

**Example:**
```bash
curl -H "Authorization: Bearer {token}" \
     https://api.hebronconnect.com/api/v1/subscription-plans/popular?room_id=21
```

---

## Monthly & Annual Pricing

### Overview

All subscription plans offer both monthly and annual billing options with automatic savings calculation.

### Pricing Structure

```
Monthly Price: Pay every month
Annual Price: Pay once per year (discounted)
Savings: Calculated as (Monthly × 12) - Annual
```

### Example Plans

**Pro Plan:**
```json
{
  "monthly_price": "5000",
  "annual_price": "50000",
  "annual_savings_percentage": 16.67,
  "annual_savings_amount": "10000"
}
```

**Calculation:**
- Monthly × 12 = 5,000 × 12 = 60,000 XAF
- Annual = 50,000 XAF
- Savings = 60,000 - 50,000 = 10,000 XAF
- Percentage = (10,000 / 60,000) × 100 = 16.67%

### Free Plans

Free plans have both prices set to 0:
```json
{
  "monthly_price": "0",
  "annual_price": "0",
  "annual_savings_percentage": 0.0,
  "annual_savings_amount": "0"
}
```

---

## Currency Conversion

### Overview

When an authenticated user provides a `room_id` parameter and is a member of that room, prices are automatically converted to the room's currency.

### Conversion Criteria

All conditions must be met:
1. ✅ User is authenticated (valid bearer token)
2. ✅ `room_id` parameter is provided
3. ✅ User is a member of the specified room
4. ✅ Room currency differs from plan's base currency

### Rounding Rules

#### XAF (Central African CFA Franc)
- **Rounded UP to nearest whole number**
- No decimal places
- Example: 3006.45 XAF → 3007 XAF

#### Other Currencies (USD, EUR, GBP, etc.)
- **Rounded UP to 2 decimal places**
- Standard monetary precision
- Example: 5.514 USD → 5.52 USD

### Conversion Example

**Plan Base Currency:** USD  
**Room Currency:** XAF  
**Exchange Rate:** 1 USD = 600 XAF

**Original:**
```json
{
  "monthly_price": "5.00",
  "annual_price": "50.00",
  "currency": "USD"
}
```

**Converted:**
```json
{
  "monthly_price": "3000",
  "annual_price": "30000",
  "currency": "XAF",
  "was_converted": true
}
```

### Supported Currencies

| Code | Currency | Decimal Places |
|------|----------|----------------|
| USD | US Dollar | 2 |
| EUR | Euro | 2 |
| GBP | British Pound | 2 |
| CAD | Canadian Dollar | 2 |
| XAF | Central African CFA Franc | 0 |
| XOF | West African CFA Franc | 0 |

---

## Dual Currency Display

### Overview

When currency conversion occurs, the API returns prices in **BOTH** the room's currency (primary) and the plan's original currency (reference).

### When Dual Currency Applies

Only when ALL conditions are met:
1. User is authenticated
2. `room_id` is provided
3. User is a room member
4. Room currency ≠ Plan currency

### Response Structure

**With Conversion:**
```json
{
  "monthly_price": "3000",
  "annual_price": "30000",
  "formatted_monthly_price": "3,000 XAF",
  "formatted_annual_price": "30,000 XAF",
  "currency": "XAF",
  "was_converted": true,
  "original_prices": {
    "monthly_price": "5.00",
    "annual_price": "50.00",
    "formatted_monthly_price": "5.00 USD",
    "formatted_annual_price": "50.00 USD",
    "currency": "USD"
  }
}
```

**Without Conversion:**
```json
{
  "monthly_price": "5.00",
  "annual_price": "50.00",
  "currency": "USD",
  "was_converted": false
  // No original_prices field
}
```

### Display Recommendations

1. **Primary Display:** Show room currency prominently
2. **Secondary Display:** Show original currency for reference
3. **Clear Labeling:** Indicate which is converted vs. original
4. **Context:** Explain that prices were converted

---

## Authentication & Access

### Public Access (No Authentication)

**What You Can Do:**
- View all active subscription plans
- Get plan details by ID or slug
- See popular plans
- View prices in plan's base currency

**Example:**
```bash
curl https://api.hebronconnect.com/api/v1/subscription-plans
```

### Authenticated Access (With Bearer Token)

**Additional Features:**
- Currency conversion to room's currency
- Dual currency display
- Room-specific pricing

**Example:**
```bash
curl -H "Authorization: Bearer {your_token}" \
     https://api.hebronconnect.com/api/v1/subscription-plans?room_id=21
```

### How Authentication Works

The API uses a hybrid approach:

1. **Routes are public** (no middleware required)
2. **Controller checks for bearer token** (manual authentication)
3. **If token present:** Attempts to authenticate
4. **If authenticated + room_id:** Applies currency conversion

This allows:
- ✅ Unauthenticated users to browse plans
- ✅ Authenticated users to see converted prices
- ✅ Flexible integration for various use cases

---

## Response Structure

### Complete Plan Object

```json
{
  "id": 2,
  "name": "Pro",
  "slug": "pro",
  "description": "Professional plan with advanced features",
  "monthly_price": "5000",
  "annual_price": "50000",
  "formatted_monthly_price": "5,000 XAF",
  "formatted_annual_price": "50,000 XAF",
  "currency": "XAF",
  "was_converted": true,
  "original_prices": {
    "monthly_price": "8.33",
    "annual_price": "83.33",
    "formatted_monthly_price": "8.33 USD",
    "formatted_annual_price": "83.33 USD",
    "currency": "USD"
  },
  "annual_savings_percentage": 16.67,
  "annual_savings_amount": "10000",
  "features": [
    "Up to 500 members",
    "Advanced analytics",
    "Priority support"
  ],
  "max_members_per_room": 500,
  "is_popular": true,
  "allows_unlimited_members": false,
  "created_at": "2025-01-01T00:00:00.000000Z",
  "updated_at": "2025-01-01T00:00:00.000000Z"
}
```

### Field Descriptions

#### Core Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique plan identifier |
| `name` | string | Plan name |
| `slug` | string | URL-friendly identifier |
| `description` | string | Plan description |

#### Price Fields (Displayed Currency)

| Field | Type | Description |
|-------|------|-------------|
| `monthly_price` | string | Monthly price (XAF: whole number; Others: 2 decimals) |
| `annual_price` | string | Annual price (XAF: whole number; Others: 2 decimals) |
| `formatted_monthly_price` | string | Formatted price with currency symbol |
| `formatted_annual_price` | string | Formatted price with currency symbol |
| `currency` | string | Display currency code |

#### Conversion Fields

| Field | Type | Description |
|-------|------|-------------|
| `was_converted` | boolean | Whether currency conversion was applied |
| `original_prices` | object\|null | Original prices (only if `was_converted` is true) |

#### Original Prices Object

| Field | Type | Description |
|-------|------|-------------|
| `monthly_price` | string | Original monthly price |
| `annual_price` | string | Original annual price |
| `formatted_monthly_price` | string | Formatted original monthly price |
| `formatted_annual_price` | string | Formatted original annual price |
| `currency` | string | Plan's base currency |

#### Savings Fields

| Field | Type | Description |
|-------|------|-------------|
| `annual_savings_percentage` | float | Percentage saved on annual plan |
| `annual_savings_amount` | string | Amount saved on annual plan |

#### Feature Fields

| Field | Type | Description |
|-------|------|-------------|
| `features` | array | List of plan features |
| `max_members_per_room` | integer\|null | Max members (null = unlimited) |
| `is_popular` | boolean | Whether marked as popular/featured |
| `allows_unlimited_members` | boolean | Computed from `max_members_per_room` |

---

## Code Examples

### JavaScript/TypeScript

#### Basic Fetch

```typescript
async function getSubscriptionPlans() {
  const response = await fetch(
    'https://api.hebronconnect.com/api/v1/subscription-plans'
  );
  
  const data = await response.json();
  
  if (data.success) {
    return data.data.plans;
  }
  
  throw new Error(data.message);
}
```

#### With Currency Conversion

```typescript
async function getPlansForRoom(roomId: number, token: string) {
  const response = await fetch(
    `https://api.hebronconnect.com/api/v1/subscription-plans?room_id=${roomId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }
  );
  
  const data = await response.json();
  return data.data.plans;
}
```

#### Display Component (React)

```tsx
interface Plan {
  id: number;
  name: string;
  monthly_price: string;
  annual_price: string;
  formatted_monthly_price: string;
  formatted_annual_price: string;
  currency: string;
  was_converted: boolean;
  original_prices?: {
    formatted_monthly_price: string;
    formatted_annual_price: string;
    currency: string;
  };
  annual_savings_percentage: number;
  features: string[];
}

function PricingCard({ plan }: { plan: Plan }) {
  return (
    <div className="pricing-card">
      <h3>{plan.name}</h3>
      
      {/* Primary price */}
      <div className="price-main">
        <span className="amount">{plan.formatted_monthly_price}</span>
        <span className="period">/month</span>
      </div>
      
      {/* Original price (if converted) */}
      {plan.was_converted && plan.original_prices && (
        <div className="price-original">
          <small>
            Originally {plan.original_prices.formatted_monthly_price}/month
          </small>
        </div>
      )}
      
      {/* Annual savings */}
      <div className="savings-badge">
        Save {plan.annual_savings_percentage}% on annual plan
      </div>
      
      {/* Annual price */}
      <div className="annual-price">
        <span>Annual: {plan.formatted_annual_price}</span>
        {plan.was_converted && plan.original_prices && (
          <small> ({plan.original_prices.formatted_annual_price})</small>
        )}
      </div>
      
      {/* Features */}
      <ul className="features">
        {plan.features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
    </div>
  );
}
```

### React Native

```tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';

function SubscriptionPlansScreen({ roomId, authToken }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertedCurrency, setConvertedCurrency] = useState(null);

  useEffect(() => {
    loadPlans();
  }, [roomId]);

  const loadPlans = async () => {
    try {
      const url = roomId 
        ? `https://api.hebronconnect.com/api/v1/subscription-plans?room_id=${roomId}`
        : 'https://api.hebronconnect.com/api/v1/subscription-plans';
      
      const headers = authToken 
        ? { 'Authorization': `Bearer ${authToken}` }
        : {};

      const response = await fetch(url, { headers });
      const data = await response.json();
      
      setPlans(data.data.plans);
      setConvertedCurrency(data.data.converted_currency);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <View>
      {convertedCurrency && (
        <Text style={styles.currencyNote}>
          Prices shown in {convertedCurrency}
        </Text>
      )}
      
      <FlatList
        data={plans}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item: plan }) => (
          <View style={styles.planCard}>
            <Text style={styles.planName}>{plan.name}</Text>
            
            <Text style={styles.priceMain}>
              {plan.formatted_monthly_price}/month
            </Text>
            
            {plan.was_converted && plan.original_prices && (
              <Text style={styles.priceOriginal}>
                Originally {plan.original_prices.formatted_monthly_price}/month
              </Text>
            )}
            
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>
                Save {plan.annual_savings_percentage}% yearly
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
```

### Flutter/Dart

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class SubscriptionPlanService {
  final String baseUrl = 'https://api.hebronconnect.com/api/v1';
  
  Future<List<SubscriptionPlan>> getPlans({
    int? roomId,
    String? authToken
  }) async {
    var uri = Uri.parse('$baseUrl/subscription-plans');
    
    if (roomId != null) {
      uri = Uri.parse('$baseUrl/subscription-plans?room_id=$roomId');
    }
    
    final headers = <String, String>{
      'Accept': 'application/json',
    };
    
    if (authToken != null) {
      headers['Authorization'] = 'Bearer $authToken';
    }
    
    final response = await http.get(uri, headers: headers);
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final plans = data['data']['plans'] as List;
      return plans.map((json) => SubscriptionPlan.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load plans');
    }
  }
}

class SubscriptionPlan {
  final int id;
  final String name;
  final String formattedMonthlyPrice;
  final String formattedAnnualPrice;
  final bool wasConverted;
  final OriginalPrices? originalPrices;
  final double annualSavingsPercentage;
  
  SubscriptionPlan.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        name = json['name'],
        formattedMonthlyPrice = json['formatted_monthly_price'],
        formattedAnnualPrice = json['formatted_annual_price'],
        wasConverted = json['was_converted'],
        originalPrices = json['original_prices'] != null
            ? OriginalPrices.fromJson(json['original_prices'])
            : null,
        annualSavingsPercentage = json['annual_savings_percentage'];
}

class OriginalPrices {
  final String formattedMonthlyPrice;
  final String formattedAnnualPrice;
  
  OriginalPrices.fromJson(Map<String, dynamic> json)
      : formattedMonthlyPrice = json['formatted_monthly_price'],
        formattedAnnualPrice = json['formatted_annual_price'];
}

// Widget
class PlanCard extends StatelessWidget {
  final SubscriptionPlan plan;
  
  const PlanCard({required this.plan});
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              plan.name,
              style: Theme.of(context).textTheme.headline6,
            ),
            SizedBox(height: 8),
            Text(
              '${plan.formattedMonthlyPrice}/month',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            if (plan.wasConverted && plan.originalPrices != null) ...[
              SizedBox(height: 4),
              Text(
                'Originally ${plan.originalPrices!.formattedMonthlyPrice}/month',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
            SizedBox(height: 12),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                'Save ${plan.annualSavingsPercentage}% on annual plan',
                style: TextStyle(color: Colors.white, fontSize: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## Testing

### Manual Testing Checklist

#### Basic Functionality
- [ ] GET `/subscription-plans` returns all active plans
- [ ] GET `/subscription-plans/{id}` returns specific plan
- [ ] GET `/subscription-plans/slug/{slug}` returns plan by slug
- [ ] GET `/subscription-plans/popular` returns only popular plans
- [ ] Invalid ID returns 404
- [ ] Invalid slug returns 404

#### Pricing
- [ ] Monthly and annual prices are present
- [ ] Annual savings percentage is calculated correctly
- [ ] Annual savings amount is calculated correctly
- [ ] Free plans show 0% savings
- [ ] Paid plans must have annual savings > 0

#### Currency Conversion (XAF)
- [ ] Authenticated request with room_id converts prices
- [ ] Converted XAF prices are whole numbers (no decimals)
- [ ] `was_converted` is true when conversion occurs
- [ ] `original_prices` object is present when converted

#### Currency Conversion (Other Currencies)
- [ ] USD conversion uses 2 decimal places
- [ ] EUR conversion uses 2 decimal places
- [ ] Prices are rounded UP (e.g., 5.514 → 5.52)

#### Dual Currency Display
- [ ] `original_prices` only present when `was_converted` is true
- [ ] Original prices maintain proper decimal places
- [ ] Both currencies are properly formatted

#### Authentication
- [ ] Unauthenticated request works (returns base currency)
- [ ] Authenticated without room_id returns base currency
- [ ] Authenticated with invalid room_id returns base currency
- [ ] Authenticated as non-member returns base currency
- [ ] Authenticated as member converts currency

### cURL Test Commands

```bash
# Test 1: Basic request (no auth)
curl https://api.hebronconnect.com/api/v1/subscription-plans

# Test 2: Get popular plans
curl https://api.hebronconnect.com/api/v1/subscription-plans/popular

# Test 3: Get specific plan by ID
curl https://api.hebronconnect.com/api/v1/subscription-plans/2

# Test 4: Get plan by slug
curl https://api.hebronconnect.com/api/v1/subscription-plans/slug/pro

# Test 5: With currency conversion (authenticated)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://api.hebronconnect.com/api/v1/subscription-plans?room_id=21"

# Test 6: Invalid ID (should return 404)
curl https://api.hebronconnect.com/api/v1/subscription-plans/99999

# Test 7: Invalid slug (should return 404)
curl https://api.hebronconnect.com/api/v1/subscription-plans/slug/invalid
```

### Expected Responses

**Test 1: USD Plan → XAF Room (Authenticated)**

Request:
```bash
curl -H "Authorization: Bearer TOKEN" \
     "https://api.hebronconnect.com/api/v1/subscription-plans?room_id=21"
```

Response:
```json
{
  "monthly_price": "3000",
  "annual_price": "30000",
  "currency": "XAF",
  "was_converted": true,
  "original_prices": {
    "monthly_price": "5.00",
    "annual_price": "50.00",
    "formatted_monthly_price": "5.00 USD",
    "currency": "USD"
  }
}
```

**Test 2: Same Currency (No Conversion)**

Response:
```json
{
  "monthly_price": "5.00",
  "annual_price": "50.00",
  "currency": "USD",
  "was_converted": false
  // No original_prices
}
```

---

## Implementation Details

### Database Schema

**Table:** `subscription_plans`

```sql
CREATE TABLE subscription_plans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'XAF',
    features JSON,
    max_members_per_room INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_popular (is_popular),
    INDEX idx_slug (slug)
);
```

### Model Methods

**File:** `app/Models/SubscriptionPlan.php`

```php
// Get formatted monthly price
$plan->formatted_monthly_price;  // "5,000.00 XAF"

// Get formatted annual price
$plan->formatted_annual_price;   // "50,000.00 XAF"

// Get annual savings percentage
$plan->annual_savings_percentage;  // 16.67

// Get annual savings amount
$plan->annual_savings_amount;      // 10000.00

// Check if plan has savings
$plan->hasAnnualSavings();  // true/false

// Check if allows unlimited members
$plan->allowsUnlimitedMembersPerRoom();  // true/false
```

### Controller Logic

**File:** `app/Http/Controllers/Api/V1/SubscriptionPlanController.php`

**Key Features:**
1. Manual authentication attempt (if bearer token present)
2. Room membership verification
3. Currency conversion (if authenticated + room member)
4. Dual currency preparation
5. Proper rounding based on target currency

### Exchange Rate Service

**File:** `app/Services/ExchangeRateService.php`

**Features:**
- Fetches live exchange rates from API
- Caches rates for 1 hour
- Fallback to hardcoded rates if API fails
- Exact conversion with `convertCurrencyExact()`

### Routes

**File:** `routes/api.php`

```php
// Public routes (no middleware)
Route::get('/subscription-plans', [SubscriptionPlanController::class, 'index']);
Route::get('/subscription-plans/popular', [SubscriptionPlanController::class, 'getPopular']);
Route::get('/subscription-plans/{id}', [SubscriptionPlanController::class, 'show']);
Route::get('/subscription-plans/slug/{slug}', [SubscriptionPlanController::class, 'getBySlug']);
```

### Logging

All operations are logged for monitoring:

```
[INFO] Authentication attempt { has_bearer_token: true, authenticated: true, user_id: 42 }
[INFO] Room ID provided for currency conversion { room_id: 21, user_id: 42 }
[INFO] Currency conversion applied { from: USD, to: XAF, rounding: whole_number }
[WARNING] User not a member of room { room_id: 21, user_id: 42 }
[ERROR] Failed to convert currency { error: "API timeout" }
```

---

## Best Practices

### ✅ DO

1. **Check `was_converted` before using `original_prices`:**
   ```typescript
   if (plan.was_converted && plan.original_prices) {
     // Safe to use
   }
   ```

2. **Display room currency prominently:**
   - Primary: Room currency (converted)
   - Secondary: Original currency (reference)

3. **Provide clear labels:**
   ```jsx
   <div>
     <h3>{plan.formatted_monthly_price}</h3>
     <small>Your room's currency</small>
   </div>
   ```

4. **Cache appropriately:**
   - Cache plans for 5-10 minutes
   - Include room_id in cache key if converted

5. **Handle both scenarios:**
   - With conversion (dual currency)
   - Without conversion (single currency)

### ❌ DON'T

1. **Don't assume `original_prices` exists:**
   ```typescript
   // BAD
   const price = plan.original_prices.monthly_price;
   
   // GOOD
   const price = plan.original_prices?.monthly_price;
   ```

2. **Don't hide conversion info:**
   - Users should know prices were converted
   - Show both currencies for transparency

3. **Don't mix currencies in calculations:**
   - Use one currency consistently
   - Convert if needed before comparing

4. **Don't cache indefinitely:**
   - Exchange rates change
   - Plans may be updated
   - Cache for short periods only

---

## Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 404 | Plan not found | Check plan ID/slug is valid |
| 500 | Server error | Check logs, retry request |

### Error Response Format

```json
{
  "success": false,
  "message": "Subscription plan not found"
}
```

### Conversion Failures

If currency conversion fails:
- No error is thrown
- Original prices are returned
- `was_converted = false`
- Error is logged for monitoring

---

## Related Files

### Controllers
- `app/Http/Controllers/Api/V1/SubscriptionPlanController.php`

### Models
- `app/Models/SubscriptionPlan.php`
- `app/Models/ConnectRoom.php`

### Services
- `app/Services/ExchangeRateService.php`

### Routes
- `routes/api.php`

### Database
- `database/migrations/2025_10_24_150000_add_monthly_and_annual_prices_to_subscription_plans.php`
- `database/seeders/SubscriptionPlanSeeder.php`

---

## Summary

### Features Implemented

✅ Public API endpoints for subscription plans  
✅ Monthly and annual pricing with savings calculation  
✅ Automatic currency conversion for authenticated users  
✅ Currency-specific rounding (XAF: whole numbers, Others: 2dp)  
✅ Dual currency display (converted + original)  
✅ Flexible authentication (optional bearer token)  
✅ Comprehensive error handling and logging  
✅ OpenAPI/Swagger documentation  

### What You Can Build

- 🎯 Pricing pages (public)
- 🎯 Subscription selection flows
- 🎯 Room-specific pricing displays
- 🎯 Multi-currency pricing comparisons
- 🎯 Mobile app subscription screens
- 🎯 Landing pages with pricing

### Support

For questions or issues:
1. Check this documentation
2. Review error logs in `storage/logs/laravel.log`
3. Test with cURL commands
4. Contact backend development team

---

**Version:** 1.1.0  
**Last Updated:** October 24, 2025  
**Maintained by:** Hebron Connect Backend Team

