import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { AuthService } from "@/lib/services/AuthService";
import { UserRepository } from "@/lib/repositories/UserRepository";
import { UpdateProfileValidator } from "@/lib/validators/UserValidators";
import { EmailService } from "@/lib/services/EmailService";
import { RateLimiter } from "@/lib/core/RateLimiter";

class GetProfileHandler extends BaseHandler {
    private authService: AuthService;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
    }

    protected async execute(req: NextRequest): Promise<NextResponse<ApiResponse>> {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return this.errorResponse("Not authenticated", 401);
        }

        const user = await this.authService.verifyToken(token);

        if (!user) {
            return this.errorResponse("Invalid or expired token", 401);
        }

        return this.successResponse({ user });
    }
}

class UpdateProfileHandler extends BaseHandler {
    private authService: AuthService;
    private userRepository: UserRepository;
    private validator: UpdateProfileValidator;
    private emailService: EmailService;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.userRepository = UserRepository.getInstance();
        this.validator = new UpdateProfileValidator();
        this.emailService = EmailService.getInstance();
        this.rateLimiter = RateLimiter.getInstance();
    }

    protected async execute(req: NextRequest): Promise<NextResponse<ApiResponse>> {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return this.errorResponse("Not authenticated", 401);
        }

        const currentUser = await this.authService.verifyToken(token);

        if (!currentUser) {
            return this.errorResponse("Invalid or expired token", 401);
        }

        // Rate limit
        const rateLimitResult = await this.rateLimiter.check(`profile:${currentUser.id}`, {
            maxRequests: 20,
            windowMs: 15 * 60 * 1000,
        });

        if (!rateLimitResult.allowed) {
            const response = this.errorResponse("Too many requests", 429);
            Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }

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

        // Check email uniqueness if changing email
        if (validation.data!.email && validation.data!.email !== currentUser.email) {
            const existing = await this.userRepository.findByEmail(validation.data!.email);
            if (existing) {
                return this.errorResponse("Email already in use", 400);
            }
        }

        const updatedUser = await this.userRepository.update(currentUser.id, validation.data!);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;

        // Send notification email (non-blocking)
        this.emailService
            .sendProfileUpdatedEmail(updatedUser.email, updatedUser.name || "")
            .catch(console.error);

        return this.successResponse({ user: userWithoutPassword, message: "Profile updated" });
    }
}

const getHandler = new GetProfileHandler();
const updateHandler = new UpdateProfileHandler();

export const GET = (req: NextRequest) => getHandler.handle(req);
export const PUT = (req: NextRequest) => updateHandler.handle(req);
