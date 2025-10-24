# Contribution Reminders - Quick Reference

## Commands

### Send Daily Reminders
```bash
php artisan contributions:send-reminders
```
- Sends reminders to all eligible members
- Runs automatically daily at 9:00 AM
- Processes all active contributions with future deadlines

### Test Reminders (Preview Only)
```bash
# Test for a specific room
php artisan contributions:test-reminders --room-id=123

# Test for a specific contribution  
php artisan contributions:test-reminders --contribution-id=456
```
- Shows which members would receive reminders
- No actual notifications sent
- Useful for testing and debugging

## What Gets Reminded

### Non-Contributors
- Members who have contributed **0** to a contribution
- Message: "Don't forget to contribute to '[Title]'. Amount: [Amount] [Currency]"

### Partial Contributors
- Members who have contributed **less than required amount**
- Message: "You've contributed [Amount] to '[Title]'. Please complete the remaining [Amount]"

## Eligibility Criteria

### Contributions Must Be:
- ✅ Active (`is_active = true`)
- ✅ Not completed (`status != 'completed'`)
- ✅ Have a deadline (`deadline IS NOT NULL`)
- ✅ Deadline in the future (`deadline > now()`)

### Members Are Reminded If:
- ✅ They have contributed 0 amount (non-contributor)
- ✅ They have contributed less than required amount (partial contributor)

## Notification Data

### Common Fields
- `type`: `contribution_reminder_non_contributor` or `contribution_reminder_partial_contributor`
- `connect_room_id`: Room ID
- `contribution_id`: Contribution ID
- `contribution_title`: Contribution title
- `contribution_amount`: Required amount
- `contribution_currency`: Currency
- `contribution_deadline`: Deadline (ISO format)
- `action`: `open_contribution_details`

### Non-Contributor Fields
- `user_contributed`: `"0"`
- `user_contributed_amount`: `"0"`
- `remaining_amount`: Full contribution amount

### Partial Contributor Fields
- `user_contributed`: `"1"`
- `user_contributed_amount`: Amount already contributed
- `remaining_amount`: Amount still needed

## Schedule

### Automatic Execution
- **Frequency**: Daily
- **Time**: 9:00 AM
- **Overlap Protection**: Yes (`withoutOverlapping()`)
- **Logging**: Success and failure logs

### Manual Execution
- Can be run manually anytime
- Useful for testing or immediate reminders
- Same logic as scheduled execution

## Logging

### Success Logs
```
[INFO] Contribution reminders process completed
[INFO] Non-contributor reminder sent
[INFO] Partial contributor reminder sent
```

### Error Logs
```
[ERROR] Failed to send non-contributor reminder
[ERROR] Contribution reminders process failed
```

## Testing Workflow

1. **Create Test Data**
   - Create a room with members
   - Create a contribution with future deadline
   - Ensure some members haven't contributed

2. **Test Preview**
   ```bash
   php artisan contributions:test-reminders --room-id=123
   ```

3. **Send Actual Reminders**
   ```bash
   php artisan contributions:send-reminders
   ```

4. **Check Logs**
   - Review success/failure logs
   - Verify notifications were sent

## Troubleshooting

### Common Issues

#### No Reminders Sent
- Check if contributions are active and have future deadlines
- Verify members exist and have device tokens
- Check Firebase service configuration

#### Command Fails
- Check database connectivity
- Verify Firebase credentials
- Review error logs for specific issues

#### Notifications Not Received
- Check device token validity
- Verify Firebase service is working
- Check user's notification settings

### Debug Steps
1. Run test command to preview reminders
2. Check logs for errors
3. Verify contribution and member data
4. Test Firebase service independently
5. Check device token status

## Files Modified/Created

### New Files
- `app/Console/Commands/SendContributionReminders.php`
- `app/Console/Commands/TestContributionReminders.php`
- `docs/CONTRIBUTION_REMINDER_SYSTEM_DOCUMENTATION.md`
- `docs/CONTRIBUTION_REMINDERS_QUICK_REFERENCE.md`

### Modified Files
- `routes/console.php` (added scheduled task)

## Dependencies

### Required Services
- `ConnectRoomNotificationService`
- `FirebaseService`
- Laravel Task Scheduler

### Required Models
- `ConnectRoom`
- `ConnectRoomContribution`
- `ConnectRoomMember`
- `ConnectRoomTransaction`
- `User`
- `UserDevices`
