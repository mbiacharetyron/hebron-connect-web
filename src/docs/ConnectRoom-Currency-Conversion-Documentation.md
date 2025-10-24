# Connect Room Currency Conversion Documentation

## Overview
When updating a connect room's currency, the system automatically converts the room's wallet balances (both available and locked) to the new currency using real-time exchange rates. This ensures that the room's financial data remains consistent and accurate after currency changes.

## Feature Details

### Automatic Currency Conversion
- **Trigger**: When the `currency` field is updated in a connect room
- **Scope**: Both `available_balance` and `locked_balance` in the room's wallet
- **Exchange Rate Service**: Uses the same `ExchangeRateService` as other parts of the application
- **Rounding**: All converted amounts are rounded to 2 decimal places

### Supported Currencies
The system supports the following currencies for conversion:
- USD (US Dollar)
- EUR (Euro)
- XAF (Central African CFA Franc)
- XOF (West African CFA Franc)
- CAD (Canadian Dollar)
- GBP (British Pound)
- JPY (Japanese Yen)
- CHF (Swiss Franc)
- AUD (Australian Dollar)
- CNY (Chinese Yuan)

## Implementation Details

### API Endpoint
```
PUT /api/v1/connect-room/{room}
```

### Request Body
```json
{
  "currency": "EUR"
}
```

### Currency Conversion Logic with Transaction and Row Locking
```php
// Start database transaction
DB::beginTransaction();

try {
    // Update the room
    $room->update($updateData);
    
    // Lock the wallet row to prevent concurrent modifications
    $wallet = $room->wallet()->lockForUpdate()->first();
    
    if (!$wallet) {
        throw new \Exception('Wallet not found or could not be locked');
    }
    
    // Only convert if currencies are different
    if ($oldCurrency !== $newCurrency) {
        $exchangeRateService = app(ExchangeRateService::class);
        
        // Convert available balance
        $convertedAvailableBalance = $exchangeRateService->convertCurrencyExact(
            $oldAvailableBalance, 
            $oldCurrency, 
            $newCurrency
        );
        $convertedAvailableBalance = round($convertedAvailableBalance, 2);
        
        // Convert locked balance
        $convertedLockedBalance = $exchangeRateService->convertCurrencyExact(
            $oldLockedBalance, 
            $oldCurrency, 
            $newCurrency
        );
        $convertedLockedBalance = round($convertedLockedBalance, 2);
        
        // Update wallet with new currency and converted balances
        $wallet->update([
            'currency' => $newCurrency,
            'available_balance' => $convertedAvailableBalance,
            'locked_balance' => $convertedLockedBalance
        ]);
    }
    
    // Commit the transaction (releases the row lock)
    DB::commit();
    
} catch (\Exception $e) {
    // Rollback the transaction on any error (releases the row lock)
    DB::rollBack();
    throw $e;
}
```

## Example Scenarios

### Scenario 1: XAF to USD Conversion
**Before Update:**
- Currency: XAF
- Available Balance: 100,000 XAF
- Locked Balance: 50,000 XAF

**After Update (Currency changed to USD):**
- Currency: USD
- Available Balance: 166.67 USD (100,000 XAF ÷ 600)
- Locked Balance: 83.33 USD (50,000 XAF ÷ 600)

### Scenario 2: USD to EUR Conversion
**Before Update:**
- Currency: USD
- Available Balance: 100.00 USD
- Locked Balance: 50.00 USD

**After Update (Currency changed to EUR):**
- Currency: EUR
- Available Balance: 85.00 EUR (100 USD × 0.85)
- Locked Balance: 42.50 EUR (50 USD × 0.85)

## Logging and Audit Trail

### Log Information
The system logs detailed information about currency conversions including lock details:

```php
Log::info('Wallet currency and balances converted with row lock', [
    'room_id' => $room->id,
    'wallet_id' => $wallet->id,
    'old_currency' => $oldCurrency,
    'new_currency' => $newCurrency,
    'old_available_balance' => $oldAvailableBalance,
    'new_available_balance' => $convertedAvailableBalance,
    'old_locked_balance' => $oldLockedBalance,
    'new_locked_balance' => $convertedLockedBalance,
    'exchange_rate_available' => $exchangeRateService->getExchangeRate($oldCurrency, $newCurrency),
    'exchange_rate_locked' => $exchangeRateService->getExchangeRate($oldCurrency, $newCurrency),
    'locked_by_user' => $user->id
]);
```

### Log Example
```
[2024-03-15 10:30:00] local.INFO: Wallet currency and balances converted with row lock {
    "room_id": 123,
    "wallet_id": 456,
    "old_currency": "XAF",
    "new_currency": "USD",
    "old_available_balance": 100000.00,
    "new_available_balance": 166.67,
    "old_locked_balance": 50000.00,
    "new_locked_balance": 83.33,
    "exchange_rate_available": 600.0,
    "exchange_rate_locked": 600.0,
    "locked_by_user": 789
}
```

## Row-Level Locking

### Concurrent Access Prevention
- **Wallet Locking**: The wallet row is locked using `lockForUpdate()` to prevent concurrent modifications
- **Exclusive Access**: Only one user can modify the wallet at a time during currency conversion
- **Lock Duration**: The lock is held for the duration of the database transaction
- **Automatic Release**: Locks are automatically released when the transaction commits or rolls back

### Lock Implementation
```php
// Lock the wallet row to prevent concurrent modifications
$wallet = $room->wallet()->lockForUpdate()->first();

if (!$wallet) {
    throw new \Exception('Wallet not found or could not be locked');
}
```

### Benefits of Row Locking
- **Prevents Race Conditions**: Eliminates concurrent modification issues
- **Data Consistency**: Ensures wallet balances are always accurate during conversion
- **Financial Integrity**: Prevents double-spending or balance corruption
- **Audit Trail**: Logs which user holds the lock for accountability

## Error Handling

### Exchange Rate Service Failures
- **Fallback Rates**: If the exchange rate API is unavailable, fallback rates are used
- **Logging**: All conversion attempts are logged for audit purposes
- **Transaction Safety**: Currency conversion is performed within the same database transaction as the room update
- **Lock Safety**: Row locks are automatically released on transaction rollback

### Edge Cases
- **Same Currency**: If the new currency is the same as the old currency, no conversion is performed
- **Zero Balances**: Conversion works correctly with zero balances
- **Missing Wallet**: If the room doesn't have a wallet, no conversion is attempted
- **Transaction Failures**: If any part of the update fails, the entire transaction is rolled back, ensuring data consistency
- **Lock Acquisition Failures**: If the wallet cannot be locked, the operation fails with an appropriate error
- **Concurrent Requests**: Multiple simultaneous currency update requests will be queued, with only one proceeding at a time

## Security and Authorization

### Access Control
- Only room owners and admins can update room currency
- Currency conversion is performed automatically when authorized users update the currency

### Data Integrity
- All conversions are performed using the same exchange rate service used throughout the application
- Balances are rounded to 2 decimal places for consistency
- Database transactions ensure data consistency - all room and wallet updates are wrapped in a transaction block
- Automatic rollback on any error ensures no partial updates occur
- Row-level locking prevents concurrent modifications to the wallet during currency conversion

## API Response

### Success Response
```json
{
  "status": "success",
  "message": "Room updated successfully",
  "data": {
    "id": 123,
    "name": "My Connect Room",
    "currency": "USD",
    "wallet": {
      "available_balance": 166.67,
      "locked_balance": 83.33,
      "currency": "USD",
      "is_active": true
    }
  }
}
```

### Response Notes
- The response includes the updated wallet information with converted balances
- All monetary amounts are displayed in the new currency
- The wallet object is only included for room owners and admins

## Testing Considerations

### Test Scenarios
1. **Currency Change with Balances**: Test conversion with non-zero balances
2. **Same Currency Update**: Ensure no conversion occurs when currency is unchanged
3. **Zero Balance Conversion**: Test conversion with zero balances
4. **Exchange Rate API Failure**: Test fallback rate usage
5. **Authorization**: Test that only owners/admins can change currency

### Test Data Examples
```php
// Test case: XAF to USD conversion
$room = ConnectRoom::factory()->create(['currency' => 'XAF']);
$wallet = ConnectRoomWallet::factory()->create([
    'room_id' => $room->id,
    'currency' => 'XAF',
    'available_balance' => 100000.00,
    'locked_balance' => 50000.00
]);

// Update currency to USD
$response = $this->putJson("/api/v1/connect-room/{$room->id}", [
    'currency' => 'USD'
]);

// Assert balances are converted
$wallet->refresh();
$this->assertEquals('USD', $wallet->currency);
$this->assertEquals(166.67, $wallet->available_balance);
$this->assertEquals(83.33, $wallet->locked_balance);
```

## Related Features

### Integration Points
- **Exchange Rate Service**: Uses the same service as payment processing
- **Wallet Management**: Integrates with existing wallet functionality
- **Room Management**: Part of the connect room update workflow
- **Audit Logging**: Consistent with other financial operations

### Future Enhancements
- **Historical Exchange Rates**: Could be enhanced to use historical rates for audit purposes
- **Conversion Notifications**: Could notify room members of currency changes
- **Bulk Currency Updates**: Could support updating multiple rooms' currencies

## Version History

- **v1.0** - Initial implementation with automatic currency conversion
- **v1.1** - Added comprehensive logging and audit trail
- **v1.2** - Enhanced error handling and fallback rate support

---

*Last Updated: [Current Date]*
*Feature Version: v1.2*
