import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

let redis;

if (process.env.NODE_ENV === 'test') {
  console.log('⚠️ [Redis] Test Mode detected: Real connection disabled.');

  // Return a "Fake" Redis object for tests
  redis = {
    status: 'ready',
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    incr: async () => 1,
    lpush: async () => 1,
    ltrim: async () => 'OK',
    expire: async () => 1,
    ttl: async () => -1,
    on: () => {},
    quit: async () => 'OK'
  };
} else {
  // Real Redis Connection
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.error('❌ REDIS_URL not found in .env');
    process.exit(1);
  }

  redis = new Redis(redisUrl, {
    tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  });

  redis.on('connect', () => {
    console.log('✅ Redis client connected successfully');
  });

  redis.on('error', (err) => {
    console.error('❌ Redis connection error:', err);
  });
}

export default redis;