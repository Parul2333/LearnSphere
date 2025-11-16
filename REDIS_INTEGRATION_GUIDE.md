# Redis Integration Guide - LearnSphere Project

## 📋 Table of Contents
1. [Overview](#overview)
2. [Step-by-Step Redis Integration](#step-by-step-redis-integration)
3. [Current Redis Usage](#current-redis-usage)
4. [Login Attempt Tracking](#login-attempt-tracking)
5. [Issue: Rapid Counter Increase](#issue-rapid-counter-increase)
6. [Best Practices](#best-practices)

---

## Overview

Redis is used in this project for:
- **Caching**: Store frequently accessed data (subjects, content, search results)
- **Rate Limiting**: Track failed login attempts and lock accounts
- **Session Management**: Store "Remember Me" tokens
- **Analytics**: Track website access counts

---

## Step-by-Step Redis Integration

### Step 1: Redis Configuration (`server/config/redis.js`)

```javascript
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL not found in .env');
  process.exit(1);
}

const redis = new Redis(redisUrl, {
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

redis.on('connect', () => {
  console.log('✅ Redis client connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
```

**What happens:**
- Creates a Redis client connection using `ioredis` library
- Supports both `redis://` (non-TLS) and `rediss://` (TLS) URLs
- Handles connection events (connect, error)
- Exports a singleton Redis instance for use across the app

---

### Step 2: Import Redis in Server (`server/server.js`)

```javascript
import redis from "./config/redis.js";
```

**What happens:**
- Redis connection is initialized when the server starts
- Health check endpoint uses it: `/api/health` returns Redis status

---

### Step 3: Redis Usage Patterns

#### A. **Caching Middleware** (`server/middleware/cache.js`)

**Purpose:** Cache database queries to reduce MongoDB load

**How it works:**
1. Check Redis for cached data using a key (e.g., `subject_content_123`)
2. If found (cache hit): Return cached data immediately
3. If not found (cache miss): Proceed to database, then store result in Redis

**Example:**
```javascript
export const cacheContent = (key) => async (req, res, next) => {
    const cacheKey = req.params.id ? `${key}_${req.params.id}` : key;
    const data = await redis.get(cacheKey);
    
    if (data !== null) {
        return res.status(200).send(JSON.parse(data));
    }
    
    req.cacheKey = cacheKey; // Pass to controller to store later
    next();
};
```

#### B. **Rate Limiting** (`server/middleware/rateLimiter.js`)

**Purpose:** Prevent brute-force attacks by locking accounts after failed login attempts

**How it works:**
1. **Before Login:** `checkLockout()` checks if user is locked out
2. **After Failed Login:** `trackFailedLogin()` increments failure count
3. **After Successful Login:** `resetLoginAttempts()` deletes the failure key

**Redis Keys Used:**
- `login_fail:user@example.com` - Stores failure count (auto-expires after 30 minutes)

**Example:**
```javascript
// Track failed attempt
const attempts = await redis.incr(`login_fail:${email}`);
if (attempts === 1) {
    await redis.expire(key, 30 * 60); // 30 minutes
}
```

#### C. **Access Counter** (`server/controllers/siteController.js`)

**Purpose:** Track total website visits

**Current Issue:** Increments on EVERY request (API calls, static files, etc.)

**Redis Key Used:**
- `website_access_count` - Stores total access count (never expires)

---

## Current Redis Usage

### 1. **Content Caching**
- **Keys:** `subject_content_{id}`, `all_subjects_cache`, `branches_cache`
- **TTL:** 30-60 minutes
- **Location:** `server/controllers/contentController.js`, `server/controllers/adminController.js`

### 2. **Search Caching**
- **Keys:** `search:{query}`, `search_suggestions:{query}`
- **TTL:** 10 minutes (suggestions), 30 minutes (results)
- **Location:** `server/controllers/searchController.js`

### 3. **Login Attempt Tracking**
- **Keys:** `login_fail:{email}`
- **TTL:** 30 minutes
- **Location:** `server/middleware/rateLimiter.js`

### 4. **Session Management**
- **Keys:** `user_session:{userId}`
- **TTL:** 90 days (for "Remember Me")
- **Location:** `server/controllers/userController.js`

### 5. **Access Counter** ⚠️
- **Key:** `website_access_count`
- **TTL:** None (never expires)
- **Location:** `server/controllers/siteController.js`
- **Problem:** Increments on ALL requests, not just page visits

---

## Login Attempt Tracking

### Current Implementation

**File:** `server/middleware/rateLimiter.js`

**Flow:**
1. User attempts login → `POST /api/auth/login`
2. Middleware `checkLockout()` runs first
   - Checks if `login_fail:{email}` exists in Redis
   - If exists and TTL > 0: Return 429 (Too Many Requests)
3. Controller `loginUser()` validates credentials
4. If login fails:
   - Call `trackFailedLogin(email)`
   - Increment counter: `redis.incr(login_fail:{email})`
   - Set expiration: 30 minutes
   - If attempts >= 1: Lock account (return 429)
5. If login succeeds:
   - Call `resetLoginAttempts(email)`
   - Delete key: `redis.del(login_fail:{email})`

**Configuration:**
```javascript
const MAX_LOGIN_ATTEMPTS = 1; // Lock after 1 failed attempt
const LOCKOUT_TIME_SECONDS = 30 * 60; // 30 minutes
```

### How to Store Login Attempts Properly

**Current Issue:** Only stores failure count, not individual attempts

**Recommended Enhancement:** Store detailed attempt logs

```javascript
// Enhanced tracking with detailed logs
export const trackFailedLogin = async (email, ip, userAgent) => {
    if (!redis || redis.status !== 'ready') return;

    const key = `login_fail:${email.toLowerCase()}`;
    const logKey = `login_attempts:${email.toLowerCase()}`;

    try {
        // Increment failure count
        const attempts = await redis.incr(key);
        
        // Store detailed attempt log
        const attemptData = {
            email,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
            success: false
        };
        
        // Add to list (keep last 10 attempts)
        await redis.lpush(logKey, JSON.stringify(attemptData));
        await redis.ltrim(logKey, 0, 9); // Keep only last 10
        await redis.expire(logKey, 24 * 60 * 60); // 24 hours

        if (attempts === 1) {
            await redis.expire(key, LOCKOUT_TIME_SECONDS);
        }

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            await redis.expire(key, LOCKOUT_TIME_SECONDS);
            return true;
        }
        return false;
    } catch (error) {
        console.error('[Redis Error] Failed to track login failure:', error);
        return false;
    }
};
```

---

## Issue: Rapid Counter Increase

### Problem

The `website_access_count` counter is increasing rapidly because:

**Current Code:**
```javascript
// server/server.js - Line 42
app.use(incrementAccessCounter); // Applied to ALL routes
```

**What this means:**
- Every API call increments the counter
- Every static file request increments it
- Every health check increments it
- Every 404 request increments it

**Result:** Counter increases by 10-50+ per page load instead of 1

### Solution

Only count actual page visits, not API calls or static assets:

```javascript
// Only increment on actual page views
app.use((req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Skip static assets
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        return next();
    }
    
    // Only count HTML page requests
    if (req.accepts('html')) {
        incrementAccessCounter(req, res, next);
    } else {
        next();
    }
});
```

---

## Best Practices

### 1. **Key Naming Convention**
- Use prefixes: `login_fail:`, `user_session:`, `cache:`
- Use colons for hierarchy: `cache:subject:123`
- Keep keys descriptive and consistent

### 2. **TTL (Time To Live)**
- Always set expiration for temporary data
- Cache: 30-60 minutes
- Sessions: Based on user preference
- Rate limits: Based on security requirements

### 3. **Error Handling**
- Always check `redis.status === 'ready'` before operations
- Use try-catch blocks
- Fail gracefully (don't crash if Redis is down)

### 4. **Memory Management**
- Use `EXPIRE` or `SET ... EX` for temporary keys
- Clean up old keys periodically
- Monitor Redis memory usage

### 5. **Atomic Operations**
- Use `INCR` for counters (atomic)
- Use `SET ... EX` for setting with expiration
- Use transactions for multiple operations

---

## Summary

Redis is integrated at multiple levels:
1. **Configuration:** Singleton connection in `config/redis.js`
2. **Middleware:** Caching and rate limiting
3. **Controllers:** Content caching, search caching, analytics
4. **Security:** Login attempt tracking and account lockout

**Key Fix Needed:** Restrict access counter to actual page visits only.

