# Phone Number Validation Implementation

This document describes the comprehensive phone number validation system implemented for MTN and Orange payment methods in the Hebron Connect Backend.

## Table of Contents

1. [Overview](#overview)
2. [Phone Validation Service](#phone-validation-service)
3. [Validation Patterns](#validation-patterns)
4. [Integration](#integration)
5. [Examples](#examples)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Overview

The phone validation system ensures that only valid MTN and Orange Cameroon phone numbers are accepted for payment processing. The system includes:

- **Pattern Validation**: Regex-based validation for MTN and Orange numbers
- **Format Standardization**: Automatic formatting to standard format
- **Error Handling**: Comprehensive error messages
- **Logging**: Detailed validation logging
- **Reusability**: Service-based architecture for reuse across the application

---

## Phone Validation Service

### **Service Location**
`app/Services/PhoneValidationService.php`

### **Key Methods**

#### **1. validateMTNPhone(string $phoneNumber): array**
Validates MTN Cameroon phone numbers.

```php
$result = PhoneValidationService::validateMTNPhone('237650123456');
// Returns: ['is_valid' => true, 'errors' => [], 'formatted_number' => '237650123456']
```

#### **2. validateOrangePhone(string $phoneNumber): array**
Validates Orange Cameroon phone numbers.

```php
$result = PhoneValidationService::validateOrangePhone('237655123456');
// Returns: ['is_valid' => true, 'errors' => [], 'formatted_number' => '237655123456']
```

#### **3. validatePhoneForPaymentMethod(string $phoneNumber, string $paymentMethod): array**
Validates phone number based on payment method.

```php
$result = PhoneValidationService::validatePhoneForPaymentMethod('650123456', 'MTN');
// Returns: ['is_valid' => true, 'errors' => [], 'formatted_number' => '237650123456']
```

#### **4. formatMTNPhone(string $phoneNumber): string**
Formats MTN phone number to standard format.

```php
$formatted = PhoneValidationService::formatMTNPhone('650123456');
// Returns: '237650123456'
```

#### **5. formatOrangePhone(string $phoneNumber): string**
Formats Orange phone number to standard format.

```php
$formatted = PhoneValidationService::formatOrangePhone('655123456');
// Returns: '237655123456'
```

---

## Validation Patterns

### **MTN Cameroon Numbers**

#### **Pattern**
```
^(237)?((650|651|652|653|654|680|681|682|683|684)[0-9]{6}$|(68[0-9]{7})$|(67[0-9]{7})$|(4673312345[0-9]{1})$)
```

#### **Valid Prefixes**
- **650, 651, 652, 653, 654**: Standard MTN prefixes
- **680, 681, 682, 683, 684**: Extended MTN prefixes
- **68x**: 7-digit numbers starting with 68
- **67x**: 7-digit numbers starting with 67
- **4673312345x**: Special MTN numbers

#### **Valid Examples**
```
237650123456  ✅ (with country code)
650123456     ✅ (without country code)
681234567     ✅ (68x series)
671234567     ✅ (67x series)
46733123456   ✅ (special number)
237680123456  ✅ (680 series)
237681123456  ✅ (681 series)
237682123456  ✅ (682 series)
237683123456  ✅ (683 series)
237684123456  ✅ (684 series)
```

#### **Invalid Examples**
```
237655123456  ❌ (Orange number)
237123456789  ❌ (Invalid prefix)
65012345      ❌ (Too short)
6501234567    ❌ (Too long)
```

### **Orange Cameroon Numbers**

#### **Pattern**
```
^(237)?((655|656|657|658|659|686|687|688|689)[0-9]{6}$|(69[0-9]{7})$)
```

#### **Valid Prefixes**
- **655, 656, 657, 658, 659**: Standard Orange prefixes
- **686, 687, 688, 689**: Extended Orange prefixes
- **69x**: 7-digit numbers starting with 69

#### **Valid Examples**
```
237655123456  ✅ (with country code)
655123456     ✅ (without country code)
691234567     ✅ (69x series)
237656123456  ✅ (656 series)
237657123456  ✅ (657 series)
237658123456  ✅ (658 series)
237659123456  ✅ (659 series)
237686123456  ✅ (686 series)
237687123456  ✅ (687 series)
237688123456  ✅ (688 series)
237689123456  ✅ (689 series)
```

#### **Invalid Examples**
```
237650123456  ❌ (MTN number)
237123456789  ❌ (Invalid prefix)
65512345      ❌ (Too short)
6551234567    ❌ (Too long)
```

---

## Integration

### **Contribution Payment Controller**

The phone validation is integrated into the contribution payment flow:

```php
// Enhanced phone validation using PhoneValidationService
if (!empty($collectPhone)) {
    $phoneValidation = PhoneValidationService::validateAndFormatPhone($collectPhone, $method);
    
    if (!$phoneValidation['is_valid']) {
        Log::warning('Contribution payment failed due to invalid phone number', [
            'phone_number' => $collectPhone,
            'payment_method' => $method,
            'validation_errors' => $phoneValidation['errors']
        ]);
        
        return $this->result_fail(
            'Invalid phone number for ' . $method . ' payment method: ' . implode(', ', $phoneValidation['errors']),
            412
        );
    }
    
    // Use formatted phone number
    $collectPhone = $phoneValidation['formatted_number'];
}
```

### **Laravel Validation Rules**

The system also includes Laravel validation rules for form validation:

```php
// Validation for Orange numbers
$validator->sometimes('phone_number', [
    'regex:/^(237)?((655|656|657|658|659|686|687|688|689)[0-9]{6}$|(69[0-9]{7})$)/'
], function ($input) use (&$validator) {
    if ($input->payment_method === 'ORANGE' && !empty($input->phone_number)) {
        $validator->setCustomMessages(['phone_number.regex' => 'The phone number must be a valid Orange Cameroon number.']);
        return true;
    }
    return false;
});

// Validation for MTN numbers
$validator->sometimes('phone_number', [
    'regex:/^(237)?((650|651|652|653|654|680|681|682|683|684)[0-9]{6}$|(68[0-9]{7})$|(67[0-9]{7})$|(4673312345[0-9]{1})$)/'
], function ($input) use (&$validator) {
    if ($input->payment_method === 'MTN' && !empty($input->phone_number)) {
        $validator->setCustomMessages(['phone_number.regex' => 'The phone number must be a valid MTN Cameroon number.']);
        return true;
    }
    return false;
});
```

---

## Examples

### **API Request Examples**

#### **Valid MTN Payment**
```json
{
  "amount": 1000,
  "currency": "XAF",
  "payment_method": "MTN",
  "phone_number": "237650123456"
}
```

#### **Valid Orange Payment**
```json
{
  "amount": 5000,
  "currency": "XAF",
  "payment_method": "ORANGE",
  "phone_number": "237655123456"
}
```

#### **Payment Without Phone Number**
```json
{
  "amount": 2000,
  "currency": "XAF",
  "payment_method": "MTN"
}
```

### **Validation Examples**

#### **MTN Validation**
```php
// Valid numbers
PhoneValidationService::validateMTNPhone('237650123456'); // ✅ Valid
PhoneValidationService::validateMTNPhone('650123456');     // ✅ Valid
PhoneValidationService::validateMTNPhone('681234567');    // ✅ Valid

// Invalid numbers
PhoneValidationService::validateMTNPhone('237655123456'); // ❌ Orange number
PhoneValidationService::validateMTNPhone('65012345');     // ❌ Too short
```

#### **Orange Validation**
```php
// Valid numbers
PhoneValidationService::validateOrangePhone('237655123456'); // ✅ Valid
PhoneValidationService::validateOrangePhone('655123456');    // ✅ Valid
PhoneValidationService::validateOrangePhone('691234567');    // ✅ Valid

// Invalid numbers
PhoneValidationService::validateOrangePhone('237650123456'); // ❌ MTN number
PhoneValidationService::validateOrangePhone('65512345');    // ❌ Too short
```

---

## Error Handling

### **Validation Errors**

#### **Invalid Phone Number**
```json
{
  "status": "error",
  "message": "Invalid phone number for MTN payment method: The phone number must be a valid MTN Cameroon number."
}
```

#### **Invalid Payment Method**
```json
{
  "status": "error",
  "message": "Invalid phone number for INVALID payment method: Invalid payment method provided."
}
```

### **Logging**

#### **Successful Validation**
```json
{
  "level": "info",
  "message": "Phone number validated and formatted",
  "context": {
    "original_phone": "650123456",
    "formatted_phone": "237650123456",
    "payment_method": "MTN"
  }
}
```

#### **Failed Validation**
```json
{
  "level": "warning",
  "message": "Contribution payment failed due to invalid phone number",
  "context": {
    "phone_number": "123456789",
    "payment_method": "MTN",
    "validation_errors": ["The phone number must be a valid MTN Cameroon number."]
  }
}
```

---

## Testing

### **Unit Test Examples**

```php
// Test MTN validation
public function testMTNPhoneValidation()
{
    $validNumbers = ['237650123456', '650123456', '681234567'];
    $invalidNumbers = ['237655123456', '65012345', '123456789'];
    
    foreach ($validNumbers as $number) {
        $result = PhoneValidationService::validateMTNPhone($number);
        $this->assertTrue($result['is_valid']);
    }
    
    foreach ($invalidNumbers as $number) {
        $result = PhoneValidationService::validateMTNPhone($number);
        $this->assertFalse($result['is_valid']);
    }
}

// Test Orange validation
public function testOrangePhoneValidation()
{
    $validNumbers = ['237655123456', '655123456', '691234567'];
    $invalidNumbers = ['237650123456', '65512345', '123456789'];
    
    foreach ($validNumbers as $number) {
        $result = PhoneValidationService::validateOrangePhone($number);
        $this->assertTrue($result['is_valid']);
    }
    
    foreach ($invalidNumbers as $number) {
        $result = PhoneValidationService::validateOrangePhone($number);
        $this->assertFalse($result['is_valid']);
    }
}
```

### **Integration Test Examples**

```php
// Test payment method validation
public function testPaymentMethodValidation()
{
    $testCases = [
        ['phone' => '650123456', 'method' => 'MTN', 'expected' => true],
        ['phone' => '655123456', 'method' => 'ORANGE', 'expected' => true],
        ['phone' => '650123456', 'method' => 'ORANGE', 'expected' => false],
        ['phone' => '655123456', 'method' => 'MTN', 'expected' => false],
    ];
    
    foreach ($testCases as $case) {
        $result = PhoneValidationService::validatePhoneForPaymentMethod($case['phone'], $case['method']);
        $this->assertEquals($case['expected'], $result['is_valid']);
    }
}
```

---

## Configuration

### **Environment Variables**

No additional environment variables are required for phone validation. The validation patterns are hardcoded based on Cameroon mobile number standards.

### **Database Configuration**

Phone validation does not require database configuration. All validation rules are defined in the service class.

---

## Performance Considerations

### **Validation Performance**
- **Regex Matching**: Fast regex-based validation
- **Memory Usage**: Minimal memory footprint
- **Processing Time**: Sub-millisecond validation time
- **Caching**: No caching required for validation

### **Optimization Tips**
- Use validation service for consistent validation across the application
- Implement validation early in the request lifecycle
- Log validation failures for monitoring and debugging
- Use formatted phone numbers for consistent processing

---

## Security Considerations

### **Input Sanitization**
- Phone numbers are cleaned of non-digit characters (except +)
- Country code is automatically added if missing
- Invalid characters are stripped before validation

### **Validation Security**
- Strict regex patterns prevent injection attacks
- Phone number length validation prevents buffer overflow
- Format standardization prevents inconsistent data

---

## Maintenance

### **Pattern Updates**
To update validation patterns:

1. **Update Regex Patterns**: Modify patterns in `PhoneValidationService.php`
2. **Update Tests**: Add test cases for new patterns
3. **Update Documentation**: Update this documentation
4. **Deploy Changes**: Deploy updated service

### **Adding New Carriers**
To add support for new carriers:

1. **Add Validation Method**: Create new validation method
2. **Add Formatting Method**: Create new formatting method
3. **Update Integration**: Update controller integration
4. **Add Tests**: Create comprehensive test suite
5. **Update Documentation**: Update all documentation

---

## Troubleshooting

### **Common Issues**

#### **1. Validation Always Fails**
- **Cause**: Incorrect regex pattern
- **Solution**: Verify pattern against valid phone numbers
- **Debug**: Check pattern with regex tester

#### **2. Formatting Issues**
- **Cause**: Incorrect country code handling
- **Solution**: Verify country code logic
- **Debug**: Check formatting method output

#### **3. Integration Errors**
- **Cause**: Missing service import
- **Solution**: Add `use App\Services\PhoneValidationService;`
- **Debug**: Check autoloader and namespace

### **Debug Information**
- Enable detailed logging for validation failures
- Check service method return values
- Verify regex patterns with online testers
- Test with known valid/invalid numbers

---

## Support

For issues with phone validation:

1. **Check Logs**: Review validation logs for error details
2. **Test Patterns**: Verify regex patterns with test numbers
3. **Validate Integration**: Ensure service is properly imported
4. **Review Documentation**: Check this documentation for usage examples
5. **Contact Support**: Reach out to development team for assistance
