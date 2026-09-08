import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

function getUpstashConfig() {
  const url = process.env.UPSTASH_REST_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

export function getRedis() {
  if (redis) return redis;
  const { url, token } = getUpstashConfig();
  if (!url || !token) {
    throw new Error('Missing Upstash REST URL/token. Set UPSTASH_REST_URL and UPSTASH_REST_TOKEN (or UPSTASH_REDIS_REST_*) in env.');
  }
  redis = new Redis({ url, token });
  return redis;
}
