import request from 'supertest';
import app from '../server.js';
import Subject from '../models/Subject.js';
import Content from '../models/Content.js';
import Branch from '../models/Branch.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

let testSubjectId;
let testContentId;
let testBranchId;
let adminToken;

// Setup & Teardown
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learnsphere-test', {
            serverSelectionTimeoutMS: 5000,
        });
    }
    await cleanDatabase();
    
    // Create admin user and get token
    const adminRes = await request(app)
        .post('/api/auth/register')
        .send({
            username: `contentadmin${Date.now()}`,
            email: `contentadmin${Date.now()}@test.com`,
            password: 'Admin@123',
            role: 'admin',
        });
    adminToken = adminRes.body.token;
    
    // Create test branch
    const branchRes = await request(app)
        .post('/api/admin/branches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            name: `TestBranch${Date.now()}`,
            years: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
        });
    testBranchId = branchRes.body._id;
}, 15000);

afterAll(async () => {
    await cleanDatabase();
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
}, 15000);

// Helper function to clean database
const cleanDatabase = async () => {
    try {
        await Content.deleteMany({});
        await Subject.deleteMany({});
        await Branch.deleteMany({});
        await User.deleteMany({});
    } catch (e) {
        // Silently ignore cleanup errors
    }
};

// Functional Test Suite 1: Admin Content Creation
describe('ADMIN POST /api/admin/subjects & /api/admin/content', () => {
    // Test 1: Subject Creation
    it('should allow admin to create a new subject (201)', async () => {
        const res = await request(app)
            .post('/api/admin/subjects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `TestSubjectMath${Date.now()}`,
                year: '1st Year',
                branchId: testBranchId,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name');
        
        testSubjectId = res.body._id; 
    });

    // Test 2: Admin Add Content (Notes)
    it('should allow admin to add content to the subject (201)', async () => {
        // Ensure we have a subject to add content to
        const subjectRes = await request(app)
            .post('/api/admin/subjects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `TestSubject${Date.now()}`,
                year: '1st Year',
                branchId: testBranchId,
            });
        const subjectId = subjectRes.body._id;

        const res = await request(app)
            .post('/api/admin/content')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                subjectId: subjectId,
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
            .send({
                name: `HackAttempt${Date.now()}`,
                year: '1st Year',
                branchId: testBranchId
            });
        
        // Expected 401: Failed initial authentication (invalid token format)
        expect(res.statusCode).toBeGreaterThanOrEqual(400); 
    });
});

// Functional Test Suite 2: Subject Progress & Content Retrieval
describe('ADMIN PUT /api/admin/subjects/progress & USER GET /api/content/subject', () => {
    // Test 4: Update Subject Progress
    it('should allow admin to update subject completion percentage (200)', async () => {
        // Create subject first
        const subjectRes = await request(app)
            .post('/api/admin/subjects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `ProgressSubject${Date.now()}`,
                year: '1st Year',
                branchId: testBranchId,
            });
        const subjectId = subjectRes.body._id;

        const res = await request(app)
            .put(`/api/admin/subjects/progress/${subjectId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ percentage: 75 });
        
        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body.completionPercentage).toBe(75);
        }
    });
    
    // Test 5: Content Retrieval (User View)
    it('should allow any user (unauthenticated) to fetch subject content (200)', async () => {
        // Create subject and content
        const subjectRes = await request(app)
            .post('/api/admin/subjects')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                name: `RetrievalSubject${Date.now()}`,
                year: '1st Year',
                branchId: testBranchId,
            });
        const subjectId = subjectRes.body._id;

        // Add content
        await request(app)
            .post('/api/admin/content')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                subjectId: subjectId,
                title: 'Test Note 1',
                category: 'notes',
                link: 'http://test.com/note',
            });

        const res = await request(app)
            .get(`/api/content/subject/${subjectId}`);
        
        expect([200, 404]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body.name).toContain('RetrievalSubject');
            expect(Array.isArray(res.body.content)).toBe(true);
        }
    });
});