import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { jest } from '@jest/globals';

// Set Env vars for testing
process.env.JWT_SECRET = 'test_secret_123';
process.env.NODE_ENV = 'test';

// Global flag to track if we've set up MongoDB
// This prevents multiple test files from conflicting
let globalMongoSetup = false;
let mongoServer = null;

// Check if this is a unit test (unit tests don't need MongoDB)
const isUnitTest = process.env.JEST_TEST_FILE?.includes('unit.test.js') || 
                   process.argv.some(arg => arg.includes('unit.test.js')) ||
                   // Also check for middleware.unit.test.js and controllers.unit.test.js
                   process.argv.some(arg => arg.includes('middleware.unit.test.js')) ||
                   process.argv.some(arg => arg.includes('controllers.unit.test.js'));

// Check if this is a functional test (functional tests handle their own DB setup)
const isFunctionalTest = process.env.JEST_TEST_FILE?.includes('functional.test.js') || 
                         process.argv.some(arg => arg.includes('functional.test.js'));

// Only setup MongoDB for integration tests and tests that need it
// Skip for unit tests and functional tests (they handle their own setup)
if (!isUnitTest && !isFunctionalTest) {
  beforeAll(async () => {
    // Only setup if not already connected and we haven't set up yet
    if (!globalMongoSetup && mongoose.connection.readyState === 0) {
      try {
        globalMongoSetup = true;
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
      } catch (error) {
        // If connection fails, it might already be connected by another test file
        // This is okay when running all tests together
        globalMongoSetup = false;
      }
    }
  }, 30000);

  afterEach(async () => {
    // Clear DB collections only if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
          await collections[key].deleteMany({});
        }
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    // Clear mock data
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Only disconnect if we created the server and we're the last one
    // When running all tests together, let the last test file clean up
    if (globalMongoSetup && mongoServer && mongoose.connection.readyState === 1) {
      try {
        // Small delay to let other tests finish
        await new Promise(resolve => setTimeout(resolve, 100));
        await mongoose.disconnect();
        await mongoServer.stop();
        globalMongoSetup = false;
        mongoServer = null;
      } catch (error) {
        // Ignore cleanup errors - another test file might have already cleaned up
      }
    }
  });
} else {
  // For unit tests and functional tests, just clear mocks
  // (functional tests handle their own DB setup)
  afterEach(() => {
    jest.clearAllMocks();
  });
}