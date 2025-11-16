# Admin Account Setup Guide

## How to Create an Admin Account

The registration form on the website only creates regular users. To create an admin account, you need to use the API directly.

---

## Method 1: Using cURL (Terminal)

### Step 1: Register an Admin User

Open your terminal and run:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@learnsphere.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Or if using HTTPS:**
```bash
curl -X POST https://localhost:4430/api/auth/register \
  -H "Content-Type: application/json" \
  -k \
  -d '{
    "username": "admin",
    "email": "admin@learnsphere.com",
    "password": "admin123",
    "role": "admin"
  }'
```

**Response:**
```json
{
  "_id": "...",
  "username": "admin",
  "email": "admin@learnsphere.com",
  "role": "admin",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 2: Login on the Website

1. Go to: `http://localhost:5173/login` (or `https://localhost:5173`)
2. Enter credentials:
   - **Email:** `admin@learnsphere.com`
   - **Password:** `admin123`
3. Click "Log In"

You should now be logged in as an admin!

---

## Method 2: Using Postman or Similar Tool

### Step 1: Register Admin

1. **Method:** POST
2. **URL:** `http://localhost:5000/api/auth/register`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (JSON):**
   ```json
   {
     "username": "admin",
     "email": "admin@learnsphere.com",
     "password": "admin123",
     "role": "admin"
   }
   ```
5. Click **Send**

### Step 2: Login on Website

Use the same credentials to login on the website.

---

## Method 3: Using Browser Console (Quick Test)

1. Open your browser and go to: `http://localhost:5173`
2. Open Developer Console (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Paste and run:

```javascript
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    email: 'admin@learnsphere.com',
    password: 'admin123',
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Admin created:', data);
  alert('Admin account created! Email: admin@learnsphere.com, Password: admin123');
})
.catch(err => console.error('Error:', err));
```

---

## Verify Admin Access

After logging in, you should:

1. **See admin dashboard** (if available)
2. **Access admin routes:**
   - `/api/admin/branches`
   - `/api/admin/subjects`
   - `/api/admin/content`
   - `/api/admin/analytics`

3. **Check in browser console:**
   ```javascript
   // After logging in, check localStorage
   const token = localStorage.getItem('token');
   console.log('Token:', token);
   
   // Decode token to see role (use jwt.io or check server logs)
   ```

---

## Test Admin WebSocket Notifications

Once logged in as admin:

1. **Open two browser windows:**
   - Window 1: Regular user view (or another tab)
   - Window 2: Admin panel

2. **In Window 2 (Admin):**
   - Create a new subject or add content

3. **In Window 1:**
   - You should see real-time notifications appear!

---

## Troubleshooting

### Issue: "User already exists"

**Solution:** Use a different email:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin2",
    "email": "admin2@learnsphere.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Issue: Server not running

**Solution:** Make sure both servers are running:
```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend  
cd client && npm run dev
```

### Issue: Can't access admin routes

**Solution:** 
1. Make sure you logged in with the admin account
2. Check browser console for token
3. Verify token includes `role: "admin"` (decode at jwt.io)

---

## Quick Reference

**Default Admin Credentials (after registration):**
- Email: `admin@learnsphere.com`
- Password: `admin123`
- Role: `admin`

**API Endpoints:**
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Get Current User: `GET /api/auth/me` (requires token)

**Admin Endpoints (require admin token):**
- `GET /api/admin/branches`
- `POST /api/admin/branches`
- `POST /api/admin/subjects`
- `POST /api/admin/content`
- `PUT /api/admin/subjects/progress/:id`
- `GET /api/admin/analytics`

---

## Security Note

⚠️ **Important:** In production, you should:
- Use strong passwords
- Restrict admin registration (only allow via database or special endpoint)
- Use environment variables for admin setup
- Consider adding admin approval workflow

For development/testing, the current setup is fine! ✅

