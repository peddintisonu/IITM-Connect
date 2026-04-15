// server/src/shared/utils/validationHandler.ts

import { ZodError, ZodTypeAny, z } from "zod";
import { ApiError } from "./ApiError";

export const parseValidationErrors = (error: ZodError): string => {
    const errors = Object.entries(error.flatten().fieldErrors)
        .map(
            ([field, messages]) =>
                `${field}: ${(messages as string[] | undefined)?.join(", ")}`
        )
        .join("; ");
    return errors;
};

export const validateAndParse = <T extends ZodTypeAny>(
    schema: T,
    data: unknown
): z.infer<T> => {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        const errors = parseValidationErrors(parsed.error);
        throw new ApiError(400, errors);
    }
    return parsed.data;
};
