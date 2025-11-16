import redis from "../config/redis.js";

const COUNTER_KEY = 'website_access_count';

/**
 * Middleware to increment the access counter on actual page visits only.
 * Skips API calls, static assets, and health checks.
 */
export const incrementAccessCounter = async (req, res, next) => {
    // Skip API routes - don't count API calls
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Skip static assets (images, CSS, JS, fonts, etc.)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|map|json)$/i)) {
        return next();
    }
    
    // Skip health checks and favicon
    if (req.path === '/favicon.ico' || req.path === '/health') {
        return next();
    }
    
    // Only count HTML page requests (actual page visits)
    // Check if request accepts HTML (browser page load) vs JSON (API call)
    const acceptsHtml = req.accepts('html');
    const isApiRequest = req.accepts('json') && !acceptsHtml;
    
    if (isApiRequest) {
        return next();
    }
    
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