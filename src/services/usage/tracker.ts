import { Redis } from 'ioredis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || '');

export class UsageTracker {
  // Track token usage in real-time
  async trackTokenUsage(userId: string, modelId: string, tokens: number): Promise<boolean> {
    // Real-time tracking via Redis
    const redisKey = `usage:${userId}:${modelId}`;
    const currentUsage = parseInt(await redis.get(redisKey) || '0');
    const newUsage = currentUsage + tokens;
    
    // Get user's subscription limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });
    
    if (!user || !user.subscription) {
      return false; // No subscription or user not found
    }
    
    // Check if usage exceeds limits (implement your business logic here)
    const canProceed = await this.checkUsageLimits(user, modelId, newUsage);
    
    if (canProceed) {
      // Update Redis for real-time tracking
      await redis.set(redisKey, newUsage.toString());
      
      // Schedule database update asynchronously
      this.updateDatabaseUsage(userId, modelId, tokens).catch(console.error);
    }
    
    return canProceed;
  }
  
  private async checkUsageLimits(user: any, modelId: string, totalTokens: number): Promise<boolean> {
    // Implement your business rules for usage limits
    // This is a simplified example
    return totalTokens <= user.usageLimit;
  }
  
  private async updateDatabaseUsage(userId: string, modelId: string, tokens: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Upsert pattern for tracking daily usage
    await prisma.userUsage.upsert({
      where: {
        userId_modelId_date: {
          userId,
          modelId,
          date: today
        }
      },
      update: {
        tokenCount: { increment: tokens }
      },
      create: {
        userId,
        modelId,
        date: today,
        tokenCount: tokens
      }
    });
  }
}