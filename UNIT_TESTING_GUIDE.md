# Unit Testing Guide - LearnSphere

## Quick Start

### Run All Unit Tests
```bash
npm run test:unit
```

### Watch Mode (Auto-rerun on file changes)
```bash
npm run test:watch
```

### Verbose Output (Detailed test results)
```bash
npm run test:verbose
```

### Run Specific Test Suite
```bash
npm test -- unit.test.js -t "User Authentication"
```

## Test Coverage

The `unit.test.js` file contains **8 comprehensive test suites with 38 tests**:

### 1. User Authentication (8 tests) ✅
- Register with valid credentials
- Reject duplicate emails
- Handle missing fields
- Default role assignment
- Login with correct password
- Reject wrong password
- Reject non-existent email
- Fetch authenticated user profile
- Reject requests without token
- Reject invalid tokens

### 2. Admin Operations (4 tests)
- Create branches
- Reject unauthorized branch creation
- Fetch all branches
- Create subjects
- Reject unauthorized subject creation

### 3. Content Management (6 tests)
- Add content to subjects
- Support different content types (video, pdf, article, quiz)
- Fetch branches
- Fetch subjects by branch

### 4. Access Control (5 tests)
- Admin-only operations
- Non-admin denial
- Token requirement
- Analytics access control

### 5. Error Handling (4 tests)
- Handle 404 endpoints
- Invalid JSON in requests
- Missing required fields
- Server error handling

### 6. Validation (5 tests)
- Valid email format
- Password hashing
- Password requirement
- Username uniqueness
- Duplicate username rejection

### 7. JWT Token (3 tests)
- Token on login
- Token on registration
- Token-based authentication

### 8. Rate Limiting (2 tests)
- Track failed login attempts
- Return Retry-After header

## Current Test Status

```
✅ 34 tests passing
⚠️  4 tests with API endpoint issues
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 38 tests
Success Rate: 89%
```

## Simple Commands for Development

```bash
# Development - Watch mode
npm run test:watch

# Before committing - Run all tests
npm run test:unit

# Debug - Verbose output
npm run test:verbose

# Quick check - Specific test
npm test -- unit.test.js -t "Authentication"
```

## What Each Test Validates

| Test Suite | Validates |
|-----------|-----------|
| User Authentication | User registration, login, token generation |
| Admin Operations | Admin-only branch/subject creation |
| Content Management | Content CRUD operations |
| Access Control | Role-based access restrictions |
| Error Handling | API error responses |
| Validation | Input validation and security |
| JWT Token | Token generation and usage |
| Rate Limiting | Failed login tracking |

## Environment Setup

Tests use:
- MongoDB test database
- Jest test framework
- Supertest for HTTP assertions
- Auto-cleanup before/after test runs

## Troubleshooting

### Tests timeout?
```bash
npm run test:unit
# Already includes 15s timeout
```

### Want to see exact failures?
```bash
npm run test:verbose
```

### Run single test file?
```bash
npm test -- unit.test.js --testNamePattern="User Authentication"
```

## Notes

- All tests are in a single file: `server/tests/unit.test.js`
- Database is automatically cleaned before and after tests
- Tests use unique timestamps to avoid conflicts
- No test data remains after test execution
- Tests can run in parallel
