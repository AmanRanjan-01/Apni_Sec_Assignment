import { z } from "zod";
import { BaseValidator } from "@/lib/core/BaseValidator";

const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
    email: z.string().email("Invalid email format").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export class UpdateProfileValidator extends BaseValidator<UpdateProfileInput> {
    protected schema = updateProfileSchema;
}
