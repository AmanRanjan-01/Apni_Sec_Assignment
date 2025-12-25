import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export interface TokenPayload {
    userId: string;
    email: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export class JwtService {
    private static instance: JwtService;
    private readonly secret: string;
    private readonly accessTokenExpiry: string;
    private readonly refreshTokenExpiryDays: number;

    private constructor() {
        this.secret = process.env.JWT_SECRET || "your-super-secret-key-change-in-production";
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
        this.refreshTokenExpiryDays = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || "7", 10);
    }

    public static getInstance(): JwtService {
        if (!JwtService.instance) {
            JwtService.instance = new JwtService();
        }
        return JwtService.instance;
    }

    // Sign access token (short-lived)
    public signAccessToken(payload: TokenPayload): string {
        return jwt.sign(payload, this.secret, { expiresIn: this.accessTokenExpiry as jwt.SignOptions['expiresIn'] });
    }

    // Legacy method for backward compatibility
    public sign(payload: TokenPayload): string {
        return this.signAccessToken(payload);
    }

    // Create refresh token and store in database
    public async createRefreshToken(userId: string): Promise<string> {
        const token = crypto.randomBytes(64).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshTokenExpiryDays);

        await prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });

        return token;
    }

    // Generate both access and refresh tokens
    public async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
        const accessToken = this.signAccessToken(payload);
        const refreshToken = await this.createRefreshToken(payload.userId);

        return { accessToken, refreshToken };
    }

    // Verify access token
    public verify(token: string): TokenPayload | null {
        try {
            return jwt.verify(token, this.secret) as TokenPayload;
        } catch {
            return null;
        }
    }

    // Verify refresh token from database
    public async verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
        const refreshToken = await prisma.refreshToken.findUnique({
            where: { token },
        });

        if (!refreshToken) return null;
        if (refreshToken.revoked) return null;
        if (refreshToken.expiresAt < new Date()) {
            // Token expired, clean it up
            await prisma.refreshToken.delete({ where: { id: refreshToken.id } });
            return null;
        }

        return { userId: refreshToken.userId };
    }

    // Revoke a specific refresh token
    public async revokeRefreshToken(token: string): Promise<boolean> {
        try {
            await prisma.refreshToken.update({
                where: { token },
                data: { revoked: true },
            });
            return true;
        } catch {
            return false;
        }
    }

    // Revoke all refresh tokens for a user (logout from all devices)
    public async revokeAllUserTokens(userId: string): Promise<void> {
        await prisma.refreshToken.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
    }

    // Rotate refresh token (revoke old, create new)
    public async rotateRefreshToken(oldToken: string, userId: string): Promise<string | null> {
        const isValid = await this.verifyRefreshToken(oldToken);
        if (!isValid) return null;

        await this.revokeRefreshToken(oldToken);
        return this.createRefreshToken(userId);
    }

    // Decode token without verification (useful for debugging)
    public decode(token: string): TokenPayload | null {
        try {
            return jwt.decode(token) as TokenPayload;
        } catch {
            return null;
        }
    }

    // Cleanup expired tokens (can be called periodically)
    public async cleanupExpiredTokens(): Promise<number> {
        const result = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { revoked: true },
                ],
            },
        });
        return result.count;
    }
}
