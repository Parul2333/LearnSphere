/**
 * UNIT TESTS FOR MIDDLEWARE
 * 
 * These tests verify individual middleware functions in isolation,
 * without making HTTP requests or connecting to databases.
 * 
 * What is Unit Testing?
 * - Tests individual functions/modules in isolation
 * - Uses mocks/stubs to replace dependencies
 * - Fast execution (no network/database calls)
 * - Tests one thing at a time
 */

import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// Mock environment variables
process.env.JWT_SECRET = 'test_secret_key_for_jwt';
process.env.NODE_ENV = 'test';

// Skip database setup for unit tests (they don't need it)
// The setup.js file tries to connect to MongoDB, which we don't need here

// ============================================
// UNIT TESTS FOR AUTH MIDDLEWARE
// ============================================
describe('Unit Tests: Auth Middleware', () => {
    let protect, admin;
    let mockReq, mockRes, mockNext;

    beforeAll(async () => {
        // Set env vars before importing
        process.env.JWT_SECRET = 'test_secret_key_for_jwt';
        
        // Dynamically import middleware after setting env vars
        const authModule = await import('../middleware/auth.js');
        protect = authModule.protect;
        admin = authModule.admin;
    });

    beforeEach(() => {
        // Reset mocks before each test
        mockReq = {
            headers: {},
            user: null,
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    describe('protect middleware', () => {
        it('should call next() when valid token is provided', () => {
            // Create a valid JWT token
            const token = jwt.sign({ id: '123', role: 'user' }, process.env.JWT_SECRET);
            mockReq.headers.authorization = `Bearer ${token}`;

            protect(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user.id).toBe('123');
            expect(mockReq.user.role).toBe('user');
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should return 401 when no token is provided', () => {
            mockReq.headers.authorization = undefined;

            protect(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when token format is invalid', () => {
            mockReq.headers.authorization = 'InvalidFormat token';

            protect(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized, no token' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 when token is invalid/expired', () => {
            // Create an invalid token (wrong secret)
            const invalidToken = jwt.sign({ id: '123' }, 'wrong_secret');
            mockReq.headers.authorization = `Bearer ${invalidToken}`;

            protect(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized, token failed' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should extract token correctly from Bearer format', () => {
            const token = jwt.sign({ id: '456', role: 'admin' }, process.env.JWT_SECRET);
            mockReq.headers.authorization = `Bearer ${token}`;

            protect(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user.id).toBe('456');
            expect(mockReq.user.role).toBe('admin');
        });
    });

    describe('admin middleware', () => {
        it('should call next() when user is admin', () => {
            mockReq.user = { id: '123', role: 'admin' };

            admin(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should return 403 when user is not admin', () => {
            mockReq.user = { id: '123', role: 'user' };

            admin(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 403 when user is undefined', () => {
            mockReq.user = undefined;

            admin(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Not authorized as an admin' });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 403 when user role is null', () => {
            mockReq.user = { id: '123', role: null };

            admin(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});

// ============================================
// UNIT TESTS FOR RATE LIMITER MIDDLEWARE
// Note: Rate limiter functions are heavily dependent on Redis.
// For comprehensive testing with Redis interactions, see integration.test.js
// ============================================
describe('Unit Tests: Rate Limiter Middleware', () => {
    let checkLockout;
    let mockRedis;
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            body: { email: 'test@example.com' },
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('Mozilla/5.0'),
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
        };
        mockNext = jest.fn();
    });

    // Note: Rate limiter functions require Redis and are comprehensively tested
    // in integration.test.js. Unit tests here verify basic structure only.

    // Note: trackFailedLogin, trackSuccessfulLogin, resetLoginAttempts, and getLoginAttemptHistory
    // are better tested in integration.test.js where Redis interactions can be properly mocked
    // and verified. These functions are primarily Redis wrappers and require Redis to test properly.
    
    describe('Rate Limiter Exports', () => {
        it('should export all rate limiter functions', async () => {
            const rateLimiterModule = await import('../middleware/rateLimiter.js');
            expect(typeof rateLimiterModule.checkLockout).toBe('function');
            expect(typeof rateLimiterModule.trackFailedLogin).toBe('function');
            expect(typeof rateLimiterModule.trackSuccessfulLogin).toBe('function');
            expect(typeof rateLimiterModule.resetLoginAttempts).toBe('function');
            expect(typeof rateLimiterModule.getLoginAttemptHistory).toBe('function');
            expect(typeof rateLimiterModule.LOCKOUT_TIME_SECONDS).toBe('number');
        });
    });

});

// ============================================
// UNIT TESTS FOR CACHE MIDDLEWARE
// Note: Cache middleware is heavily dependent on Redis and module caching.
// For comprehensive testing, see integration.test.js where Redis can be properly mocked.
// Here we test basic structure and error handling.
// ============================================
describe('Unit Tests: Cache Middleware', () => {
    it('should export cacheContent function', async () => {
        const cacheModule = await import('../middleware/cache.js');
        expect(typeof cacheModule.cacheContent).toBe('function');
    });

    it('should return a middleware function when called with key', async () => {
        const cacheModule = await import('../middleware/cache.js');
        const middleware = cacheModule.cacheContent('test_key');
        expect(typeof middleware).toBe('function');
    });
});

