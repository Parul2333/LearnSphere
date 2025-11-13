import redis from "../config/redis.js";

const COUNTER_KEY = 'website_access_count';

/**
 * Middleware to increment the access counter on every public page load.
 */
export const incrementAccessCounter = async (req, res, next) => {
    // Only increment if Redis is available
    if (redis && redis.status === 'ready') {
        try {
            // INCR is atomic and safe for concurrent access
            await redis.incr(COUNTER_KEY);
        } catch (error) {
            console.error("[Redis Counter] Failed to increment counter:", error);
        }
    }
    next(); // Always proceed
};

/**
 * API endpoint to get the current access count.
 */
export const getAccessCount = async (req, res) => {
    if (!redis || redis.status !== 'ready') {
        return res.json({ count: 0, message: "Counter unavailable" });
    }
    
    try {
        const count = await redis.get(COUNTER_KEY);
        // Parse result, defaulting to 0
        res.json({ count: parseInt(count) || 0 });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving access count" });
    }
};