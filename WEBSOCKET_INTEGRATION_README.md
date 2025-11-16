# WebSocket Integration Guide - LearnSphere

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [How It Works](#how-it-works)
4. [Integration Details](#integration-details)
5. [Testing Guide](#testing-guide)
6. [Troubleshooting](#troubleshooting)
7. [API Reference](#api-reference)

---

## Overview

LearnSphere uses **Socket.io** (WebSocket) for real-time notifications. This enables instant updates to users when:
- New content is added to a subject
- New subjects are created in a branch
- Subject progress is updated
- Admin broadcasts messages

### Key Features
- ✅ Automatic reconnection on disconnect
- ✅ Support for both HTTP and HTTPS
- ✅ Room-based targeted notifications
- ✅ Error handling and graceful degradation
- ✅ Connection status logging

---

## Architecture

### Server-Side Components

```
server/
├── server.js                    # Socket.io initialization
├── utils/
│   └── socket.js                # Socket.io instance helper
├── events/
│   └── notificationEvents.js    # Event handlers & emission functions
└── controllers/
    └── adminController.js        # Emits notifications on actions
```

### Client-Side Components

```
client/src/
├── contexts/
│   └── NotificationContext.jsx  # Socket.io client & React context
└── components/
    └── common/
        └── NotificationCenter.jsx # UI component for displaying notifications
```

---

## How It Works

### 1. Server Initialization

**File:** `server/server.js`

```javascript
// Socket.io is initialized when the HTTP/HTTPS server starts
const initializeSocketIO = (httpServer) => {
  const socketIO = new socketio(httpServer, { 
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ['websocket', 'polling']
  });
  
  setupNotificationEvents(socketIO);
  setSocketIO(socketIO); // Make available to controllers
  return socketIO;
};
```

**What happens:**
1. Creates Socket.io server attached to HTTP/HTTPS server
2. Configures CORS for cross-origin connections
3. Sets up event handlers (join/leave rooms)
4. Exports instance for use in controllers

### 2. Client Connection

**File:** `client/src/contexts/NotificationContext.jsx`

```javascript
// Client automatically connects on app load
const serverUrl = `${window.location.protocol}//${window.location.hostname}:${port}`;
const socket = io(serverUrl, {
  reconnection: true,
  transports: ['websocket', 'polling']
});
```

**What happens:**
1. Client detects protocol (HTTP/HTTPS) and port
2. Connects to Socket.io server
3. Automatically reconnects on disconnect
4. Listens for notification events

### 3. Room-Based Notifications

**Rooms** are virtual channels that clients can join/leave:

- `subject_{subjectId}` - Users viewing a specific subject
- `branch_{branchId}` - Users viewing a branch
- `admin_{adminId}` - Admin users

**Example:**
```javascript
// Client joins a room
socket.emit('join_subject', '507f1f77bcf86cd799439011');

// Server sends notification to that room
io.to('subject_507f1f77bcf86cd799439011').emit('new_content', data);
```

### 4. Notification Flow

```
Admin Action (e.g., Add Content)
    ↓
Controller (adminController.js)
    ↓
getSocketIO() → Get Socket.io instance
    ↓
notifyNewContent(io, subjectId, data)
    ↓
Emit to room: subject_{subjectId}
    ↓
Connected clients receive notification
    ↓
NotificationCenter displays notification
```

---

## Integration Details

### Server-Side

#### Step 1: Access Socket.io in Controllers

**File:** `server/utils/socket.js`

```javascript
import { getSocketIO } from '../utils/socket.js';

const io = getSocketIO();
if (io) {
    // Socket.io is available
}
```

#### Step 2: Emit Notifications

**File:** `server/controllers/adminController.js`

```javascript
import { getSocketIO } from '../utils/socket.js';
import { notifyNewContent } from '../events/notificationEvents.js';

export const addContentToSubject = async (req, res) => {
    // ... create content ...
    
    // Emit notification
    const io = getSocketIO();
    if (io) {
        notifyNewContent(io, subjectId, {
            _id: content._id,
            title: content.title,
            category: content.category,
            link: content.link
        });
    }
    
    res.status(201).json(content);
};
```

#### Available Notification Functions

1. **`notifyNewContent(io, subjectId, contentData)`**
   - Notifies users subscribed to a subject
   - Emits: `new_content` event

2. **`notifyNewSubject(io, branchId, subjectData)`**
   - Notifies users subscribed to a branch
   - Emits: `new_subject` event

3. **`notifyProgressUpdate(io, subjectId, percentage)`**
   - Notifies users about progress changes
   - Emits: `progress_update` event

4. **`notifyAdminBroadcast(io, adminId, message, data)`**
   - Sends admin messages
   - Emits: `admin_message` event

### Client-Side

#### Step 1: Use Notification Context

**File:** `client/src/components/YourComponent.jsx`

```javascript
import { useNotifications } from '../contexts/NotificationContext.jsx';

function YourComponent() {
    const { notifications, joinSubject, leaveSubject } = useNotifications();
    
    useEffect(() => {
        // Join subject room when component mounts
        joinSubject(subjectId);
        
        // Leave when component unmounts
        return () => leaveSubject(subjectId);
    }, [subjectId]);
    
    return (
        <div>
            {/* Your component */}
        </div>
    );
}
```

#### Step 2: Display Notifications

The `NotificationCenter` component automatically displays notifications. Make sure it's included in your app:

```javascript
// App.jsx
import NotificationCenter from './components/common/NotificationCenter';

function App() {
    return (
        <NotificationProvider>
            <NotificationCenter />
            {/* Rest of your app */}
        </NotificationProvider>
    );
}
```

---

## Testing Guide

### Prerequisites

1. **Start the servers:**
   ```bash
   # Terminal 1: Start backend
   cd server
   npm start
   
   # Terminal 2: Start frontend
   cd client
   npm run dev
   ```

2. **Verify WebSocket connection:**
   - Open browser console
   - Look for: `✅ Connected to WebSocket notification server`
   - Check server logs: `🔗 Socket.io client connected: {socketId}`

### Test 1: New Content Notification

**Steps:**
1. Open the app in two browser windows (or tabs)
2. In Window 1: Navigate to a subject page
3. In Window 2: Login as admin and add new content to that subject
4. **Expected:** Window 1 should show a notification: "New {category} added: {title}"

**API Call:**
```bash
curl -X POST http://localhost:5000/api/admin/content \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "subjectId": "SUBJECT_ID",
    "title": "Test Content",
    "category": "notes",
    "link": "https://example.com"
  }'
```

### Test 2: New Subject Notification

**Steps:**
1. Open the app in two browser windows
2. In Window 1: Navigate to a branch page
3. In Window 2: Login as admin and create a new subject in that branch
4. **Expected:** Window 1 should show a notification: "New subject created: {name}"

**API Call:**
```bash
curl -X POST http://localhost:5000/api/admin/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Test Subject",
    "year": "1",
    "branchId": "BRANCH_ID"
  }'
```

### Test 3: Progress Update Notification

**Steps:**
1. Open the app in two browser windows
2. In Window 1: Navigate to a subject page
3. In Window 2: Login as admin and update subject progress
4. **Expected:** Window 1 should show a notification: "Subject completion updated to X%"

**API Call:**
```bash
curl -X PUT http://localhost:5000/api/admin/subjects/progress/SUBJECT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"percentage": 75}'
```

### Test 4: Connection/Reconnection

**Steps:**
1. Open the app and verify connection in console
2. Stop the server (Ctrl+C)
3. **Expected:** Console shows: `❌ Disconnected from notification server`
4. Restart the server
5. **Expected:** Console shows: `🔄 Reconnected to WebSocket server`

### Test 5: Room Joining/Leaving

**Steps:**
1. Open browser console
2. Navigate to a subject page
3. **Expected:** Server logs show: `📍 Socket {id} joined subject room: {subjectId}`
4. Navigate away
5. **Expected:** Server logs show: `📍 Socket {id} left subject room: {subjectId}`

---

## Troubleshooting

### Issue 1: Notifications Not Appearing

**Symptoms:**
- No notifications show up
- Console shows connection errors

**Solutions:**
1. **Check server is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Check WebSocket connection:**
   - Open browser console
   - Look for connection messages
   - Check for errors

3. **Verify client URL:**
   - Client should connect to same protocol/port as server
   - HTTP: `http://localhost:5000`
   - HTTPS: `https://localhost:4430`

4. **Check CORS:**
   - Server allows all origins: `origin: "*"`
   - If issues persist, check browser console for CORS errors

### Issue 2: Connection Refused

**Symptoms:**
- `❌ WebSocket connection error: connect ECONNREFUSED`

**Solutions:**
1. **Verify server is running:**
   ```bash
   lsof -i :5000 -i :4430
   ```

2. **Check port mismatch:**
   - Server HTTP: 5000
   - Server HTTPS: 4430
   - Client should match

3. **Check firewall:**
   - Ensure ports are not blocked

### Issue 3: SSL Certificate Errors

**Symptoms:**
- Connection fails on HTTPS
- Certificate warnings

**Solutions:**
1. **Accept self-signed certificate:**
   - Browser will show warning
   - Click "Advanced" → "Proceed to localhost"

2. **Client already configured:**
   - `rejectUnauthorized: false` is set
   - Should work automatically

### Issue 4: Notifications Only Work Sometimes

**Symptoms:**
- Notifications appear in some cases but not others

**Solutions:**
1. **Check room joining:**
   - Ensure client calls `joinSubject()` or `joinBranch()`
   - Check server logs for join messages

2. **Verify subject/branch IDs:**
   - IDs must match exactly
   - Check MongoDB IDs are correct

3. **Check Socket.io instance:**
   - Server must have `io` instance initialized
   - Check server startup logs

### Issue 5: Multiple Notifications

**Symptoms:**
- Same notification appears multiple times

**Solutions:**
1. **Check React strict mode:**
   - React 18 strict mode mounts components twice
   - This is normal in development

2. **Check useEffect dependencies:**
   - Ensure cleanup function runs
   - Prevent duplicate subscriptions

---

## API Reference

### Server Events (Client → Server)

#### `join_subject`
Join a subject room to receive notifications.

```javascript
socket.emit('join_subject', subjectId);
```

#### `leave_subject`
Leave a subject room.

```javascript
socket.emit('leave_subject', subjectId);
```

#### `join_branch`
Join a branch room to receive notifications.

```javascript
socket.emit('join_branch', branchId);
```

#### `join_admin`
Join admin room for admin notifications.

```javascript
socket.emit('join_admin', adminId);
```

### Client Events (Server → Client)

#### `new_content`
Emitted when new content is added to a subject.

```javascript
socket.on('new_content', (data) => {
    console.log(data.message); // "New notes added: Chapter 1"
    console.log(data.content); // Content object
    console.log(data.timestamp); // ISO timestamp
});
```

#### `new_subject`
Emitted when a new subject is created in a branch.

```javascript
socket.on('new_subject', (data) => {
    console.log(data.message); // "New subject created: Mathematics"
    console.log(data.subject); // Subject object
    console.log(data.timestamp); // ISO timestamp
});
```

#### `progress_update`
Emitted when subject progress is updated.

```javascript
socket.on('progress_update', (data) => {
    console.log(data.message); // "Subject completion updated to 75%"
    console.log(data.percentage); // 75
    console.log(data.timestamp); // ISO timestamp
});
```

#### `admin_message`
Emitted for admin broadcasts.

```javascript
socket.on('admin_message', (data) => {
    console.log(data.message); // Admin message
    console.log(data.data); // Additional data
    console.log(data.timestamp); // ISO timestamp
});
```

### Connection Events

#### `connect`
Emitted when client connects.

```javascript
socket.on('connect', () => {
    console.log('Connected!');
});
```

#### `disconnect`
Emitted when client disconnects.

```javascript
socket.on('disconnect', (reason) => {
    console.log('Disconnected:', reason);
});
```

#### `connect_error`
Emitted on connection errors.

```javascript
socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});
```

---

## Configuration

### Environment Variables

**Server:**
```env
PORT=5000                    # HTTP port
HTTPS_PORT=4430              # HTTPS port
CLIENT_URL=http://localhost:5173  # Client URL for CORS
```

**Client:**
- Automatically detects protocol and port
- No configuration needed

### Server Options

**File:** `server/server.js`

```javascript
const socketIO = new socketio(httpServer, { 
    cors: { 
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});
```

### Client Options

**File:** `client/src/contexts/NotificationContext.jsx`

```javascript
const socket = io(serverUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    secure: isHttps,
    rejectUnauthorized: false
});
```

---

## Best Practices

1. **Always check Socket.io availability:**
   ```javascript
   const io = getSocketIO();
   if (io) {
       // Safe to emit
   }
   ```

2. **Handle errors gracefully:**
   ```javascript
   try {
       notifyNewContent(io, subjectId, data);
   } catch (error) {
       console.error('Notification failed:', error);
       // Don't crash the app
   }
   ```

3. **Join/Leave rooms properly:**
   ```javascript
   useEffect(() => {
       joinSubject(subjectId);
       return () => leaveSubject(subjectId);
   }, [subjectId]);
   ```

4. **Use rooms for targeted notifications:**
   - Don't broadcast to all clients
   - Use rooms to notify only relevant users

5. **Monitor connection status:**
   - Log connection/disconnection events
   - Handle reconnection gracefully

---

## Summary

✅ **WebSocket is fully integrated and working**
- Server initializes Socket.io on startup
- Controllers emit notifications on actions
- Client connects automatically
- Notifications display in real-time
- Automatic reconnection on disconnect
- Support for both HTTP and HTTPS

**Key Files:**
- `server/server.js` - Socket.io initialization
- `server/utils/socket.js` - Instance helper
- `server/events/notificationEvents.js` - Event handlers
- `server/controllers/adminController.js` - Emits notifications
- `client/src/contexts/NotificationContext.jsx` - Client connection
- `client/src/components/common/NotificationCenter.jsx` - UI component

**Test it out:**
1. Start both servers
2. Open app in two browser windows
3. Create content/subject in one window
4. See notification appear in the other window! 🎉

