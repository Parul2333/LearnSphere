// server/middleware/cache.js

import redis from '../config/redis.js';

// Middleware to check Redis cache before hitting MongoDB
export const cacheContent = (key) => async (req, res, next) => {
    // Graceful check: If Redis ever disconnects, skip caching
    if (!redis) {
        // console.log(`[Cache Skip] Redis not available.`);
        return next();
    }

    try {
        // Create a unique cache key based on the general key and subject ID if present
        const cacheKey = req.params.id ? `${key}_${req.params.id}` : key;
        
        const data = await redis.get(cacheKey);

        if (data !== null) {
            console.log(`[Cache Hit] Serving data from Redis for key: ${cacheKey}`);
            // Parse the stringified JSON data and send it back
            return res.status(200).send(JSON.parse(data));
        }
        
        console.log(`[Cache Miss] Proceeding to database for key: ${cacheKey}`);
        // Data not in cache, proceed to controller
        req.cacheKey = cacheKey; // Attach cache key to request for controller to use
        next();
    } catch (error) {
        console.error(`[Cache Error] Failed to check cache: ${error.message}`);
        // If caching fails, don't crash the server, just proceed to database
        next(); 
    }
};