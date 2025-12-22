import { jest } from '@jest/globals';
import request from 'supertest';

// --- 1. Define the Mock Object (No-Op Spies) ---
// By using jest.fn().mockResolvedValue(...) or simply jest.fn(),
// we ensure the functions are callable spies but they DO NOT
// store any data internally, and all SET/LPUSH operations resolve
// successfully without making a call to a real Redis server.
const redisMock = {
  status: 'ready',
  // GET is the only function that needs to resolve with a specific value (null, for cache miss)
  get: jest.fn().mockResolvedValue(null), 
  // SET, DEL, LPUSH, LTRIM, EXPIRE are no-ops (they do nothing but resolve)
  set: jest.fn().mockResolvedValue('OK'), 
  del: jest.fn().mockResolvedValue(1), 
  lpush: jest.fn().mockResolvedValue(1),
  ltrim: jest.fn().mockResolvedValue('OK'),
  expire: jest.fn().mockResolvedValue(1),
  // INCR needs to be mocked specifically for the rate-limiting test
  incr: jest.fn().mockResolvedValue(1),
  // TTL needs to be mocked for the rate-limiting test
  ttl: jest.fn().mockResolvedValue(-1),
  // ON is for event listeners, which we mock as a simple function
  on: jest.fn(), 
};

// --- 2. Register the Mock ---
// This tells Jest: "When the app asks for '../config/redis.js', give them 'redisMock' instead."
// This MUST happen before we import the app.
jest.unstable_mockModule('../config/redis.js', () => ({
  default: redisMock,
}));

// --- 3. Dynamic Import of the App ---
// We use 'await import' so the mock is applied *before* the server loads.
const { app } = await import('../server.js');
const { default: User } = await import('../models/User.js');

describe('Integration Tests', () => {
  let adminToken;
  let branchId;
  let subjectId;

  // Reset mocks before every single test to ensure a clean slate
  beforeEach(() => {
    // jest.clearAllMocks() resets the call count/arguments of all mocks
    jest.clearAllMocks(); 
    
    // Reset default behaviors (Happy Path)
    redisMock.status = 'ready';
    // Ensure 'get' always returns null by default (cache miss)
    redisMock.get.mockResolvedValue(null); 
    // Ensure 'incr' always returns 1 by default
    redisMock.incr.mockResolvedValue(1); 
    // Ensure 'ttl' returns -1 by default (not locked)
    redisMock.ttl.mockResolvedValue(-1); 
  });
  
  // --- Your original test code continues here ---

  // --- 1. AUTHENTICATION TESTS ---
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
    });

    it('should login an existing user', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123'
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'password123'
      });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  // --- 2. ADMIN WORKFLOWS ---
  describe('Admin Workflows', () => {
    beforeEach(async () => {
      // Create admin
      await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: 'admin@example.com',
        password: 'adminpass'
      });
      // Force admin role
      await User.findOneAndUpdate({ email: 'admin@example.com' }, { role: 'admin' });
      // Login
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@example.com',
        password: 'adminpass'
      });
      adminToken = res.body.token;
    });

    it('should create a new Branch', async () => {
      const res = await request(app)
        .post('/api/admin/branches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Computer Science',
          years: ['1st Year', '2nd Year']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Computer Science');
      branchId = res.body._id;
    });

    it('should create a Subject linked to the Branch', async () => {
      const branchRes = await request(app)
        .post('/api/admin/branches')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'IT', years: ['Y1'] });

      const res = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Algorithms',
          year: 'Y1',
          branchId: branchRes.body._id
        });

      expect(res.statusCode).toBe(201);
      subjectId = res.body._id;
    });

    it('should add Content to the Subject', async () => {
      const branchRes = await request(app).post('/api/admin/branches').set('Authorization', `Bearer ${adminToken}`).send({ name: 'ECE', years: ['Y1'] });
      const subRes = await request(app).post('/api/admin/subjects').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Circuits', year: 'Y1', branchId: branchRes.body._id });

      const res = await request(app)
        .post('/api/admin/content')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          subjectId: subRes.body._id,
          title: 'Circuit Analysis Video',
          category: 'reference_video',
          link: 'http://video.link'
        });

      expect(res.statusCode).toBe(201);
    });
  });

  // --- 3. PUBLIC SEARCH ---
  describe('Public Search', () => {
    it('should perform global search', async () => {
      const res = await request(app).get('/api/search/global?q=Comp');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('subjects');
      expect(res.body).toHaveProperty('content');
    });
  });

  // --- 4. SECURITY & RATE LIMITING ---
  describe('Security & Rate Limiting', () => {
    it('should lock out user after 3 failed login attempts', async () => {
      // 1. Configure the mock to simulate failed attempts sequence
      // Note: We use 'redisMock' here, NOT 'redis'
      
      // Simulate calls to INCR (counting up failures)
      redisMock.incr
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(4);
      
      // Simulate calls to TTL (Checking lockout status)
      redisMock.ttl
        .mockResolvedValueOnce(-1) // Attempt 1: Not locked
        .mockResolvedValueOnce(-1) // Attempt 2: Not locked
        .mockResolvedValueOnce(-1) // Attempt 3: Not locked
        .mockResolvedValue(60);    // Attempt 4: LOCKED (returns remaining seconds)

      // 2. Register a victim user
      await request(app).post('/api/auth/register').send({
        username: 'victim',
        email: 'victim@test.com',
        password: 'correctpassword'
      });

      // 3. Attempt 3 failed logins
      for (let i = 0; i < 3; i++) {
        await request(app).post('/api/auth/login').send({
          email: 'victim@test.com',
          password: 'wrongpassword'
        });
      }

      // 4. The 4th attempt should be locked out
      const res = await request(app).post('/api/auth/login').send({
        email: 'victim@test.com',
        password: 'wrongpassword' 
      });

      expect(res.statusCode).toBe(429);
      expect(res.body.message).toContain('locked');
    });

    it('should deny non-admins access to admin routes', async () => {
      await request(app).post('/api/auth/register').send({
        username: 'hacker',
        email: 'hacker@test.com',
        password: 'password123'
      });
      const userRes = await request(app).post('/api/auth/login').send({
        email: 'hacker@test.com',
        password: 'password123'
      });
      const userToken = userRes.body.token;

      const res = await request(app)
        .post('/api/admin/branches')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Branch', years: ['Y1'] });

      expect(res.statusCode).toBe(403);
    });
  });

  // --- 5. ANALYTICS ---
  describe('Analytics Endpoints', () => {
    let localAdminToken;

    beforeAll(async () => {
      await request(app).post('/api/auth/register').send({ username: 'analytics_admin', email: 'analytics@test.com', password: 'pass' });
      await User.findOneAndUpdate({ email: 'analytics@test.com' }, { role: 'admin' });
      const res = await request(app).post('/api/auth/login').send({ email: 'analytics@test.com', password: 'pass' });
      localAdminToken = res.body.token;
    });

    it('should fetch analytics dashboard data', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${localAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('summary');
    });

    it('should fetch growth metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics/growth')
        .set('Authorization', `Bearer ${localAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('contentGrowth');
    });
  });

  // --- 6. DATA INTEGRITY (CASCADE DELETE) ---
  describe('Cascade Deletion', () => {
    let localAdminToken;

    beforeAll(async () => {
      await request(app).post('/api/auth/register').send({ username: 'cascade_admin', email: 'cascade@test.com', password: 'pass' });
      await User.findOneAndUpdate({ email: 'cascade@test.com' }, { role: 'admin' });
      const res = await request(app).post('/api/auth/login').send({ email: 'cascade@test.com', password: 'pass' });
      localAdminToken = res.body.token;
    });

    it('should delete a branch and automatically delete related subjects', async () => {
      // 1. Create Branch
      const branchRes = await request(app)
        .post('/api/admin/branches')
        .set('Authorization', `Bearer ${localAdminToken}`)
        .send({ name: 'DeleteMe', years: ['Y1'] });
      
      const branchIdToDelete = branchRes.body._id;

      // 2. Create Subject linked to Branch
      const subjectRes = await request(app)
        .post('/api/admin/subjects')
        .set('Authorization', `Bearer ${localAdminToken}`)
        .send({ name: 'DeleteMeSubject', year: 'Y1', branchId: branchIdToDelete });
      
      const subjectIdToDelete = subjectRes.body._id;

      // 3. Delete the Branch
      const deleteRes = await request(app)
        .delete(`/api/admin/branches/${branchIdToDelete}`)
        .set('Authorization', `Bearer ${localAdminToken}`);

      expect(deleteRes.statusCode).toBe(200);

      // 4. Verify Subject is also gone
      const checkRes = await request(app)
        .get(`/api/content/subject/${subjectIdToDelete}`); 
      
      expect(checkRes.statusCode).toBe(404);
    });
  });
});