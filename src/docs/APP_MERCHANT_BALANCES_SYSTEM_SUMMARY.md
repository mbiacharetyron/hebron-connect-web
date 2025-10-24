# App Merchant Balances System Summary

## Overview
Successfully created a comprehensive merchant balances system to track the app's balance per merchant, with initial seeder data for Maviance and Stripe merchants, both initialized to 0.

## System Components

### 1. Database Table: `app_merchant_balances`
- **Migration**: `2025_10_01_090140_create_app_merchant_balances_table.php`
- **Structure**:
  - `id`: Primary key
  - `merchant_name`: Unique merchant name (e.g., Maviance, Stripe)
  - `merchant_code`: Unique merchant code for identification
  - `balance`: Current balance (decimal 15,2, default 0)
  - `currency`: Currency code (default USD)
  - `description`: Merchant description
  - `is_active`: Whether merchant is active (default true)
  - `metadata`: Additional merchant metadata (JSON)
  - `last_updated_at`: Last time balance was updated
  - `created_at`, `updated_at`: Timestamps

### 2. Model: `AppMerchantBalance`
- **File**: `app/Models/AppMerchantBalance.php`
- **Features**:
  - Comprehensive balance management methods
  - Merchant-specific retrieval methods
  - Balance operations (add, subtract, set)
  - Sufficient balance checking
  - Formatted balance display
  - Balance summary generation
  - Model scopes for filtering
  - Comprehensive logging

### 3. Seeder: `AppMerchantBalanceSeeder`
- **File**: `database/seeders/AppMerchantBalanceSeeder.php`
- **Data Created**:
  - **Maviance**: Code `MAVIANCE`, Balance 0.00 XAF
  - **Stripe**: Code `STRIPE`, Balance 0.00 USD
  - Both merchants initialized with comprehensive metadata

## Key Features

### 1. Merchant Management
```php
// Get specific merchants
$mavianceBalance = AppMerchantBalance::getMavianceBalance();
$stripeBalance = AppMerchantBalance::getStripeBalance();

// Get merchant by code
$merchant = AppMerchantBalance::getByCode('MAVIANCE');
```

### 2. Balance Operations
```php
// Add balance
$merchant->addBalance(100.50, 'Payment received');

// Subtract balance
$merchant->subtractBalance(25.25, 'Payment processed');

// Set balance
$merchant->setBalance(500.00, 'Balance adjustment');

// Check sufficient balance
$hasEnough = $merchant->hasSufficientBalance(100.00);
```

### 3. Balance Information
```php
// Get formatted balance
$formattedBalance = $merchant->formatted_balance; // "100.50 USD"

// Get balance summary
$summary = $merchant->getBalanceSummary();
```

### 4. Model Scopes
```php
// Active merchants only
$activeMerchants = AppMerchantBalance::active()->get();

// Specific currency
$usdMerchants = AppMerchantBalance::byCurrency('USD')->get();

// Balance above threshold
$highBalance = AppMerchantBalance::withBalanceAbove(100.00)->get();

// Balance below threshold
$lowBalance = AppMerchantBalance::withBalanceBelow(50.00)->get();
```

## Seeder Data

### Maviance Merchant
- **Code**: `MAVIANCE`
- **Name**: `Maviance`
- **Balance**: `0.00 XAF`
- **Description**: `Maviance payment processor merchant account balance`
- **Metadata**:
  - Payment Processor: Maviance
  - Supported Currencies: USD, XAF
  - Payment Methods: MTN_MOMO, ORANGE_MONEY
  - Commission Rate: maviance_deposit_commission

### Stripe Merchant
- **Code**: `STRIPE`
- **Name**: `Stripe`
- **Balance**: `0.00 USD`
- **Description**: `Stripe payment processor merchant account balance`
- **Metadata**:
  - Payment Processor: Stripe
  - Supported Currencies: USD, EUR, GBP
  - Payment Methods: CARD, BANK_TRANSFER
  - API Version: 2023-10-16

## Testing Results

### ✅ **All Tests Passed**
- **Table Structure**: ✅ Created successfully
- **Model Functions**: ✅ Working correctly
- **Balance Operations**: ✅ Add, subtract, set operations working
- **Seeder Data**: ✅ Maviance and Stripe merchants loaded
- **Scopes & Methods**: ✅ All scopes and methods working
- **Edge Cases**: ✅ Handled properly (small amounts, large amounts, decimal precision)
- **Metadata**: ✅ Stored and retrieved correctly
- **Error Handling**: ✅ Proper error handling and logging

### **Test Coverage**
1. **Database Operations**: Table creation, data insertion, retrieval
2. **Model Functionality**: All model methods and scopes
3. **Balance Operations**: Add, subtract, set, check sufficient balance
4. **Edge Cases**: Small amounts, large amounts, decimal precision
5. **Metadata Management**: JSON metadata storage and retrieval
6. **Error Handling**: Insufficient balance, invalid operations
7. **Performance**: Efficient queries with proper indexing

## Usage Examples

### 1. Basic Balance Management
```php
// Get Maviance balance
$maviance = AppMerchantBalance::getMavianceBalance();

// Add payment received
$maviance->addBalance(1000.00, 'Payment from user');

// Process payment
$maviance->subtractBalance(50.00, 'Payment to merchant');

// Check if sufficient balance
if ($maviance->hasSufficientBalance(500.00)) {
    // Process large payment
}
```

### 2. Balance Monitoring
```php
// Get all active merchants
$merchants = AppMerchantBalance::active()->get();

// Get merchants with low balance
$lowBalanceMerchants = AppMerchantBalance::withBalanceBelow(100.00)->get();

// Get total balance across all merchants
$totalBalance = AppMerchantBalance::sum('balance');
```

### 3. Merchant Information
```php
// Get merchant summary
$summary = $maviance->getBalanceSummary();
/*
{
    "merchant_code": "MAVIANCE",
    "merchant_name": "Maviance",
    "balance": "1000.00",
    "currency": "XAF",
    "formatted_balance": "1000.00 XAF",
    "is_active": true,
    "last_updated_at": "2025-10-01T09:09:18.000000Z",
    "description": "Maviance payment processor merchant account balance"
}
*/

// Access metadata
$metadata = $maviance->metadata;
$supportedCurrencies = $metadata['supported_currencies'];
$paymentMethods = $metadata['payment_methods'];
```

## Database Schema

### Table Structure
```sql
CREATE TABLE app_merchant_balances (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    merchant_name VARCHAR(255) UNIQUE NOT NULL,
    merchant_code VARCHAR(255) UNIQUE NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON NULL,
    last_updated_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX amb_merchant_active_idx (merchant_code, is_active),
    INDEX amb_balance_currency_idx (balance, currency),
    INDEX amb_last_updated_idx (last_updated_at)
);
```

### Sample Data
```sql
INSERT INTO app_merchant_balances VALUES 
(1, 'Maviance', 'MAVIANCE', 0.00, 'XAF', 'Maviance payment processor merchant account balance', 1, '{"payment_processor":"Maviance","supported_currencies":["USD","XAF"],"payment_methods":["MTN_MOMO","ORANGE_MONEY"],"commission_rate":"maviance_deposit_commission","created_by":"seeder"}', NOW(), NOW(), NOW()),
(2, 'Stripe', 'STRIPE', 0.00, 'USD', 'Stripe payment processor merchant account balance', 1, '{"payment_processor":"Stripe","supported_currencies":["USD","EUR","GBP"],"payment_methods":["CARD","BANK_TRANSFER"],"api_version":"2023-10-16","created_by":"seeder"}', NOW(), NOW(), NOW());
```

## Integration Points

### 1. Payment Processing
- Update Maviance balance when MTN/Orange payments are processed
- Update Stripe balance when card payments are processed
- Track commission fees and merchant amounts

### 2. Wallet Transactions
- Link merchant balances with wallet transactions
- Track balance changes through transaction history
- Monitor merchant account health

### 3. Financial Reporting
- Generate merchant balance reports
- Track balance changes over time
- Monitor merchant account performance

## Performance Features

### 1. Database Optimization
- Efficient indexes for common queries
- Optimized balance operations
- Proper data types for currency amounts

### 2. Model Efficiency
- Cached merchant lookups
- Efficient balance calculations
- Minimal database queries

### 3. Logging and Monitoring
- Comprehensive logging for all balance operations
- Error tracking and debugging
- Performance monitoring

## Security Features

### 1. Data Integrity
- Decimal precision for currency amounts
- Proper validation for balance operations
- Transaction safety for balance updates

### 2. Access Control
- Model-level access to merchant balances
- Proper error handling for invalid operations
- Audit trail through logging

### 3. Error Handling
- Insufficient balance protection
- Invalid operation prevention
- Comprehensive error logging

## Future Enhancements

### 1. Advanced Features
- Balance alerts for low amounts
- Automated balance updates
- Balance forecasting and analytics

### 2. Integration Features
- Real-time balance updates
- Webhook notifications
- API endpoints for balance management

### 3. Reporting Features
- Balance history tracking
- Merchant performance analytics
- Financial reporting dashboards

## Conclusion

The App Merchant Balances System is now fully functional and provides:

- ✅ **Comprehensive merchant balance tracking**
- ✅ **Maviance and Stripe merchants initialized to 0**
- ✅ **Full balance management capabilities**
- ✅ **Robust error handling and logging**
- ✅ **Efficient database operations**
- ✅ **Comprehensive testing coverage**
- ✅ **Ready for production use**

The system is ready to be integrated with payment processing workflows and provides a solid foundation for merchant account management.
