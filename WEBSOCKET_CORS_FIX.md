# WebSocket and CORS Connection Fix

## Issues Fixed

### 1. WebSocket Connection Error
- **Problem**: WebSocket connections were failing with "websocket error"
- **Cause**: CORS configuration was too permissive (`*`) and didn't explicitly allow frontend origins
- **Fix**: Updated CORS to explicitly allow `http://localhost:5173` and `https://localhost:5173`

### 2. Frontend Cannot Access Backend API
- **Problem**: "Failed to load available branches. Network error - check if backend server is running and certificate is accepted (for HTTPS)"
- **Cause**: 
  - CORS was not properly configured to allow credentials and specific origins
  - Mixed content issues between HTTP frontend and HTTPS backend
- **Fix**: 
  - Configured CORS with explicit origin whitelist
  - Enabled credentials in CORS
  - Frontend now correctly detects protocol and connects to matching backend port

## Changes Made

### Server (`server/server.js`)

1. **Enhanced CORS Configuration**:
   ```javascript
   const allowedOrigins = [
       'http://localhost:5173',
       'https://localhost:5173',
       'http://localhost:3000',
       'https://localhost:3000',
       process.env.CLIENT_URL
   ].filter(Boolean);

   app.use(cors({
       origin: function (origin, callback) {
           if (!origin) return callback(null, true);
           if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
               callback(null, true);
           } else {
               callback(new Error('Not allowed by CORS'));
           }
       },
       credentials: true,
       methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
       allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```

2. **Socket.io CORS Configuration**:
   ```javascript
   const socketIO = new socketio(httpServer, { 
     cors: { 
       origin: function (origin, callback) {
         if (!origin || allowedOrigins.includes('*') || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
           callback(null, true);
         } else {
           callback(new Error('Not allowed by CORS'));
         }
       },
       methods: ["GET", "POST"],
       credentials: true
     },
     transports: ['websocket', 'polling'],
     allowEIO3: true
   });
   ```

3. **HTTPS WebSocket Support**:
   - Added Socket.io to HTTPS server as well for `wss://` connections
   - Both HTTP and HTTPS servers now support WebSocket connections

### Client (`client/src/contexts/NotificationContext.jsx`)

1. **Enhanced WebSocket Connection**:
   - Added `autoConnect: true` to automatically connect
   - Added `withCredentials: true` to send credentials
   - Added HTTP fallback if HTTPS connection fails

2. **Better Error Handling**:
   - More detailed error logging
   - Automatic fallback to HTTP if HTTPS fails

## How It Works Now

### Protocol Detection
- **Frontend accessed via HTTP** (`http://localhost:5173`):
  - API calls → `http://localhost:5000/api`
  - WebSocket → `ws://localhost:5000`

- **Frontend accessed via HTTPS** (`https://localhost:5173`):
  - API calls → `https://localhost:4430/api`
  - WebSocket → `wss://localhost:4430`

### CORS Headers
When frontend makes a request with `Origin: http://localhost:5173`, server responds with:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
```

## Testing

### Test API Connection
```bash
# Test with Origin header
curl -H "Origin: http://localhost:5173" http://localhost:5000/api/health

# Test branches endpoint
curl -H "Origin: http://localhost:5173" http://localhost:5000/api/content/branches
```

### Test WebSocket Connection
1. Open browser console on `http://localhost:5173`
2. Look for: `✅ Connected to WebSocket notification server`
3. If you see errors, check:
   - Server is running on port 5000 (HTTP) or 4430 (HTTPS)
   - CORS headers in network tab
   - WebSocket connection status

## Verification

After these fixes, you should see:
- ✅ API calls work from frontend to backend
- ✅ WebSocket connects successfully
- ✅ No CORS errors in browser console
- ✅ Real-time notifications work when admin adds content

## Troubleshooting

### If WebSocket still fails:
1. Check server logs for connection errors
2. Verify both HTTP (5000) and HTTPS (4430) servers are running
3. Check browser console for specific error messages
4. Verify CORS headers in Network tab → Headers → Response Headers

### If API calls still fail:
1. Verify server is running: `curl http://localhost:5000/api/health`
2. Check browser Network tab for failed requests
3. Verify Origin header is being sent correctly
4. Check server logs for CORS rejection messages

## Server Status

To check if servers are running:
```bash
# Check ports
lsof -i :5000 -i :4430

# Test HTTP server
curl http://localhost:5000/api/health

# Test HTTPS server
curl -k https://localhost:4430/api/health
```

---

**Last Updated**: 2025-01-XX
**Status**: ✅ Fixed and Verified

