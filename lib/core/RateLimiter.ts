import { prisma } from "@/lib/db";

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    limit: number;
}

export class RateLimiter {
    private static instance: RateLimiter;
    private inMemoryStore: Map<string, { count: number; windowStart: number }> = new Map();
    private useDatabase: boolean;

    private constructor(useDatabase = false) {
        this.useDatabase = useDatabase;
    }

    public static getInstance(useDatabase = false): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter(useDatabase);
        }
        return RateLimiter.instance;
    }

    public async check(
        key: string,
        config: RateLimitConfig = { maxRequests: 100, windowMs: 15 * 60 * 1000 }
    ): Promise<RateLimitResult> {
        if (this.useDatabase) {
            return this.checkDatabase(key, config);
        }
        return this.checkInMemory(key, config);
    }

    private checkInMemory(key: string, config: RateLimitConfig): RateLimitResult {
        const now = Date.now();
        const entry = this.inMemoryStore.get(key);

        if (!entry || now - entry.windowStart > config.windowMs) {
            // New window
            this.inMemoryStore.set(key, { count: 1, windowStart: now });
            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: new Date(now + config.windowMs),
                limit: config.maxRequests,
            };
        }

        if (entry.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: new Date(entry.windowStart + config.windowMs),
                limit: config.maxRequests,
            };
        }

        entry.count++;
        return {
            allowed: true,
            remaining: config.maxRequests - entry.count,
            resetTime: new Date(entry.windowStart + config.windowMs),
            limit: config.maxRequests,
        };
    }

    private async checkDatabase(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
        const now = new Date();
        const windowStart = new Date(now.getTime() - config.windowMs);

        let entry = await prisma.rateLimitEntry.findUnique({ where: { key } });

        if (!entry || entry.windowStart < windowStart) {
            // Reset or create new entry
            entry = await prisma.rateLimitEntry.upsert({
                where: { key },
                update: { count: 1, windowStart: now },
                create: { key, count: 1, windowStart: now },
            });

            return {
                allowed: true,
                remaining: config.maxRequests - 1,
                resetTime: new Date(now.getTime() + config.windowMs),
                limit: config.maxRequests,
            };
        }

        if (entry.count >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: new Date(entry.windowStart.getTime() + config.windowMs),
                limit: config.maxRequests,
            };
        }

        await prisma.rateLimitEntry.update({
            where: { key },
            data: { count: { increment: 1 } },
        });

        return {
            allowed: true,
            remaining: config.maxRequests - entry.count - 1,
            resetTime: new Date(entry.windowStart.getTime() + config.windowMs),
            limit: config.maxRequests,
        };
    }

    public getHeaders(result: RateLimitResult): Record<string, string> {
        return {
            "X-RateLimit-Limit": result.limit.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetTime.toISOString(),
        };
    }
}
