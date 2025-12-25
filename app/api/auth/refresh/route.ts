import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { JwtService } from "@/lib/services/JwtService";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { RateLimiter } from "@/lib/core/RateLimiter";

class RefreshTokenHandler extends BaseHandler {
    private jwtService: JwtService;
    private userRepository: UserRepository;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.jwtService = JwtService.getInstance();
        this.userRepository = UserRepository.getInstance();
        this.rateLimiter = RateLimiter.getInstance();
    }

    protected async execute(req: NextRequest): Promise<NextResponse<ApiResponse>> {
        // Get refresh token from cookie
        const refreshToken = req.cookies.get("refreshToken")?.value;

        if (!refreshToken) {
            return this.errorResponse("Refresh token not provided", 401);
        }

        // Rate limit
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = await this.rateLimiter.check(`refresh:${ip}`, {
            maxRequests: 30,
            windowMs: 15 * 60 * 1000,
        });

        if (!rateLimitResult.allowed) {
            const response = this.errorResponse("Too many refresh attempts", 429);
            Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }

        // Verify refresh token
        const tokenData = await this.jwtService.verifyRefreshToken(refreshToken);

        if (!tokenData) {
            const response = this.errorResponse("Invalid or expired refresh token", 401);
            // Clear invalid cookies
            response.cookies.set("token", "", { maxAge: 0, path: "/" });
            response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
            return response;
        }

        // Get user
        const user = await this.userRepository.findById(tokenData.userId);

        if (!user) {
            return this.errorResponse("User not found", 401);
        }

        // Rotate refresh token (revoke old, create new)
        const newRefreshToken = await this.jwtService.rotateRefreshToken(refreshToken, user.id);

        if (!newRefreshToken) {
            return this.errorResponse("Failed to refresh token", 500);
        }

        // Generate new access token
        const accessToken = this.jwtService.signAccessToken({
            userId: user.id,
            email: user.email,
        });

        // Set cookies
        const response = this.successResponse({
            message: "Token refreshed successfully",
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });

        // Set new access token cookie
        response.cookies.set("token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 15, // 15 minutes
            path: "/",
        });

        // Set new refresh token cookie
        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    }
}

const handler = new RefreshTokenHandler();
export const POST = (req: NextRequest) => handler.handle(req);
