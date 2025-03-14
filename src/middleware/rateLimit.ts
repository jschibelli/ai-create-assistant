import { Redis } from 'ioredis';
import { NextApiRequest, NextApiResponse } from 'next';

const redis = new Redis(process.env.REDIS_URL || '');
const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_REQUESTS_PER_WINDOW = 100;

export function rateLimiter(userId: string) {
  return async function(req: NextApiRequest, res: NextApiResponse, next: () => void) {
    const key = `ratelimit:${userId}`;
    
    try {
      // Increment the counter
      const count = await redis.incr(key);
      
      // Set expiry on first request
      if (count === 1) {
        await redis.expire(key, WINDOW_SIZE_IN_SECONDS);
      }
      
      // Get TTL to calculate remaining window
      const ttl = await redis.ttl(key);
      
      // Set headers for rate limiting info
      res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - count));
      res.setHeader('X-RateLimit-Reset', ttl);
      
      // If limit exceeded, return 429
      if (count > MAX_REQUESTS_PER_WINDOW) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${ttl} seconds.`
        });
      }
      
      // Continue to the API handler
      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If Redis fails, allow the request to proceed
      next();
    }
  };
}