// server/src/shared/utils/mongooseHelper.ts

import mongoose from "mongoose";
import { ApiError } from "./ApiError";

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
