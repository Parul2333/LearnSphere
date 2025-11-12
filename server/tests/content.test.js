// server/tests/content.test.js
import { jest } from '@jest/globals'; // Keep this import for Jest globals

import request from 'supertest';
import app from '../server.js';
import Subject from '../models/Subject.js';
import Content from '../models/Content.js';
import mongoose from 'mongoose';
import redis from '../config/redis.js'; // Import redis for cleanup

// --- CRITICAL FIX: JEST MOCKING FOR ESM ---
const AUTH_MODULE_PATH = '../middleware/auth.js'; 

jest.mock(AUTH_MODULE_PATH, () => ({
    // Mock the 'protect' function: Bypasses JWT check, sets mock admin user
    protect: (req, res, next) => {
        // Use the hardcoded ID for safety in the mock environment
        req.user = { id: '6912b3f20e1df2b9377bdeab', role: 'admin' }; 
        next();
    },
    // Mock the 'admin' function: Allows the request to proceed after 'protect'
    admin: (req, res, next) => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: "Not authorized as an admin" });
        }
    },
}));

// --- End Mocking Setup ---

// Ensure the token is available (still needed for setting Authorization header)
global.adminToken = global.testToken || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MTJiM2YyMGUxZGYyYjkzNzdiZGVhYiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjgzMzM5NCwiZXhwIjoxNzY1NDI1Mzk0fQ.NoFfq949kxCpWPFCFqpecqcMreD7p6k29QXJ5MnjPF4";

let testSubjectId;
let testContentId;

beforeAll(async () => {
    // If not connected, connect (Mongoose)
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    
    // 💡 FIX: Explicitly wait for Redis to connect/be ready before starting tests
    if (redis && redis.status !== 'ready') {
        await new Promise((resolve) => {
            // Wait for the 'ready' event from ioredis
            redis.once('ready', resolve); 
            // If it errors, resolve anyway to avoid hanging the test suite indefinitely
            redis.once('error', resolve); 
        });
    }

    // Clean up content/subjects before running tests
    await Subject.deleteMany({});
    await Content.deleteMany({});
});

afterAll(async () => {
    // Clean up any test data
    await Subject.deleteMany({});
    await Content.deleteMany({});
    
    // CRITICAL FIX: Close connections
    await mongoose.connection.close();
    if (redis && redis.status !== 'end') {
        // This stops the connection events from running late
        await redis.quit(); 
    }
});

// Functional Test Suite 1: Admin Content Creation
describe('ADMIN POST /api/admin/subjects & /api/admin/content', () => {
    jest.setTimeout(25000); // Increased timeout

    // Test 1: Subject Creation
    it('should allow admin to create a new subject (201)', async () => {
        const res = await request(app)
            .post('/api/admin/subjects')
            .set('Authorization', `Bearer ${global.adminToken}`)
            .send({
                name: 'TestSubject-Math',
                year: 'First Year',
                branch: 'Physics',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'TestSubject-Math');
        
        testSubjectId = res.body._id; 
    });

    // Test 2: Admin Add Content (Notes)
    it('should allow admin to add content to the subject (201)', async () => {
        const res = await request(app)
            .post('/api/admin/content')
            .set('Authorization', `Bearer ${global.adminToken}`)
            .send({
                subjectId: testSubjectId,
                title: 'Test Note 1',
                category: 'notes',
                link: 'http://test.com/note',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('category', 'notes');
        
        testContentId = res.body._id;
    });

    // Test 3: Unauthorized Content Creation (Non-Admin attempt)
    it('should deny unauthorized token from creating a subject (401)', async () => {
        const res = await request(app)
            .post('/api/admin/subjects')
            .set('Authorization', `Bearer non.admin.token`)
            .send({ name: 'HackAttempt', year: 'First Year', branch: 'CS' });
        
        // Expected 401: Failed initial authentication (invalid token format)
        expect(res.statusCode).toBe(401); 
    });
});

// Functional Test Suite 2: Subject Progress & Content Retrieval
describe('ADMIN PUT /api/admin/subjects/progress & USER GET /api/content/subject', () => {
    jest.setTimeout(25000); // Apply timeout to this suite too
    
    // Test 4: Update Subject Progress
    it('should allow admin to update subject completion percentage (200)', async () => {
        const res = await request(app)
            .put(`/api/admin/subjects/progress/${testSubjectId}`)
            .set('Authorization', `Bearer ${global.adminToken}`)
            .send({ percentage: 75 });
        
        expect(res.statusCode).toBe(200);
        expect(res.body.completionPercentage).toBe(75);
    });
    
    // Test 5: Content Retrieval (User View)
    it('should allow any user (unauthenticated) to fetch subject content (200)', async () => {
        const res = await request(app)
            .get(`/api/content/subject/${testSubjectId}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('TestSubject-Math');
        expect(res.body.content).toHaveLength(1);
        expect(res.body.content[0].link).toBe('http://test.com/note');
    });
});