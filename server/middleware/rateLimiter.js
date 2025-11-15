import redis from '../config/redis.js';

// Configuration constants
// NOTE: Per product requirement, lock the user after a single failed attempt
// for 30 minutes. Adjust MAX_LOGIN_ATTEMPTS if you'd prefer a higher threshold.
const MAX_LOGIN_ATTEMPTS = 1;
export const LOCKOUT_TIME_SECONDS = 30 * 60; // 30 minutes

// Helper to construct the key in Redis (use email to identify the user)
const getKey = (email) => `login_fail:${email.toLowerCase()}`;

/**
 * Middleware to check if the user is currently locked out.
 * Applied BEFORE the login attempt.
 */
export const checkLockout = async (req, res, next) => {
    // If Redis isn't ready or available, skip security check (fail-open)
    if (!redis || redis.status !== 'ready') {
        console.warn('[Security] Skipping lockout check: Redis unavailable.');
        return next();
    }

    const { email } = req.body;
    const key = getKey(email);

    try {
        // Check the remaining time on the key
        const ttl = await redis.ttl(key); 

        // If TTL is positive, the key exists and the user is locked out
        if (ttl > 0) {
            const minutesLeft = Math.ceil(ttl / 60);
            // Inform client of retry-after (seconds)
            res.set('Retry-After', String(ttl));
            return res.status(429).json({
                message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
                retryAfterSeconds: ttl,
            });
        }
        
        // User is not locked out, proceed to login
        next();
    } catch (error) {
        console.error('[Redis Error] Failed to check lockout:', error);
        // Fail open: if Redis fails, don't block legitimate users
        next();
    }
};

/**
 * Tracks a failed login attempt and locks the account if MAX_ATTEMPTS is reached.
 * Called AFTER a failed login attempt in the user controller.
 */
export const trackFailedLogin = async (email) => {
    if (!redis || redis.status !== 'ready') return;

    const key = getKey(email);

    try {
        // INCRBY increments the failure count atomically
        const attempts = await redis.incr(key);

        if (attempts === 1) {
            // If this is the first failure, set the expiration window (e.g., 30 minutes)
            // If the user logs in successfully before this expires, the key is deleted.
            await redis.expire(key, LOCKOUT_TIME_SECONDS); 
        }

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            // Lockout triggered. Ensure the key expiration is MAX_LOCKOUT_TIME
            // This is implicitly handled by the initial expire, but we refresh TTL here
            // to ensure a full 30 mins after the final attempt.
            await redis.expire(key, LOCKOUT_TIME_SECONDS);
            return true; // Return true for lockout
        }
        return false; // Not yet locked out

    } catch (error) {
        console.error('[Redis Error] Failed to track login failure:', error);
        // Continue application flow on error
        return false;
    }
};

/**
 * Resets the failed login counter on successful login.
 * Called on successful login in the user controller.
 */
export const resetLoginAttempts = async (email) => {
    if (!redis || redis.status !== 'ready') return;
    const key = getKey(email);
    try {
        await redis.del(key);
    } catch (error) {
        console.error('[Redis Error] Failed to reset login attempts:', error);
    }
};