import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";

type BodyParserJsonError = SyntaxError & {
    status?: number;
    statusCode?: number;
    type?: string;
    body?: string;
};

const isMalformedJsonError = (err: unknown): err is BodyParserJsonError => {
    if (!(err instanceof SyntaxError)) {
        return false;
    }

    const candidate = err as BodyParserJsonError;
    return (
        candidate.type === "entity.parse.failed" &&
        (candidate.status === 400 || candidate.statusCode === 400)
    );
};

const errorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    void next;

    if (isMalformedJsonError(err)) {
        res.status(400).json({
            success: false,
            message: "Malformed JSON in request body",
            errors: ["Request body must be valid JSON"],
        });
        return;
    }

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
