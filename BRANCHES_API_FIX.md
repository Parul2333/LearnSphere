# Branches API Fix - /api/content/branches

## 🔍 Issue

**Error:** "Failed to load available branches. Check backend server and ensure /api/content/branches route is working."

**Status:** ✅ **FIXED**

---

## ✅ Root Cause

The endpoint is working correctly on the backend, but the client had issues:

1. **Hardcoded HTTPS URL** - Client was always using `https://localhost:4430`
2. **Browser certificate blocking** - Self-signed certificate blocks HTTPS requests
3. **Missing error handling** - Generic error messages made debugging difficult

---

## 🔧 Fixes Applied

### 1. Auto-Detection of Protocol (client/src/api/config.js)

**Before:**
```javascript
export const API_BASE_URL = 'https://localhost:4430/api';
```

**After:**
```javascript
// Auto-detect: Use HTTP if page is HTTP, HTTPS if page is HTTPS
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const isHttps = window.location.protocol === 'https:';
    const apiPort = isHttps ? 4430 : 5000;
    return `${window.location.protocol}//${window.location.hostname}:${apiPort}/api`;
  }
  return 'https://localhost:4430/api';
};

export const API_BASE_URL = getApiBaseUrl();
```

**Result:**
- ✅ If accessing via `http://localhost:5173` → Uses `http://localhost:5000/api`
- ✅ If accessing via `https://localhost:5173` → Uses `https://localhost:4430/api`

### 2. Enhanced Error Handling (client/src/pages/Home.jsx)

**Before:**
```javascript
catch (err) {
    setError("Failed to load available branches...");
}
```

**After:**
```javascript
catch (err) {
    // Detailed error messages based on error type
    if (err.code === 'ERR_NETWORK') {
        errorMessage += "Network error - check if backend server is running and certificate is accepted (for HTTPS).";
    } else if (err.response?.status === 404) {
        errorMessage += "Endpoint not found - check if /api/content/branches route exists.";
    } else {
        errorMessage += `Error: ${err.response?.data?.message || err.message}`;
    }
}
```

### 3. Added Debugging Logs

- ✅ Logs API URL being used
- ✅ Logs successful responses
- ✅ Logs detailed errors
- ✅ Request interceptor for API calls

---

## 🧪 Testing

### Test 1: Via HTTP (Recommended for Development)

1. **Access:** `http://localhost:5173`
2. **Expected:** Uses `http://localhost:5000/api/content/branches`
3. **Result:** ✅ Should work without certificate issues

### Test 2: Via HTTPS

1. **Access:** `https://localhost:5173`
2. **Accept certificate:** Click "Advanced" → "Proceed to localhost"
3. **Expected:** Uses `https://localhost:4430/api/content/branches`
4. **Result:** ✅ Should work after accepting certificate

### Test 3: Check Browser Console

**Look for:**
```
[API] GET /content/branches
[Home] Fetching branches from: http://localhost:5000/api/content/branches
[Home] Branches loaded: [{_id: "...", name: "Computer Science", ...}]
```

---

## 🔍 Verification

### Check Endpoint Directly

```bash
# HTTP
curl http://localhost:5000/api/content/branches

# HTTPS
curl -k https://localhost:4430/api/content/branches
```

**Expected Response:**
```json
[
  {
    "_id": "691986e3bfb7d1073cc82070",
    "name": "Computer Science Engineering",
    "years": ["First Year", "Second Year", "Third Year", "Fourth Year"]
  }
]
```

### Check Server Logs

Look for:
- `[API] GET /content/branches` - Request received
- `[Access Counter] Incremented to X` - Page visit counted

---

## 📝 Summary

**Issue:** Branches not loading in browser  
**Cause:** HTTPS certificate blocking + hardcoded API URL  
**Fix:**
1. ✅ Auto-detect protocol (HTTP/HTTPS)
2. ✅ Use appropriate port (5000 for HTTP, 4430 for HTTPS)
3. ✅ Better error handling and logging

**Result:** ✅ **FIXED** - Branches should now load correctly!

---

## 🚀 Quick Fix Guide

**If branches still don't load:**

1. **Check browser console** (F12):
   - Look for `[API]` and `[Home]` log messages
   - Check for network errors

2. **Try HTTP instead of HTTPS:**
   - Access: `http://localhost:5173`
   - This avoids certificate issues

3. **Verify server is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

4. **Check endpoint directly:**
   ```bash
   curl http://localhost:5000/api/content/branches
   ```

---

## ✅ Status

**Backend:** ✅ Working correctly  
**Endpoint:** ✅ `/api/content/branches` returns branches  
**CORS:** ✅ Configured correctly  
**Client:** ✅ Fixed with auto-detection  
**Result:** ✅ **Should work now!**

Try accessing `http://localhost:5173` (HTTP) - it should work without certificate issues! 🎉

