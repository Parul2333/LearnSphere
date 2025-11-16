# HTTP Preference Fix for Development

## Problem
When accessing the frontend via HTTPS (`https://localhost:5173`), the client was trying to connect to HTTPS backend (`https://localhost:4430`), which caused:
1. WebSocket connection failures due to certificate issues
2. API call failures due to self-signed certificate warnings
3. Continuous connection errors in the console

## Solution
Updated the client code to **prefer HTTP in development mode**, even when the frontend is accessed via HTTPS. This avoids all certificate issues during development.

## Changes Made

### 1. WebSocket Connection (`client/src/contexts/NotificationContext.jsx`)

**Before:**
- Used the same protocol as the frontend (HTTPS → HTTPS, HTTP → HTTP)
- This caused certificate issues when frontend was HTTPS

**After:**
- **In development mode**: Always uses HTTP (`http://localhost:5000`) for WebSocket
- **In production**: Uses the same protocol as the frontend
- Switched transport order to `['polling', 'websocket']` (polling is more reliable)
- Improved error handling with HTTP fallback

**Key Changes:**
```javascript
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
const useHttp = isDevelopment || !isHttps;
const serverUrl = useHttp ? `http://localhost:5000` : `https://localhost:4430`;
```

### 2. API Configuration (`client/src/api/config.js`)

**Before:**
- Used HTTPS when frontend was HTTPS
- This caused certificate errors

**After:**
- **In development mode**: Always uses HTTP (`http://localhost:5000/api`)
- **In production**: Uses the same protocol as the frontend
- Better error messages suggesting HTTP if HTTPS fails

**Key Changes:**
```javascript
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
const useHttp = isDevelopment || !isHttps;
const apiPort = useHttp ? 5000 : 4430;
const apiProtocol = useHttp ? 'http:' : 'https:';
```

## How It Works Now

### Development Mode (localhost)
- **Frontend accessed via HTTP**: `http://localhost:5173`
  - ✅ WebSocket: `http://localhost:5000` (ws://)
  - ✅ API: `http://localhost:5000/api`
  
- **Frontend accessed via HTTPS**: `https://localhost:5173`
  - ✅ WebSocket: `http://localhost:5000` (ws://) - **Uses HTTP to avoid certificates**
  - ✅ API: `http://localhost:5000/api` - **Uses HTTP to avoid certificates**

### Production Mode
- Frontend protocol determines backend protocol
- HTTPS frontend → HTTPS backend
- HTTP frontend → HTTP backend

## Benefits

1. ✅ **No certificate warnings** in development
2. ✅ **WebSocket connects reliably** via HTTP
3. ✅ **API calls work** without certificate issues
4. ✅ **Works with both HTTP and HTTPS frontend** in development
5. ✅ **Production-ready** - still respects protocol in production

## Testing

1. Start the server:
   ```bash
   cd server && npm start
   ```

2. Start the frontend:
   ```bash
   cd client && npm run dev
   ```

3. Access via **HTTP**: `http://localhost:5173`
   - Should see: `🔌 Connecting to WebSocket server: http://localhost:5000`
   - Should see: `✅ Connected to WebSocket notification server`

4. Access via **HTTPS**: `https://localhost:5173`
   - Should see: `🔌 Connecting to WebSocket server: http://localhost:5000`
   - Should see: `✅ Connected to WebSocket notification server`
   - **Note**: Even though frontend is HTTPS, WebSocket uses HTTP in development

## Console Messages

**Success:**
```
🔌 Connecting to WebSocket server: http://localhost:5000
🔒 Development mode: true, Using HTTP: true, Port: 5000
✅ Connected to WebSocket notification server
```

**Error (if server is down):**
```
❌ WebSocket connection error: ...
```

## Recommendation

For the best development experience, **always use HTTP**:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- No certificate warnings, faster, simpler

Use HTTPS only when testing production-like scenarios or deploying.

---

**Last Updated**: 2025-01-XX
**Status**: ✅ Fixed - Development mode now uses HTTP by default

