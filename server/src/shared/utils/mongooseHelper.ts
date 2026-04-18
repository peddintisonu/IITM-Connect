// server/src/shared/utils/mongooseHelper.ts

import mongoose from "mongoose";
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

export const toObjectId = (id: string | unknown): mongoose.Types.ObjectId => {
    if (typeof id !== "string") {
        throw new ApiError(400, "Invalid ID format");
    }
    try {
        return new mongoose.Types.ObjectId(id);
    } catch {
        throw new ApiError(400, "Invalid ID format");
    }
};

export const toObjectIdArray = (ids: string[]): mongoose.Types.ObjectId[] => {
    try {
        return ids.map((id) => new mongoose.Types.ObjectId(id));
    } catch {
        throw new ApiError(400, "Invalid ID format in array");
    }
};

export const isValidObjectId = (id: unknown): id is string => {
    if (typeof id !== "string") return false;
    return mongoose.Types.ObjectId.isValid(id);
};
