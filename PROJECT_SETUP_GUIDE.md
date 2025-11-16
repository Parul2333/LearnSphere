# LearnSphere - Project Setup & API Endpoints Guide

## 🚀 How to Run the Project

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas connection)
- Redis (local or remote Redis instance)
- `.env` file in the root directory with required environment variables

### Step 1: Install Dependencies

**Root directory:**
```bash
npm install
```

**Server directory:**
```bash
cd server
npm install
```

**Client directory:**
```bash
cd client
npm install
```

### Step 2: Environment Setup

Create a `.env` file in the root directory with:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=90d

# Server Ports
PORT=5000
HTTPS_PORT=4430

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### Step 3: Generate SSL Certificates (Optional, for HTTPS)

If you want HTTPS support:
```bash
cd server
node generate-self-signed.js localhost 365
```

This creates certificates in `server/certs/` directory.

### Step 4: Start the Backend Server

**Option 1: Production mode (no auto-reload)**
```bash
cd server
npm start
```

**Option 2: Development mode (with auto-reload)**
```bash
cd server
npm run server
```

The server will start on:
- **HTTP**: `http://localhost:5000`
- **HTTPS**: `https://localhost:4430` (if certificates exist)
- **WebSocket**: `ws://localhost:5000` (HTTP) or `wss://localhost:4430` (HTTPS)

### Step 5: Start the Frontend Client

**Development mode (with hot reload):**
```bash
cd client
npm run dev
```

The frontend will start on:
- **HTTP**: `http://localhost:5173`
- **HTTPS**: `https://localhost:5173` (if configured)

**Build for production:**
```bash
cd client
npm run build
```

This creates a `dist` folder that the Express server can serve statically.

### Step 6: Access the Application

- **Frontend**: `http://localhost:5173` or `https://localhost:5173`
- **Backend API**: `http://localhost:5000/api` or `https://localhost:4430/api`
- **Health Check**: `http://localhost:5000/api/health`

---

## 📡 API Endpoints Reference

### Base URLs
- **HTTP**: `http://localhost:5000/api`
- **HTTPS**: `https://localhost:4430/api`

### 🔓 Public Endpoints (No Authentication Required)

#### Health Check
- **GET** `/api/health`
  - Returns server status (MongoDB and Redis connection status)
  - Example: `GET http://localhost:5000/api/health`

---

### 🔐 Authentication Endpoints (`/api/auth`)

#### Register User
- **POST** `/api/auth/register`
  - Creates a new user account
  - Body: `{ "email": "user@example.com", "password": "password123", "name": "John Doe" }`
  - Returns: `{ "token": "...", "user": {...} }`

#### Login User
- **POST** `/api/auth/login`
  - Authenticates user and returns JWT token
  - Body: `{ "email": "user@example.com", "password": "password123", "rememberMe": true/false }`
  - Returns: `{ "token": "...", "user": {...}, "refreshToken": "..." }`
  - **Rate Limited**: Max 5 failed attempts per 15 minutes, then account locked for 1 hour

#### Get Current User
- **GET** `/api/auth/me`
  - Returns current authenticated user's profile
  - **Requires**: `Authorization: Bearer <token>`

---

### 📚 Content Endpoints (`/api/content`)

#### Get All Branches
- **GET** `/api/content/branches`
  - Returns list of all academic branches
  - Example: `GET http://localhost:5000/api/content/branches`

#### Get All Subjects
- **GET** `/api/content/subjects`
  - Query params: `?branch=<branchId>&year=<year>`
  - Returns list of subjects for a specific branch and year
  - **Cached**: Uses Redis caching
  - Example: `GET http://localhost:5000/api/content/subjects?branch=123&year=First Year`

#### Get Subject Details
- **GET** `/api/content/subject/:id`
  - Returns detailed subject information and all content
  - **Cached**: Uses Redis caching
  - Example: `GET http://localhost:5000/api/content/subject/507f1f77bcf86cd799439011`

#### Get Website Access Count
- **GET** `/api/content/access-count`
  - Returns total website page visit count
  - Example: `GET http://localhost:5000/api/content/access-count`

---

### 🔍 Search Endpoints (`/api/search`)

#### Global Search
- **GET** `/api/search/global`
  - Query params: `?q=<keyword>&type=<all|notes|videos|books>&branch=<branchId>`
  - Searches across all content types
  - Example: `GET http://localhost:5000/api/search/global?q=java&type=all`

#### Search Suggestions
- **GET** `/api/search/suggestions`
  - Query params: `?q=<keyword>`
  - Returns autocomplete suggestions
  - Example: `GET http://localhost:5000/api/search/suggestions?q=prog`

#### Filter Content
- **GET** `/api/search/filter`
  - Query params: `?branch=<branchId>&year=<year>&category=<notes|videos|books>`
  - Filters content by branch, year, and category
  - Example: `GET http://localhost:5000/api/search/filter?branch=123&year=First Year&category=notes`

---

### 👑 Admin Endpoints (`/api/admin`)

**All admin endpoints require:**
- Authentication: `Authorization: Bearer <token>`
- Admin role: User must have `role: "admin"`

#### Branch Management

##### Get All Branches (Admin)
- **GET** `/api/admin/branches`
  - Returns all branches (same as public, but for admin panel)
  - **Requires**: Admin authentication

##### Create Branch
- **POST** `/api/admin/branches`
  - Creates a new academic branch
  - Body: `{ "name": "Computer Science", "years": ["First Year", "Second Year", "Third Year", "Fourth Year"] }`
  - **Requires**: Admin authentication
  - **Emitted**: Socket.io `new_branch` notification

##### Delete Branch
- **DELETE** `/api/admin/branches/:id`
  - Deletes a branch and all associated subjects/content
  - **Requires**: Admin authentication
  - Example: `DELETE http://localhost:5000/api/admin/branches/507f1f77bcf86cd799439011`

#### Subject Management

##### Create Subject
- **POST** `/api/admin/subjects`
  - Creates a new subject
  - Body: 
    ```json
    {
      "name": "Data Structures",
      "branchId": "507f1f77bcf86cd799439011",
      "year": "Second Year",
      "description": "Introduction to data structures"
    }
    ```
  - **Requires**: Admin authentication
  - **Emitted**: Socket.io `new_subject` notification

#### Content Management

##### Add Content to Subject
- **POST** `/api/admin/content`
  - Adds content (notes, videos, books) to a subject
  - Body:
    ```json
    {
      "subjectId": "507f1f77bcf86cd799439011",
      "type": "notes",
      "title": "Introduction to Arrays",
      "url": "https://example.com/arrays",
      "description": "Basic array operations"
    }
    ```
  - **Requires**: Admin authentication
  - **Emitted**: Socket.io `new_content` notification

##### Update Subject Progress
- **PUT** `/api/admin/subjects/progress/:id`
  - Updates subject completion percentage
  - Body: `{ "progress": 75 }`
  - **Requires**: Admin authentication
  - Example: `PUT http://localhost:5000/api/admin/subjects/progress/507f1f77bcf86cd799439011`

---

### 📊 Analytics Endpoints (`/api/admin/analytics`)

**All analytics endpoints require admin authentication.**

#### Get Overall Analytics
- **GET** `/api/admin/analytics`
  - Returns comprehensive analytics dashboard data
  - **Requires**: Admin authentication

#### Get Growth Metrics
- **GET** `/api/admin/analytics/growth`
  - Returns user/content growth metrics over time
  - **Requires**: Admin authentication

#### Get Engagement Metrics
- **GET** `/api/admin/analytics/engagement`
  - Returns user engagement statistics
  - **Requires**: Admin authentication

---

## 🔌 WebSocket Events (Real-time Notifications)

The server uses Socket.io for real-time notifications. Connect to:
- **HTTP**: `ws://localhost:5000`
- **HTTPS**: `wss://localhost:4430`

### Client-Side Events

#### Join Rooms
- `joinSubject(<subjectId>)` - Join a subject room for real-time updates
- `joinBranch(<branchId>)` - Join a branch room for new subject notifications
- `leaveSubject(<subjectId>)` - Leave a subject room
- `leaveBranch(<branchId>)` - Leave a branch room

#### Receive Notifications
- `new_content` - Emitted when new content is added to a subject
  - Payload: `{ subjectId, content, timestamp }`
- `new_subject` - Emitted when a new subject is created
  - Payload: `{ branchId, subject, timestamp }`
- `new_branch` - Emitted when a new branch is created
  - Payload: `{ branch, timestamp }`

---

## 🔑 Authentication Flow

1. **Register**: `POST /api/auth/register` → Returns JWT token
2. **Login**: `POST /api/auth/login` → Returns JWT token (with `rememberMe` option)
3. **Use Token**: Include in headers: `Authorization: Bearer <token>`
4. **Get User**: `GET /api/auth/me` → Validates token and returns user profile

### Token Storage
- **Remember Me = false**: Token stored in `localStorage` (session persists until logout)
- **Remember Me = true**: Token stored in `localStorage` + session in Redis (90-day expiry)

---

## 🧪 Testing Endpoints

### Using cURL

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Get Branches:**
```bash
curl http://localhost:5000/api/content/branches
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","rememberMe":true}'
```

**Get Current User (with token):**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Development Scripts

### Server Scripts
- `npm start` - Start server in production mode
- `npm run server` - Start server in development mode (with nodemon auto-reload)
- `npm test` - Run server tests

### Client Scripts
- `npm run dev` - Start Vite dev server (development mode)
- `npm run build` - Build for production (creates `dist` folder)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 📝 Notes

1. **CORS**: Configured to allow requests from `CLIENT_URL` (default: `http://localhost:5173`)
2. **Rate Limiting**: Login endpoint has rate limiting (5 attempts per 15 minutes)
3. **Caching**: Content endpoints use Redis caching for better performance
4. **WebSocket**: Real-time notifications only work when Socket.io is properly connected
5. **HTTPS**: Self-signed certificates will show browser warnings in development (safe to accept)

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Error
- Check `MONGODB_URI` in `.env` file
- Ensure MongoDB is running (if local) or connection string is correct (if Atlas)

### Redis Connection Error
- Check `REDIS_URL` in `.env` file
- Ensure Redis is running: `redis-cli ping` (should return `PONG`)

### Certificate Errors (HTTPS)
- Accept the certificate warning in browser for development
- Or use HTTP only: `http://localhost:5000` and `http://localhost:5173`

---

## 📚 Additional Documentation

- `ADMIN_SETUP_GUIDE.md` - How to create an admin account
- `WEBSOCKET_INTEGRATION_README.md` - WebSocket integration details
- `REDIS_KEYS_DOCUMENTATION.md` - Redis keys documentation
- `BRANCHES_API_FIX.md` - API endpoint fixes

---

**Last Updated**: 2025-01-XX

