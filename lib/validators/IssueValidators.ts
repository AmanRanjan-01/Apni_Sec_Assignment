import { z } from "zod";
import { BaseValidator } from "@/lib/core/BaseValidator";

// ========================
// Create Issue Validator
// ========================

const createIssueSchema = z.object({
    type: z.enum(["CLOUD_SECURITY", "RETEAM_ASSESSMENT", "VAPT"], {
        message: "Type must be CLOUD_SECURITY, RETEAM_ASSESSMENT, or VAPT",
    }),
    title: z.string().min(1, "Title is required").max(200, "Title too long"),
    description: z.string().min(1, "Description is required").max(5000, "Description too long"),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export class CreateIssueValidator extends BaseValidator<CreateIssueInput> {
    protected schema = createIssueSchema;
}

// ========================
// Update Issue Validator
// ========================

const updateIssueSchema = z.object({
    type: z.enum(["CLOUD_SECURITY", "RETEAM_ASSESSMENT", "VAPT"]).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
});

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

export class UpdateIssueValidator extends BaseValidator<UpdateIssueInput> {
    protected schema = updateIssueSchema;
}
