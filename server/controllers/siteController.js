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
    
    // Skip WebSocket upgrade requests
    if (req.headers.upgrade === 'websocket') {
        return next();
    }
    
    // Check if this is a page visit (not an API call)
    // In development, Vite serves the frontend on port 5173, so requests to Express (5000/4430) 
    // are usually API calls. But when serving built files, we need to count page visits.
    const acceptHeader = req.headers.accept || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Determine if this is a page visit:
    // 1. Must be GET request
    // 2. Must accept HTML (or no specific accept header)
    // 3. Must not be an API client (no axios/fetch with JSON accept)
    const isGetRequest = req.method === 'GET';
    const acceptsHtml = acceptHeader.includes('text/html') || 
                       acceptHeader.includes('*/*') ||
                       acceptHeader === '' ||
                       (!acceptHeader.includes('application/json') && 
                        !acceptHeader.includes('application/xml') &&
                        !acceptHeader.includes('application/javascript'));
    
    // Don't count if it's clearly an API request
    const isApiRequest = acceptHeader.includes('application/json') && 
                        (userAgent.includes('axios') || userAgent.includes('node') || userAgent === '');
    
    const isPageRequest = isGetRequest && acceptsHtml && !isApiRequest;
    
    // Only increment for actual page visits
    if (isPageRequest) {
        // Only increment if Redis is available
        if (redis && redis.status === 'ready') {
            try {
                // INCR is atomic and safe for concurrent access
                const newCount = await redis.incr(COUNTER_KEY);
                // Log for debugging (can be removed in production)
                console.log(`[Access Counter] Incremented to ${newCount} for path: ${req.path}`);
            } catch (error) {
                console.error("[Redis Counter] Failed to increment counter:", error);
            }
        } else {
            console.warn("[Access Counter] Redis not ready, skipping increment");
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