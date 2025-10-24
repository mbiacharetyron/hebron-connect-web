# WhatsApp OTP Implementation for Hebron Connect Backend

This document explains the WhatsApp OTP implementation that has been added to the hebron-connect-backend project, based on the successful implementation from h-cab-backend-v2.

## Overview

The WhatsApp OTP feature allows users to receive One-Time Password (OTP) codes via WhatsApp in addition to the existing SMS and email methods. This implementation supports both Twilio WhatsApp and Meta WhatsApp Business API, with automatic fallback mechanisms.

## Features

- **Dual WhatsApp Support**: Both Twilio WhatsApp and Meta WhatsApp Business API
- **Automatic Fallback**: If Meta WhatsApp fails, automatically tries Twilio WhatsApp
- **Non-blocking**: WhatsApp failures don't prevent SMS/email OTP from being sent
- **Comprehensive Logging**: Detailed logging for debugging and monitoring
- **Template Support**: Support for both custom messages and Meta WhatsApp templates
- **Phone Number Formatting**: Automatic phone number formatting for different APIs
- **Regional SMS Optimization**: SMS OTP only sent to Cameroon numbers (+237) to optimize costs

## Architecture

### Services

1. **WhatsAppService** (`app/Services/WhatsAppService.php`)
   - Handles Twilio WhatsApp integration
   - Supports regular messages, OTP messages, and template messages
   - Uses Twilio SDK for message delivery

2. **MetaWhatsAppService** (`app/Services/MetaWhatsAppService.php`)
   - Handles Meta WhatsApp Business API integration
   - Supports authentication templates with OTP buttons
   - Uses HTTP client for API communication

### Controllers

1. **WhatsAppController** (`app/Http/Controllers/Api/V1/WhatsAppController.php`)
   - Public endpoints for testing WhatsApp functionality
   - Send messages, OTP, and templates via Twilio WhatsApp

2. **MetaWhatsAppController** (`app/Http/Controllers/Api/V1/MetaWhatsAppController.php`)
   - Public endpoints for testing Meta WhatsApp functionality
   - Send authentication messages, templates, and OTP via Meta WhatsApp

### Integration Points

The WhatsApp OTP functionality has been integrated into existing OTP flows:

- **Registration OTP**: `RegisterController::sendOTP()`
- **Login OTP**: `LoginController::forgotPassword()`
- **Password Reset OTP**: `ProfileController::forgotPassword()`

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

#### Twilio Configuration
```env
# Twilio SMS (existing)
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_NUMBER=your_twilio_phone_number

# Twilio WhatsApp (new)
TWILIO_WHATSAPP_NUMBER=whatsapp:your_twilio_whatsapp_number
TWILIO_MESSAGING_SERVICE_SID=your_twilio_messaging_service_sid
```

#### Meta WhatsApp Configuration
```env
# Meta WhatsApp Business API (new)
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_ACCESS_TOKEN=your_access_token
META_WHATSAPP_VERSION=v23.0
```

### Services Configuration

The configuration is automatically loaded from `config/services.php`:

```php
'twilio' => [
    'sid' => env('TWILIO_SID'),
    'auth_token' => env('TWILIO_AUTH_TOKEN'),
    'number' => env('TWILIO_NUMBER'),
    'whatsapp_number' => env('TWILIO_WHATSAPP_NUMBER'),
    'messaging_service_sid' => env('TWILIO_MESSAGING_SERVICE_SID'),
],

'meta_whatsapp' => [
    'phone_number_id' => env('META_WHATSAPP_PHONE_NUMBER_ID'),
    'access_token' => env('META_WHATSAPP_ACCESS_TOKEN'),
    'version' => env('META_WHATSAPP_VERSION', 'v23.0'),
],
```

## API Endpoints

### WhatsApp (Twilio) Endpoints

#### 1. Send WhatsApp Message
```
POST /api/v1/whatsapp/send-message
```
**Body:**
```json
{
    "to": "+1234567890",
    "message": "Hello from Hebron Connect!",
    "media_url": "https://example.com/image.jpg",
    "status_callback": "https://your-domain.com/webhook"
}
```

#### 2. Send OTP via WhatsApp
```
POST /api/v1/whatsapp/send-otp
```
**Body:**
```json
{
    "to": "+1234567890",
    "otp": "123456"
}
```

#### 3. Send Template Message
```
POST /api/v1/whatsapp/send-template
```
**Body:**
```json
{
    "to": "+1234567890",
    "template_name": "otp_verification",
    "variables": {
        "otp": "123456"
    }
}
```

#### 4. Check Service Status
```
GET /api/v1/whatsapp/status
```

### Meta WhatsApp Endpoints

#### 1. Send Authentication Message
```
POST /api/v1/meta-whatsapp/send-authentication
```
**Body:**
```json
{
    "phone_number": "12015553931",
    "otp": "123456",
    "template_name": "verification_code",
    "language_code": "en_US"
}
```

#### 2. Send Template Message
```
POST /api/v1/meta-whatsapp/send-template
```
**Body:**
```json
{
    "phone_number": "12015553931",
    "template_name": "welcome_message",
    "parameters": [],
    "language_code": "en_US"
}
```

#### 3. Send OTP
```
POST /api/v1/meta-whatsapp/send-otp
```
**Body:**
```json
{
    "phone_number": "12015553931",
    "otp": "123456",
    "template_name": "verification_code",
    "language_code": "en_US"
}
```

#### 4. Check Service Status
```
GET /api/v1/meta-whatsapp/status
```

## How It Works

### OTP Flow

1. **User requests OTP** (registration, login, password reset)
2. **System generates OTP** and stores it in database
3. **Primary OTP method** is sent based on type and region:
   - **Email**: Always sent for email verification
   - **SMS**: Only sent for Cameroon phone numbers (+237)
   - **WhatsApp**: Sent to all phone numbers (if configured)
4. **WhatsApp OTP is sent** as an additional method:
   - First tries Meta WhatsApp Business API
   - If that fails, falls back to Twilio WhatsApp
   - If both fail, logs the error but doesn't block the process
5. **User receives OTP** via appropriate channels for their region

### Fallback Mechanism

```php
// Try Meta WhatsApp first
if ($metaWhatsAppService->isConfigured()) {
    $result = $metaWhatsAppService->sendOtp($phone, $otp);
    if ($result['success']) {
        return; // Success, no need to try Twilio
    }
}

// Fallback to Twilio WhatsApp
if ($whatsAppService->isConfigured()) {
    $result = $whatsAppService->sendOtp($phone, $otp);
    // Log result regardless of success/failure
}
```

## Message Templates

### Twilio WhatsApp Templates

- **otp_verification**: "Your Hebron Connect verification code is: {otp}. This code will expire in 15 minutes. Do not share this code with anyone."
- **welcome**: "Welcome to Hebron Connect! We're excited to have you on board."
- **password_reset**: "Your Hebron Connect password reset code is: {otp}. This code will expire in 15 minutes."

### Meta WhatsApp Templates

- **verification_code**: Pre-approved template with OTP button
- **welcome_message**: Generic welcome template
- **custom**: Any other approved templates in your Meta WhatsApp account

## Phone Number Formatting

### Twilio WhatsApp
- Input: `+1234567890`
- Output: `whatsapp:+1234567890`

### Meta WhatsApp
- Input: `+1234567890`
- Output: `1234567890` (without +)

## Regional SMS Optimization

### SMS OTP Delivery
- **Cameroon numbers (+237)**: Receive both SMS and WhatsApp OTP
- **Other countries**: Receive only WhatsApp OTP (SMS skipped to optimize costs)

### Benefits
- **Cost optimization**: Reduces SMS costs for international numbers
- **Regional focus**: Prioritizes SMS for primary market (Cameroon)
- **Universal WhatsApp**: All users still receive WhatsApp OTP regardless of region
- **Flexible configuration**: Easy to modify country codes in `shouldSendSms()` method

## Error Handling

### Graceful Degradation
- WhatsApp failures don't prevent SMS/email OTP delivery
- All errors are logged for debugging
- Users still receive OTP via primary method

### Logging
- Success: Info level with message details
- Warnings: When services fail but don't break the flow
- Errors: When exceptions occur

### Common Error Scenarios
1. **Service not configured**: Logged as info, process continues
2. **API rate limits**: Logged as warning, process continues
3. **Invalid phone numbers**: Logged as error, process continues
4. **Network issues**: Logged as error, process continues
5. **Regional SMS restrictions**: Non-Cameroon numbers skip SMS, logged as info

## Testing

### Test Endpoints
Use the public endpoints to test WhatsApp functionality:

1. **Check service status**: Verify configuration
2. **Send test OTP**: Test message delivery
3. **Send custom message**: Test general messaging

### Test Phone Numbers
- Use your own WhatsApp number for testing
- Ensure the number is in international format
- Test with and without country code (+)

## Monitoring

### Key Metrics to Monitor
1. **Success rates** for each WhatsApp service
2. **Response times** for API calls
3. **Error rates** and types
4. **Fallback usage** (how often Twilio is used as fallback)

### Log Analysis
Search logs for:
- `WhatsApp OTP sent successfully`
- `Failed to send WhatsApp OTP`
- `WhatsApp services not configured`

## Security Considerations

1. **API Keys**: Store securely in environment variables
2. **Rate Limiting**: Implement rate limiting on public endpoints
3. **Phone Validation**: Validate phone numbers before sending
4. **Logging**: Avoid logging sensitive information like OTP codes

## Troubleshooting

### Common Issues

1. **Service not configured**
   - Check environment variables
   - Verify configuration in `config/services.php`

2. **Invalid phone number format**
   - Ensure international format (+1234567890)
   - Check phone number validation regex

3. **Meta WhatsApp template not found**
   - Verify template name exists in your Meta account
   - Check template approval status

4. **Twilio WhatsApp not working**
   - Verify Twilio account is active
   - Check WhatsApp number configuration
   - Ensure messaging service is set up

5. **SMS not being sent to non-Cameroon numbers**
   - This is expected behavior to optimize costs
   - Only Cameroon numbers (+237) receive SMS OTP
   - All phone numbers still receive WhatsApp OTP (if configured)

### Debug Steps

1. **Check service status** endpoints
2. **Review application logs** for detailed error messages
3. **Verify API credentials** are correct
4. **Test with simple message** before testing OTP

## Future Enhancements

1. **Webhook Support**: Add webhook endpoints for delivery status
2. **Template Management**: Admin interface for managing templates
3. **Analytics Dashboard**: Track WhatsApp usage and success rates
4. **Multi-language Support**: Support for multiple language templates
5. **Scheduled Messages**: Support for delayed message delivery

## Support

For technical support or questions about the WhatsApp OTP implementation:

1. Check the application logs for error details
2. Verify all environment variables are set correctly
3. Test individual services using the status endpoints
4. Review this documentation for configuration details

## Conclusion

The WhatsApp OTP implementation provides a robust, multi-channel approach to OTP delivery, ensuring users receive verification codes reliably. The dual-service approach with automatic fallback ensures high availability, while the non-blocking design maintains system reliability even when WhatsApp services are unavailable.
