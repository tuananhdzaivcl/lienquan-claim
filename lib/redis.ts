import { Redis } from '@upstash/redis';

let redis: Redis;

if (!process.env.UPSTASH_REST_URL || !process.env.UPSTASH_REST_TOKEN) {
  throw new Error('Missing UPSTASH_REST_URL or UPSTASH_REST_TOKEN env var');
}

redis = new Redis({ url: process.env.UPSTASH_REST_URL, token: process.env.UPSTASH_REST_TOKEN });

export default redis;
