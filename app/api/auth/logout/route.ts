import { NextRequest, NextResponse } from "next/server";
import { BaseHandler, ApiResponse } from "@/lib/core/BaseHandler";
import { AuthService } from "@/lib/services/AuthService";

export class LogoutHandler extends BaseHandler {
    private authService: AuthService;

    constructor() {
        super();
        this.authService = AuthService.getInstance();
    }

    protected async execute(req: NextRequest): Promise<NextResponse<ApiResponse>> {
        // Get refresh token to revoke it
        const refreshToken = req.cookies.get("refreshToken")?.value;

        // Revoke refresh token in database
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        const response = this.messageResponse("Logged out successfully");

        // Clear access token
        response.cookies.set("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        // Clear refresh token
        response.cookies.set("refreshToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 0,
            path: "/",
        });

        return response;
    }
}

const handler = new LogoutHandler();
export const POST = (req: NextRequest) => handler.handle(req);
