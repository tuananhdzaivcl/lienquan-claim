import { Redis } from '@upstash/redis';

let redis: Redis;

const url = process.env.UPSTASH_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error('Missing UPSTASH_REST_URL (or UPSTASH_REDIS_REST_URL) or UPSTASH_REST_TOKEN (or UPSTASH_REDIS_REST_TOKEN) env var');
}

redis = new Redis({ url, token });

export default redis;
