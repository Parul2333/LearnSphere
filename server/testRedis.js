import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("✅ Connected to Redis successfully"));
redis.on("error", (err) => console.error("❌ Redis connection error:", err));
