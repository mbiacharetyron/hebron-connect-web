# Subscription Plans Pricing - Quick Reference

## Overview

Subscription plans now support monthly and annual pricing with automatic savings calculation.

---

## API Response Format

### Complete Plan Response
```json
{
  "id": 2,
  "name": "Pro",
  "slug": "pro",
  "description": "Professional plan with advanced features",
  "monthly_price": "5000.00",
  "annual_price": "50000.00",
  "formatted_monthly_price": "5,000.00 XAF",
  "formatted_annual_price": "50,000.00 XAF",
  "currency": "XAF",
  "annual_savings_percentage": 16.67,
  "annual_savings_amount": "10000.00",
  "features": ["..."],
  "max_members_per_room": null,
  "is_popular": true,
  "allows_unlimited_members": true
}
```

---

## New Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `monthly_price` | string | Monthly subscription price | `"5000.00"` |
| `annual_price` | string | Annual subscription price | `"50000.00"` |
| `formatted_monthly_price` | string | Formatted monthly price with currency | `"5,000.00 XAF"` |
| `formatted_annual_price` | string | Formatted annual price with currency | `"50,000.00 XAF"` |
| `annual_savings_percentage` | float | Percentage saved on annual plan | `16.67` |
| `annual_savings_amount` | string | Amount saved on annual plan | `"10000.00"` |

---

## Removed Fields

❌ `price` - Replaced by `monthly_price` and `annual_price`  
❌ `formatted_price` - Replaced by `formatted_monthly_price` and `formatted_annual_price`  
❌ `billing_cycle_days` - No longer needed  
❌ `billing_cycle` - No longer needed  

---

## Calculations

### Savings Percentage
```
Savings % = ((Monthly × 12 - Annual) / (Monthly × 12)) × 100
```

**Example:**
- Monthly: 5,000 XAF
- Annual: 50,000 XAF
- Monthly × 12: 60,000 XAF
- Savings: 60,000 - 50,000 = 10,000 XAF
- Percentage: (10,000 / 60,000) × 100 = **16.67%**

### Savings Amount
```
Savings Amount = (Monthly × 12) - Annual
```

**Example:**
- Monthly × 12: 60,000 XAF
- Annual: 50,000 XAF
- Savings: **10,000 XAF**

---

## Error Handling

### Error 1: Free Plan
**Occurs when:** Both prices are 0.00

**Error Message:**
```
Cannot calculate annual savings for free plan: Basic. Plan has no pricing.
```

**Solution:** Filter free plans before returning, or handle exception in controller

---

### Error 2: No Savings
**Occurs when:** Annual price >= (Monthly × 12)

**Error Message:**
```
No annual savings available for plan: Pro. 
Annual price (60000.00) must be less than monthly price × 12 (60000.00).
```

**Solution:** Ensure annual price offers at least some discount

---

## Example Plans

### Pro Plan (16.67% savings)
```json
{
  "name": "Pro",
  "monthly_price": "5000.00",
  "annual_price": "50000.00",
  "annual_savings_percentage": 16.67,
  "annual_savings_amount": "10000.00"
}
```

### Enterprise Plan (16.67% savings)
```json
{
  "name": "Enterprise",
  "monthly_price": "15000.00",
  "annual_price": "150000.00",
  "annual_savings_percentage": 16.67,
  "annual_savings_amount": "30000.00"
}
```

---

## Frontend Display Examples

### Monthly/Annual Toggle
```javascript
const displayPrice = billingCycle === 'monthly' 
  ? plan.formatted_monthly_price 
  : plan.formatted_annual_price;
```

### Savings Badge
```javascript
{billingCycle === 'annual' && (
  <span>Save {plan.annual_savings_percentage}%</span>
)}
```

### Detailed Savings
```javascript
{billingCycle === 'annual' && (
  <p>
    Save {plan.annual_savings_amount} {plan.currency} per year
  </p>
)}
```

---

## Migration Command

```bash
# Run migration
php artisan migrate

# Re-seed plans
php artisan db:seed --class=SubscriptionPlanSeeder
```

---

## Testing

```bash
# Test in Tinker
php artisan tinker
>>> $plan = App\Models\SubscriptionPlan::where('slug', 'pro')->first();
>>> $plan->monthly_price;        // 5000.00
>>> $plan->annual_price;         // 50000.00
>>> $plan->annual_savings_percentage;  // 16.67
>>> $plan->annual_savings_amount;      // 10000.00

# Test API
curl http://localhost/api/v1/subscription-plans/2
```

---

## Model Methods

### Get Formatted Prices
```php
$plan->formatted_monthly_price;  // "5,000.00 XAF"
$plan->formatted_annual_price;   // "50,000.00 XAF"
```

### Get Savings
```php
$plan->annual_savings_percentage;  // 16.67 (throws exception if no savings)
$plan->annual_savings_amount;      // 10000.00
```

### Check Savings
```php
$plan->hasAnnualSavings();  // true/false
```

---

## Database Schema

```sql
CREATE TABLE subscription_plans (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    monthly_price DECIMAL(10,2),  -- NEW
    annual_price DECIMAL(10,2),   -- NEW
    currency VARCHAR(3),
    -- ... other fields
);
```

---

## Quick Checklist

### Before Deployment
- [ ] Run migration
- [ ] Update seeder data
- [ ] Test annual_savings_percentage calculation
- [ ] Verify API responses
- [ ] Test free plan handling (if applicable)
- [ ] Update frontend to use new fields

### After Deployment
- [ ] Verify monthly_price shows correctly
- [ ] Verify annual_price shows correctly
- [ ] Confirm savings_percentage is accurate
- [ ] Check that free plans don't break API
- [ ] Monitor error logs for exceptions

---

## Files Modified

1. ✅ `app/Models/SubscriptionPlan.php`
2. ✅ `app/Http/Controllers/Api/V1/SubscriptionPlanController.php`
3. ✅ `database/migrations/2025_10_24_150000_add_monthly_and_annual_prices_to_subscription_plans.php`
4. ✅ `database/seeders/SubscriptionPlanSeeder.php`
5. ✅ `docs/SUBSCRIPTION_PLANS_MONTHLY_ANNUAL_PRICING.md`
6. ✅ `docs/SUBSCRIPTION_PLANS_PRICING_QUICK_REFERENCE.md`
