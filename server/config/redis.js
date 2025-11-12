// config/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // adjust path if needed

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('❌ REDIS_URL not found in .env');
  process.exit(1);
}

const redis = new Redis(redisUrl, {
  tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
});

redis.on('connect', () => {
  console.log('✅ Redis client connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

export default redis;
