# Stripe Merchant Balance Auto-Update Guide

## Overview

Automatic conversion and addition of Stripe subscription payments to the merchant balance in `app_merchant_balances` table.

**Key Features:**
- ✅ Automatic balance updates when subscription payments complete
- ✅ Multi-currency support with real-time conversion
- ✅ Full audit trail with detailed logging
- ✅ Error handling with automatic fallbacks

---

## Table of Contents

1. [How It Works](#how-it-works)
2. [Quick Reference](#quick-reference)
3. [Setup & Configuration](#setup--configuration)
4. [Testing](#testing)
5. [Monitoring & Troubleshooting](#monitoring--troubleshooting)
6. [Deployment](#deployment)

---

## How It Works

### Payment Flow

```
User completes Stripe payment ($3.99 USD)
↓
Stripe sends invoice.payment_succeeded webhook
↓
System receives webhook and extracts payment details
↓
Converts to merchant currency (USD → XAF: $3.99 × 600 = 2,394 XAF)
↓
Adds converted amount to Stripe merchant balance
↓
Logs all details for audit trail
```

### Example

**Before:**
- Stripe merchant balance: 1,250,000 XAF

**Payment:**
- Amount: $3.99 USD
- Exchange rate: 600 XAF/USD
- Converted: 2,394 XAF

**After:**
- Stripe merchant balance: 1,252,394 XAF

### Webhook Event

**Trigger:** `invoice.payment_succeeded`

**When Fired:**
- Initial subscription payment
- Recurring subscription renewals
- Invoice payments (including upgrades/downgrades with proration)

---

## Quick Reference

### Check Current Balance

**SQL:**
```sql
SELECT 
    merchant_name,
    FORMAT(balance, 2) as balance,
    currency,
    last_updated_at
FROM app_merchant_balances
WHERE merchant_code = 'STRIPE';
```

**PHP:**
```php
use App\Models\AppMerchantBalance;

$stripe = AppMerchantBalance::getStripeBalance();
echo $stripe->formatted_balance; // "1,252,394.00 XAF"
```

### View Recent Updates

```bash
# Last 10 balance updates
grep "Merchant balance added" storage/logs/laravel.log | tail -10

# Watch real-time
tail -f storage/logs/laravel.log | grep "Subscription payment added"
```

### Currency Conversion Examples

| From | To | Calculation |
|------|-----|-------------|
| USD → XAF | $3.99 × 600 = 2,394 XAF |
| EUR → XAF | €5.00 × 700 = 3,500 XAF |
| GBP → XAF | £4.00 × 820 = 3,280 XAF |
| XAF → XAF | 5,000 × 1 = 5,000 XAF (no conversion) |

---

## Setup & Configuration

### 1. Database Setup

Ensure Stripe merchant exists:

```sql
INSERT INTO app_merchant_balances (
    merchant_name, 
    merchant_code, 
    balance, 
    currency, 
    is_active, 
    description
) VALUES (
    'Stripe', 
    'STRIPE', 
    0.00, 
    'XAF', 
    true, 
    'Stripe payment gateway for subscription processing'
) ON DUPLICATE KEY UPDATE 
    merchant_name = 'Stripe',
    is_active = true;
```

### 2. Environment Configuration

Add to `.env`:
```env
# Required
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Optional (for exchange rates)
EXCHANGE_RATE_API_KEY=your_api_key_here
```

### 3. Webhook Configuration

**Stripe Dashboard:**
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/v1/stripe/webhook`
3. Select event: `invoice.payment_succeeded`
4. Copy webhook signing secret to `.env`

---

## Testing

### Quick Test

```bash
# 1. Check current balance
mysql -e "SELECT balance FROM app_merchant_balances WHERE merchant_code='STRIPE';"

# 2. Make test payment in Stripe Dashboard (Test Mode)
#    Use card: 4242 4242 4242 4242
#    Amount: $3.99

# 3. Watch webhook
tail -f storage/logs/laravel.log | grep "invoice.payment"

# 4. Verify balance increased
mysql -e "SELECT balance FROM app_merchant_balances WHERE merchant_code='STRIPE';"
```

### Test Scenarios

| Test | Payment | Expected Increase |
|------|---------|-------------------|
| Same currency | 5,000 XAF | +5,000 XAF |
| USD payment | $3.99 USD | +~2,394 XAF |
| EUR payment | €5.00 EUR | +~3,500 XAF |
| Annual subscription | $39.99 USD | +~23,994 XAF |
| Upgrade (proration) | $2.50 USD | +~1,500 XAF |

---

## Monitoring & Troubleshooting

### Log Locations

**Successful payments:**
```bash
grep "Subscription payment added to Stripe merchant balance" storage/logs/laravel.log | tail -5
```

**Currency conversions:**
```bash
grep "Currency conversion for merchant balance" storage/logs/laravel.log | tail -5
```

**Errors:**
```bash
grep "ERROR.*merchant balance" storage/logs/laravel.log
```

### Common Issues

| Issue | Solution |
|-------|----------|
| "Merchant not found" | Run SQL insert for Stripe merchant |
| Balance not updating | Check webhook logs in Stripe Dashboard |
| Wrong conversion amount | Check exchange rate logs, clear cache if needed |
| Webhook signature failed | Verify `STRIPE_WEBHOOK_SECRET` in `.env` |

### Log Examples

**Currency Conversion:**
```json
{
  "message": "Currency conversion for merchant balance",
  "original_amount": 3.99,
  "original_currency": "USD",
  "converted_amount": 2394.00,
  "merchant_currency": "XAF"
}
```

**Balance Update:**
```json
{
  "message": "Subscription payment added to Stripe merchant balance",
  "amount": 2394.00,
  "currency": "XAF",
  "original_amount": 3.99,
  "original_currency": "USD",
  "new_balance": 1252394.00
}
```

---

## Deployment

### Pre-Deployment Checklist

- [ ] Verify `app_merchant_balances` table exists
- [ ] Check Stripe merchant record exists and is active
- [ ] Configure `STRIPE_WEBHOOK_SECRET` in `.env`
- [ ] Review code changes in `StripeWebhookController.php`
- [ ] Backup merchant balances table

### Deployment Steps

```bash
# 1. Backup database
mysqldump app_merchant_balances > backup_$(date +%Y%m%d).sql

# 2. Deploy code
git pull origin main

# 3. Clear caches
php artisan config:clear
php artisan cache:clear

# 4. Configure Stripe webhook (see Setup section)

# 5. Test in Stripe test mode

# 6. Monitor logs
tail -f storage/logs/laravel.log | grep -E "invoice.payment|merchant balance"
```

### Post-Deployment Verification

- [ ] Webhook shows "Active" in Stripe Dashboard
- [ ] Test payment completes successfully
- [ ] Balance increases correctly
- [ ] Logs show conversion (if different currency)
- [ ] No error logs present

### Rollback Plan

```bash
# 1. Revert code
git revert HEAD
git push origin main

# 2. Restore database (if needed)
mysql database < backup_YYYYMMDD.sql

# 3. Disable webhook in Stripe Dashboard
```

---

## Implementation Details

### Files Modified

**`app/Http/Controllers/Api/V1/StripeWebhookController.php`**
- Added `ExchangeRateService` injection
- Updated `handleInvoicePaymentSucceeded()` method
- Added `addToStripeMerchantBalance()` helper method

### Code Changes

```php
// Constructor - Added ExchangeRateService
public function __construct(
    TransactionService $transactionService, 
    StripeService $stripeService, 
    ExchangeRateService $exchangeRateService
) {
    $this->exchangeRateService = $exchangeRateService;
}

// Invoice payment handler - Added balance update
private function handleInvoicePaymentSucceeded($invoice) {
    // ... existing code to update room subscription ...
    
    // Add payment to Stripe merchant balance
    $this->addToStripeMerchantBalance(
        $amountPaid, 
        $currency, 
        $invoice->id, 
        $roomSubscription->id
    );
}

// New helper method
private function addToStripeMerchantBalance($amount, $currency, $reference, $roomSubscriptionId) {
    $stripeMerchant = AppMerchantBalance::getStripeBalance();
    
    // Convert if currencies differ
    if ($currency !== $stripeMerchant->currency) {
        $amount = $this->exchangeRateService->convertCurrencyExact(
            $amount, 
            $currency, 
            $stripeMerchant->currency
        );
    }
    
    // Add to balance
    $stripeMerchant->addBalance($amount, "Subscription payment - Invoice: {$reference}");
}
```

### Database Schema

**app_merchant_balances table:**
```sql
id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
merchant_name       VARCHAR(255) NOT NULL
merchant_code       VARCHAR(50) NOT NULL UNIQUE
balance             DECIMAL(18, 2) NOT NULL DEFAULT 0.00
currency            VARCHAR(10) NOT NULL
description         TEXT
is_active           BOOLEAN DEFAULT TRUE
metadata            JSON
last_updated_at     TIMESTAMP
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

---

## API Usage

### Get Balance

```php
use App\Models\AppMerchantBalance;

$stripe = AppMerchantBalance::getStripeBalance();

// Get formatted balance
echo $stripe->formatted_balance; // "1,252,394.00 XAF"

// Get full summary
$summary = $stripe->getBalanceSummary();
// Returns:
// [
//     'merchant_code' => 'STRIPE',
//     'merchant_name' => 'Stripe',
//     'balance' => 1252394.00,
//     'currency' => 'XAF',
//     'formatted_balance' => '1,252,394.00 XAF',
//     'is_active' => true,
//     'last_updated_at' => '2025-10-25 14:30:00',
// ]
```

### Manual Adjustments

```php
$stripe = AppMerchantBalance::getStripeBalance();

// Add to balance
$stripe->addBalance(1000.00, 'Manual adjustment - Correction');

// Subtract from balance
$stripe->subtractBalance(500.00, 'Manual adjustment - Refund');

// Set specific balance
$stripe->setBalance(1000000.00, 'Manual adjustment - Reset');

// Check sufficient balance
if ($stripe->hasSufficientBalance(5000)) {
    // Process transaction
}
```

---

## Exchange Rate Service

### Features

- Real-time rates from exchangerate-api.com
- Rates cached for 1 hour
- Automatic fallback rates if API unavailable
- Supports all major currencies

### Usage

```php
use App\Services\ExchangeRateService;

$service = app(ExchangeRateService::class);

// Get exchange rate
$rate = $service->getExchangeRate('USD', 'XAF');
// Returns: 600.0

// Convert with rounding
$amount = $service->convertCurrency(3.99, 'USD', 'XAF');
// Returns: 2394 (integer)

// Convert exact (2 decimal places)
$amount = $service->convertCurrencyExact(3.99, 'USD', 'XAF');
// Returns: 2394.00 (float)

// Convert to XAF
$amount = $service->convertToXaf(3.99, 'USD');
// Returns: 2394
```

---

## Support

### Debug Mode

Enable detailed logging:
```php
Log::debug('Webhook payload', [
    'event_type' => $event->type,
    'invoice' => $invoice,
]);
```

### Resources

- **Logs:** `storage/logs/laravel.log`
- **Stripe Dashboard:** Developers → Webhooks → Event logs
- **Code:** `app/Http/Controllers/Api/V1/StripeWebhookController.php`
- **Model:** `app/Models/AppMerchantBalance.php`
- **Service:** `app/Services/ExchangeRateService.php`

### Related Documentation

- [Stripe Recurring Subscription API](./STRIPE_RECURRING_SUBSCRIPTION_API.md)
- [Subscription Management Guide](./SUBSCRIPTION_MANAGEMENT_GUIDE.md)
- [Subscription Plans Guide](./SUBSCRIPTION_PLANS_COMPLETE_GUIDE.md)

---

**Version:** 1.0  
**Last Updated:** October 25, 2025  
**Status:** ✅ Production Ready

