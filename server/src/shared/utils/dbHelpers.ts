import { ApiError } from "./ApiError";

/**
 * Ensures a student document exists; throws 404 if null.
 * Helps standardize student-not-found error across all services.
 */
export const ensureStudentExists = <T>(
    student: T | null | undefined,
    statusCode: number = 404,
    message = "Student not found"
): Exclude<T, null | undefined> => {
    if (!student) {
        throw new ApiError(statusCode, message);
    }
    return student as Exclude<T, null | undefined>;
};
