# user_session Key Explanation

## 🔍 How user_session Works

### Flow Diagram

```
User Login with "Remember Me" checked
    ↓
Client sends: { email, password, rememberMe: true }
    ↓
Server receives rememberMe flag
    ↓
Check: rememberMe === true?
    ↓ YES
Check: Redis exists and ready?
    ↓ YES
Create key: user_session:{userId}
    ↓
Store JWT token with 90-day expiration
    ↓
✅ Key created in Redis
```

---

## 📝 Step-by-Step Process

### 1. Client Side (LoginForm.jsx)

```javascript
// User checks "Remember me" checkbox
const [rememberMe, setRememberMe] = useState(false);

// Checkbox updates state
onChange={(e) => setRememberMe(e.target.checked)}

// On submit, sends to backend
await login(email, password, rememberMe);
```

### 2. Auth Context (AuthContext.jsx)

```javascript
// Receives rememberMe and sends to API
const login = async (email, password, rememberMe = false) => {
    const { data } = await axios.post(`${API_URL}/login`, { 
        email, 
        password, 
        rememberMe  // ← Sent to backend
    });
};
```

### 3. Server Side (userController.js)

```javascript
// Receives rememberMe from request body
const { email, password, rememberMe } = req.body;

// Checks if rememberMe is true
if (rememberMe) {
    // Checks Redis availability
    if (redis && redis.status === 'ready') {
        // Creates key: user_session:{userId}
        const sessionKey = `user_session:${user._id}`;
        
        // Stores token with 90-day expiration
        await redis.set(sessionKey, token, 'EX', 90 * 24 * 60 * 60);
    }
}
```

---

## 🔧 Debugging user_session

### Check 1: Is rememberMe being sent?

**Server Logs:**
```
[Login] Attempt for: user@example.com, rememberMe: true (type: boolean)
```

**If you see `rememberMe: false`:**
- Checkbox might not be checked
- State might not be updating
- Check browser console for errors

### Check 2: Is Redis ready?

**Server Logs:**
```
[Remember Me] Redis status: ready, storing session
[Remember Me] Session stored in Redis: user_session:69198d7fb192ccb78fdf761c (90 days)
```

**If you see warnings:**
- `[Remember Me] Redis not available` → Redis not connected
- `[Remember Me] Redis status: connecting` → Wait for Redis to connect
- `[Remember Me] Redis status: end` → Redis disconnected

### Check 3: Verify in Redis

```bash
# Connect to Redis
redis-cli

# List all user sessions
KEYS user_session:*

# Get specific session
GET user_session:{userId}

# Check TTL (should be ~7776000 = 90 days)
TTL user_session:{userId}
```

---

## 🐛 Common Issues

### Issue 1: rememberMe is false

**Symptoms:**
- Server log shows: `rememberMe: false`
- No `[Remember Me] Session stored` message

**Solutions:**
1. Make sure checkbox is actually checked
2. Check browser console for JavaScript errors
3. Verify state is updating: `console.log(rememberMe)` in LoginForm

### Issue 2: Redis not ready

**Symptoms:**
- Server log shows: `[Remember Me] Redis status: {status}`

**Solutions:**
1. Check Redis connection: `GET /api/health`
2. Verify `REDIS_URL` in `.env`
3. Check Redis server is running
4. Wait a few seconds for Redis to connect

### Issue 3: Key not in Redis

**Symptoms:**
- Server log shows success but key doesn't exist

**Solutions:**
1. Check server logs for errors
2. Verify Redis connection is stable
3. Check if key expired (TTL = -2)
4. Check Redis memory limits

---

## ✅ Testing Checklist

1. **Check Remember Me checkbox:**
   - [ ] Checkbox is visible
   - [ ] Checkbox can be checked/unchecked
   - [ ] State updates when clicked

2. **Login with Remember Me:**
   - [ ] Check "Remember me" checkbox
   - [ ] Submit login form
   - [ ] Check server logs for: `rememberMe: true`
   - [ ] Check server logs for: `[Remember Me] Session stored`

3. **Verify in Redis:**
   - [ ] Key exists: `KEYS user_session:*`
   - [ ] Value is JWT token
   - [ ] TTL is ~7776000 seconds (90 days)

4. **Login without Remember Me:**
   - [ ] Don't check "Remember me"
   - [ ] Submit login form
   - [ ] Check server logs for: `[Remember Me] Not requested`
   - [ ] Verify no key created in Redis

---

## 📊 Expected Server Logs

### Successful Remember Me Login:
```
[Login] Attempt for: user@example.com, rememberMe: true (type: boolean)
[Remember Me] Session stored in Redis: user_session:69198d7fb192ccb78fdf761c (90 days)
```

### Login without Remember Me:
```
[Login] Attempt for: user@example.com, rememberMe: false (type: boolean)
[Remember Me] Not requested, skipping Redis session storage
```

### Redis Not Ready:
```
[Login] Attempt for: user@example.com, rememberMe: true (type: boolean)
[Remember Me] Redis status: connecting, cannot store session
```

---

## 🎯 Summary

**user_session key is created when:**
1. ✅ User checks "Remember me" checkbox
2. ✅ `rememberMe` is sent as `true` to backend
3. ✅ Redis is connected and ready
4. ✅ Login is successful

**Key details:**
- **Key format:** `user_session:{userId}`
- **Value:** JWT token string
- **TTL:** 90 days (7776000 seconds)
- **Purpose:** Long-term authentication storage

**If it's not working:**
- Check server logs for detailed messages
- Verify Redis connection
- Ensure checkbox state is updating
- Check browser console for errors

The enhanced logging will show you exactly what's happening! 🔍

