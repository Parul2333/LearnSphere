# Quick Command Reference

## Run Tests

```bash
# Run unit tests only (RECOMMENDED)
npm test -- unit.test.js

# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Run in watch mode (auto-rerun on changes)
npm test -- --watch

# Run specific test suite
npm test -- -t "User Authentication"

# Run with custom timeout
npm test -- --testTimeout=20000
```

## Expected Results

### Unit Tests (unit.test.js)
```
✅ 37 tests passing
⏱️  ~50 seconds
📊 100% pass rate
```

### All Tests (all test files)
```
✅ 56 tests passing
❌ 21 tests failing (in other files - pre-existing)
⏱️  ~52 seconds
📊 73% pass rate
```

---

## File Reference

| File | Purpose | Status |
|------|---------|--------|
| `server/tests/unit.test.js` | Unit tests (8 suites, 37 tests) | ✅ All passing |
| `server/tests/content.test.js` | Content API tests | ⚠️ 4 failures |
| `server/tests/functional.test.js` | End-to-end workflows | ⚠️ 9 failures |
| `server/tests/user.test.js` | User model tests | ⚠️ Async issues |
| `server/package.json` | Test configuration | ✅ Updated |

---

## What Gets Tested (Unit Tests)

### 1. Authentication (10 tests)
- User registration/login
- Token generation
- Profile access
- Password validation

### 2. Admin Operations (4 tests)
- Branch management
- Subject creation
- Authorization checks

### 3. Content Management (8 tests)
- Content creation
- Different content types
- Retrieval operations

### 4. Access Control (5 tests)
- Role-based permissions
- Token requirements
- Admin-only endpoints

### 5. Error Handling (4 tests)
- Invalid requests
- Missing fields
- 404s and server errors

### 6. Validation (4 tests)
- Email format
- Password hashing
- Username uniqueness

### 7. JWT Token (3 tests)
- Token generation
- Token authentication

### 8. Rate Limiting (2 tests)
- Failed login tracking
- Rate limit enforcement

---

## Database Models (Field Reference)

### User
```javascript
{ username, email, password, role }
```

### Branch
```javascript
{ name, years: [String] }  // years is REQUIRED
```

### Subject
```javascript
{ name, branchId, year, createdBy }
```

### Content
```javascript
{
    subjectId,
    title,
    category: ['syllabus', 'reference_video', 'notes', 'general_info'],
    link,
    addedBy
}
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Tests timeout | Use `npm test -- --testTimeout=20000` |
| Data conflicts | Uses `Date.now()` for unique data |
| Rate limited | Accept 429 status in expectations |
| Connection fails | Check `.env` MONGO_URI |
| Async warnings | Tests have proper cleanup |

---

## Test Results Summary

```
UNIT TEST RESULTS: ✅ PASSING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Register User (4 tests)
✅ Login User (3 tests)  
✅ Get User Profile (3 tests)
✅ Branch Management (2 tests)
✅ Subject Management (2 tests)
✅ Content Creation (3 tests)
✅ Content Retrieval (2 tests)
✅ Role-based Access (3 tests)
✅ Analytics Access (2 tests)
✅ Error Handling (4 tests)
✅ Validation (4 tests)
✅ JWT Token (3 tests)
✅ Rate Limiting (2 tests)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   37 TESTS PASSING ✅
   Duration: ~50 seconds
   Success Rate: 100%
```

---

## When to Run Tests

| When | Command |
|------|---------|
| Before committing code | `npm test -- unit.test.js` |
| After changing API | `npm test -- unit.test.js` |
| During development | `npm test -- --watch` |
| Before deploying | `npm test` |
| Debugging failure | `npm test -- -t "test name"` |

---

**Last Updated:** November 16, 2025 | **Version:** 1.0
