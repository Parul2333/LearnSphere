# LearnSphere - Ports Reference

## 📋 All Active Ports

This document lists all ports used by your LearnSphere application.

---

## 🌐 Frontend (React/Vite)

### Development Server
- **HTTP Port**: `5173`
  - URL: `http://localhost:5173`
  - Protocol: HTTP
  - Status: ✅ Running (PID: 9810)
  - Service: Vite Dev Server

- **HTTPS Port**: `5173` (same port, different protocol)
  - URL: `https://localhost:5173`
  - Protocol: HTTPS (self-signed certificate)
  - Status: ✅ Available (configured in `vite.config.js`)
  - Service: Vite Dev Server with SSL

**Configuration**: `client/vite.config.js`
```javascript
server: {
  https: { /* SSL certs */ },
  port: 5173,
  strictPort: false,
}
```

---

## 🔧 Backend (Express.js)

### HTTP Server
- **Port**: `5000`
  - URL: `http://localhost:5000`
  - Protocol: HTTP
  - Status: ✅ Running (PID: 35628)
  - Services:
    - REST API: `http://localhost:5000/api/*`
    - Health Check: `http://localhost:5000/api/health`
    - WebSocket: `ws://localhost:5000`
  - Configuration: `process.env.PORT || 5000`

### HTTPS Server
- **Port**: `4430`
  - URL: `https://localhost:4430`
  - Protocol: HTTPS (self-signed certificate)
  - Status: ✅ Running (PID: 35628)
  - Services:
    - REST API: `https://localhost:4430/api/*`
    - Health Check: `https://localhost:4430/api/health`
    - WebSocket: `wss://localhost:4430`
  - Configuration: `process.env.HTTPS_PORT || 4430`

**Note**: In development mode, the client prefers HTTP (port 5000) to avoid certificate issues, even when accessing frontend via HTTPS.

**Configuration**: `server/server.js`
```javascript
const PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 4430;
```

---

## 🗄️ Database & Cache Services

### MongoDB
- **Default Port**: `27017`
  - Status: ⚠️ External (MongoDB Atlas)
  - Connection: Outbound connections to MongoDB Atlas cluster
  - Configuration: `process.env.MONGODB_URI`
  - Note: Not running locally, using MongoDB Atlas cloud service

### Redis
- **Default Port**: `6379`
  - Status: ⚠️ Unknown (check if running locally or remote)
  - Configuration: `process.env.REDIS_URL`
  - Purpose: Caching and rate limiting
  - Default Local: `redis://localhost:6379`

**To check Redis status:**
```bash
redis-cli ping
# Should return: PONG
```

---

## 🔌 WebSocket Connections

### HTTP WebSocket (Primary in Development)
- **Protocol**: `ws://`
- **URL**: `ws://localhost:5000`
- **Port**: `5000` (shared with HTTP server)
- **Status**: ✅ Active
- **Used by**: NotificationContext.jsx (in development mode)

### HTTPS WebSocket
- **Protocol**: `wss://`
- **URL**: `wss://localhost:4430`
- **Port**: `4430` (shared with HTTPS server)
- **Status**: ✅ Available
- **Used by**: NotificationContext.jsx (in production mode)

---

## 📊 Current Running Services

### Frontend Services
| Service | Port | Protocol | Status | PID |
|---------|------|----------|--------|-----|
| Vite Dev Server | 5173 | HTTP/HTTPS | ✅ Running | 9810 |

### Backend Services
| Service | Port | Protocol | Status | PID |
|---------|------|----------|--------|-----|
| Express HTTP | 5000 | HTTP | ✅ Running | 35628 |
| Express HTTPS | 4430 | HTTPS | ✅ Running | 35628 |
| WebSocket (HTTP) | 5000 | WS | ✅ Running | 35628 |
| WebSocket (HTTPS) | 4430 | WSS | ✅ Running | 35628 |

### External Services
| Service | Port | Protocol | Status |
|---------|------|----------|--------|
| MongoDB Atlas | 27017 | TCP | ✅ Connected (Outbound) |
| Redis | 6379 | TCP | ⚠️ Check Status |

---

## 🌐 URL Reference

### Frontend URLs
- **HTTP**: `http://localhost:5173`
- **HTTPS**: `https://localhost:5173` (shows certificate warning)

### Backend API URLs
- **HTTP**: `http://localhost:5000/api`
- **HTTPS**: `https://localhost:4430/api`

### Health Check URLs
- **HTTP**: `http://localhost:5000/api/health`
- **HTTPS**: `https://localhost:4430/api/health`

### WebSocket URLs
- **Development (HTTP)**: `ws://localhost:5000`
- **Production (HTTPS)**: `wss://localhost:4430`

---

## 🔍 How to Check Port Status

### Check if ports are in use:
```bash
# Check specific ports
lsof -i :5173  # Frontend
lsof -i :5000  # Backend HTTP
lsof -i :4430  # Backend HTTPS
lsof -i :6379  # Redis (if local)
lsof -i :27017 # MongoDB (if local)

# Check all listening ports
lsof -i -P | grep LISTEN

# Check all node processes
ps aux | grep node | grep -v grep
```

### Test connections:
```bash
# Test frontend
curl http://localhost:5173

# Test backend HTTP
curl http://localhost:5000/api/health

# Test backend HTTPS (skip certificate check)
curl -k https://localhost:4430/api/health

# Test Redis (if local)
redis-cli ping

# Test MongoDB connection (if local)
mongosh --eval "db.version()"
```

---

## 📝 Port Configuration

### Environment Variables (`.env` file)
```env
# Backend Ports
PORT=5000              # HTTP server port
HTTPS_PORT=4430        # HTTPS server port

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Database & Cache
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
```

### Changing Ports

**Frontend Port:**
- Edit: `client/vite.config.js`
- Change: `port: 5173`
- Restart: Frontend dev server

**Backend HTTP Port:**
- Edit: `.env` file or `server/server.js`
- Change: `PORT=5000`
- Restart: Backend server

**Backend HTTPS Port:**
- Edit: `.env` file or `server/server.js`
- Change: `HTTPS_PORT=4430`
- Restart: Backend server

**Redis Port:**
- Edit: `.env` file
- Change: `REDIS_URL=redis://localhost:6379`
- Restart: Backend server (connects to new port)

---

## ⚠️ Important Notes

1. **Development vs Production**:
   - Development: Prefers HTTP (port 5000) to avoid certificate issues
   - Production: Uses HTTPS (port 4430) for secure connections

2. **Certificate Warnings**:
   - HTTPS uses self-signed certificates in development
   - Browser will show "Not Secure" warning (expected behavior)
   - Accept the certificate or use HTTP for development

3. **WebSocket Connection**:
   - In development, always connects to HTTP WebSocket (`ws://localhost:5000`)
   - Even if frontend is accessed via HTTPS, WebSocket uses HTTP in dev mode
   - This avoids certificate issues with WebSocket connections

4. **Port Conflicts**:
   - If a port is already in use, the server will fail to start
   - Use `lsof -i :PORT` to find processes using a port
   - Kill the process or change the port in configuration

---

## 🚀 Quick Start Commands

```bash
# Start Backend (HTTP on 5000, HTTPS on 4430)
cd server && npm start

# Start Frontend (HTTP/HTTPS on 5173)
cd client && npm run dev

# Check all running ports
lsof -i -P | grep LISTEN | grep -E "(5173|5000|4430|6379|27017)"
```

---

**Last Updated**: 2025-01-XX
**Status**: ✅ All ports documented

