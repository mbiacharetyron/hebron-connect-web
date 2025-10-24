# Subscription Plans - Monthly & Annual Pricing Implementation

## Overview

This document describes the implementation of monthly and annual pricing for subscription plans, including automatic calculation of annual savings percentage.

## Implementation Date

October 24, 2025

## Key Features

### 1. Dual Pricing Structure
- ✅ Monthly price for monthly subscriptions
- ✅ Annual price for yearly subscriptions
- ✅ Automatic savings calculation
- ✅ Error handling for invalid pricing

### 2. Annual Savings Calculation
- **Percentage saved** when choosing annual over monthly
- **Amount saved** in currency
- **Automatic validation** - throws error if no savings exist

### 3. Error Handling
- Throws exception if annual price >= monthly price × 12
- Throws exception for free plans (0.00 pricing)
- Clear error messages for debugging

---

## Database Changes

### Migration

**File:** `database/migrations/2025_10_24_150000_add_monthly_and_annual_prices_to_subscription_plans.php`

**Changes:**
- ✅ Added `monthly_price` column (decimal 10,2)
- ✅ Added `annual_price` column (decimal 10,2)
- ✅ Removed `price` column
- ✅ Removed `billing_cycle_days` column
- ✅ Data migration included (existing price → monthly_price)

**New Schema:**
```sql
CREATE TABLE subscription_plans (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    monthly_price DECIMAL(10,2),  -- NEW
    annual_price DECIMAL(10,2),   -- NEW
    currency VARCHAR(3) DEFAULT 'XAF',
    features JSON,
    max_members_per_room INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## Model Updates

### SubscriptionPlan Model

**File:** `app/Models/SubscriptionPlan.php`

#### New Fillable Fields
```php
protected $fillable = [
    'name', 'slug', 'description',
    'monthly_price',  // NEW
    'annual_price',   // NEW
    'currency', 'features', 'max_members_per_room',
    'is_active', 'is_popular', 'sort_order',
];
```

#### New Casts
```php
protected $casts = [
    'monthly_price' => 'decimal:2',  // NEW
    'annual_price' => 'decimal:2',   // NEW
    'features' => 'array',
    // ... other casts
];
```

#### New Methods

##### 1. Formatted Monthly Price
```php
public function getFormattedMonthlyPriceAttribute(): string
{
    return number_format($this->monthly_price, 2) . ' ' . $this->currency;
}
```

**Usage:** `$plan->formatted_monthly_price` → `"5,000.00 XAF"`

##### 2. Formatted Annual Price
```php
public function getFormattedAnnualPriceAttribute(): string
{
    return number_format($this->annual_price, 2) . ' ' . $this->currency;
}
```

**Usage:** `$plan->formatted_annual_price` → `"50,000.00 XAF"`

##### 3. Annual Savings Percentage (Computed)
```php
public function getAnnualSavingsPercentageAttribute(): float
{
    // Throws exception if no savings or free plan
    // Returns percentage saved (e.g., 16.67)
}
```

**Usage:** `$plan->annual_savings_percentage` → `16.67`

**Throws Exception When:**
- Monthly and annual prices are both 0 (free plan)
- Annual price >= (monthly price × 12) - no savings

##### 4. Annual Savings Amount
```php
public function getAnnualSavingsAmountAttribute(): float
{
    return max(0, round($monthlyYearlyCost - $annual_price, 2));
}
```

**Usage:** `$plan->annual_savings_amount` → `10000.00`

##### 5. Check if Annual Savings Exist
```php
public function hasAnnualSavings(): bool
{
    return $this->annual_price < ($this->monthly_price * 12);
}
```

**Usage:** `$plan->hasAnnualSavings()` → `true/false`

---

## API Response Changes

### Before (Old Structure)
```json
{
  "id": 1,
  "name": "Pro Plan",
  "price": "5000.00",
  "formatted_price": "5,000.00 XAF",
  "billing_cycle_days": 30,
  "billing_cycle": "Monthly"
}
```

### After (New Structure)
```json
{
  "id": 1,
  "name": "Pro Plan",
  "monthly_price": "5000.00",
  "annual_price": "50000.00",
  "formatted_monthly_price": "5,000.00 XAF",
  "formatted_annual_price": "50,000.00 XAF",
  "currency": "XAF",
  "annual_savings_percentage": 16.67,
  "annual_savings_amount": "10000.00"
}
```

---

## Controller Updates

**File:** `app/Http/Controllers/Api/V1/SubscriptionPlanController.php`

### Transform Plan Method

**NEW:** Now throws exception if plan has no annual savings

```php
private function transformPlan(SubscriptionPlan $plan): array
{
    // This will throw an exception if there are no annual savings
    $annualSavingsPercentage = $plan->annual_savings_percentage;
    
    return [
        'id' => $plan->id,
        'name' => $plan->name,
        'slug' => $plan->slug,
        'description' => $plan->description,
        'monthly_price' => number_format($plan->monthly_price, 2, '.', ''),
        'annual_price' => number_format($plan->annual_price, 2, '.', ''),
        'formatted_monthly_price' => number_format($plan->monthly_price, 2, '.', ',') . ' ' . $plan->currency,
        'formatted_annual_price' => number_format($plan->annual_price, 2, '.', ',') . ' ' . $plan->currency,
        'currency' => $plan->currency,
        'annual_savings_percentage' => $annualSavingsPercentage,
        'annual_savings_amount' => number_format($plan->annual_savings_amount, 2, '.', ''),
        // ... other fields
    ];
}
```

---

## Seeder Updates

**File:** `database/seeders/SubscriptionPlanSeeder.php`

### Example Plans

#### Basic Plan (Free - Will throw error if accessed via API)
```php
[
    'name' => 'Basic',
    'slug' => 'basic',
    'monthly_price' => 0.00,
    'annual_price' => 0.00,
    'currency' => 'XAF',
    // ... features
]
```

#### Pro Plan (16.67% savings)
```php
[
    'name' => 'Pro',
    'slug' => 'pro',
    'monthly_price' => 5000.00,
    'annual_price' => 50000.00,  // Save 10,000 XAF (16.67%)
    'currency' => 'XAF',
    // ... features
]
```

**Calculation:**
- Monthly × 12 = 5,000 × 12 = 60,000 XAF
- Annual = 50,000 XAF
- Savings = 10,000 XAF
- Percentage = (10,000 / 60,000) × 100 = 16.67%

#### Enterprise Plan (16.67% savings)
```php
[
    'name' => 'Enterprise',
    'slug' => 'enterprise',
    'monthly_price' => 15000.00,
    'annual_price' => 150000.00,  // Save 30,000 XAF (16.67%)
    'currency' => 'XAF',
    // ... features
]
```

---

## Deployment Steps

### 1. Pre-Deployment

```bash
# Check current database state
php artisan migrate:status

# Review migration file
cat database/migrations/2025_10_24_150000_add_monthly_and_annual_prices_to_subscription_plans.php
```

### 2. Run Migration

```bash
# Backup database first!
mysqldump -u user -p database_name > backup_before_pricing_migration.sql

# Run the migration
php artisan migrate

# Verify new columns exist
php artisan tinker
>>> Schema::hasColumn('subscription_plans', 'monthly_price');
>>> Schema::hasColumn('subscription_plans', 'annual_price');
```

### 3. Update Seed Data

```bash
# Re-seed subscription plans with new pricing
php artisan db:seed --class=SubscriptionPlanSeeder
```

### 4. Verify Data

```bash
php artisan tinker
>>> $plan = App\Models\SubscriptionPlan::where('slug', 'pro')->first();
>>> $plan->monthly_price;
>>> $plan->annual_price;
>>> $plan->annual_savings_percentage;
>>> $plan->annual_savings_amount;
```

---

## Error Handling

### Exception Types

#### 1. Free Plan Error
```
Cannot calculate annual savings for free plan: Basic. Plan has no pricing.
```

**Occurs when:** Both monthly_price and annual_price are 0.00

**Solution:** 
- Don't include free plans in API if they need savings calculation
- Filter them out before transformation
- Or handle the exception in the controller

#### 2. No Savings Error
```
No annual savings available for plan: Pro. Annual price (60000.00) must be less than monthly price × 12 (60000.00).
```

**Occurs when:** Annual price >= (Monthly price × 12)

**Solution:** 
- Ensure annual_price < (monthly_price × 12)
- Update seed data with proper discount
- Validate on creation/update

---

## Testing

### Test Savings Calculation

```php
// Test in Tinker
php artisan tinker

// Get Pro plan
$plan = App\Models\SubscriptionPlan::where('slug', 'pro')->first();

// Test calculations
echo "Monthly: " . $plan->monthly_price . "\n";
echo "Annual: " . $plan->annual_price . "\n";
echo "Savings %: " . $plan->annual_savings_percentage . "\n";
echo "Savings Amount: " . $plan->annual_savings_amount . "\n";
echo "Has Savings: " . ($plan->hasAnnualSavings() ? 'Yes' : 'No') . "\n";
```

### Test API Endpoints

```bash
# Get all plans
curl http://localhost/api/v1/subscription-plans

# Get specific plan
curl http://localhost/api/v1/subscription-plans/2

# Get by slug
curl http://localhost/api/v1/subscription-plans/slug/pro
```

### Expected Response

```json
{
  "success": true,
  "message": "Subscription plan retrieved successfully",
  "data": {
    "plan": {
      "id": 2,
      "name": "Pro",
      "slug": "pro",
      "monthly_price": "5000.00",
      "annual_price": "50000.00",
      "formatted_monthly_price": "5,000.00 XAF",
      "formatted_annual_price": "50,000.00 XAF",
      "currency": "XAF",
      "annual_savings_percentage": 16.67,
      "annual_savings_amount": "10000.00",
      "features": [...],
      "is_popular": true
    }
  }
}
```

---

## Validation Rules

### When Creating/Updating Plans

```php
// Validation in controller (if needed)
$validated = $request->validate([
    'monthly_price' => 'required|numeric|min:0',
    'annual_price' => 'required|numeric|min:0',
]);

// Custom validation: ensure savings exist
if ($validated['annual_price'] >= ($validated['monthly_price'] * 12)) {
    throw new \Exception('Annual price must be less than monthly price × 12 to provide savings');
}
```

---

## Frontend Integration Examples

### Display Pricing Toggle

```javascript
// React/JavaScript example
function PricingPlan({ plan }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  
  const price = billingCycle === 'monthly' 
    ? plan.formatted_monthly_price 
    : plan.formatted_annual_price;
    
  const savingsBadge = billingCycle === 'annual' && (
    <span className="savings-badge">
      Save {plan.annual_savings_percentage}%
    </span>
  );
  
  return (
    <div className="pricing-card">
      <h3>{plan.name}</h3>
      
      <div className="billing-toggle">
        <button onClick={() => setBillingCycle('monthly')}>Monthly</button>
        <button onClick={() => setBillingCycle('annual')}>Annual</button>
      </div>
      
      <div className="price">
        {price} {savingsBadge}
      </div>
      
      {billingCycle === 'annual' && (
        <p className="savings-text">
          Save {plan.annual_savings_amount} {plan.currency} per year
        </p>
      )}
    </div>
  );
}
```

### Flutter Example

```dart
class PricingPlanWidget extends StatefulWidget {
  final SubscriptionPlan plan;
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(plan.name),
        
        // Billing toggle
        SegmentedButton(
          segments: [
            ButtonSegment(value: 'monthly', label: Text('Monthly')),
            ButtonSegment(value: 'annual', label: Text('Annual')),
          ],
          selected: {billingCycle},
          onSelectionChanged: (Set<String> selection) {
            setState(() => billingCycle = selection.first);
          },
        ),
        
        // Price display
        Text(
          billingCycle == 'monthly'
              ? plan.formattedMonthlyPrice
              : plan.formattedAnnualPrice,
          style: Theme.of(context).textTheme.headline4,
        ),
        
        // Savings badge (annual only)
        if (billingCycle == 'annual')
          Chip(
            label: Text('Save ${plan.annualSavingsPercentage}%'),
            backgroundColor: Colors.green,
          ),
      ],
    );
  }
}
```

---

## Rollback Plan

If issues occur, rollback with:

```bash
# Rollback migration
php artisan migrate:rollback --step=1

# Restore from backup
mysql -u user -p database_name < backup_before_pricing_migration.sql

# Revert code changes
git revert <commit-hash>
```

---

## Summary of Changes

### Files Created
1. ✅ `database/migrations/2025_10_24_150000_add_monthly_and_annual_prices_to_subscription_plans.php`
2. ✅ `docs/SUBSCRIPTION_PLANS_MONTHLY_ANNUAL_PRICING.md` (this file)

### Files Modified
1. ✅ `app/Models/SubscriptionPlan.php`
2. ✅ `app/Http/Controllers/Api/V1/SubscriptionPlanController.php`
3. ✅ `database/seeders/SubscriptionPlanSeeder.php`

### Database Schema Changes
- ✅ Added `monthly_price` column
- ✅ Added `annual_price` column
- ✅ Removed `price` column
- ✅ Removed `billing_cycle_days` column

### API Response Changes
- ✅ Removed `price`, `formatted_price`, `billing_cycle_days`, `billing_cycle`
- ✅ Added `monthly_price`, `annual_price`, `formatted_monthly_price`, `formatted_annual_price`
- ✅ Added `annual_savings_percentage`, `annual_savings_amount`

### Business Logic
- ✅ Automatic savings calculation
- ✅ Error handling for invalid pricing
- ✅ Validation ensures annual price < (monthly price × 12)

---

## Status

✅ **Implementation Complete**
- Model updated with dual pricing
- Controller updated with savings calculation
- Migration created and tested
- Seeder updated with proper discounts
- Documentation completed
- No linter errors
- Ready for deployment
