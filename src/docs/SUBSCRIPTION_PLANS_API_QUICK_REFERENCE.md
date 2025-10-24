# Subscription Plans API - Quick Reference

## Public Endpoints (No Auth Required)

### Get All Plans
```
GET /api/v1/subscription-plans
```
Returns all active subscription plans ordered by sort order and price.

---

### Get Specific Plan by ID
```
GET /api/v1/subscription-plans/{id}
```
**Parameters:**
- `id` - Subscription plan ID

**Example:**
```
GET /api/v1/subscription-plans/1
```

---

### Get Plan by Slug
```
GET /api/v1/subscription-plans/slug/{slug}
```
**Parameters:**
- `slug` - Plan slug (e.g., "pro-plan")

**Example:**
```
GET /api/v1/subscription-plans/slug/pro-plan
```

---

### Get Popular Plans
```
GET /api/v1/subscription-plans/popular
```
Returns only plans marked as popular/featured.

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Subscription plans retrieved successfully",
  "data": {
    "plans": [...]  // or "plan": {...} for single plan
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Plan Object Structure

```json
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
  "features": ["Feature 1", "Feature 2"],
  "max_members_per_room": 100,
  "is_popular": true,
  "allows_unlimited_members": false,
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

---

## Key Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Plan ID |
| `name` | string | Plan name |
| `slug` | string | URL-friendly identifier |
| `price` | string | Decimal price |
| `formatted_price` | string | Price with currency |
| `currency` | string | Currency code |
| `billing_cycle` | string | Human-readable cycle |
| `features` | array | List of features |
| `max_members_per_room` | int\|null | Max members (null = unlimited) |
| `is_popular` | boolean | Popular badge |
| `allows_unlimited_members` | boolean | Unlimited members flag |

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | Plan not found |
| 500 | Server error |

---

## cURL Examples

### Get all plans
```bash
curl https://api.hebronconnect.com/api/v1/subscription-plans
```

### Get plan by ID
```bash
curl https://api.hebronconnect.com/api/v1/subscription-plans/1
```

### Get plan by slug
```bash
curl https://api.hebronconnect.com/api/v1/subscription-plans/slug/pro-plan
```

### Get popular plans
```bash
curl https://api.hebronconnect.com/api/v1/subscription-plans/popular
```

---

## JavaScript Example

```javascript
// Fetch all plans
const response = await fetch('/api/v1/subscription-plans');
const data = await response.json();
const plans = data.data.plans;

// Fetch popular plans
const popularResponse = await fetch('/api/v1/subscription-plans/popular');
const popularData = await popularResponse.json();
const popularPlans = popularData.data.plans;

// Fetch by slug
const planResponse = await fetch('/api/v1/subscription-plans/slug/pro-plan');
const planData = await planResponse.json();
const plan = planData.data.plan;
```

---

## Notes

- ✅ No authentication required
- ✅ Only returns active plans
- ✅ Plans ordered by sort_order and price
- ✅ `null` limits mean unlimited
- ✅ All responses include success flag
- ✅ Suitable for pricing pages and plan selection

---

## Files

**Controller:** `app/Http/Controllers/Api/V1/SubscriptionPlanController.php`  
**Routes:** `routes/api.php` (lines 59-63)  
**Model:** `app/Models/SubscriptionPlan.php`
