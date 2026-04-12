import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
        return;
    }

    console.error("Unexpected error:", err);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: [],
    });
};

export default errorHandler;
