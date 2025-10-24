# Room Subscription System

This document outlines the database updates and features implemented to track that rooms must subscribe to access the pro plan of the application.

## Database Updates

### 1. Subscription Plans Table (`subscription_plans`)
- **Purpose**: Stores available subscription plans (Basic, Pro, Enterprise)
- **Key Fields**:
  - `name`: Plan name (e.g., "Basic", "Pro", "Enterprise")
  - `slug`: Unique identifier (e.g., "basic", "pro", "enterprise")
  - `price`: Monthly price
  - `currency`: Currency code (default: XAF)
  - `billing_cycle_days`: Billing cycle in days (default: 30)
  - `features`: JSON array of features included in the plan
  - `max_rooms`: Maximum rooms allowed (null = unlimited)
  - `max_members_per_room`: Maximum members per room (null = unlimited)
  - `is_active`: Whether the plan is active
  - `is_popular`: Whether to highlight as popular plan
  - `sort_order`: For ordering plans

### 2. Room Subscriptions Table (`room_subscriptions`)
- **Purpose**: Tracks room subscriptions to plans
- **Key Fields**:
  - `connect_room_id`: Foreign key to connect_rooms table
  - `subscription_plan_id`: Foreign key to subscription_plans table
  - `subscribed_by`: User who subscribed the room
  - `status`: Subscription status (active, expired, cancelled, suspended)
  - `starts_at`: Subscription start date
  - `expires_at`: Subscription expiration date
  - `amount_paid`: Amount paid for the subscription
  - `payment_method`: Payment method used
  - `payment_reference`: External payment reference
  - `metadata`: Additional subscription data

### 3. Subscription Usage Tracking Table (`connect_room_subscription_usage`)
- **Purpose**: Tracks feature usage for subscribed rooms
- **Key Fields**:
  - `room_subscription_id`: Foreign key to room_subscriptions table
  - `feature_type`: Type of feature being used
  - `usage_count`: Number of times feature was used
  - `limit_count`: Usage limit (null = unlimited)
  - `usage_date`: Date of usage
  - `metadata`: Additional usage data

### 4. Connect Rooms Table Updates
- **New Fields Added**:
  - `requires_pro_plan`: Boolean indicating if room requires pro plan
  - `pro_plan_required_at`: Timestamp when pro plan was required
  - `pro_plan_requirement_reason`: Reason for requiring pro plan

## Models Created

### 1. SubscriptionPlan Model
- Manages subscription plans
- Includes scopes for active, popular, and ordered plans
- Methods for checking features and limits
- Formatted price and billing cycle attributes

### 2. RoomSubscription Model
- Manages room subscriptions
- Tracks subscription status and expiration
- Methods for canceling, suspending, and reactivating subscriptions
- Usage tracking and recording methods

### 3. ConnectRoomSubscriptionUsage Model
- Tracks feature usage for subscriptions
- Methods for checking limits and usage percentages
- Usage increment/decrement methods

### 4. Updated ConnectRoom Model
- Added subscription relationships
- Methods for checking pro plan access
- Feature access validation
- Usage recording methods
- Updated API response to include subscription information

## Services and Commands

### 1. SubscriptionService
- Centralized service for subscription management
- Methods for subscribing rooms, canceling subscriptions
- Feature access checking and usage recording
- Statistics and reporting methods

### 2. CheckExpiredSubscriptions Command
- Automated command to check and update expired subscriptions
- Logs expiring subscriptions for monitoring
- Can be scheduled to run daily

### 3. CheckRoomProPlanAccess Middleware
- Middleware to validate pro plan access for room features
- Can be applied to specific routes requiring pro plan access
- Returns appropriate error responses for unauthorized access

## Features Implemented

### 1. Pro Plan Requirement Tracking
- Rooms can be marked as requiring pro plan access
- Tracking of when and why pro plan was required
- Automatic access validation

### 2. Subscription Management
- Room owners can subscribe rooms to plans
- Subscription status tracking (active, expired, cancelled, suspended)
- Payment tracking and references

### 3. Feature Access Control
- Granular feature access based on subscription plans
- Usage tracking and limits
- Automatic access validation

### 4. Usage Analytics
- Track feature usage per subscription
- Monitor usage against limits
- Generate usage statistics

### 5. Automated Monitoring
- Expired subscription detection
- Usage limit monitoring
- Comprehensive logging

## Default Subscription Plans

### Basic Plan (Free)
- Price: 0 XAF
- Features: Basic room management, member invitations, basic announcements, basic events
- Limits: 1 room, 50 members per room

### Pro Plan (5,000 XAF/month)
- Price: 5,000 XAF
- Features: All basic features plus unlimited rooms, advanced features, file sharing, analytics
- Limits: Unlimited rooms and members
- Marked as popular plan

### Enterprise Plan (15,000 XAF/month)
- Price: 15,000 XAF
- Features: All pro features plus API access, white label, dedicated support
- Limits: Unlimited rooms and members

## Usage Examples

### Checking Pro Plan Access
```php
$room = ConnectRoom::find(1);

// Check if room requires pro plan
if ($room->requiresProPlan()) {
    // Check if room has active subscription
    if ($room->hasActiveProPlan()) {
        // Room has active pro plan
    } else {
        // Room requires pro plan but doesn't have active subscription
    }
}

// Check if room can access pro features
if ($room->canAccessProFeatures()) {
    // Allow access to pro features
}
```

### Recording Feature Usage
```php
// Record usage for a specific feature
$room->recordFeatureUsage('file_upload', 1, ['file_size' => 1024]);

// Get usage count for a feature
$usageCount = $room->getFeatureUsageCount('file_upload', '2025-10-20');
```

### Managing Subscriptions
```php
$subscriptionService = app(SubscriptionService::class);

// Subscribe room to pro plan
$plan = SubscriptionPlan::where('slug', 'pro')->first();
$subscription = $subscriptionService->subscribeRoom($room, $plan, $user, [
    'payment_method' => 'stripe',
    'payment_reference' => 'pi_1234567890'
]);

// Cancel subscription
$subscriptionService->cancelSubscription($subscription, 'User requested cancellation');
```

## API Response Updates

Room API responses now include subscription information:
```json
{
  "id": 1,
  "name": "My Room",
  "requires_pro_plan": true,
  "pro_plan_required_at": "2025-10-20T10:00:00Z",
  "pro_plan_requirement_reason": "Room exceeded basic plan limits",
  "has_active_pro_plan": true,
  "can_access_pro_features": true,
  "subscription": {
    "id": 1,
    "plan_name": "Pro",
    "plan_slug": "pro",
    "status": "active",
    "starts_at": "2025-10-20T10:00:00Z",
    "expires_at": "2025-11-20T10:00:00Z",
    "days_remaining": 15,
    "amount_paid": "5000.00 XAF",
    "payment_method": "stripe"
  }
}
```

## Migration Files Created

1. `2025_10_20_163648_create_subscription_plans_table.php`
2. `2025_10_20_163700_create_room_subscriptions_table.php`
3. `2025_10_20_163750_create_connect_room_subscription_usage_table.php`
4. `2025_10_20_163800_add_subscription_fields_to_connect_rooms_table.php`

## Seeder Created

- `SubscriptionPlanSeeder`: Populates default subscription plans

## Command Created

- `CheckExpiredSubscriptions`: Automated subscription monitoring

## Middleware Created

- `CheckRoomProPlanAccess`: Pro plan access validation

## Service Created

- `SubscriptionService`: Centralized subscription management

This implementation provides a comprehensive subscription system that allows rooms to subscribe to pro plans, tracks usage, and enforces access controls based on subscription status.
