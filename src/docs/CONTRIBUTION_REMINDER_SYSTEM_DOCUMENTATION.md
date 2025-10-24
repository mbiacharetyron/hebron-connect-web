# Contribution Reminder System Documentation

## Overview

The Contribution Reminder System automatically sends daily push notification reminders to Connect Room members who have not contributed or have contributed less than the required amount for active contributions.

## Features

### 1. Daily Reminder Notifications
- **Schedule**: Runs daily at 9:00 AM
- **Target**: All active contributions with future deadlines
- **Recipients**: Room members who haven't contributed or contributed partially

### 2. Two Types of Reminders

#### Non-Contributor Reminders
- **Trigger**: Member has contributed 0 amount to the contribution
- **Message**: "Don't forget to contribute to '[Contribution Title]'. Amount: [Amount] [Currency]"
- **Includes**: Deadline information if available

#### Partial Contributor Reminders  
- **Trigger**: Member has contributed less than the required amount
- **Message**: "You've contributed [Amount] [Currency] to '[Contribution Title]'. Please complete the remaining [Remaining Amount] [Currency]"
- **Includes**: Deadline information if available

## Implementation

### Console Commands

#### 1. Main Reminder Command
```bash
php artisan contributions:send-reminders
```

**File**: `app/Console/Commands/SendContributionReminders.php`

**Features**:
- Processes all active contributions
- Identifies non-contributors and partial contributors
- Sends appropriate notifications
- Comprehensive logging
- Error handling

#### 2. Test Command
```bash
# Test reminders for a specific room
php artisan contributions:test-reminders --room-id=123

# Test reminders for a specific contribution
php artisan contributions:test-reminders --contribution-id=456
```

**File**: `app/Console/Commands/TestContributionReminders.php`

**Features**:
- Preview which members would receive reminders
- Shows contribution status for each member
- No actual notifications sent
- Useful for testing and debugging

### Scheduled Task

**File**: `routes/console.php`

```php
Schedule::command('contributions:send-reminders')
    ->daily()
    ->at('09:00')
    ->withoutOverlapping()
    ->onFailure(function () {
        Log::error('Failed to send contribution reminders at ' . now());
    })
    ->onSuccess(function () {
        Log::info('Successfully ran contributions:send-reminders at ' . now());
    });
```

## Notification Data Structure

### Non-Contributor Reminder
```json
{
    "type": "contribution_reminder_non_contributor",
    "connect_room_id": "123",
    "connect_room_name": "Room Name",
    "connect_room_reference": "CR-0000001",
    "contribution_id": "456",
    "contribution_title": "Contribution Title",
    "contribution_amount": "1000.00",
    "contribution_currency": "XAF",
    "contribution_deadline": "2024-01-15T00:00:00.000Z",
    "user_contributed": "0",
    "user_contributed_amount": "0",
    "remaining_amount": "1000.00",
    "timestamp": "1704067200",
    "action": "open_contribution_details"
}
```

### Partial Contributor Reminder
```json
{
    "type": "contribution_reminder_partial_contributor",
    "connect_room_id": "123",
    "connect_room_name": "Room Name",
    "connect_room_reference": "CR-0000001",
    "contribution_id": "456",
    "contribution_title": "Contribution Title",
    "contribution_amount": "1000.00",
    "contribution_currency": "XAF",
    "contribution_deadline": "2024-01-15T00:00:00.000Z",
    "user_contributed": "1",
    "user_contributed_amount": "500.00",
    "remaining_amount": "500.00",
    "timestamp": "1704067200",
    "action": "open_contribution_details"
}
```

## Logic Flow

### 1. Contribution Selection
- Only processes contributions that are:
  - Active (`is_active = true`)
  - Not completed (`status != 'completed'`)
  - Have a deadline (`deadline IS NOT NULL`)
  - Deadline is in the future (`deadline > now()`)

### 2. Member Analysis
For each room member:
- Calculate total contributed amount for the specific contribution
- Check if amount is 0 (non-contributor) or less than required (partial contributor)
- Send appropriate reminder

### 3. Contribution Calculation
```php
$userContributions = ConnectRoomTransaction::where('user_id', $userId)
    ->where('contribution_id', $contributionId)
    ->where('status', 'completed')
    ->where('transaction_type', 'contribution')
    ->get();

$totalContributed = $userContributions->sum('amount');
```

## Logging

### Success Logs
- Command execution start/completion
- Number of contributions processed
- Number of reminders sent per contribution
- Individual reminder success

### Error Logs
- Command execution failures
- Individual notification failures
- Database query errors
- Service exceptions

### Log Examples
```php
Log::info('Contribution reminders process completed', [
    'contributions_processed' => 5,
    'total_reminders_sent' => 23,
    'timestamp' => now()
]);

Log::info('Non-contributor reminder sent', [
    'room_id' => 123,
    'contribution_id' => 456,
    'user_id' => 789,
    'user_name' => 'John Doe'
]);
```

## Testing

### Manual Testing
1. Create a test contribution with a future deadline
2. Add members to the room
3. Run the test command to preview reminders
4. Run the actual reminder command
5. Check logs for success/failure

### Test Command Usage
```bash
# Test a specific room
php artisan contributions:test-reminders --room-id=123

# Test a specific contribution
php artisan contributions:test-reminders --contribution-id=456
```

## Configuration

### Schedule Time
Default: 9:00 AM daily
- Can be modified in `routes/console.php`
- Uses Laravel's task scheduler
- Requires cron job setup on server

### Notification Service
- Uses existing `ConnectRoomNotificationService`
- Leverages Firebase push notifications
- Handles device token management
- Includes error handling for invalid tokens

## Dependencies

### Models
- `ConnectRoom`
- `ConnectRoomContribution`
- `ConnectRoomMember`
- `ConnectRoomTransaction`
- `User`

### Services
- `ConnectRoomNotificationService`
- `FirebaseService`

### External Services
- Firebase Cloud Messaging (FCM)
- Laravel Task Scheduler

## Error Handling

### Database Errors
- Graceful handling of missing relationships
- Continues processing other contributions on individual failures
- Logs all database-related errors

### Notification Errors
- Individual notification failures don't stop the process
- Invalid device tokens are automatically deactivated
- Comprehensive error logging

### Service Errors
- Firebase service errors are caught and logged
- Network timeouts are handled gracefully
- Service unavailability doesn't crash the command

## Monitoring

### Key Metrics
- Number of contributions processed
- Number of reminders sent
- Success/failure rates
- Processing time

### Alerts
- Command execution failures
- High failure rates
- Service unavailability

## Future Enhancements

### Potential Improvements
1. **Configurable Schedule**: Allow different reminder frequencies
2. **Smart Timing**: Send reminders closer to deadline
3. **Escalation**: Different reminder types for urgent contributions
4. **Analytics**: Track reminder effectiveness
5. **Customization**: Room-specific reminder settings
6. **Batch Processing**: Handle large numbers of contributions efficiently

### Advanced Features
1. **Contribution Progress Tracking**: Show progress bars in notifications
2. **Deadline Warnings**: Special notifications for contributions due soon
3. **Member Engagement**: Track who responds to reminders
4. **Contribution Trends**: Analyze contribution patterns
5. **Automated Follow-ups**: Multiple reminder rounds for non-responders
