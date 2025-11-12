import request from 'supertest';
import app from '../server.js'; // Assuming your server.js exports 'app' (we'll adjust server.js next)
import User from '../models/User.js';
import mongoose from 'mongoose';

// Setup/Teardown: Connect to a test database and clean up before/after tests
beforeAll(async () => {
    // Connect to a test MongoDB instance (use your actual MONGO_URI for simplicity here)
    // In a real project, use a separate test DB like MONGODB_TEST_URI
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
    }
});

afterAll(async () => {
    // Clean up test data
    await User.deleteMany({});
    // Disconnect (optional, but good practice)
    await mongoose.connection.close();
});

// Unit Test 1: Successful Admin Registration
describe('POST /api/auth/register', () => {
    it('should register a new admin user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'TestAdmin',
                email: 'test@admin.com',
                password: 'password123',
                role: 'admin',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.role).toBe('admin');
    });

    // Unit Test 2: Duplicate email failure
    it('should return 400 if email already exists', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                username: 'DuplicateUser',
                email: 'test@admin.com',
                password: 'password123',
                role: 'user',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message', 'User already exists');
    });
});

// Functional Test 3: Successful Login
describe('POST /api/auth/login', () => {
    it('should log in the user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@admin.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        // Store the token for subsequent tests
        global.testToken = res.body.token;
    });

    // Functional Test 4: Invalid password failure
    it('should return 401 for invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@admin.com',
                password: 'wrongpassword',
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Invalid email or password');
    });
});

// Functional Test 5: Access protected route
describe('GET /api/auth/me', () => {
    it('should return 200 and user data for authenticated user', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${global.testToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('email', 'test@admin.com');
    });
    
    // Functional Test 6: Access protected route failure
    it('should return 401 if no token is provided', async () => {
        const res = await request(app)
            .get('/api/auth/me');
        
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('message', 'Not authorized, no token');
    });
});