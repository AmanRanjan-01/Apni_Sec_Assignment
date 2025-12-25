import { z } from "zod";
import { BaseValidator } from "@/lib/core/BaseValidator";

// ========================
// Register Validator
// ========================

const registerSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password too long"),
    name: z.string().min(1).max(100).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export class RegisterValidator extends BaseValidator<RegisterInput> {
    protected schema = registerSchema;
}

// ========================
// Login Validator
// ========================

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export class LoginValidator extends BaseValidator<LoginInput> {
    protected schema = loginSchema;
}
