# Currency Conversion Implementation for MTN and Orange Money Payments

## Overview
Implemented automatic currency conversion for MTN and Orange money payments when the contribution currency is different from XAF. The system converts the amount to XAF before processing the payment, ensuring compatibility with the mobile money services.

## Key Features

### 1. Minimum Amount Validation
- **XAF Currency**: Minimum deposit amount is 100 XAF
- **Other Currencies**: Minimum deposit amount is 1 unit
- **Validation**: Applied both at request validation and business logic levels
- **Error Messages**: Clear, currency-specific error messages

### 2. Automatic Currency Detection
- **Trigger**: When contribution currency ≠ XAF
- **Action**: Automatically converts amount to XAF before payment processing
- **Fallback**: Continues with original currency if conversion fails

### 3. Exchange Rate Service
- **API Source**: exchangerate-api.com
- **Caching**: 1-hour cache for exchange rates
- **Fallback Rates**: Predefined rates when API is unavailable
- **Multi-Currency Support**: Supports USD, EUR, GBP, CAD, JPY, CHF, AUD, CNY, XOF
- **Rounding**: All converted amounts and fees rounded to nearest whole number

### 4. Comprehensive Logging
- **Conversion Details**: Original amount, converted amount, exchange rate
- **Source Tracking**: API vs fallback rate source
- **Error Handling**: Detailed error logging for failed conversions

## Implementation Details

### ExchangeRateService
**Location**: `app/Services/ExchangeRateService.php`

**Key Methods**:
- `getExchangeRate($fromCurrency, $toCurrency)` - Get exchange rate between currencies
- `convertCurrency($amount, $fromCurrency, $toCurrency)` - Convert amount between currencies (returns whole number)
- `convertToXaf($amount, $fromCurrency)` - Convert any currency to XAF (returns whole number)
- `needsConversion($fromCurrency, $toCurrency)` - Check if conversion is needed

**Supported Currencies**:
- USD, EUR, GBP, CAD, JPY, CHF, AUD, CNY, XOF, XAF

**Fallback Rates** (when API unavailable):
```php
'USD' => ['XAF' => 600.0, 'EUR' => 0.85, ...],
'EUR' => ['XAF' => 700.0, 'USD' => 1.18, ...],
'GBP' => ['XAF' => 820.0, 'USD' => 1.37, ...],
// ... more currencies
```

### Payment Controller Integration
**Location**: `app/Http/Controllers/Api/V1/ConnectRoomContributionPaymentController.php`

**Minimum Amount Validation**:
```php
// Get currency from request to determine minimum amount
$requestCurrency = $request->input('currency');
$minimumAmount = ($requestCurrency === 'XAF') ? 100 : 1;

// Validate request with dynamic minimum
$validator = Validator::make($request->all(), [
    'amount' => "required|numeric|min:{$minimumAmount}",
    'currency' => 'required|string',
    'payment_method' => 'required|in:MTN,ORANGE',
    'phone_number' => 'nullable|string|min:9|max:15'
], [
    'amount.min' => "The minimum deposit amount for {$requestCurrency} is {$minimumAmount}.",
    // ... other messages
]);

// Additional business logic validation
if ($amount < $minimumAmount) {
    return $this->result_fail(
        "Minimum deposit amount for {$currency} is {$minimumAmount}",
        400
    );
}
```

**Conversion Logic**:
```php
// Convert amount to XAF if currency is different
$originalAmount = $amount;
$originalCurrency = $currency;
$conversionRate = 1.0;
$conversionInfo = null;

if ($this->exchangeRateService->needsConversion($currency, 'XAF')) {
    $conversionInfo = $this->exchangeRateService->getExchangeRateInfo($currency, 'XAF');
    $conversionRate = $conversionInfo['rate'];
    $amount = (int) $this->exchangeRateService->convertToXaf($amount, $currency);
    $currency = 'XAF'; // Update currency to XAF for payment processing
}

// Fee calculation with whole number rounding
$appfeeAmount = (int) round($this->walletTransactionService->calculateAppFeeAmount($amount));
$merchantfeeAmount = (int) round($this->walletTransactionService->calculateMerchantFeeAmount($amount));
```

## Payment Flow with Currency Conversion

### 1. Payment Initialization
1. **User Request**: User initiates payment with amount in contribution currency
2. **Minimum Validation**: Validates amount meets minimum requirements (100 XAF or 1 for other currencies)
3. **Currency Check**: System checks if currency ≠ XAF
4. **Conversion**: If needed, converts amount to XAF using exchange rate
5. **Fee Calculation**: Calculates fees based on converted XAF amount
6. **Payment Processing**: Processes payment with converted amount

### 2. Transaction Recording
- **Original Amount**: Stored in metadata for reference
- **Converted Amount**: Used for actual payment processing
- **Exchange Rate**: Recorded for audit trail
- **Conversion Source**: API or fallback rate source

### 3. Logging and Audit Trail
```php
Log::info('Currency conversion applied for contribution payment', [
    'original_amount' => $originalAmount,
    'original_currency' => $originalCurrency,
    'converted_amount' => $amount,
    'converted_currency' => $currency,
    'conversion_rate' => $conversionRate,
    'conversion_source' => $conversionInfo['source'] ?? 'unknown'
]);
```

## Metadata Storage

### Transaction Metadata
Each transaction includes conversion information:
```json
{
  "contribution_id": 123,
  "contribution_title": "Monthly Contribution",
  "contribution_type": "monthly",
  "deadline": "2024-12-31",
  "ptn": "MTN_PTN_123456",
  "trid": "TRID_789012",
  "receipt_number": "REC_345678",
  "phone_number": "+237123456789",
  "original_amount": 10.00,
  "original_currency": "USD",
  "conversion_rate": 600.0,
  "conversion_source": "api"
}
```

## Error Handling

### 1. API Failure
- **Scenario**: Exchange rate API is unavailable
- **Action**: Uses predefined fallback rates
- **Logging**: Logs fallback usage with warning level

### 2. Conversion Failure
- **Scenario**: Exception during conversion process
- **Action**: Continues with original currency
- **Logging**: Logs error and continues processing

### 3. Invalid Currency
- **Scenario**: Unsupported currency code
- **Action**: Uses fallback rate of 1.0 (no conversion)
- **Logging**: Logs warning about unsupported currency

## Benefits

### 1. User Experience
- **Seamless**: Users can contribute in their preferred currency
- **Transparent**: Conversion details are logged and stored
- **Reliable**: Fallback rates ensure payment processing continues

### 2. Business Logic
- **Compatibility**: MTN/Orange payments always use XAF
- **Accuracy**: Real-time exchange rates when available
- **Audit Trail**: Complete conversion history for compliance

### 3. Technical Benefits
- **Caching**: Reduces API calls and improves performance
- **Fallback**: Ensures system reliability even when API fails
- **Logging**: Comprehensive audit trail for troubleshooting
- **Whole Number Rounding**: All amounts and fees rounded to nearest whole number for simplicity

## Configuration

### Exchange Rate API
**URL**: `https://api.exchangerate-api.com/v4/latest/{currency}`
**Cache Duration**: 1 hour
**Timeout**: 10 seconds

### Fallback Rates
Fallback rates are updated based on current market conditions and can be modified in the `ExchangeRateService` class.

## Testing Scenarios

### 1. Minimum Amount Validation
- **Input**: XAF 50 contribution
- **Expected**: Validation error - "Minimum deposit amount for XAF is 100"
- **Verification**: Check validation response

### 2. Minimum Amount Validation (Other Currency)
- **Input**: USD 0.5 contribution
- **Expected**: Validation error - "Minimum deposit amount for USD is 1"
- **Verification**: Check validation response

### 3. Successful Conversion
- **Input**: USD 10.00 contribution
- **Expected**: XAF 6000 payment (rate: 600, rounded to whole number)
- **Verification**: Check logs and transaction metadata

### 4. API Failure
- **Scenario**: API unavailable
- **Expected**: Uses fallback rate
- **Verification**: Check logs for fallback usage

### 5. Same Currency
- **Input**: XAF 5000.00 contribution
- **Expected**: No conversion, XAF 5000 payment
- **Verification**: Conversion rate = 1.0

### 6. Unsupported Currency
- **Input**: Unsupported currency
- **Expected**: Uses fallback rate of 1.0
- **Verification**: Check logs for warning

## Monitoring

### Key Metrics
- **Conversion Success Rate**: Percentage of successful conversions
- **API Availability**: Exchange rate API uptime
- **Fallback Usage**: Frequency of fallback rate usage
- **Conversion Accuracy**: Comparison with market rates

### Log Analysis
- **Search**: `Currency conversion applied for contribution payment`
- **Monitor**: Conversion rates and sources
- **Alert**: On high fallback usage or conversion failures

## Future Enhancements

### 1. Multiple Exchange Rate Providers
- **Primary**: exchangerate-api.com
- **Secondary**: Alternative providers for redundancy
- **Fallback**: Local rate database

### 2. Rate Validation
- **Range Checking**: Validate rates against reasonable ranges
- **Historical Comparison**: Compare with historical rates
- **Alert System**: Notify on unusual rate changes

### 3. User Interface
- **Rate Display**: Show conversion rate to users
- **Amount Preview**: Display converted amount before payment
- **Rate History**: Show recent exchange rates

### 4. Advanced Caching
- **Redis**: Use Redis for distributed caching
- **Rate Updates**: Real-time rate updates
- **Cache Invalidation**: Smart cache invalidation strategies
