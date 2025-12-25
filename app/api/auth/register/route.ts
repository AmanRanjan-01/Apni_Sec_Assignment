import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { AuthService } from "@/lib/services/AuthService";
import { RegisterValidator } from "@/lib/validators/AuthValidators";
import { RateLimiter } from "@/lib/core/RateLimiter";

export class RegisterHandler extends BaseHandler {
    private authService: AuthService;
    private validator: RegisterValidator;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.validator = new RegisterValidator();
        this.rateLimiter = RateLimiter.getInstance();
    }

    protected async execute(req: NextRequest): Promise<NextResponse<ApiResponse>> {
        // Rate limit check
        const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
        const rateLimitResult = await this.rateLimiter.check(`register:${ip}`, {
            maxRequests: 10,
            windowMs: 15 * 60 * 1000,
        });

        if (!rateLimitResult.allowed) {
            const response = this.errorResponse("Too many requests. Please try again later.", 429);
            Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }

        // Parse and validate body
        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return this.errorResponse("Invalid JSON body", 400);
        }

        const validation = this.validator.validate(body);
        if (!validation.success) {
            return this.errorResponse(validation.errors?.join(", ") || "Validation failed", 400);
        }

        // Register user
        const result = await this.authService.register(validation.data!);

        if (!result.success) {
            return this.errorResponse(result.error || "Registration failed", 400);
        }

        // Set JWT cookies
        const response = this.successResponse(
            { user: result.user, message: "Registration successful" },
            201
        );

        // Access token (short-lived)
        response.cookies.set("token", result.accessToken!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 15, // 15 minutes
            path: "/",
        });

        // Refresh token (long-lived)
        response.cookies.set("refreshToken", result.refreshToken!, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;
    }
}

const handler = new RegisterHandler();
export const POST = (req: NextRequest) => handler.handle(req);
