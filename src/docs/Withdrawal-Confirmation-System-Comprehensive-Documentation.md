# Withdrawal Confirmation System - Comprehensive Documentation

## Overview

The Withdrawal Confirmation System provides a comprehensive security layer for connect room contributions, allowing flexible configuration of withdrawal approval requirements and admin management. The system consists of two main components:

1. **Withdrawal Confirmation System**: Core functionality for designating admins who must confirm withdrawals
2. **Admin Management System**: Endpoints for adding, removing, and managing withdrawal confirmation admins

## Table of Contents

1. [System Features](#system-features)
2. [Core Withdrawal Confirmation System](#core-withdrawal-confirmation-system)
3. [Admin Management System](#admin-management-system)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Model Methods](#model-methods)
7. [Authorization & Security](#authorization--security)
8. [Validation Rules](#validation-rules)
9. [Error Handling](#error-handling)
10. [Integration Points](#integration-points)
11. [Testing](#testing)
12. [Future Enhancements](#future-enhancements)

## System Features

### 1. **Contribution-Level Withdrawal Controls**
- Each contribution can have designated withdrawal confirmation admins
- Only specified admins can approve withdrawals from that contribution
- Flexible admin selection per contribution
- Optional feature - contributions can be created without withdrawal confirmation requirements

### 2. **Admin Management**
- Add admins to withdrawal confirmation lists
- Remove admins with multi-admin confirmation workflow
- View and manage removal requests
- Comprehensive audit trail and logging

### 3. **Security Features**
- Multi-level authorization controls
- Role-based access control
- Request ownership validation
- Data integrity protection
- Update restrictions for security

### 4. **Flexible Configuration**
- Multiple admins can be designated for a single contribution
- Easy to modify withdrawal confirmation admins after contribution creation
- Room owners can also be designated as withdrawal confirmation admins
- Clear separation between contribution updates and admin management

## Core Withdrawal Confirmation System

### Database Schema

#### New Field Added to `connect_room_contributions` Table
```sql
ALTER TABLE connect_room_contributions 
ADD COLUMN withdrawal_confirmation_admins JSON NULL 
COMMENT 'Array of admin user IDs who must confirm withdrawals from this contribution';
```

#### Model Updates
The `ConnectRoomContribution` model includes:
- `withdrawal_confirmation_admins` field in fillable array
- Array casting for JSON field
- Helper methods for managing withdrawal confirmation admins

### Create Contribution with Withdrawal Confirmation Admins

**Endpoint:** `POST /api/v1/connect-room/{room}/contribution`

**Request Body:**
```json
{
  "title": "Monthly Fundraising",
  "amount": 1000.00,
  "currency": "USD",
  "contribution_type": "monthly",
  "description": "Monthly fundraising for project development",
  "deadline": "2024-12-31",
  "notes": "All funds will be used for development",
  "withdrawal_confirmation_admins": [123, 456, 789]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Contribution created successfully",
  "data": {
    "id": 1,
    "title": "Monthly Fundraising",
    "amount": 1000.00,
    "currency": "USD",
    "contribution_type": "monthly",
    "description": "Monthly fundraising for project development",
    "deadline": "2024-12-31",
    "status": "open",
    "notes": "All funds will be used for development",
    "withdrawal_confirmation_admins": [123, 456, 789],
    "created_at": "2024-10-14T10:30:00Z",
    "updated_at": "2024-10-14T10:30:00Z"
  }
}
```

## Admin Management System

### 1. Add Admin to Withdrawal Confirmation List

**Endpoint:** `POST /api/v1/connect-room/{room}/contribution/{contribution}/withdrawal-confirmation-admins`

**Authorization:** Room owner or contribution creator only

**Request Body:**
```json
{
  "admin_id": 123
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Admin added to withdrawal confirmation list successfully",
  "data": {
    "contribution_id": 1,
    "admin_id": 123,
    "withdrawal_confirmation_admins": [123, 456, 789]
  }
}
```

### 2. Remove Admin from Withdrawal Confirmation List

**Endpoint:** `POST /api/v1/connect-room/{room}/contribution/{contribution}/withdrawal-confirmation-admins/{admin}/remove`

**Authorization:** Room owner or contribution creator only

**Response:**
```json
{
  "status": "success",
  "message": "Admin removal request created. Confirmation from other admins required.",
  "data": {
    "request_id": "uuid-here",
    "admin_to_remove": 123,
    "pending_confirmations": [456, 789],
    "expires_at": "2024-10-21T14:18:54.000Z"
  }
}
```

### 3. Confirm Admin Removal Request

**Endpoint:** `POST /api/v1/connect-room/{room}/contribution/{contribution}/withdrawal-confirmation-admin-removal/{request}/confirm`

**Authorization:** Admin must be in the required confirmations list

**Response:**
```json
{
  "status": "success",
  "message": "Removal request confirmed and admin removed successfully.",
  "data": {
    "request_id": "uuid-here",
    "status": "approved",
    "admin_removed": true
  }
}
```

### 4. Get Withdrawal Confirmation Admin Removal Requests

**Endpoint:** `GET /api/v1/connect-room/{room}/withdrawal-confirmation-admin-removal-requests`

**Authorization:** Room owner or admin only

**Query Parameters:**
- `status` (optional): Filter by status (pending, approved, rejected, expired)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "request_id": "uuid-here",
      "contribution_id": 5,
      "contribution_title": "Monthly Fundraising",
      "admin_to_remove": {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "requested_by": {
        "id": 456,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "status": "pending",
      "required_confirmations": [789, 101],
      "confirmations": [789],
      "pending_confirmations": [101],
      "expires_at": "2024-10-21T14:18:54.000Z",
      "created_at": "2024-10-14T14:18:54.000Z"
    }
  ]
}
```

## Database Schema

### WithdrawalConfirmationAdminRemovalRequest Table

```sql
CREATE TABLE withdrawal_confirmation_admin_removal_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    contribution_id BIGINT UNSIGNED NOT NULL,
    admin_to_remove BIGINT UNSIGNED NOT NULL,
    requested_by BIGINT UNSIGNED NOT NULL,
    required_confirmations JSON NOT NULL,
    confirmations JSON NULL,
    status ENUM('pending', 'approved', 'rejected', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (room_id) REFERENCES connect_rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (contribution_id) REFERENCES connect_room_contributions(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_to_remove) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX wcarr_room_contribution_index (room_id, contribution_id),
    INDEX wcarr_status_expires_index (status, expires_at)
);
```

## Model Methods

### ConnectRoomContribution Model Methods

#### 1. **getWithdrawalConfirmationAdmins()**
```php
public function getWithdrawalConfirmationAdmins()
{
    return $this->withdrawal_confirmation_admins ?? [];
}
```
Returns array of admin user IDs who must confirm withdrawals.

#### 2. **setWithdrawalConfirmationAdmins(array $adminIds)**
```php
public function setWithdrawalConfirmationAdmins(array $adminIds)
{
    $this->update(['withdrawal_confirmation_admins' => $adminIds]);
}
```
Sets the withdrawal confirmation admins for this contribution.

#### 3. **addWithdrawalConfirmationAdmin($adminId)**
```php
public function addWithdrawalConfirmationAdmin($adminId)
{
    $admins = $this->getWithdrawalConfirmationAdmins();
    if (!in_array($adminId, $admins)) {
        $admins[] = $adminId;
        $this->setWithdrawalConfirmationAdmins($admins);
    }
}
```
Adds a new admin to the withdrawal confirmation list.

#### 4. **removeWithdrawalConfirmationAdmin($adminId)**
```php
public function removeWithdrawalConfirmationAdmin($adminId)
{
    $admins = $this->getWithdrawalConfirmationAdmins();
    $admins = array_filter($admins, function($id) use ($adminId) {
        return $id != $adminId;
    });
    $this->setWithdrawalConfirmationAdmins(array_values($admins));
}
```
Removes an admin from the withdrawal confirmation list.

#### 5. **isWithdrawalConfirmationAdmin($userId)**
```php
public function isWithdrawalConfirmationAdmin($userId)
{
    return in_array($userId, $this->getWithdrawalConfirmationAdmins());
}
```
Checks if a user is a withdrawal confirmation admin for this contribution.

#### 6. **withdrawalConfirmationAdmins()**
```php
public function withdrawalConfirmationAdmins()
{
    $adminIds = $this->getWithdrawalConfirmationAdmins();
    if (empty($adminIds)) {
        return collect();
    }
    
    return User::whereIn('id', $adminIds)->get();
}
```
Returns User models for all withdrawal confirmation admins.

### WithdrawalConfirmationAdminRemovalRequest Model Methods

#### 1. **addConfirmation($adminId)**
```php
public function addConfirmation($adminId): bool
{
    $confirmations = $this->confirmations ?? [];
    $requiredConfirmations = $this->required_confirmations ?? [];
    
    if (!in_array($adminId, $confirmations)) {
        $confirmations[] = $adminId;
        $this->update(['confirmations' => $confirmations]);
        
        $allRequiredConfirmed = empty(array_diff($requiredConfirmations, $confirmations));
        
        if ($allRequiredConfirmed) {
            $this->approveRemoval();
            return true;
        }
    }
    return false;
}
```

#### 2. **approveRemoval()**
```php
public function approveRemoval(): void
{
    $this->update(['status' => 'approved']);
    $contribution = $this->contribution;
    $contribution->removeWithdrawalConfirmationAdmin($this->admin_to_remove);
}
```

#### 3. **hasAllConfirmations()**
```php
public function hasAllConfirmations(): bool
{
    $confirmations = $this->confirmations ?? [];
    $required = $this->required_confirmations ?? [];
    
    return empty(array_diff($required, $confirmations));
}
```

## Authorization & Security

### 1. **Add Admin Authorization**
```php
// Only room owner or contribution creator can add admins
$isOwner = $room->owner_id === $user->id;
$isCreator = $contribution->created_by === $user->id;

if (!$isOwner && !$isCreator) {
    return $this->errorResponse('Unauthorized. Only room owner or contribution creator can add withdrawal confirmation admins.', 403);
}
```

### 2. **Remove Admin Authorization**
```php
// Only room owner or contribution creator can initiate removal
$isOwner = $room->owner_id === $user->id;
$isCreator = $contribution->created_by === $user->id;

if (!$isOwner && !$isCreator) {
    return $this->errorResponse('Unauthorized. Only room owner or contribution creator can remove withdrawal confirmation admins.', 403);
}
```

### 3. **Confirmation Authorization**
```php
// Admin must be in the required confirmations list
$requiredConfirmations = $removalRequest->required_confirmations ?? [];
if (!in_array($user->id, $requiredConfirmations)) {
    return $this->errorResponse('Unauthorized. You are not authorized to confirm this request.', 403);
}
```

### 4. **Update Restrictions**
- **Contribution Updates**: `withdrawal_confirmation_admins` field cannot be updated through contribution update endpoints
- **Dedicated Endpoints**: Must use specific admin management endpoints for any changes
- **Clear Error Messages**: Provides helpful guidance when incorrect endpoints are used

## Validation Rules

### 1. **Create Contribution Validation**
```php
$validator = Validator::make($request->all(), [
    'title' => 'required|string|max:255',
    'amount' => 'nullable|numeric|min:0',
    'currency' => 'nullable|string|size:3|in:USD,EUR,XAF,XOF,CAD,GBP,JPY,CHF,AUD,CNY',
    'contribution_type' => 'required|string',
    'description' => 'nullable|string|max:1000',
    'deadline' => 'required|date',
    'notes' => 'nullable|string|max:1000',
    'withdrawal_confirmation_admins' => 'nullable|array',
    'withdrawal_confirmation_admins.*' => 'integer|exists:users,id'
]);
```

### 2. **Admin Validation**
```php
// Validate withdrawal confirmation admins are actually room admins or owner
if ($request->has('withdrawal_confirmation_admins') && !empty($request->withdrawal_confirmation_admins)) {
    $roomAdminIds = $room->admins()->pluck('user_id')->toArray();
    $roomOwnerId = $room->owner_id;
    
    // Combine admin IDs and owner ID
    $validUserIds = array_merge($roomAdminIds, [$roomOwnerId]);
    $validUserIds = array_unique($validUserIds);
    
    $invalidAdmins = array_diff($request->withdrawal_confirmation_admins, $validUserIds);
    
    if (!empty($invalidAdmins)) {
        return $this->errorResponse(
            'Some withdrawal confirmation admins are not admins or owner of this room.',
            422
        );
    }
}
```

### 3. **Add Admin Validation**
- Admin must exist in the system
- Admin must be a room admin or owner
- Admin must not already be in the withdrawal confirmation list
- User must be room owner or contribution creator

### 4. **Remove Admin Validation**
- Admin must be in the withdrawal confirmation list
- At least one other admin must remain in the list
- User must be room owner or contribution creator

### 5. **Confirmation Validation**
- Request must be pending
- Request must not be expired
- User must be authorized to confirm
- User must not have already confirmed

## Error Handling

### 1. **Common Error Scenarios**

#### Invalid Admin IDs
```json
{
  "status": "error",
  "message": "Some withdrawal confirmation admins are not admins or owner of this room.",
  "code": 422
}
```

#### Unauthorized Access
```json
{
  "status": "error",
  "message": "Unauthorized. Only room owner or contribution creator can add withdrawal confirmation admins."
}
```

#### Admin Not Found
```json
{
  "status": "error",
  "message": "User must be a room admin or owner to be added to withdrawal confirmation list."
}
```

#### Duplicate Admin
```json
{
  "status": "error",
  "message": "Admin is already in the withdrawal confirmation list."
}
```

#### Insufficient Admins
```json
{
  "status": "error",
  "message": "Cannot remove admin. At least one other admin must remain in the withdrawal confirmation list."
}
```

#### Expired Request
```json
{
  "status": "error",
  "message": "Request has expired."
}
```

#### Update Restriction
```json
{
  "status": "error",
  "message": "Withdrawal confirmation admins cannot be updated through contribution update. Use the dedicated admin management endpoints."
}
```

## Integration Points

### 1. **Contribution Management**
- Integrates with existing contribution system
- Maintains withdrawal confirmation lists
- Updates contribution records
- **Important**: `withdrawal_confirmation_admins` cannot be updated through contribution update endpoints
- Must use dedicated admin management endpoints for any changes

### 2. **Room Management**
- Respects room ownership and admin roles
- Integrates with room permissions
- Maintains room financial integrity

### 3. **User Management**
- Works with user authentication
- Respects user roles and permissions
- Maintains user relationships

### 4. **Withdrawal Processing**
When implementing withdrawal processing, check if the contribution has withdrawal confirmation admins:
```php
$contribution = ConnectRoomContribution::find($contributionId);
$confirmationAdmins = $contribution->getWithdrawalConfirmationAdmins();

if (!empty($confirmationAdmins)) {
    // Require confirmation from designated admins
    // Implement withdrawal approval workflow
} else {
    // Process withdrawal without additional confirmation
}
```

### 5. **Admin Notifications**
Send notifications to withdrawal confirmation admins when withdrawal requests are made:
```php
$confirmationAdmins = $contribution->withdrawalConfirmationAdmins();
foreach ($confirmationAdmins as $admin) {
    // Send notification to admin about pending withdrawal approval
}
```

## Usage Examples

### 1. **Create Contribution Without Withdrawal Confirmation**
```json
{
  "title": "Simple Contribution",
  "amount": 500.00,
  "contribution_type": "one-time",
  "deadline": "2024-12-31"
}
```

### 2. **Create Contribution With Single Withdrawal Confirmation Admin**
```json
{
  "title": "Secure Fundraising",
  "amount": 2000.00,
  "contribution_type": "monthly",
  "deadline": "2024-12-31",
  "withdrawal_confirmation_admins": [123]
}
```

### 3. **Create Contribution With Multiple Withdrawal Confirmation Admins**
```json
{
  "title": "High-Security Project",
  "amount": 5000.00,
  "contribution_type": "special",
  "deadline": "2024-12-31",
  "withdrawal_confirmation_admins": [123, 456, 789]
}
```

### 4. **Adding an Admin**
```bash
# Step 1: Add admin to withdrawal confirmation list
POST /api/v1/connect-room/1/contribution/5/withdrawal-confirmation-admins
{
  "admin_id": 123
}

# Response: Admin added successfully
```

### 5. **Removing an Admin**
```bash
# Step 1: Initiate removal request
POST /api/v1/connect-room/1/contribution/5/withdrawal-confirmation-admins/123/remove

# Response: Removal request created, waiting for confirmations

# Step 2: Other admins confirm the removal
POST /api/v1/connect-room/1/contribution/5/withdrawal-confirmation-admin-removal/uuid-here/confirm

# Response: Admin removed after all confirmations received
```

### 6. **Viewing Removal Requests**
```bash
# Get all removal requests for a room
GET /api/v1/connect-room/1/withdrawal-confirmation-admin-removal-requests

# Get only pending requests
GET /api/v1/connect-room/1/withdrawal-confirmation-admin-removal-requests?status=pending

# Response: List of all removal requests with details
```

## Logging and Monitoring

### 1. **Security Logging**
```php
Log::warning('Unauthorized attempt to add withdrawal confirmation admin', [
    'user_id' => $user->id,
    'room_id' => $room->id,
    'contribution_id' => $contributionId
]);
```

### 2. **Success Logging**
```php
Log::info('Admin added to withdrawal confirmation list', [
    'contribution_id' => $contributionId,
    'room_id' => $room->id,
    'admin_id' => $adminId,
    'added_by' => $user->id
]);
```

### 3. **Request Tracking**
```php
Log::info('Admin removal request created for withdrawal confirmation', [
    'contribution_id' => $contributionId,
    'room_id' => $room->id,
    'admin_to_remove' => $adminId,
    'requested_by' => $user->id,
    'other_admins' => $otherAdmins,
    'request_id' => $requestId
]);
```

### 4. **Update Restriction Logging**
```php
Log::warning('Attempt to update withdrawal_confirmation_admins through contribution update', [
    'user_id' => $user->id,
    'room_id' => $room->id,
    'contribution_id' => $contributionId
]);
```

## Testing

### 1. **Unit Tests**
- Test model methods for withdrawal confirmation admins
- Validate admin assignment and removal
- Test validation rules and error handling
- Test removal request workflow

### 2. **Integration Tests**
- Test contribution creation with withdrawal confirmation admins
- Test admin validation logic
- Test error scenarios and edge cases
- Test admin management endpoints
- Test confirmation workflow

### 3. **Edge Cases**
- Single admin scenarios
- Expired requests
- Concurrent confirmations
- System failures
- Update restriction enforcement

## Future Enhancements

### 1. **Notification System**
- Email notifications for removal requests
- Push notifications for confirmations
- SMS alerts for urgent requests
- Real-time notifications for withdrawal requests

### 2. **Advanced Workflow**
- Custom confirmation requirements
- Time-based approvals
- Escalation procedures
- Automated approval workflows

### 3. **Reporting and Analytics**
- Admin activity reports
- Request success rates
- Performance metrics
- Withdrawal approval patterns
- Contribution security metrics

### 4. **Enhanced Security**
- Two-factor authentication for confirmations
- Biometric verification
- Advanced audit trails
- Security monitoring and alerts

## Database Migration

The system includes migrations for both components:

### 1. **Withdrawal Confirmation Admins Field**
```php
Schema::table('connect_room_contributions', function (Blueprint $table) {
    $table->json('withdrawal_confirmation_admins')->nullable()
          ->after('notes')
          ->comment('Array of admin user IDs who must confirm withdrawals from this contribution');
});
```

### 2. **Removal Requests Table**
```php
Schema::create('withdrawal_confirmation_admin_removal_requests', function (Blueprint $table) {
    $table->id();
    $table->string('request_id')->unique();
    $table->foreignId('room_id')->constrained('connect_rooms', 'id', 'wcarr_room_id_foreign')->onDelete('cascade');
    $table->foreignId('contribution_id')->constrained('connect_room_contributions', 'id', 'wcarr_contribution_id_foreign')->onDelete('cascade');
    $table->foreignId('admin_to_remove')->constrained('users', 'id', 'wcarr_admin_to_remove_foreign')->onDelete('cascade');
    $table->foreignId('requested_by')->constrained('users', 'id', 'wcarr_requested_by_foreign')->onDelete('cascade');
    $table->json('required_confirmations'); // Array of admin IDs who must confirm
    $table->json('confirmations')->nullable(); // Array of admin IDs who have confirmed
    $table->enum('status', ['pending', 'approved', 'rejected', 'expired'])->default('pending');
    $table->timestamp('expires_at')->nullable();
    $table->timestamps();
    
    $table->index(['room_id', 'contribution_id'], 'wcarr_room_contribution_index');
    $table->index(['status', 'expires_at'], 'wcarr_status_expires_index');
});
```

## Conclusion

The Withdrawal Confirmation System provides a comprehensive security layer for connect room contributions, combining:

- **Core Functionality**: Flexible withdrawal confirmation requirements
- **Admin Management**: Secure admin addition and removal workflows
- **Security**: Multi-level authorization and validation
- **Integrity**: Comprehensive audit trails and data protection
- **Flexibility**: Easy configuration and management
- **Reliability**: Robust error handling and system resilience

The system strikes a balance between security and usability, providing powerful admin management capabilities while maintaining strict authorization controls and data integrity. It ensures that withdrawal confirmation admins can only be managed through dedicated, secure endpoints while preventing accidental modifications through regular contribution updates.
