# Connect Room Questions and Answers API Documentation

This document provides comprehensive API documentation for managing questions and answers within connect rooms. The questions system allows room owners and admins to create custom questions that new members must answer when joining a room.

## Table of Contents

1. [Overview](#overview)
2. [Questions Management](#questions-management)
3. [Answers Management](#answers-management)
4. [Question Types](#question-types)
5. [Common Response Formats](#common-response-formats)
6. [Error Handling](#error-handling)
7. [Authentication & Permissions](#authentication--permissions)
8. [Examples](#examples)

---

## Overview

The Questions and Answers system allows connect room owners and admins to:

- Create custom questions for new members
- Set different question types (text, single choice, multiple choice)
- Make questions required or optional
- Order questions in a specific sequence
- View and manage answers submitted by members
- Update or delete existing questions

### Key Features

- **Maximum 5 questions per room**
- **3 question types supported**: Text, Single Choice, Multiple Choice
- **Required/Optional questions**
- **Custom ordering** of questions
- **Answer validation** based on question type
- **Soft deletion** for questions and answers
- **Unique constraint** - one answer per user per question

---

## Questions Management

### 1. Get Room Questions

**GET** `/api/v1/connect-room/{room}/questions`

Retrieve all questions for a specific connect room, ordered by their sequence.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Questions retrieved successfully",
  "data": [
    {
      "id": 1,
      "question": "What is your main interest in this room?",
      "type": "text",
      "options": null,
      "is_required": true,
      "order": 0
    },
    {
      "id": 2,
      "question": "How did you hear about us?",
      "type": "single_choice",
      "options": ["Social Media", "Friend", "Website", "Other"],
      "is_required": true,
      "order": 1
    },
    {
      "id": 3,
      "question": "What topics interest you most?",
      "type": "multiple_choice",
      "options": ["Technology", "Business", "Health", "Education", "Entertainment"],
      "is_required": false,
      "order": 2
    }
  ]
}
```

#### Error Responses

- **404 Not Found**: Connect room not found
- **500 Internal Server Error**: Failed to retrieve questions

---

### 2. Add Question to Room

**POST** `/api/v1/connect-room/{room}/questions`

Add a new question to a connect room. Only room owners and admins can add questions.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |

#### Request Body

```json
{
  "question": "What is your experience level?",
  "type": "single_choice",
  "options": ["Beginner", "Intermediate", "Advanced"],
  "is_required": true,
  "order": 1
}
```

#### Required Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `question` | string | Question text | Required, max 500 characters |
| `type` | string | Question type | Required, must be: `text`, `single_choice`, or `multiple_choice` |

#### Optional Fields

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| `options` | array | Answer options for choice types | Required for `single_choice` and `multiple_choice`, min 2 options, max 200 chars each |
| `is_required` | boolean | Whether answer is required | Default: `true` |
| `order` | integer | Display order | Default: next available order number |

#### Success Response (201)

```json
{
  "status": "success",
  "message": "Question added successfully",
  "data": {
    "id": 4,
    "question": "What is your experience level?",
    "type": "single_choice",
    "options": ["Beginner", "Intermediate", "Advanced"],
    "is_required": true,
    "order": 1
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can manage questions
- **404 Not Found**: Connect room not found
- **422 Unprocessable Entity**: 
  - Maximum number of questions (5) already reached
  - Validation errors
- **500 Internal Server Error**: Failed to add question

---

### 3. Update Question

**PUT** `/api/v1/connect-room/{room}/questions/{question}`

Update an existing question in a connect room. Only room owners and admins can update questions.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |
| `question` | integer | Yes | ID of the question to update |

#### Request Body

```json
{
  "question": "Updated: What is your experience level?",
  "type": "multiple_choice",
  "options": ["Beginner", "Intermediate", "Advanced", "Expert"],
  "is_required": false,
  "order": 2
}
```

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Question updated successfully",
  "data": {
    "id": 4,
    "question": "Updated: What is your experience level?",
    "type": "multiple_choice",
    "options": ["Beginner", "Intermediate", "Advanced", "Expert"],
    "is_required": false,
    "order": 2
  }
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can manage questions
- **404 Not Found**: Connect room or question not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Failed to update question

---

### 4. Delete Question

**DELETE** `/api/v1/connect-room/{room}/questions/{question}`

Delete a question from a connect room. Only room owners and admins can delete questions.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `room` | integer | Yes | ID of the connect room |
| `question` | integer | Yes | ID of the question to delete |

#### Success Response (200)

```json
{
  "status": "success",
  "message": "Question deleted successfully"
}
```

#### Error Responses

- **403 Forbidden**: Only room owners and admins can manage questions
- **404 Not Found**: Connect room or question not found
- **500 Internal Server Error**: Failed to delete question

---

## Answers Management

Answers are automatically created when users submit join requests with their responses to room questions. The system handles answer validation and storage based on the question type.

### Answer Submission Process

Answers are submitted as part of the join request process via the endpoint:

**POST** `/api/v1/connect-room/{room}/join-request`

#### Request Body Example

```json
{
  "answers": {
    "1": "I'm interested in learning about technology and networking",
    "2": "Social Media",
    "3": ["Technology", "Business"]
  }
}
```

#### Answer Format by Question Type

| Question Type | Answer Format | Example |
|---------------|---------------|---------|
| `text` | string | `"I'm interested in learning about technology"` |
| `single_choice` | string | `"Social Media"` |
| `multiple_choice` | array | `["Technology", "Business"]` |

#### Validation Rules

- **Required questions**: Must be answered
- **Optional questions**: Can be left empty (null)
- **Single choice**: Answer must match one of the provided options
- **Multiple choice**: All answers must match provided options
- **Text questions**: Maximum 1000 characters
- **Unique constraint**: One answer per user per question

---

## Question Types

### 1. Text Questions

For open-ended text responses.

```json
{
  "question": "What is your main interest in this room?",
  "type": "text",
  "options": null,
  "is_required": true,
  "order": 0
}
```

**Answer Format**: String (max 1000 characters)

### 2. Single Choice Questions

For selecting one option from a list.

```json
{
  "question": "How did you hear about us?",
  "type": "single_choice",
  "options": ["Social Media", "Friend", "Website", "Other"],
  "is_required": true,
  "order": 1
}
```

**Answer Format**: String (must match one of the options)

### 3. Multiple Choice Questions

For selecting multiple options from a list.

```json
{
  "question": "What topics interest you most?",
  "type": "multiple_choice",
  "options": ["Technology", "Business", "Health", "Education", "Entertainment"],
  "is_required": false,
  "order": 2
}
```

**Answer Format**: Array of strings (all must match provided options)

---

## Common Response Formats

### Success Response Format

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

### Error Response Format

```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    // Validation errors (if applicable)
  }
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

### Common Error Messages

- **Authentication Required**: `"Authentication required"`
- **Insufficient Permissions**: `"Only room owners and admins can manage questions"`
- **Resource Not Found**: `"Connect room not found"` or `"Question not found"`
- **Validation Error**: `"The given data was invalid"`
- **Maximum Questions**: `"Maximum number of questions (5) already reached"`
- **Server Error**: `"An internal server error occurred"`

### Validation Error Examples

```json
{
  "status": "error",
  "message": "The given data was invalid",
  "errors": {
    "question": ["The question field is required."],
    "type": ["The selected type is invalid."],
    "options": ["The options field is required when type is single_choice."],
    "options.0": ["The options.0 field must not be greater than 200 characters."]
  }
}
```

---

## Authentication & Permissions

### Authentication

All API endpoints require Bearer token authentication:

```
Authorization: Bearer {your-token}
```

### Permission Levels

| Role | Permissions |
|------|-------------|
| **Room Owner** | Full access to all question management operations |
| **Room Admin** | Full access to all question management operations |
| **Room Member** | Can view questions (when joining) and submit answers |
| **Non-Member** | Can view questions when submitting join requests |

### Access Control

- **View Questions**: All authenticated users (when joining rooms)
- **Create Questions**: Room owners and admins only
- **Update Questions**: Room owners and admins only
- **Delete Questions**: Room owners and admins only
- **Submit Answers**: Users submitting join requests
- **View Answers**: Room owners and admins (through join request details)

---

## Examples

### Complete Question Management Flow

```bash
# 1. Get existing questions
curl -X GET "https://api.example.com/api/v1/connect-room/1/questions" \
  -H "Authorization: Bearer {token}"

# 2. Add a new text question
curl -X POST "https://api.example.com/api/v1/connect-room/1/questions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your main interest in this room?",
    "type": "text",
    "is_required": true,
    "order": 0
  }'

# 3. Add a single choice question
curl -X POST "https://api.example.com/api/v1/connect-room/1/questions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How did you hear about us?",
    "type": "single_choice",
    "options": ["Social Media", "Friend", "Website", "Other"],
    "is_required": true,
    "order": 1
  }'

# 4. Add a multiple choice question
curl -X POST "https://api.example.com/api/v1/connect-room/1/questions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What topics interest you most?",
    "type": "multiple_choice",
    "options": ["Technology", "Business", "Health", "Education"],
    "is_required": false,
    "order": 2
  }'

# 5. Update a question
curl -X PUT "https://api.example.com/api/v1/connect-room/1/questions/1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Updated: What is your main interest in this room?",
    "is_required": false
  }'

# 6. Delete a question
curl -X DELETE "https://api.example.com/api/v1/connect-room/1/questions/1" \
  -H "Authorization: Bearer {token}"
```

### Answer Submission Example

```bash
# Submit join request with answers
curl -X POST "https://api.example.com/api/v1/connect-room/1/join-request" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "1": "I am interested in learning about technology and networking with like-minded professionals.",
      "2": "Social Media",
      "3": ["Technology", "Business"]
    }
  }'
```

### Error Handling Examples

```bash
# Try to add more than 5 questions
curl -X POST "https://api.example.com/api/v1/connect-room/1/questions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "This would be the 6th question",
    "type": "text"
  }'

# Response: 422 Unprocessable Entity
{
  "status": "error",
  "message": "Maximum number of questions (5) already reached"
}

# Try to add single_choice without options
curl -X POST "https://api.example.com/api/v1/connect-room/1/questions" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is your preference?",
    "type": "single_choice"
  }'

# Response: 422 Unprocessable Entity
{
  "status": "error",
  "message": "The given data was invalid",
  "errors": {
    "options": ["The options field is required when type is single_choice."]
  }
}
```

---

## Database Schema

### Connect Room Questions Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `connect_room_id` | bigint | Foreign key to connect_rooms |
| `question` | text | Question text |
| `type` | enum | Question type (text, single_choice, multiple_choice) |
| `options` | json | Answer options for choice types |
| `is_required` | boolean | Whether answer is required |
| `order` | integer | Display order |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |
| `deleted_at` | timestamp | Soft deletion timestamp |

### Connect Room Question Answers Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | bigint | Primary key |
| `question_id` | bigint | Foreign key to connect_room_questions |
| `user_id` | bigint | Foreign key to users |
| `connect_room_id` | bigint | Foreign key to connect_rooms |
| `answer` | text | User's answer |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |
| `deleted_at` | timestamp | Soft deletion timestamp |

### Constraints

- **Unique constraint**: `(question_id, user_id)` - One answer per user per question
- **Foreign key constraints**: All foreign keys have cascade delete
- **Indexes**: On `(connect_room_id, user_id)` for efficient querying

---

## Best Practices

### Question Design

1. **Keep questions concise** - Maximum 500 characters
2. **Use clear, unambiguous language**
3. **Provide meaningful options** for choice questions
4. **Order questions logically** - Most important first
5. **Limit to essential questions** - Maximum 5 per room

### Answer Options

1. **Provide 2-5 options** for choice questions
2. **Keep option text short** - Maximum 200 characters
3. **Use consistent formatting** across options
4. **Include "Other" option** when appropriate
5. **Avoid overlapping options**

### Validation

1. **Always validate required fields**
2. **Check option validity** for choice questions
3. **Enforce character limits**
4. **Handle edge cases** gracefully
5. **Provide clear error messages**

---

## Integration Notes

### Join Request Integration

Questions and answers are tightly integrated with the join request system:

1. **Questions are displayed** when users request to join a room
2. **Answers are validated** before creating join requests
3. **Answers are stored** with the join request
4. **Room admins can view answers** when reviewing join requests

### Data Relationships

- **Questions belong to rooms** (one-to-many)
- **Answers belong to questions and users** (many-to-one)
- **Answers are linked to join requests** (through user and room)
- **Soft deletion preserves data integrity**

---

This documentation provides comprehensive coverage of the Connect Room Questions and Answers API. For additional support or questions, please contact the development team.
