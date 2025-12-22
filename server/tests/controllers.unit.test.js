/**
 * UNIT TESTS FOR CONTROLLERS
 * 
 * These tests verify controller function exports and basic structure.
 * Note: Controller functions are heavily dependent on models, Redis, and database.
 * For comprehensive testing with actual functionality, see integration.test.js and functional.test.js.
 */

import { jest } from '@jest/globals';

// Set environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key';
process.env.NODE_ENV = 'test';

// Skip database setup for unit tests (they don't need it)
// The setup.js file tries to connect to MongoDB, which we don't need here

// ============================================
// UNIT TESTS FOR USER CONTROLLER
// ============================================
describe('Unit Tests: User Controller', () => {

    it('should export all user controller functions', async () => {
        const userController = await import('../controllers/userController.js');
        expect(typeof userController.registerUser).toBe('function');
        expect(typeof userController.loginUser).toBe('function');
        expect(typeof userController.getMe).toBe('function');
    });
});

// ============================================
// UNIT TESTS FOR ADMIN CONTROLLER
// Note: Admin controller functions are heavily dependent on models and Redis.
// For comprehensive testing, see integration.test.js and functional.test.js.
// Unit tests here verify basic structure and exports.
// ============================================
describe('Unit Tests: Admin Controller', () => {
    it('should export admin controller functions', async () => {
        const adminController = await import('../controllers/adminController.js');
        expect(typeof adminController.createBranch).toBe('function');
        expect(typeof adminController.getAllBranches).toBe('function');
        expect(typeof adminController.deleteBranch).toBe('function');
        expect(typeof adminController.createSubject).toBe('function');
    });
});

