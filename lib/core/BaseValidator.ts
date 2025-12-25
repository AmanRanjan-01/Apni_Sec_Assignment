import { z } from "zod";

export interface ValidationResult<T> {
    success: boolean;
    data?: T;
    errors?: string[];
}

export abstract class BaseValidator<T> {
    protected abstract schema: z.ZodSchema<T>;

    public validate(data: unknown): ValidationResult<T> {
        const result = this.schema.safeParse(data);

        if (result.success) {
            return { success: true, data: result.data };
        }

        const errors = result.error.issues.map(
            (err) => `${err.path.join(".")}: ${err.message}`
        );

        return { success: false, errors };
    }
}
