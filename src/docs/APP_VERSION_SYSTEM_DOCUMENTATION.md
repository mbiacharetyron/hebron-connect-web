# App Version Management System

## Overview
A comprehensive system for tracking and managing app versions across multiple platforms (iOS, Android, Web) with API endpoints for version checking and update management.

## Database Schema

### app_versions Table
```sql
CREATE TABLE app_versions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    platform VARCHAR(20) NOT NULL COMMENT 'Platform: ios, android, web',
    version VARCHAR(20) NOT NULL COMMENT 'Version number (e.g., 1.0.0)',
    build_number VARCHAR(20) NULL COMMENT 'Build number for mobile apps',
    title VARCHAR(100) NOT NULL COMMENT 'Version title (e.g., "Major Update")',
    description TEXT NULL COMMENT 'Version description/changelog',
    release_notes TEXT NULL COMMENT 'Detailed release notes',
    is_required BOOLEAN DEFAULT FALSE COMMENT 'Whether this update is mandatory',
    is_latest BOOLEAN DEFAULT FALSE COMMENT 'Whether this is the latest version',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether this version is active',
    download_url VARCHAR(255) NULL COMMENT 'Download URL for the app',
    min_supported_version VARCHAR(20) NULL COMMENT 'Minimum supported version',
    compatibility JSON NULL COMMENT 'Compatibility requirements',
    release_date TIMESTAMP NULL COMMENT 'Release date',
    effective_date TIMESTAMP NULL COMMENT 'When this version becomes effective',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    INDEX idx_platform_latest (platform, is_latest),
    INDEX idx_platform_active (platform, is_active),
    INDEX idx_version (version),
    UNIQUE KEY unique_platform_version (platform, version)
);
```

## API Endpoints

### 1. Get Latest Version for Platform
**GET** `/api/v1/app-version/latest/{platform}`

Get the latest app version for a specific platform.

**Parameters:**
- `platform` (path, required): Platform type (`ios`, `android`, `web`)

**Response:**
```json
{
    "status": "success",
    "message": "Latest version retrieved successfully",
    "data": {
        "id": 1,
        "platform": "ios",
        "version": "1.2.0",
        "build_number": "120",
        "title": "Major Update",
        "description": "Bug fixes, performance improvements, and new features",
        "release_notes": "• Fixed critical bug in contribution system\n• Improved app performance",
        "is_required": false,
        "is_latest": true,
        "is_active": true,
        "download_url": "https://apps.apple.com/app/hebron-connect/id123456789",
        "min_supported_version": "1.0.0",
        "compatibility": {
            "ios_version": "14.0",
            "device_types": ["iPhone", "iPad"]
        },
        "formatted_version": "1.2.0 (120)",
        "platform_display_name": "iOS",
        "release_date": "2024-10-10T10:00:00.000000Z",
        "effective_date": "2024-10-10T10:00:00.000000Z"
    }
}
```

### 2. Check for Updates
**GET** `/api/v1/app-version/check-update`

Check if an app version update is available.

**Parameters:**
- `platform` (query, required): Platform type (`ios`, `android`, `web`)
- `current_version` (query, required): Current app version (e.g., `1.1.0`)

**Response:**
```json
{
    "status": "success",
    "message": "Update check completed",
    "data": {
        "update_available": true,
        "is_required": false,
        "current_version": "1.1.0",
        "latest_version": {
            "version": "1.2.0",
            "build_number": "120",
            "title": "Major Update",
            "description": "Bug fixes, performance improvements, and new features",
            "release_notes": "• Fixed critical bug in contribution system",
            "download_url": "https://apps.apple.com/app/hebron-connect/id123456789",
            "formatted_version": "1.2.0 (120)",
            "release_date": "2024-10-10T10:00:00.000000Z",
            "effective_date": "2024-10-10T10:00:00.000000Z"
        }
    }
}
```

### 3. Get All Versions for Platform
**GET** `/api/v1/app-version/platform/{platform}`

Get all app versions for a specific platform.

**Parameters:**
- `platform` (path, required): Platform type (`ios`, `android`, `web`)
- `active_only` (query, optional): Show only active versions (default: `true`)

**Response:**
```json
{
    "status": "success",
    "message": "Versions retrieved successfully",
    "data": [
        {
            "id": 1,
            "platform": "ios",
            "version": "1.2.0",
            "title": "Major Update",
            "is_latest": true,
            "is_required": false,
            "release_date": "2024-10-10T10:00:00.000000Z"
        }
    ]
}
```

### 4. Get All Versions (Admin Only)
**GET** `/api/v1/app-version/all`

Get all app versions across all platforms. Requires admin authentication.

**Parameters:**
- `platform` (query, optional): Filter by platform

**Response:**
```json
{
    "status": "success",
    "message": "All versions retrieved successfully",
    "data": [
        {
            "id": 1,
            "platform": "ios",
            "version": "1.2.0",
            "title": "Major Update",
            "is_latest": true,
            "is_active": true,
            "created_at": "2024-10-10T10:00:00.000000Z"
        }
    ]
}
```

## Model Features

### AppVersion Model
The `AppVersion` model includes:

**Scopes:**
- `latest()` - Get latest versions
- `active()` - Get active versions
- `forPlatform($platform)` - Get versions for specific platform
- `required()` - Get required updates

**Methods:**
- `getLatestForPlatform($platform)` - Static method to get latest version for platform
- `isNewerThan($version)` - Check if version is newer
- `isOlderThan($version)` - Check if version is older
- `getFormattedVersionAttribute()` - Get formatted version string
- `getPlatformDisplayNameAttribute()` - Get platform display name

**Casts:**
- `is_required` → boolean
- `is_latest` → boolean
- `is_active` → boolean
- `compatibility` → array
- `release_date` → datetime
- `effective_date` → datetime

## Usage Examples

### Mobile App Integration
```javascript
// Check for updates
const checkUpdate = async (platform, currentVersion) => {
    const response = await fetch(`/api/v1/app-version/check-update?platform=${platform}&current_version=${currentVersion}`);
    const data = await response.json();
    
    if (data.data.update_available) {
        if (data.data.is_required) {
            // Force update
            showForceUpdateDialog(data.data.latest_version);
        } else {
            // Optional update
            showUpdateDialog(data.data.latest_version);
        }
    }
};

// Get latest version info
const getLatestVersion = async (platform) => {
    const response = await fetch(`/api/v1/app-version/latest/${platform}`);
    return await response.json();
};
```

### Web App Integration
```javascript
// Check for web app updates
const checkWebUpdate = async () => {
    const response = await fetch('/api/v1/app-version/check-update?platform=web&current_version=1.1.0');
    const data = await response.json();
    
    if (data.data.update_available) {
        // Show update notification
        showUpdateNotification(data.data.latest_version);
    }
};
```

## Sample Data

The seeder creates sample data for:
- **iOS**: Versions 1.2.0 (latest), 1.1.0, and 1.2.1 (critical security update)
- **Android**: Versions 1.2.0 (latest) and 1.1.0
- **Web**: Versions 1.2.0 (latest) and 1.1.0

## Features

1. **Multi-Platform Support**: iOS, Android, and Web
2. **Version Comparison**: Built-in version comparison using `version_compare()`
3. **Required Updates**: Support for mandatory updates
4. **Compatibility Info**: JSON field for platform-specific requirements
5. **Release Management**: Release and effective dates
6. **Build Numbers**: Support for mobile app build numbers
7. **Download URLs**: Platform-specific download links
8. **Comprehensive API**: Full CRUD operations with proper validation
9. **Admin Management**: Admin-only endpoints for version management
10. **Detailed Logging**: Comprehensive logging for all operations

## Security

- Public endpoints for version checking (no authentication required)
- Admin endpoints protected by authentication and admin middleware
- Input validation for all parameters
- Proper error handling and logging

## Future Enhancements

1. **Version Creation API**: Add endpoints for creating/updating versions
2. **Rollback Support**: Ability to rollback to previous versions
3. **A/B Testing**: Support for feature flags and gradual rollouts
4. **Analytics**: Track version adoption rates
5. **Automated Deployment**: Integration with CI/CD pipelines
