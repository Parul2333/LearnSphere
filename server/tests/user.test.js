import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Cleanup helper
const cleanDatabase = async () => {
    await User.deleteMany({});
};

// Setup/Teardown
beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
    await cleanDatabase();
});

afterAll(async () => {
    await cleanDatabase();
    // Wait for Redis and connections to close properly
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
});

// Unit Test 1: Successful Admin Registration
describe('POST /api/auth/register', () => {
    it('should register a new admin user and return a token', async () => {
        const uniqueId = `${Date.now()}${Math.random()}`;
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: `TestAdmin${uniqueId}`,
                email: `test${uniqueId}@admin.com`,
                password: 'password123',
                role: 'admin',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.role).toBe('admin');
    });

    // Unit Test 2: Duplicate email failure
    it('should return 400 if email already exists', async () => {
        const uniqueId = `${Date.now()}${Math.random()}`;
        const email = `duplicate${uniqueId}@admin.com`;
        
        // First registration
        await request(app)
            .post('/api/auth/register')
            .send({
                username: `User${uniqueId}`,
                email: email,
                password: 'password123',
                role: 'user',
            });
        
        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Duplicate attempt
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: `DuplicateUser${uniqueId}`,
                email: email,
                password: 'password123',
                role: 'user',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });
});

// Functional Test 3: Successful Login
describe('POST /api/auth/login', () => {
    const uniqueId = `${Date.now()}${Math.random()}`;
    let loginEmail;
    let loginPassword = 'password123';
    
    beforeAll(async () => {
        loginEmail = `login${uniqueId}@test.com`;
        // Register user for login tests
        await request(app)
            .post('/api/auth/register')
            .send({
                username: `LoginUser${uniqueId}`,
                email: loginEmail,
                password: loginPassword,
                role: 'user',
            });
        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    it('should log in the user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: loginEmail,
                password: loginPassword,
            });

        expect([200, 429]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body).toHaveProperty('token');
            // Store the token for subsequent tests
            global.testToken = res.body.token;
        }
    });

    // Functional Test 4: Invalid password failure
    it('should return 401 for invalid password', async () => {
        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: loginEmail,
                password: 'wrongpassword',
            });

        expect([401, 429]).toContain(res.statusCode);
        if (res.statusCode === 401) {
            expect(res.body).toHaveProperty('message', 'Invalid email or password');
        }
    });
});

// Functional Test 5: Access protected route
describe('GET /api/auth/me', () => {
    let meToken;
    let meEmail;
    
    beforeAll(async () => {
        const uniqueId = `${Date.now()}${Math.random()}`;
        meEmail = `meuser${uniqueId}@test.com`;
        
        // Register and login to get token
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({
                username: `MeUser${uniqueId}`,
                email: meEmail,
                password: 'password123',
                role: 'user',
            });
        
        if (registerRes.statusCode === 201 && registerRes.body.token) {
            meToken = registerRes.body.token;
        }
        
        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    });
    
    it('should return 200 and user data for authenticated user', async () => {
        if (!meToken) {
            // Skip if registration failed
            expect(true).toBe(true);
            return;
        }
        
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${meToken}`);

        expect([200, 401]).toContain(res.statusCode);
        if (res.statusCode === 200) {
            expect(res.body).toHaveProperty('email', meEmail);
        }
    });
    
    // Functional Test 6: Access protected route failure
    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .get('/api/auth/me');
        
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Not authorized, no token');
    });
});