// server/src/shared/middleware/requireAuth.ts

import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const requireAuth = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }
        next();
    }
);
