import { NextRequest, NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export abstract class BaseHandler {
    protected abstract execute(
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse<ApiResponse>>;

    public async handle(
        req: NextRequest,
        context?: { params: Promise<Record<string, string>> }
    ): Promise<NextResponse<ApiResponse>> {
        try {
            return await this.execute(req, context);
        } catch (error) {
            console.error(`[${this.constructor.name}] Error:`, error);
            return this.errorResponse(
                error instanceof Error ? error.message : "Internal server error",
                500
            );
        }
    }

    protected successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
        return NextResponse.json({ success: true, data }, { status });
    }

    protected errorResponse(error: string, status = 400): NextResponse<ApiResponse> {
        return NextResponse.json({ success: false, error }, { status });
    }

    protected messageResponse(message: string, status = 200): NextResponse<ApiResponse> {
        return NextResponse.json({ success: true, message }, { status });
    }
}
