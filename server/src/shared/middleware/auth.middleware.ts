import jwt from "jsonwebtoken";
import { ENV } from "../../config/env";
import Session from "../../modules/auth/session.model";
import Student from "../../modules/student/student.model";
import { ApiError, asyncHandler } from "../utils";

export const protectRoute = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) throw new ApiError(401, "No access token provided");

    const decoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as {
        studentId: string;
        tokenVersion: number;
        sessionId: string;
    };

    const [student, session] = await Promise.all([
        Student.findById(decoded.studentId).select("-__v"),
        Session.findById(decoded.sessionId),
    ]);

    if (!student) throw new ApiError(401, "Student not found");
    if (!session)
        throw new ApiError(401, "Session expired, please login again");
    if (session.revoked)
        throw new ApiError(401, "Session revoked, please login again");

    if (decoded.tokenVersion !== student.tokenVersion) {
        throw new ApiError(401, "Token invalidated, please login again");
    }

    // Update lastAccessedAt for the session
    session.lastAccessedAt = new Date();
    await session.save();

    req.user = student;
    next();
});

export const redirectIfAuthenticated = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) return next();

    try {
        const decoded = jwt.verify(accessToken, ENV.ACCESS_TOKEN_SECRET) as {
            studentId: string;
            tokenVersion: number;
            sessionId: string;
        };

        const [student, session] = await Promise.all([
            Student.findById(decoded.studentId),
            Session.findById(decoded.sessionId),
        ]);

        if (!student) return next();
        if (!session) return next();
        if (decoded.tokenVersion !== student.tokenVersion) return next();

        return res.redirect("/");
    } catch {
        return next();
    }
});

export const requireAuth = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized");
    }
    next();
});
