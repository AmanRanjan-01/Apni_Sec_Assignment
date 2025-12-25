import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { AuthService } from "@/lib/services/AuthService";
import { IssueRepository } from "@/lib/repositories/IssueRepository";
import { CreateIssueValidator } from "@/lib/validators/IssueValidators";
import { EmailService } from "@/lib/services/EmailService";
import { RateLimiter } from "@/lib/core/RateLimiter";
import { IssueType } from "@/app/generated/prisma";

class GetIssuesHandler extends BaseHandler {
    private authService: AuthService;
    private issueRepository: IssueRepository;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.issueRepository = IssueRepository.getInstance();
        this.rateLimiter = RateLimiter.getInstance();
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

        // Rate limit
        const rateLimitResult = await this.rateLimiter.check(`issues:list:${user.id}`, {
            maxRequests: 100,
            windowMs: 15 * 60 * 1000,
        });

        if (!rateLimitResult.allowed) {
            const response = this.errorResponse("Too many requests", 429);
            Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }

        // Parse filters from query params
        const { searchParams } = new URL(req.url);
        const typeParam = searchParams.get("type");

        const filters: { type?: IssueType } = {};
        if (typeParam && ["CLOUD_SECURITY", "RETEAM_ASSESSMENT", "VAPT"].includes(typeParam)) {
            filters.type = typeParam as IssueType;
        }

        const issues = await this.issueRepository.findAllByUser(user.id, filters);

        const response = this.successResponse({ issues });
        Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    }
}

class CreateIssueHandler extends BaseHandler {
    private authService: AuthService;
    private issueRepository: IssueRepository;
    private validator: CreateIssueValidator;
    private emailService: EmailService;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.issueRepository = IssueRepository.getInstance();
        this.validator = new CreateIssueValidator();
        this.emailService = EmailService.getInstance();
        this.rateLimiter = RateLimiter.getInstance();
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

        // Rate limit
        const rateLimitResult = await this.rateLimiter.check(`issues:create:${user.id}`, {
            maxRequests: 50,
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

        const issue = await this.issueRepository.create({
            ...validation.data!,
            userId: user.id,
        });

        // Send email notification (non-blocking)
        this.emailService
            .sendIssueCreatedEmail(user.email, {
                type: issue.type,
                title: issue.title,
                description: issue.description,
            })
            .catch(console.error);

        const response = this.successResponse({ issue }, 201);
        Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
            response.headers.set(key, value);
        });

        return response;
    }
}

const getHandler = new GetIssuesHandler();
const createHandler = new CreateIssueHandler();

export const GET = (req: NextRequest) => getHandler.handle(req);
export const POST = (req: NextRequest) => createHandler.handle(req);
