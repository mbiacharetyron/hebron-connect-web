# Hebron Connect Authentication Documentation Suite

Welcome to the Hebron Connect Authentication Documentation! This suite provides everything you need to integrate authentication into your application.

## 📚 Documentation Overview

This documentation suite consists of three comprehensive guides:

### 1. [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md) 📖
**Best for**: Understanding the complete authentication system

- Detailed overview of the authentication flow
- Complete endpoint documentation with request/response examples
- Security configuration and best practices
- Device management and notifications
- Password management workflows
- Profile management
- Comprehensive error handling guide
- **Estimated reading time**: 30-45 minutes

### 2. [Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md) ⚡
**Best for**: Quick lookups and API calls

- Condensed endpoint summary table
- Step-by-step registration and login flows
- Common cURL examples
- HTTP status codes reference
- Common errors and solutions
- **Estimated reading time**: 5-10 minutes

### 3. [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md) 💻
**Best for**: Implementing authentication in your app

- Complete code examples for 5+ platforms
- Production-ready service classes
- React Native, Flutter, Swift, Kotlin examples
- Security implementation patterns
- Error handling strategies
- **Estimated reading time**: 20-30 minutes (plus implementation time)

---

## 🚀 Quick Start

### For Developers New to the API

1. **Read**: Start with the [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md) to understand the authentication flow
2. **Reference**: Keep the [Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md) handy for endpoint details
3. **Implement**: Use the [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md) for your platform

### For Experienced Developers

1. **Skim**: Quickly review the [Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md)
2. **Copy**: Use code examples from the [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)
3. **Refer**: Check the [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md) for specific details as needed

---

## 🔑 Key Features

### OAuth2 Bearer Token Authentication
- Powered by Laravel Passport
- Secure token-based authentication
- Long-lived access tokens

### OTP Verification
- 6-digit numeric codes
- 15-minute validity
- Multi-channel delivery:
  - 📧 Email via AWS SES
  - 📱 SMS via Twilio (Cameroon: +237)
  - 💬 WhatsApp via Twilio (all numbers)

### Device Management
- Track all logged-in devices
- New device login notifications
- Logout from single or all devices
- FCM push notification support

### Password Management
- OTP-based password reset
- Authenticated password change
- Secure password validation

### Profile Management
- Update user information
- Profile image upload to AWS S3
- Automatic image optimization (original + thumbnail)

### Multi-Language Support
- English (en) - default
- French (fr)
- Affects OTPs, notifications, and emails

---

## 🌐 API Endpoints at a Glance

### Public Endpoints (No Auth Required)
| Endpoint | Purpose |
|----------|---------|
| `POST /auth/check-availability` | Check if email/phone available |
| `POST /auth/send-otp` | Send verification OTP |
| `POST /auth/verify-otp` | Verify OTP code |
| `POST /auth/register` | Complete registration |
| `POST /auth/login` | User login |
| `POST /auth/forgot-password` | Request password reset |
| `POST /auth/reset-password` | Reset password with OTP |

### Protected Endpoints (Auth Required)
| Endpoint | Purpose |
|----------|---------|
| `POST /auth/logout` | Logout current device |
| `POST /auth/logout-all-devices` | Logout all devices |
| `GET /auth/profile` | Get user profile |
| `POST /auth/profile` | Update profile |
| `POST /auth/change-password` | Change password |

---

## 📱 Supported Platforms

The Integration Guide includes production-ready code for:

- ✅ **JavaScript/TypeScript** (Web/Node.js)
- ✅ **React Native** (iOS/Android)
- ✅ **Flutter/Dart** (iOS/Android)
- ✅ **Swift** (iOS/macOS)
- ✅ **Kotlin** (Android)

---

## 🔒 Security Highlights

### Token Storage
- **iOS**: Keychain
- **Android**: EncryptedSharedPreferences
- **React Native**: SecureStore
- **Flutter**: flutter_secure_storage
- **Web**: Secure httpOnly cookies (recommended)

### Security Features
- SSL/TLS encryption (HTTPS only)
- OAuth2 Bearer tokens
- Device tracking and notifications
- New device login alerts
- Multi-factor authentication via OTP
- Automatic token management

### Best Practices Included
- SSL certificate validation
- Request timeout handling
- Retry logic with exponential backoff
- Secure token storage patterns
- Error handling strategies

---

## 🎯 Common Use Cases

### 1. User Registration
```
Check Availability → Send OTP → Verify OTP → Register → Receive Token
```
**See**: [Full Documentation - Registration Flow](./AUTHENTICATION_DOCUMENTATION.md#registration-flow)

### 2. User Login
```
Login with Credentials → Receive Token → Store Securely
```
**See**: [Quick Reference - Login](./AUTHENTICATION_QUICK_REFERENCE.md#login)

### 3. Password Reset
```
Forgot Password → Receive OTP → Verify & Reset
```
**See**: [Full Documentation - Password Reset](./AUTHENTICATION_DOCUMENTATION.md#password-reset-flow)

### 4. Profile Update
```
Get Profile → Update Fields → Upload Image → Save
```
**See**: [Full Documentation - Profile Management](./AUTHENTICATION_DOCUMENTATION.md#profile-management)

---

## 🔧 Testing & Development

### Swagger UI
Interactive API documentation and testing:
**URL**: https://api.hebronconnect.com/api/docs

Features:
- Test all endpoints directly
- See request/response examples
- Authenticate with Bearer token
- Explore schema definitions

### Base URL
```
https://api.hebronconnect.com/api/v1
```

### Testing with cURL
```bash
# Login example
curl -X POST https://api.hebronconnect.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "login": "user@example.com",
    "password": "password123"
  }'

# Get profile example
curl -X GET https://api.hebronconnect.com/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 📊 Response Format

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "code": 400
}
```

---

## 🆘 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Unauthenticated` | Missing/invalid token | Include Bearer token in header |
| `Invalid credentials` | Wrong email/password | Verify credentials |
| `Account not verified` | OTP not completed | Complete verification |
| `Invalid OTP` | Wrong/expired code | Request new OTP |
| `Token expired` | Session ended | Re-authenticate |

**See**: [Full Documentation - Error Handling](./AUTHENTICATION_DOCUMENTATION.md#error-handling)

---

## 🎓 Learning Path

### Beginner Path
1. Read [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md) - Overview section
2. Test endpoints using [Swagger UI](https://api.hebronconnect.com/api/docs)
3. Follow step-by-step flow in [Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md)
4. Implement basic login using [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)

### Intermediate Path
1. Skim [Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md)
2. Copy service class from [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)
3. Implement all authentication flows
4. Refer to [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md) for specific features

### Advanced Path
1. Review security section in [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md)
2. Implement SSL pinning from [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)
3. Add biometric authentication
4. Implement comprehensive error handling
5. Add device management features

---

## 📦 What's Included

### Documentation Files
- `AUTHENTICATION_DOCUMENTATION.md` - Complete reference (14,000+ words)
- `AUTHENTICATION_QUICK_REFERENCE.md` - Quick lookup guide (3,000+ words)
- `AUTHENTICATION_INTEGRATION_GUIDE.md` - Code examples (8,000+ words)
- `AUTHENTICATION_README.md` - This overview

### Code Examples
- JavaScript/TypeScript authentication service
- React Native with Context API
- Flutter authentication repository
- Swift authentication manager
- Kotlin authentication repository
- Error handling utilities
- Security implementation patterns

---

## 🔗 Additional Resources

### Related Documentation
- Subscription Plans API: `SUBSCRIPTION_PLANS_API_DOCUMENTATION.md`
- Connect Room API: Check `docs/` directory
- Contribution System: `CONTRIBUTION_REMINDER_SYSTEM_DOCUMENTATION.md`

### External Resources
- [Laravel Passport Documentation](https://laravel.com/docs/passport)
- [OAuth2 Specification](https://oauth.net/2/)
- [REST API Best Practices](https://restfulapi.net/)

---

## 💡 Tips for Success

### DO ✅
- Store tokens securely (Keychain/Keystore)
- Validate SSL certificates
- Include device information on login
- Implement proper error handling
- Use HTTPS for all requests
- Clear tokens on logout
- Test all error scenarios

### DON'T ❌
- Store tokens in plain text
- Log sensitive data (passwords, tokens)
- Ignore new device notifications
- Skip SSL certificate validation
- Hardcode API URLs
- Make unlimited retry attempts
- Display raw error messages to users

---

## 📞 Support

### Technical Support
- **Email**: support@hebronconnect.com
- **API Documentation**: https://api.hebronconnect.com/api/docs

### Reporting Issues
When reporting authentication issues, include:
- Endpoint being called
- Request headers (excluding tokens)
- Error message/status code
- Platform/framework version
- Steps to reproduce

---

## 📝 Version Information

**Current Version**: 1.0.0  
**Last Updated**: October 24, 2025  
**API Base URL**: https://api.hebronconnect.com/api/v1

### Changelog
- **v1.0.0** (October 2025)
  - Initial release
  - OAuth2 Bearer token authentication
  - OTP-based verification
  - Device management
  - Password reset functionality
  - Profile management with image upload
  - Multi-language support (English, French)

---

## 🎉 Get Started Now!

Choose your path:

1. **Want to understand the system?**  
   → Start with [Full Documentation](./AUTHENTICATION_DOCUMENTATION.md)

2. **Need quick endpoint reference?**  
   → Jump to [Quick Reference](./AUTHENTICATION_QUICK_REFERENCE.md)

3. **Ready to code?**  
   → Check [Integration Guide](./AUTHENTICATION_INTEGRATION_GUIDE.md)

4. **Want to test interactively?**  
   → Visit [Swagger UI](https://api.hebronconnect.com/api/docs)

---

**Happy Coding! 🚀**

