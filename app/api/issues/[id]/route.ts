import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { AuthService } from "@/lib/services/AuthService";
import { IssueRepository } from "@/lib/repositories/IssueRepository";
import { UpdateIssueValidator } from "@/lib/validators/IssueValidators";
import { RateLimiter } from "@/lib/core/RateLimiter";

class GetIssueHandler extends BaseHandler {
    private authService: AuthService;
    private issueRepository: IssueRepository;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.issueRepository = IssueRepository.getInstance();
    }

    protected async execute(
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse<ApiResponse>> {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return this.errorResponse("Not authenticated", 401);
        }

        const user = await this.authService.verifyToken(token);

        if (!user) {
            return this.errorResponse("Invalid or expired token", 401);
        }

        const params = await context?.params;
        const id = params?.id;

        if (!id) {
            return this.errorResponse("Issue ID required", 400);
        }

        const issue = await this.issueRepository.findByIdAndUser(id, user.id);

        if (!issue) {
            return this.errorResponse("Issue not found", 404);
        }

        return this.successResponse({ issue });
    }
}

class UpdateIssueHandler extends BaseHandler {
    private authService: AuthService;
    private issueRepository: IssueRepository;
    private validator: UpdateIssueValidator;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.issueRepository = IssueRepository.getInstance();
        this.validator = new UpdateIssueValidator();
        this.rateLimiter = RateLimiter.getInstance();
    }

    protected async execute(
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse<ApiResponse>> {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return this.errorResponse("Not authenticated", 401);
        }

        const user = await this.authService.verifyToken(token);

        if (!user) {
            return this.errorResponse("Invalid or expired token", 401);
        }

        const params = await context?.params;
        const id = params?.id;

        if (!id) {
            return this.errorResponse("Issue ID required", 400);
        }

        // Rate limit
        const rateLimitResult = await this.rateLimiter.check(`issues:update:${user.id}`, {
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

        const updatedIssue = await this.issueRepository.update(id, user.id, validation.data!);

        if (!updatedIssue) {
            return this.errorResponse("Issue not found", 404);
        }

        return this.successResponse({ issue: updatedIssue });
    }
}

class DeleteIssueHandler extends BaseHandler {
    private authService: AuthService;
    private issueRepository: IssueRepository;
    private rateLimiter: RateLimiter;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
        this.issueRepository = IssueRepository.getInstance();
        this.rateLimiter = RateLimiter.getInstance();
    }

    protected async execute(
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse<ApiResponse>> {
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return this.errorResponse("Not authenticated", 401);
        }

        const user = await this.authService.verifyToken(token);

        if (!user) {
            return this.errorResponse("Invalid or expired token", 401);
        }

        const params = await context?.params;
        const id = params?.id;

        if (!id) {
            return this.errorResponse("Issue ID required", 400);
        }

        // Rate limit
        const rateLimitResult = await this.rateLimiter.check(`issues:delete:${user.id}`, {
            maxRequests: 30,
            windowMs: 15 * 60 * 1000,
        });

        if (!rateLimitResult.allowed) {
            const response = this.errorResponse("Too many requests", 429);
            Object.entries(this.rateLimiter.getHeaders(rateLimitResult)).forEach(([key, value]) => {
                response.headers.set(key, value);
            });
            return response;
        }

        const deleted = await this.issueRepository.delete(id, user.id);

        if (!deleted) {
            return this.errorResponse("Issue not found", 404);
        }

        return this.messageResponse("Issue deleted successfully");
    }
}

const getHandler = new GetIssueHandler();
const updateHandler = new UpdateIssueHandler();
const deleteHandler = new DeleteIssueHandler();

export const GET = (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
) => getHandler.handle(req, context);

export const PUT = (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
) => updateHandler.handle(req, context);

export const DELETE = (
    req: NextRequest,
    context: { params: Promise<Record<string, string>> }
) => deleteHandler.handle(req, context);
