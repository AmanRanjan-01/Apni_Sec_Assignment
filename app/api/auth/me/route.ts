import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { AuthService } from "@/lib/services/AuthService";

export class MeHandler extends BaseHandler {
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

const handler = new MeHandler();
export const GET = (req: NextRequest) => handler.handle(req);
